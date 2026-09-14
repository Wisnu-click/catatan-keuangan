import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import MaterialIcon from '../../Components/MaterialIcon';
import CurrencyInput from '../../Components/CurrencyInput';

export default function Index({
  userName = 'Pengguna',
  wallets = [],
  aiModels = [],
  defaultModel = 'gpt-4o',
  initialMessages = [],
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedModelId, setSelectedModelId] = useState(defaultModel || aiModels[0]?.id || 'gpt-4o');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showIdeasDropdown, setShowIdeasDropdown] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Wallet Selection per Receipt Message Card
  const [selectedWallets, setSelectedWallets] = useState({});
  // Transaction Type Selection per Receipt Message Card ('income' vs 'expense')
  const [selectedTypes, setSelectedTypes] = useState({});

  // Edit Receipt Modal State
  const [editingMessage, setEditingMessage] = useState(null);
  const [editForm, setEditForm] = useState({
    wallet_id: '',
    type: 'expense',
    category: '',
    amount: '',
    note: '',
  });

  // API Test Modal State
  const [showApiTestModal, setShowApiTestModal] = useState(false);
  const [apiTestResults, setApiTestResults] = useState(null);
  const [apiTestLoading, setApiTestLoading] = useState(false);
  const [apiTestTestedAt, setApiTestTestedAt] = useState(null);
  const [apiTestKeyPreview, setApiTestKeyPreview] = useState(null);

  // Command Palette & Shortcut State
  const [showCommandPalette, setShowCommandPalette] = useState(false);




  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const chatBottomRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync messages whenever props change
  useEffect(() => {
    setMessages(initialMessages);

    const walletMap = {};
    const typeMap = {};
    initialMessages.forEach((msg) => {
      if (msg.type === 'receipt' && msg.structured_data) {
        walletMap[msg.id] = msg.structured_data.wallet_id || (wallets[0]?.id ? String(wallets[0].id) : '');
        typeMap[msg.id] = msg.structured_data.type || 'expense';
      }
    });
    setSelectedWallets(walletMap);
    setSelectedTypes(typeMap);
  }, [initialMessages, wallets]);

  // Auto-scroll to bottom on message change or typing
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Handle scroll detection for "Scroll to bottom" button
  const handleScroll = () => {
    if (!chatScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isFarFromBottom);
  };

  const scrollToBottom = () => {
    setShowIdeasDropdown(false);
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeModel = aiModels.find((m) => m.id === selectedModelId) || aiModels[0] || {
    name: 'GPT-4o (OpenAI)',
    provider: 'OpenAI',
    badge: 'REKOMENDASI',
    icon: 'smart_toy',
  };

  const handleWalletSelectForMsg = (msgId, walletId) => {
    setSelectedWallets((prev) => ({
      ...prev,
      [msgId]: walletId,
    }));
  };

  const handleTypeToggleForMsg = (msgId, newType) => {
    setSelectedTypes((prev) => ({
      ...prev,
      [msgId]: newType,
    }));
  };

  // Voice Speech Recognition (STT)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung input suara Web Speech API. Silakan gunakan Google Chrome di HP / Laptop.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSend = (presetText = null) => {
    const textToSend = presetText || input;
    if (!textToSend.trim() && !imageFile && !previewImage) return;

    setIsSending(true);

    const formData = new FormData();
    formData.append('content', textToSend);
    formData.append('ai_model', selectedModelId);

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (previewImage) {
      formData.append('has_preset_image', '1');
    }

    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      sender: 'user',
      type: imageFile || previewImage ? 'image' : 'text',
      text: textToSend || 'Mengirim foto struk belanja...',
      image: previewImage,
      isScanning: !!(imageFile || previewImage),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setImageFile(null);
    setPreviewImage(null);

    router.post('/chat/send', formData, {
      forceFormData: true,
      preserveScroll: true,
      onFinish: () => {
        setIsSending(false);
      },
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
      setShowCameraModal(false);
    }
  };

  const processFile = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers for desktop/laptop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDemoPresetReceipt = () => {
    const sampleReceiptSvg =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23FEF08A" stroke="%231C1A27" stroke-width="8"/><rect x="20" y="20" width="260" height="160" fill="white" stroke="%231C1A27" stroke-width="4"/><text x="150" y="45" font-family="monospace" font-weight="bold" font-size="16" fill="%231C1A27" text-anchor="middle">SPBU PERTAMINA</text><line x1="30" y1="60" x2="270" y2="60" stroke="%231C1A27" stroke-dasharray="4"/><text x="40" y="85" font-family="monospace" font-size="12" fill="%231C1A27">PERTAMAX TURBO</text><text x="220" y="85" font-family="monospace" font-size="12" fill="%231C1A27">75.000</text><text x="40" y="110" font-family="monospace" font-size="12" fill="%231C1A27">VOL: 5.17 Liter</text><line x1="30" y1="125" x2="270" y2="125" stroke="%231C1A27" stroke-dasharray="4"/><text x="40" y="150" font-family="monospace" font-weight="bold" font-size="14" fill="%231C1A27">TOTAL</text><text x="200" y="150" font-family="monospace" font-weight="bold" font-size="14" fill="%23BA1A1A">Rp 75.000</text></svg>';
    setPreviewImage(sampleReceiptSvg);
    setShowCameraModal(false);
  };

  const handleConfirmReceipt = (msgId) => {
    const chosenWalletId = selectedWallets[msgId] || (wallets[0]?.id ? String(wallets[0].id) : null);
    const chosenType = selectedTypes[msgId] || 'expense';

    router.post(
      `/chat/confirm/${msgId}`,
      {
        wallet_id: chosenWalletId,
        type: chosenType,
      },
      {
        preserveScroll: true,
      }
    );
  };

  const handleStartEditReceipt = (msg) => {
    setEditingMessage(msg);
    setEditForm({
      wallet_id: selectedWallets[msg.id] || msg.structured_data?.wallet_id || (wallets[0]?.id ? String(wallets[0].id) : ''),
      type: selectedTypes[msg.id] || msg.structured_data?.type || 'expense',
      category: msg.structured_data?.category || 'Pengeluaran',
      amount: msg.structured_data?.amount || 0,
      note: msg.structured_data?.note || '',
    });
  };

  const handleSaveEditReceipt = (e) => {
    e.preventDefault();
    if (!editingMessage) return;

    router.post(`/chat/confirm/${editingMessage.id}`, editForm, {
      preserveScroll: true,
      onSuccess: () => {
        setEditingMessage(null);
      },
    });
  };

  const handleClearHistory = () => {
    if (confirm('Bersihkan seluruh riwayat percakapan dengan AI Assistant?')) {
      router.delete('/chat/clear');
    }
  };

  const handleCopyMessage = (text, id) => {
    const cleaned = cleanMessageDisplay(text);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleaned);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Helper untuk membersihkan simbol markdown kaku (** * ` " _) agar tampilan chat nyaman & alami
  const cleanMessageDisplay = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/_([^_\n]+)_/g, '$1')
      .replace(/`/g, '')
      .replace(/[═=\-]{4,}/g, '')
      .trim();
  };

  const handleTestApi = async () => {
    setApiTestLoading(true);
    setApiTestResults(null);
    setApiTestKeyPreview(null);
    setShowApiTestModal(true);
    try {
      const res = await fetch('/chat/test-api', {
        headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
      });
      const data = await res.json();
      setApiTestResults(data.results);
      setApiTestTestedAt(data.tested_at);
      setApiTestKeyPreview(data.key_preview || null);
    } catch (e) {
      setApiTestResults({ error: { ok: false, label: 'Error', message: '❌ Gagal terhubung ke server: ' + e.message } });
    } finally {
      setApiTestLoading(false);
    }
  };

  const shortcutCommands = [
    {
      cmd: '!help',
      icon: 'help_outline',
      color: '#FEF08A',
      title: '!help',
      desc: 'Panduan lengkap seluruh perintah AI shortcut',
      category: 'Bantuan',
    },
    {
      cmd: '!saldo',
      icon: 'account_balance_wallet',
      color: '#DCFCE7',
      title: '!saldo',
      desc: 'Cek saldo seluruh dompet & total dana terkini',
      category: 'Finansial',
    },
    {
      cmd: '!target',
      icon: 'savings',
      color: '#E7DEFF',
      title: '!target',
      desc: 'Cek progres dan status semua target tabungan',
      category: 'Finansial',
    },
    {
      cmd: '!rekap',
      icon: 'analytics',
      color: '#FEF08A',
      title: '!rekap',
      desc: 'Rekap pemasukan, pengeluaran & cashflow bulan ini',
      category: 'Laporan',
    },
    {
      cmd: '!transaksi',
      icon: 'receipt_long',
      color: '#FFDAD6',
      title: '!transaksi',
      desc: 'Cek 10 riwayat transaksi/mutasi terbaru',
      category: 'Laporan',
    },
    {
      cmd: '!wallet',
      icon: 'credit_card',
      color: '#DCFCE7',
      title: '!wallet',
      desc: 'Daftar semua dompet dan e-wallet aktif',
      category: 'Data',
    },
    {
      cmd: '!kategori',
      icon: 'category',
      color: '#E7DEFF',
      title: '!kategori',
      desc: 'Daftar kategori pengeluaran & pemasukan',
      category: 'Data',
    },
    {
      cmd: '!profil',
      icon: 'person',
      color: '#F1EEFF',
      title: '!profil',
      desc: 'Informasi akun & status sistem autentikasi',
      category: 'Akun',
    },
    {
      cmd: '!input',
      icon: 'edit_note',
      color: '#FEF08A',
      title: '!input',
      desc: 'Panduan format cepat mencatat transaksi',
      category: 'Bantuan',
    },
  ];

  // Filter commands for inline autocomplete when typing '!' or '/'
  const isTypingCommand = input.startsWith('!') || input.startsWith('/');
  const matchingCommands = isTypingCommand
    ? shortcutCommands.filter(
        (c) =>
          c.cmd.toLowerCase().startsWith(input.toLowerCase()) ||
          input === '!' ||
          input === '/'
      )
    : [];

  const suggestionChips = [
    { label: '!help', icon: 'help_outline', text: '!help' },
    { label: '!saldo', icon: 'account_balance_wallet', text: '!saldo' },
    { label: '!target', icon: 'savings', text: '!target' },
    { label: '!rekap', icon: 'analytics', text: '!rekap' },
    { label: '!transaksi', icon: 'receipt_long', text: '!transaksi' },
    { label: 'Makan 35rb', icon: 'restaurant', text: 'Catat pengeluaran Makan Siang Rp 35.000' },
    { label: 'Gaji 5jt', icon: 'arrow_downward', text: 'Catat pemasukan gaji Rp 5.000.000 ke Rekening Utama' },
    { label: 'Nabung 100rb', icon: 'savings', text: 'Saya mau nabung Rp 100.000' },
  ];

  return (
    <>
      <Head title="AI Assistant - VIRA" />

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* =========================================================================
          🌟 STANDALONE FULL-SCREEN CHAT INTERFACE (FULL WIDTH, NO SIDEBAR / TOPNAV)
          ========================================================================= */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-[#FDF8FF] text-[#1C1A27] font-body-md overflow-hidden select-none z-10"
      >
        {/* Drag Overlay Banner */}
        {isDragging && (
          <div className="absolute inset-0 z-40 bg-[#3B4CCA]/90 text-white flex flex-col items-center justify-center pointer-events-none p-4 text-center backdrop-blur-xs">
            <MaterialIcon name="file_upload" className="text-6xl animate-bounce mb-2" />
            <h3 className="font-headline-md text-2xl font-black uppercase">
              LEPASKAN FOTO STRUK DI SINI
            </h3>
            <p className="font-label-mono text-xs mt-1 font-bold">
              AI akan otomatis memindai dan membaca nominal transaksi.
            </p>
          </div>
        )}

        {/* ========== 1. FULL-WIDTH CHAT HEADER WITH BACK BUTTON ========== */}
        <header className="w-full bg-white border-b-4 border-[#1C1A27] px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between z-20 shrink-0 shadow-[0_2px_0_0_#1C1A27]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  router.visit('/dashboard');
                }
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-[#FFDAD6] text-[#1C1A27] border-2 sm:border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center font-bold shrink-0 transition-transform active:scale-95 cursor-pointer"
              title="Kembali ke Halaman Sebelumnya"
            >
              <MaterialIcon name="arrow_back" className="text-xl sm:text-2xl font-black" />
            </button>

            {/* Model Avatar */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#3B4CCA] border-2 sm:border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center text-white shrink-0">
              <MaterialIcon name={activeModel?.icon || 'smart_toy'} className="text-xl sm:text-2xl" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-headline-md text-sm sm:text-base font-black text-[#1C1A27] tracking-tight uppercase truncate">
                  AI ASSISTANT
                </h1>
                <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-label-mono bg-[#DCFCE7] text-[#166534] border border-[#1C1A27] px-1.5 py-0.2 font-black">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
                  ONLINE
                </span>
              </div>

              {/* Model Selector Dropdown Button */}
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-label-mono text-[#454654] font-bold hidden xs:inline">
                  Engine:
                </span>
                <button
                  type="button"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="font-label-mono text-[10px] sm:text-xs uppercase bg-[#E7DEFF] text-[#1C1A27] border border-[#1C1A27] px-2 py-0.2 font-black hover:bg-[#8B5CF6] hover:text-white transition-all cursor-pointer flex items-center gap-1 shadow-[1px_1px_0px_0px_#1C1A27] active:translate-y-0.5"
                >
                  <span className="truncate max-w-[120px] sm:max-w-[200px]">{activeModel?.name}</span>
                  <MaterialIcon name="expand_more" className="text-xs font-bold shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Test API Button */}
            <button
              type="button"
              onClick={handleTestApi}
              className="bg-[#FEF08A] text-[#1C1A27] border-2 sm:border-3 border-[#1C1A27] px-2.5 py-1.5 sm:px-3 sm:py-1.5 font-label-mono text-[11px] sm:text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] hover:bg-[#EAB308] transition-colors cursor-pointer flex items-center gap-1"
              title="Test koneksi API AI"
            >
              <MaterialIcon name="wifi_tethering" className="text-base" />
              <span className="hidden sm:inline">TEST API</span>
            </button>
            {/* Clear History Button */}
            <button
              type="button"
              onClick={handleClearHistory}
              className="bg-[#FFDAD6] text-[#93000A] border-2 sm:border-3 border-[#1C1A27] px-2.5 py-1.5 sm:px-3 sm:py-1.5 font-label-mono text-[11px] sm:text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] hover:bg-[#BA1A1A] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              title="Bersihkan Riwayat Chat"
            >
              <MaterialIcon name="delete_sweep" className="text-base" />
              <span className="hidden sm:inline">BERSIHKAN</span>
            </button>
          </div>
        </header>

        {/* Model Selection Dropdown Popup */}
        {showModelDropdown && (
          <div className="absolute left-3 sm:left-6 top-14 z-50 w-[calc(100vw-1.5rem)] max-w-sm bg-white border-4 border-[#1C1A27] neo-shadow p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b-2 border-[#1C1A27] pb-2 flex justify-between items-center">
              <span className="font-label-mono text-xs font-black uppercase text-[#1C1A27]">
                PILIH AI MODEL ENGINE
              </span>
              <button
                onClick={() => setShowModelDropdown(false)}
                className="w-6 h-6 border border-[#1C1A27] bg-[#FFDAD6] text-[#93000A] text-xs font-bold font-label-mono flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {aiModels.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedModelId(m.id);
                    setShowModelDropdown(false);
                  }}
                  className={`w-full text-left p-2.5 border-2 border-[#1C1A27] font-body-md transition-all cursor-pointer flex flex-col gap-1 ${
                    selectedModelId === m.id
                      ? 'bg-[#3B4CCA] text-white shadow-[3px_3px_0px_0px_#1C1A27]'
                      : 'bg-[#FDF8FF] text-[#1C1A27] hover:bg-[#E7DEFF]'
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold font-headline-md text-xs sm:text-sm flex items-center gap-1.5 truncate">
                      <MaterialIcon name={m.icon} className="text-base shrink-0" />
                      {m.name}
                    </span>
                    <span
                      className={`text-[9px] font-label-mono uppercase px-1 py-0.2 border border-[#1C1A27] font-bold shrink-0 ${
                        selectedModelId === m.id ? 'bg-white text-[#1C1A27]' : 'bg-[#C4B5FD] text-[#1C1A27]'
                      }`}
                    >
                      {m.badge}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-tight opacity-90 truncate ${selectedModelId === m.id ? 'text-white/90' : 'text-[#454654]'}`}>
                    {m.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========== API TEST MODAL ========== */}
        {showApiTestModal && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1C1A27]/70 backdrop-blur-sm">
            <div className="bg-white border-4 border-[#1C1A27] shadow-[6px_6px_0px_0px_#1C1A27] w-full sm:max-w-lg max-h-[90dvh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="bg-[#FEF08A] border-b-4 border-[#1C1A27] px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="wifi_tethering" className="text-xl font-black" />
                  <span className="font-headline-md text-sm font-black uppercase tracking-tight">
                    TEST KONEKSI AI API
                  </span>
                </div>
                <button
                  onClick={() => setShowApiTestModal(false)}
                  className="w-8 h-8 bg-white border-2 border-[#1C1A27] text-[#93000A] font-black flex items-center justify-center cursor-pointer hover:bg-[#FFDAD6] shadow-[2px_2px_0px_0px_#1C1A27]"
                >
                  <MaterialIcon name="close" className="text-base" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* Loading State */}
                {apiTestLoading && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-12 h-12 border-4 border-[#1C1A27] border-t-[#8B5CF6] rounded-full animate-spin" />
                    <p className="font-label-mono text-xs font-black text-[#454654] uppercase animate-pulse">
                      Menghubungi semua API endpoint...
                    </p>
                  </div>
                )}

                {/* Results */}
                {!apiTestLoading && apiTestResults && (
                  <>
                    {apiTestTestedAt && (
                      <p className="font-label-mono text-[10px] text-[#454654] font-bold">
                        Diuji pada: {apiTestTestedAt}
                      </p>
                    )}
                    {/* Key Preview Banner */}
                    {apiTestKeyPreview && (
                      <div className="flex items-center gap-2 bg-[#1C1A27] text-[#FEF08A] px-3 py-2 font-label-mono text-[10px] font-black">
                        <MaterialIcon name="key" className="text-sm" />
                        <span>Key aktif: <code className="text-white">{apiTestKeyPreview}</code></span>
                        <span className="ml-auto text-[8px] text-white/50 uppercase">via OpenRouter</span>
                      </div>
                    )}
                    <div className="space-y-2.5">
                      {Object.entries(apiTestResults).map(([modelKey, result]) => (
                        <div
                          key={modelKey}
                          className={`border-3 border-[#1C1A27] p-3 flex flex-col gap-1.5 shadow-[3px_3px_0px_0px_#1C1A27] ${
                            result.ok ? 'bg-[#DCFCE7]' : 'bg-[#FEF2F2]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-headline-md text-xs font-black text-[#1C1A27] flex items-center gap-1.5">
                              <MaterialIcon
                                name={result.ok ? 'check_circle' : 'cancel'}
                                className={`text-base ${result.ok ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}
                              />
                              {result.label}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {result.ok && result.latency_ms && (
                                <span className="text-[9px] font-label-mono bg-[#1C1A27] text-[#FEF08A] px-1.5 py-0.5 font-black">
                                  {result.latency_ms}ms
                                </span>
                              )}
                              <span
                                className={`text-[9px] font-label-mono uppercase px-1.5 py-0.5 border border-[#1C1A27] font-black ${
                                  result.ok ? 'bg-[#16A34A] text-white' : 'bg-[#DC2626] text-white'
                                }`}
                              >
                                {result.ok ? 'AKTIF' : 'ERROR'}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] font-body-md text-[#1C1A27] leading-snug">
                            {result.message}
                          </p>
                          {!result.ok && result.env_key && (
                            <div className="bg-[#1C1A27] text-[#FEF08A] px-2.5 py-2 font-label-mono text-[10px] leading-relaxed mt-1 flex flex-col gap-1">
                              <span className="font-black uppercase text-[9px] text-white/70">Setup di file .env :</span>
                              <code className="font-black">{result.env_key}=<span className="opacity-60">your_api_key_here</span></code>
                              {result.get_url && (
                                <a
                                  href={result.get_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#8B5CF6] hover:text-white underline text-[10px] font-black mt-0.5 flex items-center gap-1"
                                >
                                  <MaterialIcon name="open_in_new" className="text-xs" />
                                  Dapatkan API Key →
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* ENV Setup Guide — OpenRouter */}
                    <div className="border-3 border-[#1C1A27] bg-[#E7DEFF] p-3 mt-3 shadow-[3px_3px_0px_0px_#1C1A27]">
                      <p className="font-label-mono text-[10px] font-black uppercase text-[#1C1A27] mb-2 flex items-center gap-1">
                        <MaterialIcon name="settings" className="text-xs" />
                        SETUP — OPENROUTER (1 KEY UNTUK SEMUA MODEL)
                      </p>
                      <div className="bg-[#1C1A27] text-[#FEF08A] p-2.5 font-label-mono text-[10px] leading-relaxed space-y-1">
                        <p className="text-white/60 text-[9px]"># Edit file: <span className="text-white font-black">.env</span> (root project)</p>
                        <p>OPENROUTER_API_KEY=<span className="opacity-50">sk-or-v1-...</span></p>
                        <p>DEFAULT_AI_MODEL=<span className="text-[#86EFAC]">openai/gpt-4o</span></p>
                        <p className="text-white/40 text-[9px] mt-1"># Model lain yang tersedia via OpenRouter:</p>
                        <p className="text-white/60 text-[9px]">openai/gpt-4o-mini  |  google/gemini-flash-1.5</p>
                        <p className="text-white/60 text-[9px]">anthropic/claude-3.5-sonnet  |  deepseek/deepseek-chat</p>
                      </div>
                      <p className="font-label-mono text-[9px] font-bold text-[#454654] mt-2">
                        Setelah edit .env → jalankan: <code className="bg-white border border-[#1C1A27] px-1 text-[#8B5CF6]">php artisan config:clear</code>
                      </p>
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-1 text-[#8B5CF6] font-label-mono text-[10px] font-black hover:underline"
                      >
                        <MaterialIcon name="open_in_new" className="text-xs" />
                        Daftar &amp; dapatkan API Key di openrouter.ai →
                      </a>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t-4 border-[#1C1A27] px-4 py-3 flex gap-2 shrink-0 bg-white">
                <button
                  onClick={handleTestApi}
                  disabled={apiTestLoading}
                  className="flex-1 bg-[#3B4CCA] text-white border-2 border-[#1C1A27] px-3 py-2 font-label-mono text-xs uppercase font-black shadow-[3px_3px_0px_0px_#1C1A27] hover:bg-[#2B3CB0] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MaterialIcon name={apiTestLoading ? 'hourglass_top' : 'refresh'} className={`text-sm ${apiTestLoading ? 'animate-spin' : ''}`} />
                  {apiTestLoading ? 'MENGUJI...' : 'UJI ULANG'}
                </button>
                <button
                  onClick={() => setShowApiTestModal(false)}
                  className="bg-white text-[#1C1A27] border-2 border-[#1C1A27] px-3 py-2 font-label-mono text-xs uppercase font-black shadow-[3px_3px_0px_0px_#1C1A27] hover:bg-[#F3F4F6] cursor-pointer"
                >
                  TUTUP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== 2. FULL-PAGE SCROLLABLE CHAT MESSAGES STREAM ========== */}
        <div
          ref={chatScrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5 bg-[#F8F6FF] bg-[radial-gradient(#D5D4E6_1px,transparent_1px)] [background-size:16px_16px]"
        >
          <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-5">
            {/* Welcome Greeting on Empty Chat */}
            {messages.length === 0 && (
              <div className="max-w-lg mx-auto text-center py-8 sm:py-12 space-y-3 bg-white border-4 border-[#1C1A27] neo-shadow p-6 sm:p-8 my-4">
                <div className="w-14 h-14 bg-[#3B4CCA] text-white border-3 border-[#1C1A27] mx-auto flex items-center justify-center shadow-[3px_3px_0px_0px_#1C1A27]">
                  <MaterialIcon name="smart_toy" className="text-3xl font-bold" />
                </div>
                <h3 className="font-headline-md text-xl sm:text-2xl font-black text-[#1C1A27] uppercase">
                  Halo, {userName}!
                </h3>
                <p className="font-body-md text-xs sm:text-sm text-[#454654] font-bold leading-relaxed">
                  Asisten AI siap membantu Anda mencatat keuangan dengan cepat. Tulis pengeluaran/pemasukan, gunakan suara (mic), atau upload foto struk untuk pencatatan otomatis!
                </p>
              </div>
            )}

            {/* Messages Stream */}
            {messages.map((msg) => {
              const currentMsgType = selectedTypes[msg.id] || msg.structured_data?.type || 'expense';
              const isIncome = currentMsgType === 'income';

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 sm:gap-3.5 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  } animate-in fade-in slide-in-from-bottom-2 duration-150 select-text`}
                >
                  {/* AI Bot Avatar */}
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#3B4CCA] border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center text-white shrink-0 mb-1">
                      <MaterialIcon name={activeModel?.icon || 'smart_toy'} className="text-lg" />
                    </div>
                  )}

                  {/* USER TEXT BUBBLE */}
                  {msg.sender === 'user' && msg.type === 'text' && (
                    <div className="max-w-[85%] sm:max-w-lg md:max-w-xl bg-[#8B5CF6] text-white border-3 sm:border-4 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] p-3 sm:p-4 font-body-md font-bold break-words">
                      <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                      <span className="block text-[9px] sm:text-[10px] font-label-mono text-white/80 text-right mt-1.5 font-bold">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {/* USER IMAGE BUBBLE */}
                  {msg.sender === 'user' && msg.type === 'image' && (
                    <div className="max-w-[85%] sm:max-w-xs bg-white border-3 sm:border-4 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] p-2.5 sm:p-3 relative">
                      {msg.text && (
                        <p className="text-xs font-body-md font-bold mb-2 text-[#1C1A27] break-words">
                          {msg.text}
                        </p>
                      )}
                      <div className="relative border-2 border-[#1C1A27] overflow-hidden bg-gray-100 min-h-[110px] flex items-center justify-center">
                        <img
                          src={msg.image}
                          alt="Receipt Thumbnail"
                          className="w-full h-auto object-cover max-h-52"
                        />
                        {msg.isScanning && (
                          <div className="absolute inset-0 bg-[#1C1A27]/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2">
                            <div className="w-7 h-7 border-3 border-white border-t-[#8B5CF6] rounded-full animate-spin mb-1.5" />
                            <span className="font-label-mono text-[10px] uppercase bg-[#8B5CF6] text-white border border-white px-2 py-0.5 font-bold shadow-[2px_2px_0px_0px_white]">
                              Memindai OCR...
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-1.5 text-[10px] font-label-mono font-bold text-[#1C1A27]">
                        <span>📷 Struk Belanja</span>
                        <span className="text-[#454654]">{msg.timestamp}</span>
                      </div>
                    </div>
                  )}

                  {/* AI TEXT BUBBLE */}
                  {msg.sender === 'ai' && msg.type === 'text' && (
                    <div className="max-w-[88%] sm:max-w-lg md:max-w-xl bg-white text-[#1C1A27] border-3 sm:border-4 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] p-3 sm:p-4 font-body-md font-bold break-words">
                      <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-[#1C1A27]">
                        {cleanMessageDisplay(msg.text)}
                      </p>
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-[#1C1A27]/20 text-[9px] sm:text-[10px] font-label-mono font-bold">
                        <span className="text-[#8B5CF6] uppercase truncate max-w-[160px]">
                          Model: {msg.ai_model || selectedModelId}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.text, msg.id)}
                            className="text-[#454654] hover:text-[#1C1A27] cursor-pointer font-bold flex items-center gap-1"
                            title="Salin Pesan"
                          >
                            <MaterialIcon name="content_copy" className="text-xs" />
                            {copiedId === msg.id ? 'Tersalin' : 'Salin'}
                          </button>
                          <span className="text-[#454654]">{msg.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI RECEIPT CONFIRMATION CARD */}
                  {msg.sender === 'ai' && msg.type === 'receipt' && msg.structured_data && (
                    <div className="max-w-[95%] sm:max-w-md w-full bg-white border-3 sm:border-4 border-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27] p-4 sm:p-5 space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-center border-b-3 border-[#1C1A27] pb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">📋</span>
                          <h3 className="font-headline-md text-xs sm:text-sm uppercase text-[#1C1A27] font-black">
                            KONFIRMASI TRANSAKSI
                          </h3>
                        </div>
                        <span className="text-[9px] font-label-mono bg-[#E7DEFF] border border-[#1C1A27] px-1.5 py-0.2 font-bold">
                          {msg.ai_model || selectedModelId}
                        </span>
                      </div>

                      {/* Detail Table */}
                      <div className="space-y-2 text-xs font-body-md">
                        {/* Transaction Type Toggle */}
                        <div className="flex justify-between items-center border-b border-dashed border-[#1C1A27]/40 pb-1.5 gap-2">
                          <span className="text-[#454654] font-bold shrink-0 text-[11px]">Tipe:</span>
                          {msg.confirmed ? (
                            <span
                              className={`font-label-mono text-[10px] uppercase px-2 py-0.5 border border-[#1C1A27] font-bold ${
                                isIncome ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FFDAD6] text-[#93000A]'
                              }`}
                            >
                              {isIncome ? 'Pemasukan (+)' : 'Pengeluaran (-)'}
                            </span>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleTypeToggleForMsg(msg.id, 'expense')}
                                className={`px-2 py-0.5 font-label-mono text-[10px] uppercase font-black border border-[#1C1A27] cursor-pointer transition-all ${
                                  !isIncome
                                    ? 'bg-[#FFDAD6] text-[#93000A] shadow-[1px_1px_0px_0px_#1C1A27]'
                                    : 'bg-white text-[#454654] opacity-60'
                                }`}
                              >
                                - Keluar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTypeToggleForMsg(msg.id, 'income')}
                                className={`px-2 py-0.5 font-label-mono text-[10px] uppercase font-black border border-[#1C1A27] cursor-pointer transition-all ${
                                  isIncome
                                    ? 'bg-[#4ADE80] text-[#1C1A27] shadow-[1px_1px_0px_0px_#1C1A27]'
                                    : 'bg-white text-[#454654] opacity-60'
                                }`}
                              >
                                + Masuk
                              </button>
                            </div>
                          )}
                        </div>

                        {msg.structured_data.merchant && (
                          <div className="flex justify-between border-b border-dashed border-[#1C1A27]/40 pb-1.5 text-[11px]">
                            <span className="text-[#454654] font-bold">Merchant:</span>
                            <span className="font-bold text-[#1C1A27] truncate max-w-[180px]">
                              {msg.structured_data.merchant}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between border-b border-dashed border-[#1C1A27]/40 pb-1.5 text-[11px]">
                          <span className="text-[#454654] font-bold">Kategori:</span>
                          <span className="font-bold text-[#8B5CF6] truncate max-w-[180px]">
                            {msg.structured_data.category}
                          </span>
                        </div>

                        <div className="flex justify-between border-b border-dashed border-[#1C1A27]/40 pb-1.5 items-baseline">
                          <span className="text-[#454654] font-bold text-[11px]">Nominal:</span>
                          <span
                            className={`font-number-xl text-sm sm:text-base font-bold ${
                              isIncome ? 'text-[#166534]' : 'text-[#BA1A1A]'
                            }`}
                          >
                            {msg.structured_data.amount_formatted || `Rp ${Number(msg.structured_data.amount).toLocaleString('id-ID')}`}
                          </span>
                        </div>

                        {/* Wallet Selector Dropdown */}
                        <div className="flex justify-between items-center border-b border-dashed border-[#1C1A27]/40 pb-1.5 gap-2">
                          <span className="text-[#454654] font-bold shrink-0 text-[11px]">Wallet:</span>
                          {msg.confirmed ? (
                            <span className="font-bold text-[#3B4CCA] text-xs truncate max-w-[180px]">
                              {msg.structured_data.wallet_name || 'Dompet Utama'}
                            </span>
                          ) : (
                            <select
                              value={
                                selectedWallets[msg.id] ||
                                msg.structured_data.wallet_id ||
                                (wallets[0]?.id ? String(wallets[0].id) : '')
                              }
                              onChange={(e) => handleWalletSelectForMsg(msg.id, e.target.value)}
                              className="border-2 border-[#1C1A27] bg-[#F1EBFE] text-[#3B4CCA] font-bold text-xs px-2 py-0.5 cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27] max-w-[190px] truncate"
                            >
                              {wallets.map((w) => (
                                <option key={w.id} value={w.id}>
                                  {w.name} ({w.balance})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {msg.structured_data.note && (
                          <div className="flex justify-between border-b border-dashed border-[#1C1A27]/40 pb-1.5 text-[11px]">
                            <span className="text-[#454654] font-bold">Catatan:</span>
                            <span className="font-bold text-[#1C1A27] truncate max-w-[180px]">
                              {msg.structured_data.note}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-1.5">
                        {msg.confirmed ? (
                          <div className="w-full bg-[#DCFCE7] text-[#166534] border-2 border-[#1C1A27] py-1.5 px-3 shadow-[2px_2px_0px_0px_#1C1A27] font-label-mono text-[11px] uppercase font-black flex items-center justify-center gap-1.5">
                            <MaterialIcon name="check_circle" className="text-base text-[#16A34A]" />
                            TERCATAT {isIncome ? 'PEMASUKAN' : 'PENGELUARAN'}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleConfirmReceipt(msg.id)}
                              className="bg-[#4ADE80] text-[#14532D] border-2 border-[#1C1A27] py-2 px-2 shadow-[2px_2px_0px_0px_#1C1A27] font-label-mono text-xs uppercase font-black hover:bg-[#22C55E] cursor-pointer flex items-center justify-center gap-1 active:translate-y-0.5"
                            >
                              <MaterialIcon name="check" className="text-base font-bold" />
                              KONFIRMASI
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEditReceipt(msg)}
                              className="bg-white text-[#1C1A27] border-2 border-[#1C1A27] py-2 px-2 shadow-[2px_2px_0px_0px_#1C1A27] font-label-mono text-xs uppercase font-bold hover:bg-gray-100 cursor-pointer flex items-center justify-center gap-1 active:translate-y-0.5"
                            >
                              <MaterialIcon name="edit" className="text-base" />
                              EDIT
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isSending && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#3B4CCA] border-2 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center text-white shrink-0">
                  <MaterialIcon name={activeModel?.icon || 'smart_toy'} className="text-lg" />
                </div>
                <div className="bg-white border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] px-3.5 py-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#3B4CCA] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#1C1A27] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="font-label-mono text-xs uppercase font-bold text-[#454654] ml-1">
                    AI sedang berpikir...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>
        </div>

        {/* Scroll To Bottom Floating Button (Floats clearly above input and suggestions) */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute right-4 sm:right-6 bottom-36 sm:bottom-28 z-40 bg-[#3B4CCA] text-white border-3 border-[#1C1A27] w-10 h-10 sm:w-11 sm:h-11 shadow-[3px_3px_0px_0px_#1C1A27] flex items-center justify-center cursor-pointer hover:bg-[#2A379D] transition-transform active:scale-95 animate-in fade-in zoom-in-95 duration-150"
            title="Ke Pesan Terbaru"
          >
            <MaterialIcon name="arrow_downward" className="text-xl sm:text-2xl font-black" />
          </button>
        )}

        {/* Attached image preview banner */}
        {previewImage && (
          <div className="bg-[#FEF08A] border-t-3 border-[#1C1A27] p-2 flex items-center justify-between px-3 sm:px-6 shrink-0 shadow-[0_-2px_0_0_#1C1A27]">
            <div className="flex items-center gap-2">
              <span className="text-base">📷</span>
              <span className="font-label-mono text-xs font-bold text-[#854D0E] truncate max-w-[220px] sm:max-w-md">
                Struk terlampir (Siap diproses OCR)
              </span>
            </div>
            <button
              onClick={() => {
                setPreviewImage(null);
                setImageFile(null);
              }}
              className="text-[11px] font-label-mono font-bold uppercase bg-white border border-[#1C1A27] px-2.5 py-0.5 hover:bg-[#FFDAD6] cursor-pointer shadow-[1px_1px_0px_0px_#000]"
            >
              Batal ✕
            </button>
          </div>
        )}

        {/* ========== 3. QUICK SUGGESTIONS (DROPDOWN ON MOBILE, CHIPS ON DESKTOP) ========== */}
        {/* Mobile Dropdown View (sm:hidden) */}
        <div className="sm:hidden relative bg-[#F1EEFF] border-t-3 border-[#1C1A27] px-3 py-1.5 shrink-0 select-none z-30">
          <button
            type="button"
            onClick={() => setShowIdeasDropdown(!showIdeasDropdown)}
            className="w-full bg-white text-[#1C1A27] border-2 border-[#1C1A27] px-3 py-1.5 font-label-mono text-xs font-black flex items-center justify-between shadow-[2px_2px_0px_0px_#1C1A27] active:translate-y-0.5 cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-[#3B4CCA]">
              <MaterialIcon name="lightbulb" className="text-base text-[#F59E0B]" />
              <span>IDE PERTANYAAN & CATAT CEPAT</span>
            </span>
            <MaterialIcon
              name={showIdeasDropdown ? 'expand_less' : 'expand_more'}
              className="text-base font-bold text-[#1C1A27]"
            />
          </button>

          {/* Mobile Popover Menu */}
          {showIdeasDropdown && (
            <div className="absolute left-3 right-3 bottom-full mb-1 bg-white border-3 border-[#1C1A27] neo-shadow p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
              <div className="text-[10px] font-label-mono uppercase font-black text-[#454654] px-1 py-0.5 border-b border-[#1C1A27]/20 flex justify-between items-center">
                <span>💡 PILIH PROMPT CEPAT:</span>
                <button
                  type="button"
                  onClick={() => setShowIdeasDropdown(false)}
                  className="text-[#93000A] font-bold text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setShowIdeasDropdown(false);
                    handleSend(chip.text);
                  }}
                  className="w-full text-left bg-[#FDF8FF] hover:bg-[#E7DEFF] text-[#1C1A27] border-2 border-[#1C1A27] px-2.5 py-2 font-body-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-[1px_1px_0px_0px_#1C1A27] active:scale-98"
                >
                  <MaterialIcon name={chip.icon} className="text-base text-[#8B5CF6] shrink-0" />
                  <span className="truncate">{chip.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Chips View (hidden on mobile, flex on sm and up) */}
        <div className="hidden sm:flex bg-[#F1EEFF] border-t-3 border-[#1C1A27] px-4 sm:px-6 py-2 items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none">
          <span className="text-[9px] font-label-mono uppercase font-black text-[#454654] shrink-0 mr-1 flex items-center gap-0.5">
            <MaterialIcon name="bolt" className="text-xs text-[#F59E0B]" />
            IDE:
          </span>
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip.text)}
              className="bg-white text-[#1C1A27] border-2 border-[#1C1A27] px-2.5 py-1 font-label-mono text-[11px] font-bold hover:bg-[#E7DEFF] transition-transform active:scale-95 shrink-0 cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27] flex items-center gap-1.5"
            >
              <MaterialIcon name={chip.icon} className="text-xs text-[#8B5CF6]" />
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* ========== 4. FULL-WIDTH STICKY BOTTOM INPUT BAR WITH COMMAND AUTOCOMPLETE ========== */}
        <div className="bg-white border-t-4 border-[#1C1A27] p-2.5 sm:p-3.5 pb-3 sm:pb-3.5 shrink-0 shadow-[0_-3px_0_0_#1C1A27] z-20 relative">
          
          {/* ⚡ Inline Command Autocomplete Popover (Appears when typing '!' or '/') */}
          {isTypingCommand && matchingCommands.length > 0 && (
            <div className="absolute left-2.5 right-2.5 sm:left-6 sm:right-6 bottom-full mb-2 bg-white border-3 sm:border-4 border-[#1C1A27] shadow-[4px_4px_0px_0px_#1C1A27] p-2 z-40 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-2 duration-150 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b-2 border-[#1C1A27]">
                <div className="flex items-center gap-1.5 text-[11px] font-label-mono font-black text-[#1C1A27] uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                  <span>PILIH SHORTCUT COMMAND:</span>
                </div>
                <span className="text-[10px] font-label-mono text-[#454654] font-bold">
                  {matchingCommands.length} perintah
                </span>
              </div>
              <div className="space-y-1">
                {matchingCommands.map((cmdItem) => (
                  <button
                    key={cmdItem.cmd}
                    type="button"
                    onClick={() => {
                      setInput('');
                      handleSend(cmdItem.cmd);
                    }}
                    className="w-full text-left p-2 border-2 border-[#1C1A27] bg-[#FDF8FF] hover:bg-[#FEF08A] transition-all flex items-center justify-between gap-2 cursor-pointer shadow-[1px_1px_0px_0px_#1C1A27] active:translate-y-0.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-7 h-7 border border-[#1C1A27] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cmdItem.color }}
                      >
                        <MaterialIcon name={cmdItem.icon} className="text-base text-[#1C1A27]" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-label-mono text-xs font-black text-[#1C1A27] block">
                          {cmdItem.title}
                        </span>
                        <span className="text-[11px] font-body-md text-[#454654] font-bold truncate block">
                          {cmdItem.desc}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-label-mono font-black uppercase bg-white px-1.5 py-0.5 border border-[#1C1A27] shrink-0">
                      Kirim ↵
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto w-full flex items-center gap-1.5 sm:gap-3">
            {/* Quick Command Menu Button (!) */}
            <button
              type="button"
              onClick={() => setShowCommandPalette(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FEF08A] hover:bg-[#FACC15] text-[#1C1A27] border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center transition-all cursor-pointer font-black font-label-mono text-base sm:text-lg shrink-0 active:translate-y-0.5"
              title="Daftar Perintah Cepat / Shortcut (!)"
            >
              !
            </button>

            {/* Upload Camera / Gallery Button */}
            <button
              type="button"
              onClick={() => setShowCameraModal(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E7DEFF] text-[#1C1A27] border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center hover:bg-[#8B5CF6] hover:text-white transition-all cursor-pointer font-bold shrink-0 active:translate-y-0.5"
              title="Kirim Foto Struk"
            >
              <MaterialIcon name="photo_camera" className="text-lg sm:text-2xl font-bold" />
            </button>

            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`w-10 h-10 sm:w-12 sm:h-12 border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center transition-all cursor-pointer font-bold shrink-0 active:translate-y-0.5 ${
                isListening
                  ? 'bg-[#EF4444] text-white animate-pulse'
                  : 'bg-white text-[#1C1A27] hover:bg-[#FEF08A]'
              }`}
              title={isListening ? 'Sedang Mendengarkan Suara...' : 'Bicara untuk Mengetik (Voice Input)'}
            >
              <MaterialIcon name={isListening ? 'mic' : 'mic_none'} className="text-lg sm:text-2xl font-bold" />
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isListening ? '🎙️ Mendengarkan suara Anda...' : `Ketik pesan atau ketik ! untuk shortcut...`}
              className="flex-1 h-10 sm:h-12 px-2.5 sm:px-4 bg-white border-3 border-[#1C1A27] font-body-md font-bold text-xs sm:text-base text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_#1C1A27] rounded-none min-w-0"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isSending || (!input.trim() && !previewImage)}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-[#3B4CCA] text-white border-3 border-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27] flex items-center justify-center hover:bg-[#2A379D] transition-all cursor-pointer font-bold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5"
              title="Kirim Pesan"
            >
              <MaterialIcon name="send" className="text-lg sm:text-2xl font-bold" />
            </button>
          </div>
        </div>
      </div>

      {/* ========== 5. EDIT RECEIPT MODAL ========== */}
      {editingMessage && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1A27]/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
          onClick={() => setEditingMessage(null)}
        >
          <div
            className="bg-[#FDF8FF] border-4 border-[#1C1A27] neo-shadow p-5 sm:p-7 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-3 mb-5">
              <h3 className="text-xl font-headline-md font-black text-[#1C1A27] uppercase">
                EDIT DETAIL STRUK
              </h3>
              <button
                type="button"
                onClick={() => setEditingMessage(null)}
                className="w-8 h-8 bg-white border-2 border-[#1C1A27] flex items-center justify-center cursor-pointer hover:bg-[#FFDAD6] font-bold shadow-[2px_2px_0px_0px_#000]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditReceipt} className="space-y-4">
              {/* Type Toggle in Edit Modal */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-1.5">
                  TIPE TRANSAKSI
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, type: 'expense' })}
                    className={`py-2.5 border-3 border-[#1C1A27] font-label-mono text-xs uppercase font-black cursor-pointer transition-all ${
                      editForm.type === 'expense'
                        ? 'bg-[#FFDAD6] text-[#93000A] shadow-[2px_2px_0px_0px_#1C1A27]'
                        : 'bg-white text-[#454654] opacity-70'
                    }`}
                  >
                    - Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, type: 'income' })}
                    className={`py-2.5 border-3 border-[#1C1A27] font-label-mono text-xs uppercase font-black cursor-pointer transition-all ${
                      editForm.type === 'income'
                        ? 'bg-[#4ADE80] text-[#14532D] shadow-[2px_2px_0px_0px_#1C1A27]'
                        : 'bg-white text-[#454654] opacity-70'
                    }`}
                  >
                    + Pemasukan
                  </button>
                </div>
              </div>

              {/* Wallet Select */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-1.5">
                  PILIH SUMBER WALLET
                </label>
                <select
                  value={editForm.wallet_id}
                  onChange={(e) => setEditForm({ ...editForm, wallet_id: e.target.value })}
                  className="w-full border-3 border-[#1C1A27] p-2.5 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27]"
                  required
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.balance})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-1.5">
                  KATEGORI
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full border-3 border-[#1C1A27] p-2.5 font-body-md bg-white text-[#1C1A27] font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-1.5">
                  NOMINAL (Rp)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-lg font-number-xl font-bold text-[#454654]">Rp</span>
                  <CurrencyInput
                    value={editForm.amount}
                    onChange={(raw) => setEditForm({ ...editForm, amount: raw })}
                    size="md"
                    className="w-full border-3 border-[#1C1A27] py-2.5 pl-12 pr-3 bg-white font-number-xl text-[#1C1A27] font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                    required
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-1.5">
                  CATATAN / KETERANGAN
                </label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  className="w-full border-3 border-[#1C1A27] p-2.5 font-body-md bg-[#F1EBFE] text-[#1C1A27] font-bold shadow-[2px_2px_0px_0px_#1C1A27]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMessage(null)}
                  className="flex-1 bg-white border-3 border-[#1C1A27] py-2.5 font-label-mono text-xs uppercase font-bold shadow-[2px_2px_0px_0px_#1C1A27] hover:bg-gray-100 cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#4ADE80] text-[#14532D] border-3 border-[#1C1A27] py-2.5 font-label-mono text-xs uppercase font-black shadow-[2px_2px_0px_0px_#1C1A27] hover:bg-[#22C55E] cursor-pointer"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== 6. CAMERA / ATTACHMENT MODAL (CENTERED & PROMINENT) ========== */}
      {showCameraModal && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1A27]/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-150"
          onClick={() => setShowCameraModal(false)}
        >
          <div
            className="bg-[#FDF8FF] border-4 border-[#1C1A27] neo-shadow p-5 sm:p-7 w-full max-w-md my-auto animate-in zoom-in-95 duration-150 relative shadow-[6px_6px_0px_0px_#1C1A27]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-3 mb-4">
              <div>
                <h3 className="text-xl font-headline-md font-black text-[#1C1A27] uppercase">
                  UNGGAH STRUK BELANJA
                </h3>
                <p className="text-[11px] font-body-md text-[#454654] font-bold mt-0.5">
                  OCR AI akan otomatis membaca nama toko & nominal belanja.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCameraModal(false)}
                className="w-8 h-8 bg-white border-2 border-[#1C1A27] flex items-center justify-center cursor-pointer hover:bg-[#FFDAD6] font-bold shadow-[2px_2px_0px_0px_#000]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setShowCameraModal(false);
                  cameraInputRef.current?.click();
                }}
                className="w-full bg-[#8B5CF6] text-white border-3 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] py-3.5 px-4 font-headline-md text-sm uppercase font-black flex items-center justify-center gap-2 hover:bg-[#7C3AED] transition-all cursor-pointer active:translate-y-0.5"
              >
                <MaterialIcon name="photo_camera" className="text-xl font-bold" />
                AMBIL FOTO (KAMERA HP)
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCameraModal(false);
                  galleryInputRef.current?.click();
                }}
                className="w-full bg-white text-[#1C1A27] border-3 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] py-3.5 px-4 font-headline-md text-sm uppercase font-black flex items-center justify-center gap-2 hover:bg-[#F1EBFE] transition-all cursor-pointer active:translate-y-0.5"
              >
                <MaterialIcon name="photo_library" className="text-xl text-[#3B4CCA]" />
                PILIH DARI GALERI / FILE
              </button>

              <button
                type="button"
                onClick={handleDemoPresetReceipt}
                className="w-full bg-[#FEF08A] text-[#854D0E] border-3 border-[#1C1A27] shadow-[3px_3px_0px_0px_#1C1A27] py-2.5 px-4 font-label-mono text-xs uppercase font-black flex items-center justify-center gap-1.5 hover:bg-yellow-300 transition-all cursor-pointer active:translate-y-0.5"
              >
                <MaterialIcon name="bolt" className="text-base font-bold text-[#D97706]" />
                GUNAKAN STRUK DEMO (SPBU)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 7. COMMAND PALETTE MODAL (SHORTCUT EXPLORER) ========== */}
      {showCommandPalette && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1A27]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-150"
          onClick={() => setShowCommandPalette(false)}
        >
          <div
            className="bg-[#FDF8FF] border-4 border-[#1C1A27] shadow-[6px_6px_0px_0px_#1C1A27] p-4 sm:p-6 w-full max-w-lg max-h-[85vh] flex flex-col my-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-3 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FEF08A] border-2 border-[#1C1A27] flex items-center justify-center shadow-[2px_2px_0px_0px_#1C1A27]">
                  <span className="font-label-mono font-black text-base">!</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-headline-md font-black text-[#1C1A27] uppercase tracking-tight">
                    SHORTCUT COMMANDS
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-body-md text-[#454654] font-bold">
                    Pilih perintah di bawah ini untuk dijalankan langsung oleh AI.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCommandPalette(false)}
                className="w-8 h-8 bg-white border-2 border-[#1C1A27] flex items-center justify-center cursor-pointer hover:bg-[#FFDAD6] font-bold shadow-[2px_2px_0px_0px_#000]"
              >
                ✕
              </button>
            </div>

            {/* Modal Command List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {shortcutCommands.map((cmdItem) => (
                <button
                  key={cmdItem.cmd}
                  type="button"
                  onClick={() => {
                    setShowCommandPalette(false);
                    setInput('');
                    handleSend(cmdItem.cmd);
                  }}
                  className="w-full text-left p-3 border-3 border-[#1C1A27] bg-white hover:bg-[#FEF08A] transition-all flex items-center justify-between gap-3 cursor-pointer shadow-[2px_2px_0px_0px_#1C1A27] active:translate-y-0.5 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 border-2 border-[#1C1A27] flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_#1C1A27]"
                      style={{ backgroundColor: cmdItem.color }}
                    >
                      <MaterialIcon name={cmdItem.icon} className="text-lg text-[#1C1A27]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-label-mono text-xs sm:text-sm font-black text-[#1C1A27]">
                          {cmdItem.title}
                        </span>
                        <span className="text-[8px] font-label-mono uppercase px-1 py-0.2 bg-[#E7DEFF] border border-[#1C1A27] font-bold">
                          {cmdItem.category}
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs font-body-md text-[#454654] font-bold truncate block mt-0.5">
                        {cmdItem.desc}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 bg-[#3B4CCA] group-hover:bg-[#1C1A27] text-white px-2 py-1 border border-[#1C1A27] shadow-[1px_1px_0px_0px_#1C1A27] text-[10px] font-label-mono font-black uppercase transition-colors">
                    <span>Jalankan</span>
                    <MaterialIcon name="arrow_forward" className="text-xs" />
                  </div>
                </button>
              ))}
            </div>

            {/* Modal Footer Note */}
            <div className="border-t-3 border-[#1C1A27] pt-2.5 mt-3 text-center shrink-0">
              <p className="text-[10px] font-label-mono font-bold text-[#454654]">
                💡 Anda juga dapat mengetik langsung <code className="bg-white px-1 border border-[#1C1A27] text-[#8B5CF6]">!</code> di kolom pesan untuk menampilkan pilihan ini.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
