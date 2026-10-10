'use client';
import Link from 'next/link';
import {ArrowLeft,Eye} from 'lucide-react';
import {usePortal} from './provider';
import {usePreferences} from './preferences';
import {demoPreviews} from '@/lib/demo-preview';
import {ReportSelect} from './report-fields';
export default function DemoPreviewBar(){const {mode,demoPreview,setDemoPreview}=usePortal(),{language}=usePreferences();if(mode!=='demo')return null;const id=language==='id';return <div className="demo-preview-bar" role="region" aria-label="Demo role preview"><Link href="/settings/account" className="demo-preview-back"><ArrowLeft size={15}/>{id?'Kembali ke Pengaturan':'Back to Account Settings'}</Link><div className="demo-preview-controls"><span><Eye size={15}/>{demoPreview?(id?'Preview akses sebagai':'Previewing workspace as'):(id?'Demo · Preview nonaktif':'Demo · Preview disabled')}</span><ReportSelect label="Preview access" value={demoPreview||'default'} items={[{value:'default',label:id?'Akses default':'Default access'},...demoPreviews.map(p=>({value:p.id,label:p.label}))]} onChange={v=>setDemoPreview(v==='default'?'':v)}/></div><button type="button" className="demo-preview-disable" disabled={!demoPreview} onClick={()=>setDemoPreview('')}>{id?'Nonaktifkan':'Disable'}</button></div>}
