import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function Sheet({title,children,onClose,className='',layer=1}:{title:string;children:ReactNode;onClose:()=>void;className?:string;layer?:number}) {
 const ref=useRef<HTMLDivElement>(null);const titleId=useId();
 const closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  ref.current?.focus();
  const handle=(e:KeyboardEvent)=>{
   // Only the uppermost dialog handles keys.
   const dialogs=[...document.querySelectorAll<HTMLElement>('[role="dialog"]')];
   if(dialogs.at(-1)!==ref.current)return;
   if(e.key==='Escape'){e.preventDefault();closeRef.current()}
   if(e.key==='Tab'){
    const els=[...ref.current!.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input,select,[tabindex="0"]')].filter(x=>x.offsetParent!==null);
    if(!els.length){e.preventDefault();return}
    const first=els[0],last=els.at(-1)!;
    if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===ref.current)){e.preventDefault();first.focus()}
   }
  };
  document.addEventListener('keydown',handle);
  return()=>{document.removeEventListener('keydown',handle);previous?.focus({preventScroll:true})};
 },[]);
 return <div className={`overlay layer-${layer}`} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
  <div ref={ref} className={`sheet ${className}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
   <header className="sheet-header"><h2 id={titleId}>{title}</h2><button className="close-button" onClick={onClose} aria-label="Закрыть"><X size={20}/></button></header>
   <div className="sheet-body">{children}</div>
  </div>
 </div>;
}
