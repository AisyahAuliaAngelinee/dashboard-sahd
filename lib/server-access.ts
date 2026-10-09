import 'server-only';
import type {serverClient} from './supabase/server';
import type {Profile} from './portal-data';
export async function requestProfile(client:NonNullable<Awaited<ReturnType<typeof serverClient>>>,id:string):Promise<Profile|null>{const {data}=await client.from('profiles').select('id,display_name,role,division,job_title,access_role,is_active,teams').eq('id',id).single();if(!data||data.is_active===false)return null;return {id:data.id,name:data.display_name,role:data.role,division:data.division||'',position:data.job_title||'',accessRole:data.access_role,teams:data.teams||[],providers:[],avatar:'',notifications:true}}
