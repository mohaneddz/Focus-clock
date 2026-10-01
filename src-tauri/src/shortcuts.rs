//! Right-Alt shortcuts need a hook: RegisterHotKey treats both Alt keys alike.
use std::{cell::RefCell, sync::mpsc, thread};
use tauri::{AppHandle, Emitter};
use windows_sys::Win32::{
    Foundation::{LPARAM, LRESULT, WPARAM},
    System::LibraryLoader::GetModuleHandleW,
    UI::{
        Input::KeyboardAndMouse::{GetAsyncKeyState, VK_LWIN, VK_RMENU, VK_RWIN},
        WindowsAndMessaging::*,
    },
};

#[derive(Default)]
struct Keys {
    right_alt: bool,
    held: [bool; 5],
}

impl Keys {
    fn input(&mut self, key: u32, down: bool, windows_key: bool) -> (bool, Option<&'static str>) {
        if key == VK_RMENU as u32 {
            self.right_alt = down;
            return (false, None);
        }
        let (index, action) = match key {
            0x50 => (0, "play-pause"),
            0x4f => (1, "stop"),
            0x4c => (2, "reset"),
            0xbe | 0x27 => (3, "next"), // . / >, with or without Shift
            0xbc | 0x25 => (4, "previous"), // , / <, with or without Shift
            _ => return (false, None),
        };
        if !down {
            let consumed = self.held[index];
            self.held[index] = false;
            return (consumed, None);
        }
        if self.held[index] {
            return (true, None);
        }
        if !self.right_alt || windows_key {
            return (false, None);
        }
        self.held[index] = true;
        (true, Some(action))
    }
}

thread_local! {
    static KEYS: RefCell<Keys> = RefCell::new(Keys::default());
    static EVENTS: RefCell<Option<mpsc::Sender<&'static str>>> = const { RefCell::new(None) };
}

unsafe extern "system" fn keyboard_hook(code: i32, message: WPARAM, data: LPARAM) -> LRESULT {
    if code >= 0 {
        let input = &*(data as *const KBDLLHOOKSTRUCT);
        let down = message == WM_KEYDOWN as usize || message == WM_SYSKEYDOWN as usize;
        let up = message == WM_KEYUP as usize || message == WM_SYSKEYUP as usize;
        if down || up {
            let windows_key =
                GetAsyncKeyState(VK_LWIN as i32) < 0 || GetAsyncKeyState(VK_RWIN as i32) < 0;
            let (consume, action) =
                KEYS.with(|keys| keys.borrow_mut().input(input.vkCode, down, windows_key));
            if let Some(action) = action {
                // Keep IPC out of the hook; Windows removes slow keyboard hooks.
                EVENTS.with(|events| {
                    if let Some(tx) = events.borrow().as_ref() {
                        let _ = tx.send(action);
                    }
                });
            }
            if consume {
                return 1;
            }
        }
    }
    CallNextHookEx(std::ptr::null_mut(), code, message, data)
}

pub fn install(app: AppHandle) -> std::io::Result<()> {
    let (events_tx, events_rx) = mpsc::channel();
    let (ready_tx, ready_rx) = mpsc::sync_channel(1);
    thread::Builder::new()
        .name("session-shortcuts".into())
        .spawn(move || unsafe {
            EVENTS.with(|events| *events.borrow_mut() = Some(events_tx));
            KEYS.with(|keys| keys.borrow_mut().right_alt = GetAsyncKeyState(VK_RMENU as i32) < 0);
            let hook = SetWindowsHookExW(
                WH_KEYBOARD_LL,
                Some(keyboard_hook),
                GetModuleHandleW(std::ptr::null()),
                0,
            );
            if hook.is_null() {
                let _ = ready_tx.send(Err(std::io::Error::last_os_error()));
                return;
            }
            let _ = ready_tx.send(Ok(()));
            let mut message = std::mem::zeroed();
            while GetMessageW(&mut message, std::ptr::null_mut(), 0, 0) > 0 {
                TranslateMessage(&message);
                DispatchMessageW(&message);
            }
            UnhookWindowsHookEx(hook);
        })?;
    ready_rx.recv().map_err(std::io::Error::other)??;
    thread::Builder::new()
        .name("session-shortcut-events".into())
        .spawn(move || {
            for action in events_rx {
                let _ = app.emit("session-shortcut", action);
            }
        })?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_shortcut_requires_right_alt_and_fires_once_per_press() {
        for (key, action) in [
            (0x50, "play-pause"),
            (0x4f, "stop"),
            (0x4c, "reset"),
            (0xbe, "next"),
            (0xbc, "previous"),
        ] {
            let mut keys = Keys::default();
            assert_eq!(keys.input(key, true, false), (false, None));
            keys.input(0xa4, true, false); // Left Alt must not activate shortcuts.
            assert_eq!(keys.input(key, true, false), (false, None));
            keys.input(VK_RMENU as u32, true, false);
            assert_eq!(keys.input(key, true, false), (true, Some(action)));
            assert_eq!(keys.input(key, true, false), (true, None));
            keys.input(VK_RMENU as u32, false, false);
            assert_eq!(keys.input(key, false, false), (true, None));
            assert_eq!(keys.input(key, true, false), (false, None));
        }
    }

    #[test]
    fn altgr_and_shifted_punctuation_work() {
        let mut keys = Keys::default();
        keys.input(0xa2, true, false); // AltGr layouts synthesize Left Ctrl.
        keys.input(VK_RMENU as u32, true, false);
        keys.input(0xa0, true, false); // Shift for < and >.
        assert_eq!(keys.input(0xbe, true, false), (true, Some("next")));
        assert_eq!(keys.input(0xbc, true, false), (true, Some("previous")));
        assert_eq!(keys.input(0x50, true, true), (false, None));
    }
}
