"use client";
import {useId,type ReactNode} from 'react';
import {ChevronDown} from 'lucide-react';
export function InvoiceSection({title,active,onChange,children}:{title:string;active:string|null;onChange:(title:string|null)=>void;children:ReactNode}){
 const id=useId(),open=active===title;
 return <details className="invoice-card" open={open}>
  <summary aria-controls={id} aria-expanded={open} onClick={event=>{event.preventDefault();onChange(open?null:title);}} className="invoice-section-toggle flex cursor-pointer list-none items-center justify-between gap-3 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c4aeec] [&::-webkit-details-marker]:hidden"><span>{title}</span><ChevronDown aria-hidden className={`h-4 w-4 text-white/50 transition-transform ${open?'rotate-180':''}`}/></summary>
  <div id={id} className="invoice-section-content" onFocusCapture={()=>{if(!open)onChange(title);}}>{children}</div>
 </details>;
}
