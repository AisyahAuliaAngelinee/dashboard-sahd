import 'server-only';
import {hasDiscordAccess} from '@/lib/discord-access';
import {localDemoAllowed} from '@/lib/demo-access';
import {cookies} from 'next/headers';
import {createServerClient} from '@supabase/ssr';
import {canonicalOrigin,sessionCookieOptions} from '@/lib/auth-session';
export function demoAllowed(){return localDemoAllowed(process.env.NODE_ENV,process.env.VERCEL)}
export async function serverClient(options:{oauthCallback?:boolean}={}){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return null;
 const jar=await cookies();
 const client=createServerClient(url,key,{cookieOptions:sessionCookieOptions(process.env.NODE_ENV==='production'),cookies:{
  getAll:()=>jar.getAll(),
  setAll:(values)=>{try{values.forEach(({name,value,options})=>jar.set(name,value,options))}catch{/* Server Component cookies are refreshed in proxy. */}},
 }});
 const {data:{user}}=await client.auth.getUser();if(user){if(!options.oauthCallback&&!(await hasDiscordAccess(user)))return null;const active=await client.rpc('is_active_member');if(!active.error&&active.data===false)return null;}
 return client;
}
export function appOrigin(request:Request){
 const canonical=process.env.VERCEL_ENV==='preview'?null:canonicalOrigin(process.env.SAHD_APP_URL,process.env.NODE_ENV==='production');
 if(process.env.NODE_ENV==='production'&&canonical)return canonical;
 const host=request.headers.get('host');const parsed=new URL(request.url);
 if(process.env.NODE_ENV!=='production'&&host&&/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host))return `http://${host}`;
 return parsed.origin;
}
export function validOrigin(request:Request){const origin=request.headers.get('origin');return !!origin&&origin===appOrigin(request)}
