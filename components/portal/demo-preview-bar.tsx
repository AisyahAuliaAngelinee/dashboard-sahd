'use client';
import Link from 'next/link';
import {ArrowLeft,Eye} from 'lucide-react';
import {usePortal} from './provider';
import {usePreferences} from './preferences';
import {customDemoPreview} from '@/lib/demo-preview';
import {divisions,positions} from '@/lib/member-options';
import {ReportSelect} from './report-fields';
import type {Profile} from '@/lib/portal-data';
export default function DemoPreviewBar(){
 const {mode,profile,demoPreview,setDemoPreview}=usePortal(),{language}=usePreferences();if(mode!=='demo')return null;const id=language==='id';
 function change(next:Partial<Profile>){setDemoPreview(customDemoPreview({...profile,...next}))}
 const division=divisions.includes(profile.division as typeof divisions[number])?profile.division:'Medical Service';
 return <div className="demo-preview-bar" role="region" aria-label="Demo role preview"><Link href="/settings/account" className="demo-preview-back"><ArrowLeft size={15}/>{id?'Kembali ke Pengaturan':'Back to Account Settings'}</Link><span className="demo-preview-status"><Eye size={15}/>{demoPreview?(id?'Preview akses workspace':'Workspace access preview'):(id?'Demo · Preview nonaktif':'Demo · Preview disabled')}</span><button type="button" className="demo-preview-disable" disabled={!demoPreview} onClick={()=>setDemoPreview('')}>{id?'Nonaktifkan':'Disable'}</button><div className="demo-preview-controls"><div className="demo-preview-field"><span>{id?'Akses Web':'Web Access'}</span><ReportSelect label="Preview web access" value={profile.accessRole||'Member'} items={['Member','Admin','Superadmin'].map(value=>({value,label:value}))} onChange={v=>change({accessRole:v as Profile['accessRole'],division,position:profile.position||'Trainee'})}/></div><div className="demo-preview-field"><span>Role</span><span className="demo-preview-role" aria-disabled="true">SAHD</span></div><div className="demo-preview-field"><span>{id?'Divisi':'Division'}</span><ReportSelect label="Preview division" value={division} items={divisions.map(value=>({value,label:value}))} onChange={v=>change({division:v,position:'Trainee'})}/></div><div className="demo-preview-field"><span>{id?'Posisi / Jabatan':'Position / Title'}</span><ReportSelect label="Preview position" value={profile.position||'Trainee'} items={(positions[division]||['Trainee']).map(value=>({value,label:value}))} onChange={v=>change({division,position:v})}/></div></div></div>
}
