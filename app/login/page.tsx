import '@/app/portal.css';
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { redirect } from 'next/navigation';
import { serverClient, demoAllowed } from '@/lib/supabase/server';
import LoginForm from '@/components/auth/login-form';
export const metadata = { title: 'Login | SAHD Operations' };
export default async function LoginPage() {
 const client = await serverClient();
 if (client && (await client.auth.getUser()).data.user) redirect('/dashboard');
 return <div className="portal login-shell"><aside className="login-story"><Link href="/" className="flex items-center gap-4"><img src="/sahd-logo.webp" alt="SAHD"/><div><b className="text-2xl">SAHD</b><p className="text-xs opacity-60">San Andreas Health Department</p></div></Link><div className="my-auto py-16 relative z-10"><span className="text-xs tracking-[3px] text-teal-200">CARE BEYOND DUTY</span><h1 className="mt-6">A better workspace.<br/><span className="text-teal-200">For every story.</span></h1><p className="text-sm opacity-70 mt-6 max-w-sm leading-7">Satu tempat untuk tim medis dan fire department. Terhubung, terorganisir, dan siap untuk setiap panggilan.</p><div className="flex gap-4 mt-12"><span className="p-3 rounded-xl bg-white/10"><HeartPulse size={22}/></span><span className="text-sm">Medical Service & Fire Department<small className="block text-xs opacity-50 mt-1">Executive Roleplay · San Andreas</small></span></div></div><p className="text-xs opacity-40">SAHD Operations Portal · Internal workspace</p></aside><main className="login-form"><LoginForm allowDemo={demoAllowed()}/></main></div>;
}
