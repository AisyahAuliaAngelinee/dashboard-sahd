import {NextResponse} from 'next/server';
import {serverClient,appOrigin} from '@/lib/supabase/server';
import {cookies} from 'next/headers';
export async function GET(request:Request){
 const url=new URL(request.url);const token_hash=url.searchParams.get('token_hash');const type=url.searchParams.get('type');
 try{
  const client=await serverClient();
  if(token_hash&&client&&(type==='email'||type==='recovery')){
   const {error}=await client.auth.verifyOtp({token_hash,type});
   if(!error){(await cookies()).delete('sahd-demo');return NextResponse.redirect(new URL(type==='recovery'?'/reset-password':'/dashboard',appOrigin(request)))}
  }
 }catch{/* Invalid and expired links share a safe, actionable error. */}
 return NextResponse.redirect(new URL('/login?error=confirmation',appOrigin(request)));
}
