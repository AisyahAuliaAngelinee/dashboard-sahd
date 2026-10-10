'use client';
import {useEffect,useState} from 'react';
import {waitForPushWorker,pushApplicationKey,pushRegistrationError} from '@/lib/device-push-client';
import {BellRing} from 'lucide-react';
import {Switch} from '@/components/ui/switch';
import {usePortal} from './provider';
import {usePreferences} from './preferences';
import {showFeedback} from '@/components/runtime/feedback-toast';
export default function DevicePushSettings(){
 const {profile,mode}=usePortal(),{language}=usePreferences();const [enabled,setEnabled]=useState(false),[busy,setBusy]=useState(true),[key,setKey]=useState(''),[message,setMessage]=useState('');
 const tr=(en:string,id:string)=>language==='id'?id:en;
 useEffect(()=>{let cancelled=false;(async()=>{try{
 if(!window.isSecureContext||!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){setMessage(tr('This browser does not support device notifications. On iPhone/iPad, add the portal to your Home Screen first.','Browser ini belum mendukung notifikasi perangkat. Pada iPhone/iPad, tambahkan portal ke Layar Utama terlebih dahulu.'));return}
 if(mode!=='live'){setMessage(tr('Available after signing in with Discord.','Tersedia setelah login dengan Discord.'));return}
 const r=await fetch('/api/push',{cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.error||'Unable to load notification settings.');if(cancelled)return;
 if(d.error)throw Error(d.error);if(!d.configured){setMessage(tr('Device notifications have not been configured by the administrator.','Notifikasi perangkat belum dikonfigurasi oleh admin.'));return}setKey(d.publicKey);
 const registration=await navigator.serviceWorker.getRegistration('/'),subscription=await registration?.pushManager.getSubscription();if(!cancelled)setEnabled(!!subscription&&d.subscriptions.some((s:{endpoint:string;enabled:boolean})=>s.enabled&&s.endpoint===subscription.endpoint));
 }catch(e){if(!cancelled)setMessage((e as Error).message)}finally{if(!cancelled)setBusy(false)}})();return()=>{cancelled=true}},[profile.id,mode,language]);
 async function toggle(next:boolean){setBusy(true);try{
 if(next&&await Notification.requestPermission()!=='granted')throw Error(tr('Allow notifications in your browser settings to enable this feature.','Izinkan notifikasi di pengaturan browser untuk mengaktifkan fitur ini.'));
 const registration=await navigator.serviceWorker.register('/announcement-sw.js',{scope:'/',updateViaCache:'none'});await waitForPushWorker(registration);let subscription=await registration.pushManager.getSubscription();
 if(next){
 const created=!subscription;if(!subscription){subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushApplicationKey(key)})}
 const response=await fetch('/api/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(subscription.toJSON())});if(!response.ok){if(created)await subscription.unsubscribe();throw Error((await response.json()).error)}
 }else if(subscription){const response=await fetch('/api/push',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:subscription.endpoint})});if(!response.ok)throw Error((await response.json()).error);await subscription.unsubscribe()}
 setEnabled(next);showFeedback(next?tr('Announcement device notifications enabled.','Notifikasi perangkat Announcement aktif.'):tr('Device notifications disabled on this browser.','Notifikasi perangkat dimatikan pada browser ini.'),'notice');
 }catch(e){showFeedback(pushRegistrationError(e,language)||tr('Unable to update device notifications.','Gagal mengubah notifikasi perangkat.'))}finally{setBusy(false)}}
 return <div className="form-section flex items-center justify-between gap-6"><div><h2 className="flex items-center gap-2"><BellRing size={19}/>{tr('Device Notifications','Notifikasi Perangkat')}</h2><p className="muted text-xs mt-2">{tr('Announcements only, including when the portal tab is closed. This setting applies to this browser/device and saves immediately.','Khusus Announcement, termasuk saat tab portal ditutup. Berlaku pada browser/perangkat ini dan langsung tersimpan.')}</p>{message&&<p className="muted text-xs mt-2" role="status">{message}</p>}</div><Switch type="button" aria-label={tr('Announcement device notifications','Notifikasi perangkat Announcement')} checked={enabled} disabled={busy||!key} onCheckedChange={toggle}/></div>
}
