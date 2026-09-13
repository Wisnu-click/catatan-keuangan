/**
 * 🔔 PWA & Mobile Real System Notification Helper for VIRA
 * Menampilkan notifikasi nyata ke panel / status bar handphone (Android / iOS PWA) & browser
 */

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return {
      supported: false,
      permission: 'unsupported',
      message: 'Browser / HP ini tidak mendukung Web Notifications API.',
    };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      supported: true,
      permission,
      granted: permission === 'granted',
      message:
        permission === 'granted'
          ? 'Izin notifikasi telah diaktifkan!'
          : permission === 'denied'
          ? 'Izin notifikasi ditolak. Silakan izinkan melalui Pengaturan Browser / HP Anda.'
          : 'Izin notifikasi belum ditentukan.',
    };
  } catch (error) {
    console.error('[PWA Notification] Error requesting permission:', error);
    return {
      supported: true,
      permission: Notification.permission,
      granted: Notification.permission === 'granted',
      message: 'Gagal meminta izin notifikasi: ' + error.message,
    };
  }
}

/**
 * Kirim Notifikasi Nyata ke Layar Handphone / Desktop
 */
export async function sendPwaNotification({
  title = 'VIRA - Catat Keuangan',
  body = '🔔 Ini adalah notifikasi pengujian langsung di layar handphone Anda!',
  icon = '/logo.png',
  badge = '/logo.png',
  url = '/dashboard',
  tag = 'vira-test-notification',
  delayMs = 0,
}) {
  if (!('Notification' in window)) {
    alert('Browser / HP ini belum mendukung Web Notifications API.');
    return false;
  }

  // Cek dan minta izin jika belum granted
  let permission = Notification.permission;
  if (permission !== 'granted') {
    const permResult = await requestNotificationPermission();
    permission = permResult.permission;
    if (permission !== 'granted') {
      alert(
        '⚠️ Izin notifikasi diperlukan untuk menampilkan notifikasi pada panel layar HP Anda.\nSilakan izinkan notifikasi saat jendela konfirmasi muncul.'
      );
      return false;
    }
  }

  const trigger = async () => {
    const options = {
      body,
      icon,
      badge,
      tag: tag + '-' + Date.now(),
      vibrate: [200, 100, 200, 100, 200],
      renotify: true,
      requireInteraction: false,
      data: {
        url,
        timestamp: Date.now(),
      },
      actions: [
        { action: 'open', title: 'Buka Aplikasi' },
        { action: 'close', title: 'Tutup' },
      ],
    };

    // 1. Prioritaskan Service Worker Registration showNotification (Wajib untuk PWA di Handphone Android & iOS)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(title, options);
          console.log('[PWA Notification] Notifikasi dikirim melalui Service Worker Registration.');
          return true;
        }
      } catch (swErr) {
        console.warn('[PWA Notification] Service Worker notification failed, falling back to Notification API:', swErr);
      }
    }

    // 2. Fallback ke window.Notification standar
    try {
      const n = new Notification(title, {
        body: options.body,
        icon: options.icon,
        badge: options.badge,
        tag: options.tag,
        data: options.data,
      });

      n.onclick = function (e) {
        e.preventDefault();
        window.focus();
        if (url) window.location.href = url;
        n.close();
      };
      return true;
    } catch (apiErr) {
      console.error('[PWA Notification] Error creating direct notification:', apiErr);
      return false;
    }
  };

  if (delayMs > 0) {
    setTimeout(trigger, delayMs);
    return true;
  } else {
    return await trigger();
  }
}

