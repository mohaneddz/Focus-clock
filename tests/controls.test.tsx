import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import Pomodoro from "../src/routes/Pomodoro";
import Timer from "../src/routes/timer/TimerMain";
import Titlebar from "../src/components/Titlebar";
import TimerGallery from "../src/routes/timer/TimerGallery";
import { dispatchSessionAction as action } from "../src/config/sessionControls";

const mocks = vi.hoisted(() => ({
  data: {} as Record<string, unknown>,
  fullscreen: false,
  setFullscreen: vi.fn(async (_value: boolean) => {}),
  maximize: vi.fn(),
}));
vi.mock("@/config/store", () => ({
  getStoreValue: vi.fn(async (key: string) => mocks.data[key] ?? null),
  setStoreValue: vi.fn(async (key: string, value: unknown) => { mocks.data[key] = structuredClone(value); }),
}));
vi.mock("@/config/sounds", () => ({ playChime: vi.fn() }));
vi.mock("@/hooks/useTickingSound", () => ({ default: () => ({ muted: () => true, toggleMuted: () => {} }) }));
vi.mock("@tauri-apps/api/window", () => ({ getCurrentWindow: () => ({
  isMaximized: async () => false,
  isFullscreen: async () => mocks.fullscreen,
  setFullscreen: mocks.setFullscreen,
  toggleMaximize: mocks.maximize,
  onResized: async () => () => {},
}) }));

let dispose: (() => void) | undefined;
const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
const button = (text: string) => [...document.querySelectorAll("button")].find(item => item.textContent === text)!;
const mount = async (component: () => any, path = "/pomodoro") => {
  history.replaceState(null, "", path);
  dispose = render(() => <Router><Route path="/*" component={component} /></Router>, document.body);
  await settle();
};

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval", "setTimeout", "clearTimeout"] });
  mocks.data = {
    "pomodoro-settings": { pomodoroTimeSeconds: 10, shortBreakTimeSeconds: 3, longBreakTimeSeconds: 5, numberOfRounds: 2 },
    timers: [{ id: 1, title: "First", duration: 60 }, { id: 2, title: "Second", duration: 120 }, { id: 3, title: "Third", duration: 180 }],
  };
});
afterEach(async () => {
  await action("reset");
  dispose?.(); dispose = undefined;
  document.body.innerHTML = "";
  vi.clearAllTimers(); vi.useRealTimers();
  delete (window as any).__TAURI_INTERNALS__;
});

describe("Pomodoro session and shortcut actions", () => {
  it("continues focus/short/focus/long/focus and catches up after throttling", async () => {
    await mount(Pomodoro);
    button("Start").click();
    await vi.advanceTimersByTimeAsync(10000);
    expect(document.querySelector(".eyebrow")?.textContent).toBe("Short break");
    expect(button("Pause")).toBeTruthy();
    await vi.advanceTimersByTimeAsync(3000);
    expect(document.querySelector(".eyebrow")?.textContent).toBe("Focus session");
    await vi.advanceTimersByTimeAsync(10000);
    expect(document.querySelector(".eyebrow")?.textContent).toBe("Long break");
    await vi.advanceTimersByTimeAsync(5000);
    expect(document.querySelector(".eyebrow")?.textContent).toBe("Focus session");
    expect(button("Pause")).toBeTruthy();
    vi.setSystemTime(Date.now() + 14000);
    await vi.advanceTimersByTimeAsync(250);
    expect(document.querySelector(".time")?.textContent).toBe("00:09");
    expect(button("Pause")).toBeTruthy();
  });

  it("each shortcut controls the last session after unmount; stop resets phase, reset resets cycle", async () => {
    await mount(Pomodoro);
    await action("play-pause");
    await vi.advanceTimersByTimeAsync(2000);
    await action("play-pause");
    expect(document.querySelector(".time")?.textContent).toBe("00:08");
    await vi.advanceTimersByTimeAsync(5000);
    expect(document.querySelector(".time")?.textContent).toBe("00:08");
    await action("play-pause");
    await action("next");
    expect(document.querySelector(".eyebrow")?.textContent).toBe("Short break");
    expect(button("Pause")).toBeTruthy();
    await action("previous");
    expect(document.querySelector(".eyebrow")?.textContent).toBe("Focus session");
    await action("next");
    await vi.advanceTimersByTimeAsync(1000);
    await action("stop");
    expect(document.querySelector(".time")?.textContent).toBe("00:03");
    expect(button("Start")).toBeTruthy();
    await action("reset");
    expect(document.querySelector(".eyebrow")?.textContent).toBe("Focus session");
    expect(document.querySelector(".session-count")?.textContent).toMatch(/^0/);
    dispose!(); dispose = undefined;
    await action("play-pause");
    await vi.advanceTimersByTimeAsync(10000);
    await mount(Pomodoro);
    expect(document.querySelector(".eyebrow")?.textContent).toBe("Short break");
    expect(button("Pause")).toBeTruthy();
  });
});

