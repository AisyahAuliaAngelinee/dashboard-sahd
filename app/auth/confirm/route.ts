import {NextResponse} from 'next/server';
import {sessionCacheHeaders} from '@/lib/auth-session';
import {serverClient,appOrigin} from '@/lib/supabase/server';
import {cookies} from 'next/headers';
function redirectNoStore(url:URL){const response=NextResponse.redirect(url);Object.entries(sessionCacheHeaders).forEach(([name,value])=>response.headers.set(name,value));return response}
export async function GET(request:Request){
 const url=new URL(request.url);const token_hash=url.searchParams.get('token_hash');const type=url.searchParams.get('type');
 try{
  const client=await serverClient();
  if(token_hash&&client&&(type==='email'||type==='recovery')){
   const {error}=await client.auth.verifyOtp({token_hash,type});
   if(!error){(await cookies()).delete('sahd-demo');return redirectNoStore(new URL(type==='recovery'?'/reset-password':'/dashboard',appOrigin(request)))}
  }
 }catch{/* Invalid and expired links share a safe, actionable error. */}
 return redirectNoStore(new URL('/login?error=confirmation',appOrigin(request)));
}
