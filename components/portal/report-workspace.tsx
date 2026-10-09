'use client';
import {usePortal} from './provider';
import ReportList from './report-list';
import {FileText} from 'lucide-react';

/** Tables for report types whose document formats have not yet been supplied. */
export default function ReportWorkspace({title,division}:{title:string;division:string}) {
 const {profile}=usePortal();
 return <div className="medical-reports">
  <div className="report-heading"><div><p className="label">{division}</p><h1>{title}</h1><p className="muted text-sm">Daftar laporan {title.toLowerCase()}.</p></div></div>
  <div className="announcement"><FileText size={20}/><p className="text-sm">Tabel sudah disiapkan. Pembuatan {title} akan tersedia setelah format dokumen ditentukan.</p></div>
  <ReportList reports={[]} userId={profile.id} busy={false} showCategoryFilter={false} onOpen={()=>{}} onDownload={()=>{}} onDelete={async()=>{}}/>
 </div>;
}