describe("countdown shortcuts", () => {
  it("plays, pauses, stops, resets and moves between saved timers", async () => {
    history.replaceState(null, "", "/timer/1");
    dispose = render(() => <Router><Route path="/timer/:id" component={Timer} /></Router>, document.body);
    await settle();
    await action("play-pause");
    await vi.advanceTimersByTimeAsync(2000);
    await action("play-pause");
    expect(document.querySelector(".time")?.textContent).toBe("00:58");
    await vi.advanceTimersByTimeAsync(2000);
    expect(document.querySelector(".time")?.textContent).toBe("00:58");
    await action("stop");
    expect(document.querySelector(".time")?.textContent).toBe("01:00");
    await action("play-pause");
    await action("next"); await settle();
    expect(document.querySelector(".date")?.textContent).toBe("Second");
    expect(button("Pause")).toBeTruthy();
    await action("previous"); await settle();
    expect(document.querySelector(".date")?.textContent).toBe("First");
    await vi.advanceTimersByTimeAsync(2000);
    await action("reset");
    expect(document.querySelector(".time")?.textContent).toBe("01:00");
    expect(button("Start")).toBeTruthy();
    await action("previous"); await settle();
    expect(document.querySelector(".date")?.textContent).toBe("Third");
  });
});

describe("native fullscreen", () => {
  it("F11 enters and exits fullscreen without maximizing; ignores held-key repeat", async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    mocks.fullscreen = false;
    mocks.setFullscreen.mockImplementation(async value => { mocks.fullscreen = value; });
    dispose = render(Titlebar, document.body);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "F11", cancelable: true }));
    await settle();
    expect(mocks.fullscreen).toBe(true);
    expect(document.documentElement.classList.contains("native-fullscreen")).toBe(true);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "F11", repeat: true }));
    await settle();
    expect(mocks.fullscreen).toBe(true);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "F11" }));
    await settle();
    expect(mocks.fullscreen).toBe(false);
    expect(mocks.maximize).not.toHaveBeenCalled();
  });
});

describe("dragging saved timers", () => {
  const pointer = (target: EventTarget, type: string, x: number, y = 50) => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y });
    Object.defineProperty(event, "pointerId", { value: 1 });
    target.dispatchEvent(event);
  };
  const names = () => [...document.querySelectorAll(".timer-grid .timer-name")].map(el => el.textContent);
  const positions = () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const index = [...document.querySelectorAll(".timer-grid article")].indexOf(this);
      return { left: index * 200, top: 0, width: 180, height: 200 } as DOMRect;
    });
  };
  it("previews the order before drop and persists it after drop", async () => {
    await mount(TimerGallery, "/timers"); positions();
    pointer(document.querySelector("article")!, "pointerdown", 50);
    pointer(window, "pointermove", 490);
    expect(names()).toEqual(["Second", "Third", "First"]);
    expect((mocks.data.timers as any[]).map(t => t.title)).toEqual(["First", "Second", "Third"]);
    pointer(window, "pointerup", 490);
    expect((mocks.data.timers as any[]).map(t => t.title)).toEqual(names());
    expect(document.querySelector(".timer-drag-preview")).toBeNull();
  });
  it("Escape cancels the preview and restores the original order", async () => {
    await mount(TimerGallery, "/timers"); positions();
    pointer(document.querySelector("article")!, "pointerdown", 50);
    pointer(window, "pointermove", 490);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(names()).toEqual(["First", "Second", "Third"]);
    expect(document.querySelector(".timer-drag-preview")).toBeNull();
    pointer(window, "pointerup", 490);
    expect((mocks.data.timers as any[]).map(t => t.title)).toEqual(names());
  });
});
