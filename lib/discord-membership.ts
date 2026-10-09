export type DiscordAccess = {allowed:true}|{allowed:false;reason:'discord_only'|'discord_not_member'|'discord_visitor'|'discord_verification_unavailable'};
export type DiscordMembershipConfig={required:boolean;guildId?:string;visitorRoleId?:string;providerToken?:string};
/** OAuth token remains on the server during this check. A failed check never grants access. */
export async function checkDiscordMembership(discordId:string|undefined,config:DiscordMembershipConfig,request:typeof fetch=fetch):Promise<DiscordAccess>{
 if(!config.required)return {allowed:true};
 const snowflake=(value:string|undefined)=>!!value&&/^\d{17,20}$/.test(value);
 if(!snowflake(config.guildId)||!snowflake(config.visitorRoleId)||!config.providerToken)return {allowed:false,reason:'discord_verification_unavailable'};
 if(!snowflake(discordId))return {allowed:false,reason:'discord_only'};
 try{
  const response=await request(`https://discord.com/api/v10/users/@me/guilds/${config.guildId}/member`,{headers:{Authorization:`Bearer ${config.providerToken}`},cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(response.status===404){const error=await response.json().catch(()=>null);return {allowed:false,reason:error?.code===10007||error?.code===10004?'discord_not_member':'discord_verification_unavailable'}}
  if(!response.ok)return {allowed:false,reason:'discord_verification_unavailable'};
  const member=await response.json();
  if(member.user?.id!==discordId||!Array.isArray(member.roles)||!member.roles.every((role:unknown)=>typeof role==='string'))return {allowed:false,reason:'discord_verification_unavailable'};
  return member.roles.includes(config.visitorRoleId)?{allowed:false,reason:'discord_visitor'}:{allowed:true};
 }catch{return {allowed:false,reason:'discord_verification_unavailable'}}
}
