import {NextResponse,type NextRequest} from 'next/server';import {createServerClient} from '@supabase/ssr';
export async function proxy(request:NextRequest){
 if(request.nextUrl.pathname.startsWith('/api/cron/')){const response=NextResponse.next();response.headers.set('Cache-Control','private, no-store');return response;}
 if(process.env.SAHD_APP_URL&&request.method==='GET'){const canonical=new URL(process.env.SAHD_APP_URL);if(request.headers.get('host')!==canonical.host){canonical.pathname=request.nextUrl.pathname;canonical.search=request.nextUrl.search;return NextResponse.redirect(canonical)}}
 let response=NextResponse.next({request});response.headers.set('Cache-Control','private, no-store');
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)return response;
 const client=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll:(values)=>{values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));response.headers.set('Cache-Control','private, no-store')}}});await client.auth.getClaims();return response;
}
export const config={matcher:['/login','/reset-password','/dashboard/:path*','/settings/:path*','/reports/:path*','/patient-consents/:path*','/case-assistant/:path*','/consultations/:path*','/announcements/:path*','/trash/:path*','/admin/:path*','/auth/:path*','/api/:path*']};
