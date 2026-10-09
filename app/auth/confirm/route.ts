import {NextResponse} from 'next/server';
import {sessionCacheHeaders} from '@/lib/auth-session';
import {appOrigin} from '@/lib/supabase/server';

// Email sign-in links are no longer accepted; Discord is the sole login method.
export async function GET(request:Request){
 const response=NextResponse.redirect(new URL('/login?error=discord_only',appOrigin(request)));
 Object.entries(sessionCacheHeaders).forEach(([name,value])=>response.headers.set(name,value));
 return response;
}
