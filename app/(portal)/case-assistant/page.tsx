import {LocalizedView} from '@/components/portal/localized-view';
import {portalBootstrap} from '@/lib/portal-server';
import CaseAssistant from '@/components/portal/case-assistant';
export default async function Page(){const data=await portalBootstrap();return <LocalizedView>{<CaseAssistant/>}</LocalizedView>}
