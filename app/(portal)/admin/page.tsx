import {portalBootstrap} from '@/lib/portal-server';import {redirect} from 'next/navigation';import AdminForm from '@/components/portal/admin';
export default async function AdminPage(){const data=await portalBootstrap();if(data.mode!=='live'||data.profile.role!=='Admin')redirect('/settings/account');return <AdminForm members={data.members.filter(m=>m.id!==data.profile.id)}/>}
