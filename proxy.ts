import {NextResponse,type NextRequest} from 'next/server';import {createServerClient} from '@supabase/ssr';
import {canonicalOrigin,portalOrigin,sessionCookieOptions,sessionCacheHeaders} from '@/lib/auth-session';
export async function proxy(request:NextRequest){
 const noStore=(response:NextResponse)=>{Object.entries(sessionCacheHeaders).forEach(([name,value])=>response.headers.set(name,value));return response};
 if(request.nextUrl.pathname==='/api/health'||request.nextUrl.pathname.startsWith('/api/cron/'))return noStore(NextResponse.next());
 // Keep OAuth on the requested supported host so its PKCE cookie stays together.
 const canonical=process.env.NODE_ENV==='production'&&process.env.VERCEL_ENV!=='preview'?canonicalOrigin(process.env.SAHD_APP_URL,true):null;
 const origin=canonical?portalOrigin(request.nextUrl.origin,canonical):request.nextUrl.origin;
 if(canonical&&request.method==='GET'&&request.nextUrl.origin!==origin){const target=new URL(origin);target.pathname=request.nextUrl.pathname;target.search=request.nextUrl.search;return noStore(NextResponse.redirect(target))}
 let response=noStore(NextResponse.next({request}));
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)return response;
 const client=createServerClient(url,key,{cookieOptions:sessionCookieOptions(process.env.NODE_ENV==='production'),cookies:{
  getAll:()=>request.cookies.getAll(),
  setAll:(values,headers)=>{
   values.forEach(({name,value})=>request.cookies.set(name,value));
   const previous=response.cookies.getAll();response=noStore(NextResponse.next({request}));
   previous.forEach(cookie=>response.cookies.set(cookie));
   values.forEach(({name,value,options})=>response.cookies.set(name,value,options));
   Object.entries(headers).forEach(([name,value])=>response.headers.set(name,value));
  },
 }});
 await client.auth.getClaims();return response;
}
export const config={matcher:['/login','/reset-password','/dashboard/:path*','/settings/:path*','/reports/:path*','/patient-consents/:path*','/case-assistant/:path*','/consultations/:path*','/announcements/:path*','/trash/:path*','/admin/:path*','/auth/:path*','/api/:path*']};
