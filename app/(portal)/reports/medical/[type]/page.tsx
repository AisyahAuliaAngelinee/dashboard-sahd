import {notFound} from 'next/navigation';
import {portalBootstrap} from '@/lib/portal-server';
import ReportWorkspace from '@/components/portal/report-workspace';
const titles:Record<string,string>={psychiatrist:'Psychiatrist Report',forensics:'Forensics Report',pharmacy:'Pharmacy Report'};
export default async function Page({params}:{params:Promise<{type:string}>}){
 const {type}=await params;const title=titles[type];if(!title)notFound();
 const data=await portalBootstrap();
 if(data.mode==='live'&&data.profile.division!=='Medical Service')return <div className="panel"><h1>Akses belum tersedia</h1><p className="muted mt-3">Hubungi admin untuk assignment Medical Service.</p></div>;
 return <ReportWorkspace title={title} division="Medical Service"/>;
}
