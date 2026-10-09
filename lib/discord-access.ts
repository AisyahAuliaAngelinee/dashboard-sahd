import 'server-only';
import {cookies} from 'next/headers';
import type {User} from '@supabase/supabase-js';
import {checkDiscordMembership,type DiscordAccess} from './discord-membership';
import {createDiscordTicket,validDiscordTicket,DISCORD_TICKET_TTL} from './discord-ticket';
const cookieName='sahd-discord-membership';
const context=(user:User)=>({userId:user.id,guildId:process.env.DISCORD_GUILD_ID||'',visitorRoleId:process.env.DISCORD_VISITOR_ROLE_ID||''});
export const discordGateEnabled=()=>process.env.DISCORD_MEMBERSHIP_REQUIRED==='true';
export async function hasDiscordAccess(user:User){if(!discordGateEnabled())return true;return validDiscordTicket((await cookies()).get(cookieName)?.value,context(user),process.env.DISCORD_VERIFICATION_SECRET)}
export async function verifyDiscordLogin(user:User,providerToken:string|undefined):Promise<DiscordAccess>{
 if(!discordGateEnabled())return {allowed:true};
 if(!process.env.DISCORD_VERIFICATION_SECRET||process.env.DISCORD_VERIFICATION_SECRET.length<32)return {allowed:false,reason:'discord_verification_unavailable'};
 const identity=user.identities?.find(identity=>identity.provider==='discord');
 // Use provider identity data, never editable user_metadata or a client-supplied ID.
 const id=identity?.identity_data?.provider_id||identity?.identity_data?.sub||identity?.id;
 const result=await checkDiscordMembership(typeof id==='string'?id:undefined,{required:true,...context(user),providerToken});
 if(result.allowed)(await cookies()).set(cookieName,createDiscordTicket(context(user),process.env.DISCORD_VERIFICATION_SECRET),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:DISCORD_TICKET_TTL});
 else (await cookies()).delete(cookieName);
 return result;
}
