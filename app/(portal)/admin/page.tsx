import {canManageMembers} from '@/lib/member-directory';
import {LocalizedView} from '@/components/portal/localized-view';
import {portalBootstrap} from '@/lib/portal-server';import {redirect} from 'next/navigation';import AdminForm from '@/components/portal/admin';
export default async function AdminPage(){const data=await portalBootstrap();if(data.mode!=='live'||!canManageMembers(data.profile))redirect('/settings/account');return <LocalizedView>{<AdminForm members={data.members.filter(m=>m.id!==data.profile.id)}/>}</LocalizedView>}
