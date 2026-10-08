import {portalBootstrap} from '@/lib/portal-server';
import CaseAssistant from '@/components/portal/case-assistant';
export default async function Page(){const data=await portalBootstrap();if(data.mode==='live'&&data.profile.division!=='Medical Service')return <div className="panel">Akses Medical Service diperlukan.</div>;return <CaseAssistant/>}
