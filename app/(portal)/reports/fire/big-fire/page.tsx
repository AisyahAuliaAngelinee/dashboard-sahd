import {LocalizedView} from '@/components/portal/localized-view';
import {portalBootstrap} from '@/lib/portal-server';
import ReportWorkspace from '@/components/portal/report-workspace';
export default async function Page(){
 const data=await portalBootstrap();

 return <LocalizedView>{<ReportWorkspace title="Big Fire Report" division="Fire Department"/>}</LocalizedView>;
}
