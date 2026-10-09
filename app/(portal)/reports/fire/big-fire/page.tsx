import {LocalizedView} from '@/components/portal/localized-view';
import {portalBootstrap} from '@/lib/portal-server';
import ReportWorkspace from '@/components/portal/report-workspace';
export default async function Page(){
 const data=await portalBootstrap();
 if(data.mode==='live'&&data.profile.division!=='Fire Department')return <LocalizedView>{<div className="panel"><h1>Akses Belum Tersedia</h1><p className="muted mt-3">Hubungi admin untuk assignment Fire Department.</p></div>}</LocalizedView>;
 return <LocalizedView>{<ReportWorkspace title="Big Fire Report" division="Fire Department"/>}</LocalizedView>;
}
