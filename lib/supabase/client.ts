import {createBrowserClient} from '@supabase/ssr';
import {sessionCookieOptions} from '@/lib/auth-session';
export function authConfigured(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)}
export function browserClient(){if(!authConfigured())throw new Error('Layanan akun belum dikonfigurasi.');return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookieOptions:sessionCookieOptions(typeof window!=='undefined'&&window.location.protocol==='https:'),auth:{persistSession:true,autoRefreshToken:true}})}
