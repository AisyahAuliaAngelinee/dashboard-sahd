// Keep cookie settings identical in the browser, server and token-refresh proxy.
export function sessionCookieOptions(secure:boolean){return {path:'/',sameSite:'lax' as const,secure}}
export const sessionCacheHeaders={'Cache-Control':'private, no-cache, no-store, must-revalidate, max-age=0','Pragma':'no-cache','Expires':'0','CDN-Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store'};
export function canonicalOrigin(value:string|undefined,production:boolean){if(!value?.trim())return null;const url=new URL(value.trim());if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||!['http:','https:'].includes(url.protocol)||production&&url.protocol!=='https:')throw new Error('SAHD_APP_URL harus berupa origin HTTPS tanpa path untuk production.');return url.origin}

export const SESSION_MAX_AGE=7*24*60*60;
/** Call only with claims verified by Supabase; token refresh must not renew the login window. */
export function loginExpiresAt(claims:{amr?:unknown}){
 if(!Array.isArray(claims.amr))return 0;
 const timestamps=claims.amr.filter((a):a is {method:string;timestamp:number}=>!!a&&a.method==='oauth'&&Number.isInteger(a.timestamp)&&a.timestamp>0).map(a=>a.timestamp);
 return timestamps.length?(Math.min(...timestamps)+SESSION_MAX_AGE)*1000:0;
}
export function loginIsCurrent(claims:{amr?:unknown},now=Date.now()){
 const expires=loginExpiresAt(claims);return expires>now&&expires<=now+SESSION_MAX_AGE*1000;
}

/** Keep OAuth and host-only cookies on either supported production domain. */
export function portalOrigin(requestOrigin:string,canonical:string|null){
 const origin=new URL(requestOrigin).origin;
 const allowed=new Set(['https://clarishna.my.id','https://dashboard-sahd.clarishna.my.id','https://dashboard-sahd.vercel.app',...(canonical?[canonical]:[])]);
 return allowed.has(origin)?origin:canonical||origin;
}
