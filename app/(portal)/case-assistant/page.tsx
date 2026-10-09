import {LocalizedView} from '@/components/portal/localized-view';
import {portalBootstrap} from '@/lib/portal-server';
import CaseAssistant from '@/components/portal/case-assistant';
export default async function Page(){const data=await portalBootstrap();if(data.mode==='live'&&data.profile.division!=='Medical Service')return <LocalizedView>{<div className="panel">Akses Medical Service diperlukan.</div>}</LocalizedView>;return <LocalizedView>{<CaseAssistant/>}</LocalizedView>}
