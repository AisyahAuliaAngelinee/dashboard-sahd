self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(clients.claim()));
self.addEventListener('push',event=>{
 let message={};try{message=event.data?.json()||{}}catch{}
 const path=typeof message.url==='string'&&/^\/announcements\/[a-f0-9-]{36}$/i.test(message.url)?message.url:'/announcements';
 event.waitUntil(self.registration.showNotification(message.title||'SAHD Announcement',{body:message.body||'Ada announcement baru.',icon:'/push-icon-192.png',tag:message.tag||'sahd-announcement',data:{url:path}}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();const candidate=event.notification.data?.url;const path=typeof candidate==='string'&&/^\/announcements\/[a-f0-9-]{36}$/i.test(candidate)?candidate:'/announcements';event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{for(const client of windows){if(new URL(client.url).origin===self.location.origin){await client.navigate(path);return client.focus()}}return clients.openWindow(path)}));});
