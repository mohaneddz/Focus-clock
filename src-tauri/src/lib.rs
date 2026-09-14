use std::fs;

use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager, WindowEvent};
use tauri_plugin_autostart::MacosLauncher;

#[derive(Default)]
struct AppSettings {
    close_to_tray: bool,
    start_minimized: bool,
}

fn read_app_settings(app: &AppHandle) -> AppSettings {
    let Ok(dir) = app.path().app_data_dir() else {
        return AppSettings::default();
    };
    let Ok(contents) = fs::read_to_string(dir.join("store.json")) else {
        return AppSettings::default();
    };
    let Ok(json) = serde_json::from_str::<serde_json::Value>(&contents) else {
        return AppSettings::default();
    };
    AppSettings {
        close_to_tray: json
            .get("closeToTray")
            .and_then(|v| v.as_bool())
            .unwrap_or(false),
        start_minimized: json
            .get("startMinimized")
            .and_then(|v| v.as_bool())
            .unwrap_or(false),
    }
}

fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn build_tray(app: &tauri::App) -> tauri::Result<()> {
    let show_item = MenuItem::with_id(app, "show", "Show Focus Clock", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Focus Clock")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => show_main_window(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let is_visible = window.is_visible().unwrap_or(false);
                    if is_visible {
                        let _ = window.hide();
                    } else {
                        show_main_window(app);
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            build_tray(app)?;

            let settings = read_app_settings(&app.handle());
            if let Some(window) = app.get_webview_window("main") {
                if !settings.start_minimized {
                    window.show()?;
                }

                let event_window = window.clone();
                window.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        let settings = read_app_settings(&event_window.app_handle());
                        if settings.close_to_tray {
                            api.prevent_close();
                            let _ = event_window.hide();
                        }
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
