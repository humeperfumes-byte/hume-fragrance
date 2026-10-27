"use client";
import {useId,useState} from 'react';
import type {InvoiceSuggestion} from '@/lib/invoice-suggestions';
export function InvoiceItemSearch({suggestions,value,onChange,onSelect,path}:{suggestions:InvoiceSuggestion[];value:string;onChange:(value:string)=>void;onSelect:(item:InvoiceSuggestion)=>void;path:string}){
 const query=value; const [open,setOpen]=useState(false),[active,setActive]=useState(-1);const id=useId();
 const [recent,setRecent]=useState<string[]>([]);
 const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const ranked=[...suggestions].sort((a,b)=>{const ai=recent.indexOf(a.id),bi=recent.indexOf(b.id);return (ai<0?999:ai)-(bi<0?999:bi);});
 const matches=ranked.filter(item=>terms.every(term=>item.search.includes(term))).slice(0,40);
 function choose(item:InvoiceSuggestion){setRecent(previous=>[item.id,...previous.filter(id=>id!==item.id)].slice(0,10));onSelect(item);setOpen(false);setActive(-1);}
 return <div className="relative sm:col-span-2"><label htmlFor={id} className="invoice-field"><span>Product / description</span><input id={id} data-invoice-path={path} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-results`} aria-activedescendant={open&&active>=0?`${id}-${active}`:undefined} value={query} placeholder="Search a product or type a custom item..." autoComplete="off" onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)} onChange={event=>{onChange(event.target.value);setOpen(true);setActive(-1);}} onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);return;}if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setOpen(true);setActive(index=>Math.max(0,Math.min(matches.length-1,index+(event.key==='ArrowDown'?1:-1))));}if(event.key==='Enter'&&open&&matches.length&&active>=0){event.preventDefault();choose(matches[Math.max(0,active)]);}}}/></label>
 {open&&<ul id={`${id}-results`} role="listbox" className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-white/20 bg-[#202229] p-1 shadow-2xl">{matches.map((item,index)=><li key={item.id} id={`${id}-${index}`} role="option" aria-selected={active===index} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(item)} className={`cursor-pointer rounded-lg px-3 py-3 text-sm ${active===index?'bg-white/15':'hover:bg-white/10'}`}><span className="block font-medium text-white">{item.name}</span><span className="mt-1 block text-xs text-white/50">{item.price===null?'Enter your price':`Catalogue price ₹${item.price.toFixed(2)} · editable`}</span></li>)}{!matches.length&&<li className="p-3 text-sm text-white/50">Custom item — use the description you typed.</li>}</ul>}
 </div>;
}
