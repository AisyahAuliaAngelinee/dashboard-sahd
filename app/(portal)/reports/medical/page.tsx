import {portalBootstrap} from '@/lib/portal-server';
import MedicalReports from '@/components/portal/medical-reports';
export default async function Page(){const data=await portalBootstrap();if(data.mode==='live'&&data.profile.division!=='Medical Service')return <div className="panel"><h1>Akses Belum Tersedia</h1><p className="muted mt-3">Hubungi admin untuk assignment Medical Service.</p></div>;return <MedicalReports/>}
