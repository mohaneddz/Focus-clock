import { createSignal, For, Show, onMount, onCleanup } from "solid-js";
import { A } from "@solidjs/router";
import { Plus, Play, Pencil, Trash2, Search, Star, X, Sparkles, TimerReset } from "lucide-solid";
import { getStoreValue, setStoreValue } from "@/config/store";

type TimerData = { id: number; title: string; duration: number; favorite?: boolean };
const format = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function TimerGallery() {
  const [timers, setTimers] = createSignal<TimerData[]>([]);
  const [query, setQuery] = createSignal("");
  const [filter, setFilter] = createSignal("all");
  const [editing, setEditing] = createSignal<TimerData | null>(null);
  const [isCreating, setIsCreating] = createSignal(false);
  const [title, setTitle] = createSignal("");
  const [minutes, setMinutes] = createSignal(25);
  const [history, setHistory] = createSignal<{ title: string; duration: number; at: string }[]>([]);

  onMount(async () => { setTimers((await getStoreValue<TimerData[]>("timers")) || []); setHistory((await getStoreValue<any[]>("timer-history")) || []); });
  const persist = (next: TimerData[]) => { setTimers(next); void setStoreValue("timers", next); };
  const openCreate = () => { setEditing(null); setIsCreating(true); setTitle(""); setMinutes(25); };
  const closeEditor = () => { setEditing(null); setIsCreating(false); };
  const openEdit = (timer: TimerData) => { setEditing(timer); setIsCreating(false); setTitle(timer.title); setMinutes(Math.max(1, Math.round(timer.duration / 60))); };
  const save = () => { const existing = editing(); const next: TimerData = { id: existing?.id ?? Date.now(), title: title().trim() || "Untitled timer", duration: minutes() * 60, favorite: existing?.favorite }; persist(existing ? timers().map(timer => timer.id === existing.id ? next : timer) : [...timers(), next]); closeEditor(); };
  const visible = () => timers().filter(timer => timer.title.toLowerCase().includes(query().toLowerCase()) && (filter() !== "favorites" || timer.favorite));
  const refs = new Map<number, HTMLElement>();
  const [dragging, setDragging] = createSignal<number | null>(null);
  let drag: { id: number; pointerId: number; startX: number; startY: number; offsetX: number; offsetY: number; original: TimerData[]; preview?: HTMLElement } | null = null;
  const endDrag = (cancel = false) => {
    if (!drag) return;
    const active = drag;
    drag = null;
    active.preview?.remove();
    setDragging(null);
    if (cancel) setTimers(active.original);
    else if (active.preview) persist(timers());
  };
  const onPointerDown = (event: PointerEvent, timer: TimerData) => {
    if (drag || event.button !== 0 || (event.target as HTMLElement).closest("button,a")) return;
    const el = refs.get(timer.id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    drag = { id: timer.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, original: [...timers()] };
    event.preventDefault();
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.preview) {
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return;
      const el = refs.get(drag.id)!;
      const rect = el.getBoundingClientRect();
      drag.preview = el.cloneNode(true) as HTMLElement;
      drag.preview.classList.add("timer-drag-preview");
      drag.preview.setAttribute("aria-hidden", "true");
      drag.preview.inert = true;
      Object.assign(drag.preview.style, { width: `${rect.width}px`, height: `${rect.height}px` });
      document.body.append(drag.preview);
      setDragging(drag.id);
    }
    event.preventDefault();
    Object.assign(drag.preview.style, { left: `${event.clientX - drag.offsetX}px`, top: `${event.clientY - drag.offsetY}px` });
    const items = visible();
    const slots = items.map(item => refs.get(item.id)!.getBoundingClientRect());
    let target = -1;
    let distance = Infinity;
    slots.forEach((rect, index) => {
      const next = Math.hypot(event.clientX - (rect.left + rect.width / 2), event.clientY - (rect.top + rect.height / 2));
      if (next < distance) { distance = next; target = index; }
    });
    const from = items.findIndex(item => item.id === drag!.id);
    if (target < 0 || from === target) return;
    const reordered = [...items];
    reordered.splice(target, 0, reordered.splice(from, 1)[0]);
    const visibleIds = new Set(items.map(item => item.id));
    let index = 0;
    setTimers(timers().map(item => visibleIds.has(item.id) ? reordered[index++] : item));
  };
  onMount(() => {
    const up = (event: PointerEvent) => { if (event.pointerId === drag?.pointerId) endDrag(); };
    const cancel = () => endDrag(true);
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") cancel(); };
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", escape);
    onCleanup(() => {
      cancel();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", escape);
    });
  });

  return <section class="page">
    <div class="toolbar"><div><h1>Timers</h1><p class="subtitle">Your saved countdowns</p></div><button class="button primary" onClick={openCreate}><Plus /> New timer</button></div>
    <div class="timer-controls"><label class="search"><Search /><input aria-label="Search timers" value={query()} onInput={event => setQuery(event.currentTarget.value)} placeholder="Search timers" /></label><div class="chips"><button class={`chip ${filter() === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button><button class={`chip ${filter() === "favorites" ? "active" : ""}`} onClick={() => setFilter("favorites")}>Favorites</button></div></div>
    <div class="timer-grid"><For each={visible()}>{timer => <article class="timer-card" classList={{ "drag-placeholder": dragging() === timer.id }} data-timer-id={timer.id} ref={el => refs.set(timer.id, el)} onPointerDown={event => onPointerDown(event, timer)}><div class="mini-clock"><span>{format(timer.duration)}</span></div><div class="card-actions"><button class="icon-button" aria-label="Edit" onClick={() => openEdit(timer)}><Pencil /></button><A class="play-button" aria-label={`Start ${timer.title}`} href={`/timer/${timer.id}`}><Play fill="currentColor" /></A><button class="icon-button" aria-label="Delete" onClick={() => persist(timers().filter(item => item.id !== timer.id))}><Trash2 /></button></div><strong class="timer-name">{timer.title}</strong><button class="icon-button favorite-button" aria-label={timer.favorite ? "Remove from favorites" : "Add to favorites"} onClick={() => persist(timers().map(item => item.id === timer.id ? { ...item, favorite: !item.favorite } : item))}><Star fill={timer.favorite ? "currentColor" : "none"} /></button></article>}</For><button class="timer-card new-card" onClick={openCreate}><Plus /><span>Create timer</span></button></div>
    <Show when={history().length}><section class="panel history"><h2>Recent activity</h2><For each={history().slice(0, 4)}>{entry => <div class="history-row"><Play size={16} /><div><strong>{entry.title}</strong><small class="muted">Completed · {format(entry.duration)}</small></div><time>{entry.at}</time></div>}</For></section></Show>
    <Show when={isCreating() || editing()}><div class="modal-backdrop" role="presentation"><form class="modal timer-editor" onSubmit={event => { event.preventDefault(); save(); }}><button type="button" class="icon-button" style={{ float: "right" }} onClick={closeEditor} aria-label="Close"><X /></button><div class="timer-editor-heading"><span class="timer-editor-icon"><TimerReset /></span><div><p class="eyebrow">{editing() ? "Refine your countdown" : "Make time intentional"}</p><h2>{editing() ? "Edit timer" : "Create a timer"}</h2></div></div><label class="field">Timer name<input required value={title()} onInput={event => setTitle(event.currentTarget.value)} placeholder="e.g. Deep work" autofocus /></label><label class="field">Duration <span class="duration-value">{minutes()} min</span><input min="1" max="480" type="number" value={minutes()} onInput={event => setMinutes(Math.max(1, Number(event.currentTarget.value) || 1))} /></label><div class="timer-presets" aria-label="Quick durations"><For each={[5, 15, 25, 45, 60]}>{value => <button type="button" classList={{ active: minutes() === value }} onClick={() => setMinutes(value)}>{value}m</button>}</For></div><div class="modal-footer"><button class="button" type="button" onClick={closeEditor}>Cancel</button><button class="button primary" type="submit"><Sparkles /> {editing() ? "Save changes" : "Create timer"}</button></div></form></div></Show>
  </section>;
}
