import {LocalizedView} from '@/components/portal/localized-view';
import {portalBootstrap} from '@/lib/portal-server';
import MedicalReports from '@/components/portal/medical-reports';
export default async function Page(){const data=await portalBootstrap();return <LocalizedView>{<MedicalReports/>}</LocalizedView>}
