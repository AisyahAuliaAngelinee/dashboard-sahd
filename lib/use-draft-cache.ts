'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
/** Per-user, per-tab recovery. Never queues a server mutation or persists credentials. */
export function useDraftCache<T>(key:string,value:T,restore:(value:T)=>void,enabled:boolean,canRestore=true){
 const current=useRef({value,restore,enabled,canRestore});current.current={value,restore,enabled,canRestore};
 const [loaded,setLoaded]=useState('');
 const save=useCallback(()=>{try{if(!current.current.canRestore&&!current.current.enabled)return;if(current.current.enabled)sessionStorage.setItem(key,JSON.stringify(current.current.value));else sessionStorage.removeItem(key)}catch{window.dispatchEvent(new Event('sahd-draft-storage-error'))}},[key]);
 useEffect(()=>{try{const raw=sessionStorage.getItem(key);if(raw&&current.current.canRestore)current.current.restore(JSON.parse(raw))}catch{window.dispatchEvent(new Event('sahd-draft-storage-error'))}setLoaded(key)},[key]);
 useEffect(()=>{if(loaded!==key)return;const timer=setTimeout(save,250);return()=>clearTimeout(timer)},[key,loaded,value,enabled,save]);
 useEffect(()=>{if(loaded!==key)return;window.addEventListener('sahd-flush-drafts',save);window.addEventListener('pagehide',save);return()=>{save();window.removeEventListener('sahd-flush-drafts',save);window.removeEventListener('pagehide',save)}},[key,loaded,save]);
 return ()=>{try{sessionStorage.removeItem(key)}catch{}};
}
