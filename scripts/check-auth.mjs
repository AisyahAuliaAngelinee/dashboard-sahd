import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key){console.error('Auth belum siap: isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY di .env.local.');process.exit(1)}
try{
 const parsed=new URL(url);
 if(!['https:','http:'].includes(parsed.protocol))throw new Error('invalid URL');
 const response=await fetch(new URL('/auth/v1/settings',parsed),{headers:{apikey:key},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error(`HTTP ${response.status}`);
 const settings=await response.json();
 const ready=Boolean(settings.external?.email&&settings.external?.google&&settings.external?.discord);
 console.log(JSON.stringify({reachable:true,email:!!settings.external?.email,google:!!settings.external?.google,discord:!!settings.external?.discord,emailConfirmation:!settings.mailer_autoconfirm,registrationEnabled:!settings.disable_signup,canonicalDomainConfigured:!!process.env.SAHD_APP_URL},null,2));
 console.log('Pemeriksaan ini tidak memvalidasi client secret OAuth, email delivery, migration, atau login end-to-end.');
 if(!ready)process.exitCode=1;
}catch{console.error('Tidak dapat membaca konfigurasi Auth. Periksa URL, publishable key, dan koneksi. Nilai konfigurasi tidak ditampilkan.');process.exitCode=1}
