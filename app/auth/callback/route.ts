import {NextResponse} from 'next/server';
import {sessionCacheHeaders} from '@/lib/auth-session';
import {serverClient,appOrigin} from '@/lib/supabase/server';
import {cookies} from 'next/headers';
function redirectNoStore(url:URL){const response=NextResponse.redirect(url);Object.entries(sessionCacheHeaders).forEach(([name,value])=>response.headers.set(name,value));return response}
export async function GET(request:Request){
 const url=new URL(request.url);
 const failure=(code:string)=>redirectNoStore(new URL(`/login?error=${code}`,appOrigin(request)));
 if(url.searchParams.has('error')){
  // Classify known upstream failures, never reflect provider descriptions or codes.
  const description=url.searchParams.get('error_description')||'';
  if(description.startsWith('Unable to exchange external code'))return failure('provider_exchange');
  return failure(url.searchParams.get('error')==='access_denied'?'access_denied':'callback');
 }
 try{
  const code=url.searchParams.get('code');const client=await serverClient();
  if(code&&client){const {error}=await client.auth.exchangeCodeForSession(code);
   if(!error){(await cookies()).delete('sahd-demo');return redirectNoStore(new URL(url.searchParams.get('recovery')==='1'?'/reset-password':'/dashboard',appOrigin(request)))}
  }
 }catch{/* Never expose OAuth codes, tokens or upstream error descriptions. */}
 return failure('callback');
}
