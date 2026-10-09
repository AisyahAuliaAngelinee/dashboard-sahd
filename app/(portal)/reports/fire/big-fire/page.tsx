import {portalBootstrap} from '@/lib/portal-server';
import ReportWorkspace from '@/components/portal/report-workspace';
export default async function Page(){
 const data=await portalBootstrap();
 if(data.mode==='live'&&data.profile.division!=='Fire Department')return <div className="panel"><h1>Akses belum tersedia</h1><p className="muted mt-3">Hubungi admin untuk assignment Fire Department.</p></div>;
 return <ReportWorkspace title="Big Fire Report" division="Fire Department"/>;
}
