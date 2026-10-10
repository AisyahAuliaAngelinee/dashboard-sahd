export function validPushSubscription(v:unknown):v is {endpoint:string;keys:{p256dh:string;auth:string}}{
 if(!v||typeof v!=='object')return false;const s=v as {endpoint:string;keys:{p256dh:string;auth:string}};
 if(typeof s.endpoint!=='string'||s.endpoint.length>2048)return false;
 try{const u=new URL(s.endpoint);if(u.protocol!=='https:'||u.port||u.username||u.password||!(['fcm.googleapis.com','web.push.apple.com'].includes(u.hostname)||u.hostname==='updates.push.services.mozilla.com'||u.hostname.endsWith('.push.services.mozilla.com')||u.hostname.endsWith('.notify.windows.com')))return false}catch{return false}
 return !!s.keys&&/^[A-Za-z0-9_-]{87}$/.test(s.keys.p256dh)&&/^[A-Za-z0-9_-]{22}$/.test(s.keys.auth);
}
