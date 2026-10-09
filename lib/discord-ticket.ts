import {createHmac,timingSafeEqual} from 'node:crypto';
export const DISCORD_TICKET_TTL=24*60*60;
export type DiscordTicketContext={userId:string;guildId:string;visitorRoleId:string};
const sign=(payload:string,secret:string)=>createHmac('sha256',secret).update(payload).digest('base64url');
/** Signed, expiring login proof; contains no provider token, credentials, or Discord roles. */
export function createDiscordTicket(context:DiscordTicketContext,secret:string,now=Date.now()){
 if(secret.length<32)throw new Error('Discord verification secret is not configured.');
 const payload=Buffer.from(JSON.stringify({...context,expires:Math.floor(now/1000)+DISCORD_TICKET_TTL})).toString('base64url');
 return `${payload}.${sign(payload,secret)}`;
}
export function validDiscordTicket(ticket:string|undefined,context:DiscordTicketContext,secret:string|undefined,now=Date.now()){
 if(!ticket||!secret||secret.length<32||ticket.length>2048)return false;
 try{const [payload,signature,...extra]=ticket.split('.');if(!payload||!signature||extra.length)return false;const received=Buffer.from(signature,'base64url'),expected=Buffer.from(sign(payload,secret),'base64url');if(received.length!==expected.length||!timingSafeEqual(received,expected))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));const seconds=Math.floor(now/1000);return data.userId===context.userId&&data.guildId===context.guildId&&data.visitorRoleId===context.visitorRoleId&&Number.isInteger(data.expires)&&data.expires>seconds&&data.expires<=seconds+DISCORD_TICKET_TTL}catch{return false}
}
