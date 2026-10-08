'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authConfigured, browserClient } from '@/lib/supabase/client';
import { authFeedback } from '@/lib/auth-feedback';

export default function LoginForm({ allowDemo }: { allowDemo: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const configured = authConfigured();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('error')) setMessage(authFeedback(params.get('error') || 'callback'));
    if (params.get('success') === 'password') setMessage('Password berhasil diperbarui. Silakan masuk dengan password baru.');
  }, []);
  async function oauth(provider: 'google' | 'discord') {
    setBusy(true); setMessage('');
    try {
      const { error } = await browserClient().auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback` } });
      if (error) throw new Error(authFeedback(error.code, 'Login provider gagal dimulai. Silakan coba lagi.'));
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Login gagal.'); setBusy(false); }
  }
  async function enterDemo() {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/demo', { method: 'POST' });
      if (!response.ok) throw new Error('Demo tidak tersedia.');
      router.push('/dashboard'); router.refresh();
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Demo gagal dibuka.'); }
    finally { setBusy(false); }
  }
  return <div>
    <Link href="/" className="inline-flex items-center gap-2 mb-10 muted text-xs">← Website SAHD</Link>
    <p className="label mb-2">WELCOME TO YOUR WORKSPACE</p><h1>Welcome back</h1>
    <p className="muted text-sm mt-2 mb-7">Masuk untuk melanjutkan aktivitas Anda.</p>
    {!configured && <p role="status" className="mb-5 p-3 bg-amber-50 rounded-lg text-xs text-amber-800">Login akun belum tersedia. Admin perlu menyelesaikan konfigurasi layanan akun.</p>}
    <div className="oauth-options">
      <Button variant="outline" disabled={busy || !configured} onClick={() => oauth('google')}><span className="font-bold text-blue-600">G</span>{busy&&<LoaderCircle size={16} className="animate-spin"/>}{busy?'Menghubungkan…':'Continue with Google'}<ArrowRight size={16}/></Button>
      <Button variant="outline" disabled={busy || !configured} onClick={() => oauth('discord')}><span className="font-bold text-indigo-500">◉</span>{busy?'Menghubungkan…':'Continue with Discord'}<ArrowRight size={16}/></Button>
    </div>
    <p className="muted text-xs mt-5 text-center">Gunakan akun Google atau Discord Anda. Form registrasi email sementara dinonaktifkan.</p>
    {message && <p role="status" className="text-xs p-3 rounded-lg bg-amber-50 text-amber-800 mt-5">{message}</p>}
    {allowDemo && <div className="border-t border-slate-200 mt-8 pt-6"><Button variant="secondary" disabled={busy} className="w-full" onClick={enterDemo}>Buka workspace demo <ArrowRight size={15}/></Button><p className="muted text-[11px] text-center mt-3">Data contoh. Demo bukan login akun.</p></div>}
  </div>;
}
