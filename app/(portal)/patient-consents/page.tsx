import {LocalizedView} from '@/components/portal/localized-view';
import {portalBootstrap} from '@/lib/portal-server';import PatientConsent from '@/components/portal/patient-consent';
export default async function Page(){const d=await portalBootstrap();return <LocalizedView>{<PatientConsent/>}</LocalizedView>}
