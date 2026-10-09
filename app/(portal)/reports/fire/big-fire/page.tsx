import FireReports from '@/components/portal/fire-reports';
import {portalBootstrap} from '@/lib/portal-server';
export default async function Page(){await portalBootstrap();return <FireReports/>}
