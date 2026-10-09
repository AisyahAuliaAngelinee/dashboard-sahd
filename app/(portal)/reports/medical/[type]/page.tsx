import {LocalizedView} from '@/components/portal/localized-view';
import {notFound} from 'next/navigation';
import {portalBootstrap} from '@/lib/portal-server';
import ReportWorkspace from '@/components/portal/report-workspace';
import PlasticReports from '@/components/portal/plastic-reports';
const titles:Record<string,string>={'plastic-surgery':'Plastic Surgery Report',psychiatrist:'Psychiatrist Report',forensics:'Forensics Report',pharmacy:'Pharmacy Report',visum:'Visum'};
export default async function Page({params}:{params:Promise<{type:string}>}){
 const {type}=await params;const title=titles[type];if(!title)notFound();
 const data=await portalBootstrap();

 if(type==='plastic-surgery')return <PlasticReports/>;
 return <LocalizedView>{<ReportWorkspace title={title} division="Medical Service"/>}</LocalizedView>;
}
