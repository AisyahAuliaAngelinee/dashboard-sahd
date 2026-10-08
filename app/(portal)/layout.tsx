export const dynamic='force-dynamic';
import '@/app/portal.css';import {PortalProvider} from '@/components/portal/provider';import Shell from '@/components/portal/shell';import {portalBootstrap} from '@/lib/portal-server';
export default async function PortalLayout({children}:{children:React.ReactNode}){const initial=await portalBootstrap();return <PortalProvider initial={initial}><Shell>{children}</Shell></PortalProvider>}
