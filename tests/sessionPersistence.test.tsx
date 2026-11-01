import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({ data: {} as Record<string, unknown> }));
vi.mock("@/config/store", () => ({
  getStoreValue: vi.fn(async (key: string) => storage.data[key] ?? null),
  setStoreValue: vi.fn(async (key: string, value: unknown) => { storage.data[key] = structuredClone(value); }),
}));
vi.mock("@/config/sounds", () => ({ playChime: vi.fn() }));

const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  storage.data = { "pomodoro-settings": { pomodoroTimeSeconds: 10, shortBreakTimeSeconds: 3, longBreakTimeSeconds: 5, numberOfRounds: 2 } };
});
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

describe("saved session deadlines", () => {
  it("keeps two timers independent and restores them after a hidden interval and reload", async () => {
    const first = { id: 1, title: "First", duration: 10 };
    const second = { id: 2, title: "Second", duration: 20 };
    const service = await import("../src/config/timerSessions");
    await service.initTimerSessions();
    service.startTimer(first);
    service.startTimer(second);
    await settle();
    vi.setSystemTime(Date.now() + 2000);
    service.refreshTimerSessions();
    expect(service.timerRemaining(first)).toBe(8);
    expect(service.timerRemaining(second)).toBe(18);
    service.pauseTimer(second);
    await settle();
    service.stopTimerSessionTicker();

    vi.setSystemTime(Date.now() + 9000);
    vi.resetModules();
    const restored = await import("../src/config/timerSessions");
    await restored.initTimerSessions();
    expect(restored.timerRemaining(first)).toBe(0);
    expect(restored.timerRunning(first.id)).toBe(false);
    expect(restored.timerRemaining(second)).toBe(18);
    expect(restored.timerRunning(second.id)).toBe(false);
    await settle();
    expect((storage.data["timer-history"] as unknown[]).length).toBe(1);
    restored.stopTimerSessionTicker();
  });

  it("restores the Pomodoro phase after time passes while the app is closed", async () => {
    const session = await import("../src/config/pomodoroSession");
    await session.initPomodoroSession();
    session.toggle();
    await settle();
    vi.setSystemTime(Date.now() + 11000);
    vi.resetModules();
    const restored = await import("../src/config/pomodoroSession");
    await restored.initPomodoroSession();
    expect(restored.mode()).toBe("short");
    expect(restored.left()).toBe(2);
    expect(restored.running()).toBe(true);
    expect(restored.sessions()).toBe(1);
  });
});
