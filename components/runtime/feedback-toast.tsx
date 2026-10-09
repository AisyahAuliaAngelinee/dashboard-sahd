'use client';
import {useCallback,useEffect,useState,type SetStateAction} from 'react';
import {createPortal} from 'react-dom';
import {AlertCircle,Info,X} from 'lucide-react';
type Feedback={message:string;kind:'error'|'notice'};
export function showFeedback(message:string,kind:Feedback['kind']='error'){
 if(message.trim()&&typeof window!=='undefined')window.dispatchEvent(new CustomEvent<Feedback>('sahd-feedback',{detail:{message,kind}}));
}
/** Shared feedback state keeps field-level context while also announcing it globally. */
export function useFeedbackState(initial='',kind:Feedback['kind']='error'){
 const [value,setValue]=useState(initial);
 useEffect(()=>{if(initial)showFeedback(initial,kind)},[]);
 const update=useCallback((next:SetStateAction<string>)=>{setValue(previous=>typeof next==='function'?next(previous):next);if(typeof next==='string'&&next)showFeedback(next,kind)},[kind]);
 return [value,update] as const;
}
export default function FeedbackToast(){
 const [items,setItems]=useState<(Feedback&{id:number})[]>([]),[mounted,setMounted]=useState(false);
 useEffect(()=>{setMounted(true);let sequence=0;const timers=new Set<ReturnType<typeof setTimeout>>();
  const receive=(event:Event)=>{const detail=(event as CustomEvent<Feedback>).detail;if(!detail?.message)return;const id=++sequence;setItems(items=>[...items.filter(item=>item.message!==detail.message),{...detail,id}].slice(-3));const timer=setTimeout(()=>{setItems(items=>items.filter(item=>item.id!==id));timers.delete(timer)},7000);timers.add(timer)};
  let invalidPending=false;const invalid=(event:Event)=>{event.preventDefault();if(invalidPending)return;invalidPending=true;queueMicrotask(()=>{invalidPending=false});const field=event.target;if(field instanceof HTMLInputElement||field instanceof HTMLTextAreaElement||field instanceof HTMLSelectElement){showFeedback(field.validationMessage||'Please complete the required field.');field.focus()}};
  const unexpected=()=>showFeedback('Terjadi kesalahan. Silakan coba kembali atau muat ulang halaman.');
  window.addEventListener('error',unexpected);window.addEventListener('unhandledrejection',unexpected);
  window.addEventListener('sahd-feedback',receive);document.addEventListener('invalid',invalid,true);
  return()=>{window.removeEventListener('error',unexpected);window.removeEventListener('unhandledrejection',unexpected);window.removeEventListener('sahd-feedback',receive);document.removeEventListener('invalid',invalid,true);timers.forEach(clearTimeout)};
 },[]);
 if(!mounted)return null;
 return createPortal(<div className="feedback-toasts" aria-label="Notifications">{items.map(item=><div key={item.id} className="feedback-toast" data-kind={item.kind} role={item.kind==='error'?'alert':'status'}>{item.kind==='error'?<AlertCircle size={20}/>:<Info size={20}/>}<span>{item.message}</span><button type="button" aria-label="Dismiss notification" onClick={()=>setItems(items=>items.filter(row=>row.id!==item.id))}><X size={16}/></button></div>)}</div>,document.body);
}
