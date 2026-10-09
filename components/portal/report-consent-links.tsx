'use client';
import {useFeedbackState} from '@/components/runtime/feedback-toast';
import {LocalizedView} from '@/components/portal/localized-view';

import {useEffect,useMemo,useState} from 'react';
import {usePortal} from './provider';
import {matchingConsentLinks} from '@/lib/report-consent';
import type {ConsentRow} from '@/lib/consent-list';
import type {MedicalDraft,ConsentLink} from '@/lib/medical-report';
export default function ReportConsentLinks({draft,onChange}:{draft:MedicalDraft;onChange:(v:ConsentLink[])=>void}){
 const {mode,profile}=usePortal();
 const [rows,setRows]=useState<ConsentRow[]>([]),[message,setMessage]=useFeedbackState('', 'notice'),[loaded,setLoaded]=useState(false);
 useEffect(()=>{let active=true;setLoaded(false);setMessage('');async function load(){try{
  let consents:ConsentRow[];
  if(mode==='demo')consents=JSON.parse(localStorage.getItem(`sahd-consents:${profile.id}`)||'[]');
  else {const r=await fetch('/api/consents');const d=await r.json();if(!r.ok)throw Error(d.error);consents=d.consents}
  if(active){setRows(consents);setLoaded(true)}
 }catch(e){if(active)setMessage(e instanceof Error?e.message:'Consent tidak dapat dimuat.')}}void load();return ()=>{active=false}},[mode,profile.id]);
 const links=useMemo(()=>matchingConsentLinks(draft.fields['Patient Name']||'',rows),[draft.fields,rows]);
 useEffect(()=>{if(loaded&&JSON.stringify(draft.consentLinks||[])!==JSON.stringify(links))onChange(links)},[loaded,links,draft.consentLinks,onChange]);
 return <LocalizedView>{<div className="report-consent-links"><h2>Patient Consent</h2>{message?<p role="status" className="muted text-xs">{message}</p>:!loaded?<p role="status" className="muted text-xs">Memuat consent…</p>:links.length?links.map((link,index)=><div className="report-consent-link" key={link.id}><a href={`/share/consent/${link.token}`} target="_blank" rel="noreferrer">Preview consent — {link.name}{links.length>1?` (${index+1})`:''} ↗</a></div>):<p className="muted text-xs">{draft.fields['Patient Name']?.trim()?'Belum ada consent dengan nama pasien yang sesuai.':'Isi Patient Name untuk menampilkan consent.'}</p>}</div>}</LocalizedView>
}
