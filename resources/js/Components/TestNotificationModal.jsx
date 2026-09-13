import React, { useState, useEffect } from 'react';
import MaterialIcon from './MaterialIcon';
import NeoButton from './NeoButton';
import { requestNotificationPermission, sendPwaNotification } from '../Utils/pwaNotifications';

export default function TestNotificationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [permission, setPermission] = useState('default');
  const [countdown, setCountdown] = useState(0);
  const [testTitle, setTestTitle] = useState('VIRA - Transaksi Berhasil Dicatat! 💸');
  const [testBody, setTestBody] = useState('Pengeluaran sebesar Rp 50.000 (Makan Siang) berhasil disimpan ke Dompet Utama.');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  // Handle Request Permission
  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res.permission);
    setStatusMsg(res.message);
  };

  // Handle Instant Test
  const handleInstantTest = async () => {
    setStatusMsg('Mengirimkan notifikasi ke panel layar HP...');
    const success = await sendPwaNotification({
      title: testTitle,
      body: testBody,
      url: '/dashboard',
      tag: 'vira-instant-test',
    });

    if (success) {
      setStatusMsg('✅ Notifikasi berhasil dikirim! Periksa bar status / panel atas HP Anda.');
    }
  };

  // Handle Delayed Test (5 Seconds)
  const handleDelayedTest = () => {
    setCountdown(5);
    setStatusMsg('⏳ Menghitung mundur 5 detik... Silakan minimize browser atau kunci layar HP Anda!');

    let timeLeft = 5;
    const interval = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);
        sendPwaNotification({
          title: testTitle,
          body: testBody,
          url: '/dashboard',
          tag: 'vira-delayed-test',
        });
        setStatusMsg('✅ Notifikasi telah dikirim ke panel notifikasi HP Anda!');
      }
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className="relative bg-[#FDF8FF] border-4 border-[#1C1A27] neo-shadow w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-[#3B4CCA] p-5 text-white border-b-4 border-[#1C1A27]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-[#3B4CCA] border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center shrink-0">
              <MaterialIcon name="notifications_active" className="text-2xl font-bold" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-headline-md uppercase tracking-tight font-black">
                TEST NOTIFIKASI HP (PWA)
              </h2>
              <p className="font-label-mono text-[10px] opacity-90 font-bold uppercase">
                Pengujian Real System Notification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white text-[#1C1A27] border-2 border-[#1C1A27] flex items-center justify-center cursor-pointer hover:bg-[#FECACA] transition-colors shadow-[2px_2px_0px_0px_#1C1A27]"
          >
            <MaterialIcon name="close" className="text-xl font-bold" />
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-4">
          {/* Status Izin Box */}
          <div className="bg-white border-4 border-[#1C1A27] p-3.5 shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-between gap-3">
            <div>
              <span className="font-label-mono text-[10px] uppercase font-bold text-[#454654] block">
                Status Izin Notifikasi Browser / HP:
              </span>
              <span className="font-headline-md text-sm font-black uppercase flex items-center gap-1.5 mt-0.5">
                {permission === 'granted' ? (
                  <span className="text-[#16A34A] flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
                    🟢 DIIZINKAN (AKTIF)
                  </span>
                ) : permission === 'denied' ? (
                  <span className="text-[#DC2626]">🔴 DIBLOKIR / DITOLAK</span>
                ) : (
                  <span className="text-[#D97706]">🟡 BELUM MEMINTA IZIN</span>
                )}
              </span>
            </div>

            {permission !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="bg-[#FEF08A] text-[#854D0E] border-2 border-[#1C1A27] px-3 py-1.5 font-label-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_#1C1A27] hover:bg-yellow-300 cursor-pointer"
              >
                AKTIFKAN IZIN 🔔
              </button>
            )}
          </div>

          {/* Form Kustomisasi Notifikasi */}
          <div className="space-y-3">
            <div>
              <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-1">
                Judul Notifikasi
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full h-11 border-2 border-[#1C1A27] px-3 font-body-md bg-white text-[#1C1A27] font-bold"
              />
            </div>
            <div>
              <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-1">
                Isi Pesan Notifikasi
              </label>
              <textarea
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                rows={2}
                className="w-full border-2 border-[#1C1A27] p-3 font-body-md bg-white text-[#1C1A27] font-bold resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleInstantTest}
              className="bg-[#4ADE80] text-[#14532D] border-4 border-[#1C1A27] py-3 px-4 font-label-mono text-xs font-black uppercase shadow-[3px_3px_0px_0px_#1C1A27] hover:bg-[#22C55E] cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <MaterialIcon name="bolt" className="text-lg font-bold" />
              TEST INSTAN (SEKARANG)
            </button>

            <button
              type="button"
              onClick={handleDelayedTest}
              disabled={countdown > 0}
              className="bg-[#FEF08A] text-[#854D0E] border-4 border-[#1C1A27] py-3 px-4 font-label-mono text-xs font-black uppercase shadow-[3px_3px_0px_0px_#1C1A27] hover:bg-yellow-300 cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <MaterialIcon name="timer" className="text-lg font-bold" />
              {countdown > 0 ? `KIRIM DLM ${countdown} DETIK...` : 'TEST TIMER (5 DETIK)'}
            </button>
          </div>

          {/* Info Petunjuk */}
          <div className="bg-[#E0F2FE] border-2 border-[#1C1A27] p-3 text-xs font-label-mono text-[#0369A1] font-bold flex items-start gap-2 shadow-[2px_2px_0px_0px_#1C1A27]">
            <MaterialIcon name="lightbulb" className="text-xl shrink-0 text-[#0284C7]" />
            <p className="leading-snug">
              <strong>Tips Uji di Handphone:</strong> Pilih tombol <em>"TEST TIMER (5 DETIK)"</em>, lalu segera <strong>minimize browser</strong> atau <strong>kunci layar HP Anda</strong>. Dalam 5 detik, notifikasi sistem akan muncul bergetar di status bar / panel atas HP Anda!
            </p>
          </div>

          {/* Feedback message */}
          {statusMsg && (
            <div className="bg-[#DCFCE7] border-2 border-[#1C1A27] p-3 text-xs font-label-mono text-[#14532D] font-bold flex items-center gap-2 animate-in fade-in">
              <MaterialIcon name="info" className="text-lg shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

