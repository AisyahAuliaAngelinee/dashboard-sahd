'use client';
import {LocalizedView} from '@/components/portal/localized-view';

import {PageTitle} from './preferences';
import {usePortal} from './provider';
import ReportList from './report-list';
import {FileText} from 'lucide-react';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {permissions} from '@/lib/access-policy';
import {ReportTemplateUpload} from './report-template-upload';
import {renderReportTemplate} from '@/lib/medical-report';

/** Tables for report types whose document formats have not yet been supplied. */
export default function ReportWorkspace({title,division}:{title:string;division:string}) {
 const {profile}=usePortal();
 const [preview,setPreview]=useState('');
 function download(){
  const url=URL.createObjectURL(new Blob([preview],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=title+'.txt';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <LocalizedView>{<div className="medical-reports">
  <div className="report-heading"><div><p className="label">{division}</p><h1><PageTitle>{title}</PageTitle></h1><p className="muted text-sm">Daftar laporan {title.toLowerCase()}.</p></div></div>
  <div className="announcement"><FileText size={20}/><p className="text-sm">{title} belum memiliki format bawaan. Gunakan template untuk menyiapkan draft teks.</p></div>
  {permissions(profile).medicalWrite&&preview&&<section className="panel report-case">
   <h2>Draft dari Template</h2>
   {preview&&<><textarea aria-label="Preview template" value={preview} maxLength={100000} rows={12} onChange={e=>setPreview(e.target.value)}/><Button onClick={download}>Download TXT</Button></>}
  </section>}
  <ReportList templateAction={permissions(profile).medicalWrite&&<ReportTemplateUpload hasFormat={!!preview.trim()} onApply={template=>setPreview(renderReportTemplate(template,{Title:title}))} hint="Placeholder: {{Title}}. Draft dapat diunduh sebagai teks."/>} reports={[]} userId={profile.id} busy={false} showCategoryFilter={false} onOpen={()=>{}} onDownload={()=>{}} onDelete={async()=>{}}/>
 </div>}</LocalizedView>;
}
