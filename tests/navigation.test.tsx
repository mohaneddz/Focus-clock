import { afterEach, describe, expect, it, vi } from "vitest";
import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import Navigation from "../src/components/Navigation";
import Titlebar from "../src/components/Titlebar";

let dispose: (() => void) | undefined;

afterEach(() => {
  dispose?.();
  dispose = undefined;
  document.body.innerHTML = "";
  history.replaceState(null, "", "/");
});

describe("compact navigation", () => {
  it("opens, closes from the backdrop, and closes after following a link", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    history.replaceState(null, "", "/");
    const [open, setOpen] = createSignal(false);
    const toggleMenu = () => setOpen(value => !value);
    dispose = render(() => <Router><Route path="/*" component={() => <><Navigation mobileOpen={open()} onToggle={toggleMenu} onClose={() => setOpen(false)} /><Titlebar mobileMenuOpen={open()} onMenuToggle={toggleMenu} /></>} /></Router>, document.body);

    const toggle = () => document.querySelector<HTMLButtonElement>(".mobile-menu-toggle")!;
    const backdrop = () => document.querySelector<HTMLButtonElement>(".mobile-menu-backdrop")!;
    expect(toggle().getAttribute("aria-expanded")).toBe("false");

    toggle().click();
    expect(toggle().getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelector(".sidebar")?.classList.contains("mobile-open")).toBe(true);

    backdrop().click();
    expect(toggle().getAttribute("aria-expanded")).toBe("false");

    toggle().click();
    document.querySelector<HTMLAnchorElement>('a[href="/pomodoro"]')!.click();
    for (let i = 0; i < 12; i++) await Promise.resolve();
    expect(location.pathname).toBe("/pomodoro");
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
  });
});
