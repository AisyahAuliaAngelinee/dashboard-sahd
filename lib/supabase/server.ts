import 'server-only';
import {cookies} from 'next/headers';
import {createServerClient} from '@supabase/ssr';
export function demoAllowed(){return process.env.NODE_ENV!=='production'||process.env.SAHD_ENABLE_DEMO==='true'}
export async function serverClient(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return null;
 const jar=await cookies();
 return createServerClient(url,key,{cookies:{
  getAll:()=>jar.getAll(),
  setAll:(values)=>{try{values.forEach(({name,value,options})=>jar.set(name,value,options))}catch{/* Server Component cookies are refreshed in proxy. */}},
 }});
}
export function appOrigin(request:Request){
 if(process.env.SAHD_APP_URL)return new URL(process.env.SAHD_APP_URL).origin;
 const host=request.headers.get('host');const parsed=new URL(request.url);
 if(process.env.NODE_ENV!=='production'&&host&&/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host))return `http://${host}`;
 return parsed.origin;
}
export function validOrigin(request:Request){const origin=request.headers.get('origin');return !!origin&&origin===appOrigin(request)}
