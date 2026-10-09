import {LocalizedView} from '@/components/portal/localized-view';
import {portalBootstrap} from '@/lib/portal-server';import PatientConsent from '@/components/portal/patient-consent';
export default async function Page(){const d=await portalBootstrap();if(d.mode==='live'&&d.profile.division!=='Medical Service')return <LocalizedView>{<div className="panel">Akses Medical Service diperlukan.</div>}</LocalizedView>;return <LocalizedView>{<PatientConsent/>}</LocalizedView>}
