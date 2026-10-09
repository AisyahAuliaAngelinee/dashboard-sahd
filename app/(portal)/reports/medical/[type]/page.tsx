import {LocalizedView} from '@/components/portal/localized-view';
import {notFound} from 'next/navigation';
import {portalBootstrap} from '@/lib/portal-server';
import ReportWorkspace from '@/components/portal/report-workspace';
const titles:Record<string,string>={psychiatrist:'Psychiatrist Report',forensics:'Forensics Report',pharmacy:'Pharmacy Report',visum:'Visum'};
export default async function Page({params}:{params:Promise<{type:string}>}){
 const {type}=await params;const title=titles[type];if(!title)notFound();
 const data=await portalBootstrap();

 return <LocalizedView>{<ReportWorkspace title={title} division="Medical Service"/>}</LocalizedView>;
}
