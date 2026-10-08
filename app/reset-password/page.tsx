import '@/app/portal.css';
import {redirect} from 'next/navigation';
import {serverClient} from '@/lib/supabase/server';
import ResetForm from '@/components/auth/reset-form';
export const metadata={title:'Reset password | SAHD Operations'};
export default async function ResetPage(){
 const client=await serverClient();
 if(!client || !(await client.auth.getUser()).data.user) redirect('/login?error=recovery');
 return <ResetForm/>;
}
