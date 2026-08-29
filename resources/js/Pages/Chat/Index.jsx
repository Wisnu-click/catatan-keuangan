import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
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
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
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

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const chatBottomRef = useRef(null);

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

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

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
      type: (imageFile || previewImage) ? 'image' : 'text',
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
      onFinish: () => {
        setIsSending(false);
      },
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setShowCameraModal(false);
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

    router.post(`/chat/confirm/${msgId}`, {
      wallet_id: chosenWalletId,
      type: chosenType,
    });
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
      onSuccess: () => {
        setEditingMessage(null);
      },
    });
  };

  const handleClearHistory = () => {
    if (confirm('Bersihkan seluruh riwayat percakapan dengan AI?')) {
      router.delete('/chat/clear');
    }
  };

  const suggestionChips = [
    'Cek saldo',
    'Gaji 5jt ke Rekening Utama',
    'Catat pengeluaran 50rb',
    'Beli kuota 100rb dari Usaha E-Wallet',
  ];

  return (
    <AuthenticatedLayout>
      <Head title="AI Assistant - RAW LOGIC" />

      {/* Hidden File Input for Gallery / File Picker */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Hidden File Input for Camera (Direct Capture) */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Main Chat Container (Full Width) */}
      <div className="w-full flex flex-col h-[calc(100vh-140px)] neo-border border-4 border-[#1C1A27] bg-[#F1EEFF] neo-shadow overflow-hidden transform rotate-[-0.3deg]">
        
        {/* HEADER */}
        <header className="bg-white border-b-4 border-[#1C1A27] px-6 py-3 flex items-center justify-between z-20 shrink-0 relative">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="w-10 h-10 bg-[#F1EBFE] border-4 border-[#1C1A27] neo-shadow-sm flex items-center justify-center hover:bg-[#8B5CF6] hover:text-white transition-colors cursor-pointer font-bold">
                <MaterialIcon name="arrow_back" className="text-xl" />
              </button>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#3B4CCA] border-4 border-[#1C1A27] rounded-full flex items-center justify-center text-white neo-shadow-sm shrink-0">
                <MaterialIcon name={activeModel?.icon || 'smart_toy'} className="text-2xl" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-headline-md text-lg md:text-xl font-black text-[#1C1A27] tracking-tight uppercase">
                    RAW AI ASSISTANT
                  </h1>
                  <span className="flex items-center gap-1.5 text-xs font-label-mono bg-[#DCFCE7] text-[#166534] border-2 border-[#1C1A27] px-2 py-0.5 rounded-full font-bold shadow-[2px_2px_0px_0px_#1C1A27]">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    ONLINE
                  </span>
                </div>

                {/* AI Model Selector */}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-label-mono text-[#454654] font-bold">
                    Model:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="font-label-mono text-xs uppercase bg-[#E7DEFF] text-[#1C1A27] border-2 border-[#1C1A27] px-2.5 py-0.5 font-black hover:bg-[#8B5CF6] hover:text-white transition-all cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_0px_#1C1A27]"
                  >
                    <span>{activeModel?.name}</span>
                    <MaterialIcon name="expand_more" className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Model Selection Dropdown Popup */}
          {showModelDropdown && (
            <div className="absolute left-6 md:left-64 top-16 z-50 w-80 bg-white border-4 border-[#1C1A27] neo-shadow p-3 space-y-2">
              <div className="border-b-2 border-[#1C1A27] pb-2 flex justify-between items-center">
                <span className="font-label-mono text-xs font-bold uppercase text-[#1C1A27]">
                  PILIH AI MODEL ENGINE
                </span>
                <button
                  onClick={() => setShowModelDropdown(false)}
                  className="text-xs font-bold font-label-mono text-[#454654] hover:text-[#BA1A1A]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
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
                    <div className="flex justify-between items-center">
                      <span className="font-bold font-headline-md text-sm flex items-center gap-1.5">
                        <MaterialIcon name={m.icon} className="text-base" />
                        {m.name}
                      </span>
                      <span
                        className={`text-[9px] font-label-mono uppercase px-1.5 py-0.5 border border-[#1C1A27] font-bold ${
                          selectedModelId === m.id ? 'bg-white text-[#1C1A27]' : 'bg-[#C4B5FD] text-[#1C1A27]'
                        }`}
                      >
                        {m.badge}
                      </span>
                    </div>
                    <p className={`text-[11px] leading-tight opacity-90 ${selectedModelId === m.id ? 'text-white/90' : 'text-[#454654]'}`}>
                      {m.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearHistory}
              className="w-10 h-10 bg-[#FFDAD6] text-[#93000A] border-4 border-[#1C1A27] neo-shadow-sm flex items-center justify-center hover:bg-[#BA1A1A] hover:text-white transition-colors cursor-pointer font-bold"
              title="Bersihkan Riwayat Chat"
            >
              <MaterialIcon name="delete_sweep" className="text-xl" />
            </button>
          </div>
        </header>

        {/* CHAT BODY AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#F1EEFF] bg-[radial-gradient(#C5C5D6_1px,transparent_1px)] [background-size:20px_20px]">
          {messages.map((msg) => {
            const currentMsgType = selectedTypes[msg.id] || msg.structured_data?.type || 'expense';
            const isIncome = currentMsgType === 'income';

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot Avatar Beside AI Message */}
                {msg.sender === 'ai' && (
                  <div className="w-9 h-9 bg-[#3B4CCA] border-2 border-[#1C1A27] rounded-full flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_0px_#1C1A27] mb-1">
                    <MaterialIcon name={activeModel?.icon || 'smart_toy'} className="text-lg" />
                  </div>
                )}

                {/* USER TEXT MESSAGE */}
                {msg.sender === 'user' && msg.type === 'text' && (
                  <div className="max-w-md md:max-w-xl bg-[#8B5CF6] text-white border-4 border-[#1C1A27] neo-shadow-sm p-4 rounded-[6px] font-body-md font-bold">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[10px] font-label-mono text-white/80 text-right mt-2 font-bold">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* USER IMAGE MESSAGE */}
                {msg.sender === 'user' && msg.type === 'image' && (
                  <div className="max-w-xs bg-white border-4 border-[#1C1A27] neo-shadow-sm p-3 rounded-[6px] relative">
                    {msg.text && <p className="text-xs font-body-md font-bold mb-2 text-[#1C1A27]">{msg.text}</p>}
                    <div className="relative border-2 border-[#1C1A27] overflow-hidden bg-gray-100 min-h-[120px]">
                      <img src={msg.image} alt="Receipt Thumbnail" className="w-full h-auto object-cover max-h-48" />
                      
                      {msg.isScanning && (
                        <div className="absolute inset-0 bg-[#1C1A27]/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2">
                          <div className="w-8 h-8 border-4 border-white border-t-[#8B5CF6] rounded-full animate-spin mb-2" />
                          <span className="font-label-mono text-xs uppercase bg-[#8B5CF6] text-white border-2 border-white px-2 py-0.5 font-bold shadow-[2px_2px_0px_0px_white]">
                            Memindai...
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2 text-xs font-label-mono font-bold text-[#1C1A27]">
                      <span>📷 Foto Struk Belanja</span>
                      <span className="text-[#454654]">{msg.timestamp}</span>
                    </div>
                  </div>
                )}

                {/* AI TEXT MESSAGE */}
                {msg.sender === 'ai' && msg.type === 'text' && (
                  <div className="max-w-md md:max-w-xl bg-white text-[#1C1A27] border-4 border-[#1C1A27] neo-shadow-sm p-4 rounded-[6px] font-body-md font-bold">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#1C1A27]/20 text-[10px] font-label-mono font-bold">
                      <span className="text-[#8B5CF6] uppercase">Model: {msg.ai_model || selectedModelId}</span>
                      <span className="text-[#454654]">{msg.timestamp}</span>
                    </div>
                  </div>
                )}

                {/* AI STRUCTURED RECEIPT CARD BUBBLE WITH TYPE TOGGLE & WALLET SELECTOR */}
                {msg.sender === 'ai' && msg.type === 'receipt' && msg.structured_data && (
                  <div className="max-w-md w-full bg-white border-4 border-[#1C1A27] neo-shadow p-5 rounded-[6px] space-y-4">
                    {/* Card Header */}
                    <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📋</span>
                        <h3 className="font-headline-md text-base uppercase text-[#1C1A27] font-black">
                          KONFIRMASI TRANSAKSI
                        </h3>
                      </div>
                      <span className="text-[10px] font-label-mono bg-[#E7DEFF] border-2 border-[#1C1A27] px-2 py-0.5 font-bold">
                        {msg.ai_model || selectedModelId}
                      </span>
                    </div>

                    {/* Rows with Dashed Borders */}
                    <div className="space-y-2.5 text-sm font-body-md">
                      {/* DYNAMIC TYPE SELECTOR TOGGLE (INCOME vs EXPENSE) */}
                      <div className="flex justify-between items-center border-b-2 border-dashed border-[#1C1A27]/40 pb-2">
                        <span className="text-[#454654] font-bold shrink-0">Tipe Transaksi:</span>
                        {msg.confirmed ? (
                          <span className={`font-label-mono text-xs uppercase px-2 py-0.5 border-2 border-[#1C1A27] font-bold ${isIncome ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FFDAD6] text-[#93000A]'}`}>
                            {isIncome ? 'Pemasukan (+)' : 'Pengeluaran (-)'}
                          </span>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleTypeToggleForMsg(msg.id, 'expense')}
                              className={`px-2.5 py-1 font-label-mono text-xs uppercase font-black neo-border transition-all cursor-pointer ${
                                !isIncome
                                  ? 'bg-[#FFDAD6] text-[#93000A] shadow-[2px_2px_0px_0px_#1C1A27]'
                                  : 'bg-white text-[#454654] opacity-70'
                              }`}
                            >
                              - Pengeluaran
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTypeToggleForMsg(msg.id, 'income')}
                              className={`px-2.5 py-1 font-label-mono text-xs uppercase font-black neo-border transition-all cursor-pointer ${
                                isIncome
                                  ? 'bg-[#4ADE80] text-[#1C1A27] shadow-[2px_2px_0px_0px_#1C1A27]'
                                  : 'bg-white text-[#454654] opacity-70'
                              }`}
                            >
                              + Pemasukan
                            </button>
                          </div>
                        )}
                      </div>

                      {msg.structured_data.merchant && (
                        <div className="flex justify-between border-b-2 border-dashed border-[#1C1A27]/40 pb-2">
                          <span className="text-[#454654] font-bold">Merchant:</span>
                          <span className="font-bold text-[#1C1A27]">{msg.structured_data.merchant}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-b-2 border-dashed border-[#1C1A27]/40 pb-2">
                        <span className="text-[#454654] font-bold">Kategori:</span>
                        <span className="font-bold text-[#8B5CF6]">{msg.structured_data.category}</span>
                      </div>
                      <div className="flex justify-between border-b-2 border-dashed border-[#1C1A27]/40 pb-2">
                        <span className="text-[#454654] font-bold">Nominal:</span>
                        <span className={`font-bold text-base ${isIncome ? 'text-[#166534]' : 'text-[#1C1A27]'}`}>
                          {msg.structured_data.amount_formatted || `Rp ${msg.structured_data.amount}`}
                        </span>
                      </div>

                      {/* DYNAMIC WALLET SELECTOR DROPDOWN IN CARD */}
                      <div className="flex justify-between items-center border-b-2 border-dashed border-[#1C1A27]/40 pb-2">
                        <span className="text-[#454654] font-bold shrink-0">Pilih Wallet:</span>
                        {msg.confirmed ? (
                          <span className="font-bold text-[#3B4CCA]">{msg.structured_data.wallet_name || 'Dompet Utama'}</span>
                        ) : (
                          <select
                            value={selectedWallets[msg.id] || msg.structured_data.wallet_id || (wallets[0]?.id ? String(wallets[0].id) : '')}
                            onChange={(e) => handleWalletSelectForMsg(msg.id, e.target.value)}
                            className="neo-border bg-[#F1EBFE] text-[#3B4CCA] font-bold text-xs px-2 py-1 cursor-pointer focus:ring-0 shadow-[2px_2px_0px_0px_#1C1A27] max-w-[210px] truncate"
                          >
                            {wallets.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name} ({w.balance})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="flex justify-between border-b-2 border-dashed border-[#1C1A27]/40 pb-2">
                        <span className="text-[#454654] font-bold">Catatan:</span>
                        <span className="font-bold text-[#1C1A27] truncate max-w-[200px]">
                          {msg.structured_data.note || 'Transaksi AI Assistant'}
                        </span>
                      </div>
                    </div>

                    {/* Buttons Action */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      {msg.confirmed ? (
                        <div className="w-full bg-[#DCFCE7] text-[#166534] border-3 border-[#1C1A27] py-2 px-4 neo-shadow-sm font-label-mono text-xs uppercase font-bold flex items-center justify-center gap-2">
                          <MaterialIcon name="check_circle" className="text-lg text-[#22C55E]" />
                          ✓ TERCATAT {isIncome ? 'PEMASUKAN' : 'PENGELUARAN'} ({msg.structured_data.wallet_name || 'Wallet'})
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleConfirmReceipt(msg.id)}
                            className="flex-1 bg-[#4ADE80] text-[#1C1A27] border-3 border-[#1C1A27] py-2.5 px-3 neo-shadow-sm font-label-mono text-xs uppercase font-bold hover:bg-[#22C55E] hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <MaterialIcon name="check" className="text-base" />
                            ✓ Konfirmasi
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEditReceipt(msg)}
                            className="bg-white text-[#1C1A27] border-3 border-[#1C1A27] py-2.5 px-3 neo-shadow-sm font-label-mono text-xs uppercase font-bold hover:bg-[#F1EBFE] transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <MaterialIcon name="edit" className="text-base" />
                            ✕ Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* TYPING INDICATOR */}
          {isSending && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#3B4CCA] border-2 border-[#1C1A27] rounded-full flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_0px_#1C1A27]">
                <MaterialIcon name={activeModel?.icon || 'smart_toy'} className="text-lg" />
              </div>
              <div className="bg-white border-4 border-[#1C1A27] neo-shadow-sm px-4 py-3 rounded-[6px] flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 bg-[#3B4CCA] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 bg-[#1C1A27] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="font-label-mono text-xs uppercase font-bold text-[#454654] ml-2">
                  {activeModel?.name} berpikir...
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* PREVIEW IMAGE BAR IF ATTACHED */}
        {previewImage && (
          <div className="bg-[#FEF08A] border-t-4 border-[#1C1A27] p-2.5 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-lg">📷</span>
              <span className="font-label-mono text-xs font-bold text-[#1C1A27]">
                Struk terlampir (Siap di-scan & diparse)
              </span>
            </div>
            <button
              onClick={() => {
                setPreviewImage(null);
                setImageFile(null);
              }}
              className="text-xs font-label-mono font-bold uppercase bg-white border-2 border-[#1C1A27] px-2 py-0.5 hover:bg-[#FFDAD6]"
            >
              Batal ✕
            </button>
          </div>
        )}

        {/* QUICK SUGGESTION CHIPS */}
        <div className="bg-[#F1EEFF] border-t-4 border-[#1C1A27] px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-label-mono uppercase font-bold text-[#454654] shrink-0">
            SARAN:
          </span>
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip)}
              className="bg-[#E7DEFF] text-[#1C1A27] border-2 border-[#1C1A27] px-3 py-1 rounded-full font-label-mono text-xs font-bold hover:bg-[#8B5CF6] hover:text-white transition-all shrink-0 cursor-pointer neo-shadow-sm"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* STICKY BOTTOM INPUT BAR */}
        <div className="bg-white border-t-4 border-[#1C1A27] p-3 md:p-4 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowCameraModal(true)}
            className="w-14 h-14 bg-[#E7DEFF] text-[#1C1A27] border-4 border-[#1C1A27] neo-shadow-sm rounded-[6px] flex items-center justify-center hover:bg-[#8B5CF6] hover:text-white transition-colors cursor-pointer font-bold shrink-0"
            title="Kirim Foto Struk"
          >
            <MaterialIcon name="photo_camera" className="text-2xl" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Tulis pesan atau catat transaksi (${activeModel?.name})...`}
            className="flex-1 h-14 px-4 bg-white border-4 border-[#1C1A27] font-body-md font-bold text-[#1C1A27] focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1C1A27] rounded-[6px]"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isSending || (!input.trim() && !previewImage)}
            className="w-14 h-14 bg-[#8B5CF6] text-white border-4 border-[#1C1A27] neo-shadow-sm rounded-[6px] flex items-center justify-center hover:bg-[#3B4CCA] transition-colors cursor-pointer font-bold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Kirim Pesan"
          >
            <MaterialIcon name="send" className="text-2xl" />
          </button>
        </div>
      </div>

      {/* EDIT RECEIPT CARD MODAL */}
      {editingMessage && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1A27]/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditingMessage(null)}
        >
          <div
            className="bg-[#FDF8FF] border-4 border-[#1C1A27] neo-shadow p-6 md:p-8 w-full max-w-md transform rotate-[0.5deg]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-4 mb-6">
              <h3 className="text-2xl font-headline-md font-black text-[#1C1A27] uppercase">
                EDIT DETAIL STRUK
              </h3>
              <button
                type="button"
                onClick={() => setEditingMessage(null)}
                className="w-10 h-10 bg-white border-4 border-[#1C1A27] flex items-center justify-center cursor-pointer hover:bg-[#FFDAD6] font-bold neo-shadow-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditReceipt} className="space-y-4">
              {/* Type Toggle in Edit Modal */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  TIPE TRANSAKSI
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, type: 'expense' })}
                    className={`flex-1 py-3 border-4 border-[#1C1A27] font-label-mono text-xs uppercase font-bold neo-shadow-sm cursor-pointer transition-all ${
                      editForm.type === 'expense'
                        ? 'bg-[#FFDAD6] text-[#93000A]'
                        : 'bg-white text-[#454654] opacity-70'
                    }`}
                  >
                    - Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, type: 'income' })}
                    className={`flex-1 py-3 border-4 border-[#1C1A27] font-label-mono text-xs uppercase font-bold neo-shadow-sm cursor-pointer transition-all ${
                      editForm.type === 'income'
                        ? 'bg-[#4ADE80] text-[#1C1A27]'
                        : 'bg-white text-[#454654] opacity-70'
                    }`}
                  >
                    + Pemasukan
                  </button>
                </div>
              </div>

              {/* Wallet Select */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  PILIH SUMBER WALLET
                </label>
                <select
                  value={editForm.wallet_id}
                  onChange={(e) => setEditForm({ ...editForm, wallet_id: e.target.value })}
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold cursor-pointer"
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
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  KATEGORI
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full neo-border p-3 font-body-md bg-white text-[#1C1A27] font-bold"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  NOMINAL (IDR)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xl font-number-xl font-bold text-[#454654]">Rp</span>
                  <CurrencyInput
                    value={editForm.amount}
                    onChange={(raw) => setEditForm({ ...editForm, amount: raw })}
                    size="lg"
                    className="w-full neo-border py-3 pl-14 pr-4 bg-white font-number-xl text-[#1C1A27] font-bold"
                    required
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block font-label-mono text-xs uppercase font-bold text-[#1C1A27] mb-2">
                  CATATAN / KETERANGAN
                </label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  className="w-full neo-border p-3 font-body-md bg-[#F1EBFE] text-[#1C1A27] font-bold"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMessage(null)}
                  className="flex-1 bg-white border-4 border-[#1C1A27] py-3 font-label-mono text-xs uppercase font-bold neo-shadow-sm hover:bg-gray-100"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#4ADE80] text-[#1C1A27] border-4 border-[#1C1A27] py-3 font-label-mono text-xs uppercase font-bold neo-shadow-sm hover:bg-[#22C55E] hover:text-white"
                >
                  SIMPAN & KONFIRMASI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CAMERA / ATTACHMENT BOTTOM-SHEET MODAL */}
      {showCameraModal && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1A27]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowCameraModal(false)}
        >
          <div
            className="bg-[#FDF8FF] border-4 border-[#1C1A27] neo-shadow p-6 md:p-8 w-full max-w-md transform rotate-[0.5deg]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b-4 border-[#1C1A27] pb-4 mb-6">
              <div>
                <h3 className="text-2xl font-headline-md font-black text-[#1C1A27] uppercase">
                  KIRIM FOTO STRUK
                </h3>
                <p className="text-xs font-body-md text-[#454654] font-bold mt-1">
                  Unggah nota belanja untuk pemindaian OCR & auto-input.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCameraModal(false)}
                className="w-10 h-10 bg-white border-4 border-[#1C1A27] flex items-center justify-center cursor-pointer hover:bg-[#FFDAD6] font-bold neo-shadow-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setShowCameraModal(false);
                  cameraInputRef.current?.click();
                }}
                className="w-full bg-[#8B5CF6] text-white border-4 border-[#1C1A27] neo-shadow py-4 px-6 font-headline-md text-lg uppercase font-bold flex items-center justify-center gap-3 hover:bg-[#3B4CCA] transition-all cursor-pointer"
              >
                <span className="text-2xl">📷</span>
                AMBIL FOTO LANGSUNG (KAMERA)
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCameraModal(false);
                  galleryInputRef.current?.click();
                }}
                className="w-full bg-white text-[#1C1A27] border-4 border-[#1C1A27] neo-shadow py-4 px-6 font-headline-md text-lg uppercase font-bold flex items-center justify-center gap-3 hover:bg-[#E7DEFF] transition-all cursor-pointer"
              >
                <span className="text-2xl">🖼️</span>
                PILIH DARI GALERI HP / FILE
              </button>

              <button
                type="button"
                onClick={handleDemoPresetReceipt}
                className="w-full bg-[#FEF08A] text-[#1C1A27] border-4 border-[#1C1A27] neo-shadow py-3 px-6 font-label-mono text-xs uppercase font-bold flex items-center justify-center gap-2 hover:bg-[#FACC15] transition-all cursor-pointer"
              >
                <span className="text-base">⚡</span>
                GUNAKAN STRUK CONTOH DEMO
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
