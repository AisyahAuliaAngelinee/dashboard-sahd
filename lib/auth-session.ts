// Keep cookie settings identical in the browser, server and token-refresh proxy.
export function sessionCookieOptions(secure:boolean){return {path:'/',sameSite:'lax' as const,secure}}
export const sessionCacheHeaders={'Cache-Control':'private, no-cache, no-store, must-revalidate, max-age=0','Pragma':'no-cache','Expires':'0','CDN-Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store'};
export function canonicalOrigin(value:string|undefined,production:boolean){if(!value?.trim())return null;const url=new URL(value.trim());if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||!['http:','https:'].includes(url.protocol)||production&&url.protocol!=='https:')throw new Error('SAHD_APP_URL harus berupa origin HTTPS tanpa path untuk production.');return url.origin}
