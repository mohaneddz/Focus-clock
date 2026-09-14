import { createSignal, For, Show, onMount, onCleanup } from "solid-js";
import { A } from "@solidjs/router";
import { Plus, Play, Pencil, Trash2, Search, Star, X } from "lucide-solid";
import { getStoreValue, setStoreValue } from "@/config/store";
type TimerData = { id:number; title:string; duration:number; favorite?:boolean };
const format = (s:number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
const SPRING = "cubic-bezier(.34,1.56,.64,1)";
export default function TimerGallery(){
 const [timers,setTimers]=createSignal<TimerData[]>([]),[query,setQuery]=createSignal(""),[filter,setFilter]=createSignal("all"),[editing,setEditing]=createSignal<TimerData|null>(null),[title,setTitle]=createSignal(""),[minutes,setMinutes]=createSignal(25),[history,setHistory]=createSignal<{title:string;duration:number;at:string}[]>([]),[dragId,setDragId]=createSignal<number|null>(null);
 onMount(async()=>{setTimers((await getStoreValue<TimerData[]>("timers"))||[]);setHistory((await getStoreValue<any[]>("timer-history"))||[])});
 const persist=(next:TimerData[])=>{setTimers(next);void setStoreValue("timers",next)};
 const save=()=>{const item=editing()||{id:Date.now(),title:"",duration:0};persist(editing()?timers().map(t=>t.id===item.id?{...item,title:title().trim()||"Untitled timer",duration:minutes()*60}:t):[...timers(),{...item,title:title().trim()||"Untitled timer",duration:minutes()*60}]);setEditing(null)};
 const visible=()=>timers().filter(t=>t.title.toLowerCase().includes(query().toLowerCase())&&(filter()!=="favorites"||t.favorite));

 const refs=new Map<number,HTMLElement>();
 let drag:{id:number;startX:number;startY:number;el:HTMLElement}|null=null;
 const snapshot=()=>{const m=new Map<number,DOMRect>();refs.forEach((el,id)=>m.set(id,el.getBoundingClientRect()));return m};
 const flip=(before:Map<number,DOMRect>,skip:number)=>{refs.forEach((el,id)=>{if(id===skip)return;const b=before.get(id);if(!b)return;const a=el.getBoundingClientRect();const dx=b.left-a.left,dy=b.top-a.top;if(dx||dy)el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:"none"}],{duration:420,easing:SPRING})});};
 const glue=(clientX:number,clientY:number)=>{if(drag)drag.el.style.transform=`translate(${clientX-drag.startX}px,${clientY-drag.startY}px) scale(1.05)`};
 const onPointerDown=(e:PointerEvent,t:TimerData)=>{if(e.button!==0||(e.target as HTMLElement).closest("button,a"))return;const el=refs.get(t.id);if(!el)return;drag={id:t.id,startX:e.clientX,startY:e.clientY,el};el.setPointerCapture(e.pointerId)};
 const onPointerMove=(e:PointerEvent)=>{
  const d=drag;if(!d)return;
  if(dragId()!==d.id){if(Math.hypot(e.clientX-d.startX,e.clientY-d.startY)<5)return;setDragId(d.id)}
  glue(e.clientX,e.clientY);
  // detect drop index from layout geometry (offset*), which ignores the in-flight FLIP transforms and stays stable
  const op=d.el.offsetParent as HTMLElement|null,opRect=op?op.getBoundingClientRect():{left:0,top:0} as DOMRect,px=e.clientX-opRect.left,py=e.clientY-opRect.top;
  const list=timers(),rest=list.filter(t=>t.id!==d.id);
  let idx=0;for(const t of rest){const el=refs.get(t.id);if(!el)continue;const cx=el.offsetLeft+el.offsetWidth/2,cy=el.offsetTop+el.offsetHeight/2,h=el.offsetHeight;if(cy<py-h*0.5||(Math.abs(cy-py)<=h*0.5&&cx<px))idx++}
  const next=[...rest];next.splice(idx,0,list.find(t=>t.id===d.id)!);
  if(next.every((t,i)=>t.id===list[i].id))return;
  const before=snapshot();setTimers(next);
  queueMicrotask(()=>{if(drag!==d)return;const b=before.get(d.id)!,a=d.el.getBoundingClientRect();d.startX+=a.left-b.left;d.startY+=a.top-b.top;glue(e.clientX,e.clientY);flip(before,d.id)});
 };
 const endDrag=(e:PointerEvent)=>{
  if(!drag)return;
  const {el,id}=drag;
  try{el.releasePointerCapture(e.pointerId)}catch{}
  if(dragId()===id){const from=el.style.transform;el.style.transform="";el.animate([{transform:from},{transform:"none"}],{duration:520,easing:SPRING});void setStoreValue("timers",timers())}
  drag=null;setDragId(null);
 };

 return <section class="page"><div class="toolbar"><div><h1>Timers</h1><p class="subtitle">Your saved countdowns</p></div><button class="button primary" onClick={()=>{setTitle("");setMinutes(25);setEditing({id:0,title:"",duration:0})}}><Plus/> New timer</button></div><div class="timer-controls"><label class="search"><Search/><input aria-label="Search timers" value={query()} onInput={e=>setQuery(e.currentTarget.value)} placeholder="Search timers"/></label><div class="chips"><button class={`chip ${filter()==="all"?"active":""}`} onClick={()=>setFilter("all")}>All</button><button class={`chip ${filter()==="favorites"?"active":""}`} onClick={()=>setFilter("favorites")}>Favorites</button></div></div><div class="timer-grid"><For each={visible()}>{t=><article class="timer-card" data-id={t.id} classList={{dragging:dragId()===t.id}} ref={el=>{refs.set(t.id,el);onCleanup(()=>refs.delete(t.id))}} onPointerDown={e=>onPointerDown(e,t)} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}><div class="mini-clock"><span>{format(t.duration)}</span></div><div class="card-actions"><button class="icon-button" aria-label="Edit" onClick={()=>{setEditing(t);setTitle(t.title);setMinutes(Math.max(1,Math.round(t.duration/60)))}}><Pencil/></button><A class="play-button" aria-label={`Start ${t.title}`} href={`/timer/${t.id}`}><Play fill="currentColor"/></A><button class="icon-button" aria-label="Delete" onClick={()=>persist(timers().filter(x=>x.id!==t.id))}><Trash2/></button></div><strong class="timer-name">{t.title}</strong><button class="icon-button favorite-button" aria-label={t.favorite?"Remove from favorites":"Add to favorites"} onClick={()=>persist(timers().map(x=>x.id===t.id?{...x,favorite:!x.favorite}:x))}><Star fill={t.favorite?"currentColor":"none"}/></button></article>}</For><button class="timer-card new-card" onClick={()=>{setTitle("");setMinutes(25);setEditing({id:0,title:"",duration:0})}}><Plus/><span>Create timer</span></button></div><Show when={history().length}><section class="panel history"><h2>Recent activity</h2><For each={history().slice(0,4)}>{h=><div class="history-row"><Play size={16}/><div><strong>{h.title}</strong><small class="muted">Completed · {format(h.duration)}</small></div><time>{h.at}</time></div>}</For></section></Show><Show when={editing()}><div class="modal-backdrop" role="presentation"><form class="modal" onSubmit={e=>{e.preventDefault();save()}}><button class="icon-button" style={{float:"right"}} onClick={()=>setEditing(null)} aria-label="Close"><X/></button><h2>{editing()?.id?"Edit timer":"New timer"}</h2><label class="field">Timer name<input required value={title()} onInput={e=>setTitle(e.currentTarget.value)} placeholder="e.g. Deep work"/></label><label class="field">Minutes<input min="1" type="number" value={minutes()} onInput={e=>setMinutes(Math.max(1,Number(e.currentTarget.value)||1))}/></label><div class="modal-footer"><button class="button" type="button" onClick={()=>setEditing(null)}>Cancel</button><button class="button primary" type="submit">Save timer</button></div></form></div></Show></section>;
}
