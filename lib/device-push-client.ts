/** Wait for this registration, rather than an unrelated worker from ready. */
export function waitForPushWorker(registration: ServiceWorkerRegistration, timeoutMs = 15000): Promise<void> {
 if (registration.active?.state === 'activated') return Promise.resolve();
 return new Promise((resolve, reject) => {
  const workers = new Set<ServiceWorker>();
  const finish = (error?: Error) => { clearTimeout(timer); registration.removeEventListener('updatefound', observe); workers.forEach(worker => worker.removeEventListener('statechange', check)); error ? reject(error) : resolve(); };
  const check = () => { if (registration.active?.state === 'activated') finish(); };
  const observe = () => { for (const worker of [registration.installing, registration.waiting, registration.active]) if (worker && !workers.has(worker)) { workers.add(worker); worker.addEventListener('statechange', check); } check(); };
  const timer = setTimeout(() => finish(new Error('push-worker-timeout')), timeoutMs);
  registration.addEventListener('updatefound', observe); observe();
 });
}
export function pushApplicationKey(key: string): Uint8Array<ArrayBuffer> {
 const normalized = key.trim();
 if (!/^[A-Za-z0-9_-]{87}$/.test(normalized)) throw new Error('push-invalid-key');
 const bytes = Uint8Array.from(atob(normalized.replace(/-/g, '+').replace(/_/g, '/') + '='), c => c.charCodeAt(0));
 if (bytes.length !== 65 || bytes[0] !== 4) throw new Error('push-invalid-key');
 return bytes;
}
export function pushRegistrationError(error: unknown, language: string): string {
 const e = error instanceof Error ? error : new Error(String(error));
 const id = language === 'id';
 if (e.message === 'push-invalid-key') return id ? 'Konfigurasi kunci notifikasi tidak valid. Minta admin memeriksa VAPID_PUBLIC_KEY di server.' : 'Invalid notification key. Ask an administrator to check VAPID_PUBLIC_KEY on the server.';
 if (e.message === 'push-worker-timeout' || e.name === 'InvalidStateError') return id ? 'Layanan notifikasi belum aktif. Muat ulang halaman, lalu coba lagi.' : 'The notification worker is not active yet. Reload the page and try again.';
 if (e.name === 'AbortError' || /registration failed|push service/i.test(e.message)) return id ? 'Browser gagal terhubung ke layanan push perangkat. Coba buka portal di Chrome, Edge, Firefox atau Safari langsung (bukan browser dalam aplikasi), periksa koneksi, lalu coba lagi.' : 'The browser could not connect to its device push service. Open the portal directly in Chrome, Edge, Firefox or Safari (outside an in-app browser), check your connection and try again.';
 if (e.name === 'NotAllowedError') return id ? 'Notifikasi diblokir. Izinkan notifikasi untuk situs ini di pengaturan browser.' : 'Notifications are blocked. Allow notifications for this site in browser settings.';
 return e.message;
}
