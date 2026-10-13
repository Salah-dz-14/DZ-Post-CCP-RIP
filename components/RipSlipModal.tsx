import React, { useEffect } from 'react';
import { SavedAccount, Language } from '../types';
import { generateQrSvg } from '../utils/qr-code';

interface RipSlipModalProps {
  account: SavedAccount;
  lang: Language;
  onClose: () => void;
}

const RipSlipModal: React.FC<RipSlipModalProps> = ({ account, lang, onClose }) => {
  const isArabic = lang === 'ar';

  // QR code encodes: name, CCP, CCP key, RIP, RIP key — all info in one scan
  const qrContent = [
    `Name: ${account.name}`,
    `CCP: ${account.ccp}`,
    `CCP Key: ${account.ccpKey}`,
    `RIP: ${account.fullRip}`,
    `RIP Key: ${account.ripKey}`,
  ].join('\n');

  const qrSvgHtml = generateQrSvg(qrContent, 180);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handlePrint = () => window.print();

  return (
    <div
      className="print-modal-shell fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isArabic ? 'شهادة الـ RIP' : 'RIP Certificate'}
    >
      {/* Backdrop */}
      <div
        className="no-print absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className="print-modal-panel relative w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-[28px] shadow-2xl overflow-hidden"
        style={{ maxHeight: '92dvh', overflowY: 'auto' }}
      >
        {/* Drag handle (mobile) */}
        <div className="no-print flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="no-print flex items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <div>
              <h2 className="font-black text-[#003366] text-base leading-tight">
                {isArabic ? 'شهادة الـ RIP' : lang === 'fr' ? 'Certificat RIP' : 'RIP Certificate'}
              </h2>
              <p className="text-[11px] text-gray-400 font-semibold truncate max-w-[200px]">
                {account.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#003366] text-white hover:bg-[#002244] font-black rounded-xl text-[11px] flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h10z" />
              </svg>
              {isArabic ? 'حفظ PDF' : lang === 'fr' ? 'Enregistrer en PDF' : 'Save as PDF'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all active:scale-95"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Certificate card */}
        <div className="print-modal-content p-4">
          <div className="print-certificate bg-gradient-to-br from-[#003366] to-[#002244] text-white rounded-3xl p-5 shadow-2xl relative overflow-hidden border border-white/10">
            {/* Background glows */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-[#FFD700]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex justify-between items-start border-b border-white/15 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
                  <h4 className="font-black text-xs tracking-wide text-[#FFD700] uppercase">
                    ALGÉRIE POSTE 🇩🇿 بريد الجزائر
                  </h4>
                </div>
                <p className="text-[10px] font-bold opacity-75">
                  {isArabic ? 'كارت تعريف الحساب البريدي الجاري' : 'Relevé d\'Identité Postale (RIP)'}
                </p>
              </div>
              <div className="w-9 h-9 bg-white/10 rounded-xl p-0.5 border border-white/20 flex-shrink-0 overflow-hidden">
                <img src="/app_icon.png" alt="Algérie Poste" className="w-full h-full object-cover rounded-lg" />
              </div>
            </div>

            {/* Content: info + QR side by side */}
            <div className="flex items-start gap-4">
              {/* Left: account info */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Account name */}
                <div>
                  <span className="block text-[9px] uppercase tracking-widest text-amber-300/80 font-bold mb-0.5">
                    {isArabic ? 'صاحب الحساب' : 'Account Holder'}
                  </span>
                  <span className="font-bold text-sm text-white truncate block">
                    👤 {account.name}
                  </span>
                </div>

                {/* CCP */}
                <div>
                  <span className="block text-[9px] uppercase tracking-widest text-amber-300/80 font-bold mb-0.5">
                    {isArabic ? 'رقم الحساب / المفتاح (CCP)' : 'CCP Number / Key'}
                  </span>
                  <span className="font-mono text-sm font-black text-white tracking-wider">
                    {account.ccp} / {account.ccpKey}
                  </span>
                </div>

                {/* RIP */}
                <div>
                  <span className="block text-[9px] uppercase tracking-widest text-amber-300/80 font-bold mb-0.5">
                    {isArabic ? 'رقم الـ RIP الكامل (20 رقم)' : 'Full RIP Number (20 Digits)'}
                  </span>
                  <span className="font-mono text-base font-black text-[#FFD700] tracking-wider select-all break-all leading-tight">
                    {account.fullRip}
                  </span>
                </div>

                {/* RIP Key */}
                <div>
                  <span className="block text-[9px] uppercase tracking-widest text-amber-300/80 font-bold mb-0.5">
                    {isArabic ? 'مفتاح الـ RIP' : 'RIP Key'}
                  </span>
                  <span className="font-mono text-sm font-black text-white">
                    {account.ripKey}
                  </span>
                </div>
              </div>

              {/* Right: QR code */}
              <div className="flex flex-col items-center justify-center flex-shrink-0">
                <div className="bg-white rounded-2xl p-2 shadow-inner border border-white/20">
                  <div
                    dangerouslySetInnerHTML={{ __html: qrSvgHtml }}
                    className="w-28 h-28"
                  />
                </div>
                <span className="text-[8px] font-extrabold text-white/60 mt-1.5 font-mono text-center leading-tight">
                  {isArabic ? 'امسح للحصول على كل المعلومات' : 'Scan for full info'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[9px] opacity-60">
              <span>{isArabic ? 'محلي وآمن 100%' : '100% On-device · Secure'}</span>
              <span className="font-mono font-bold">Baridi RIP App</span>
            </div>
          </div>

          {/* QR info note */}
          <div className="no-print mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2">
            <span className="text-base flex-shrink-0">📱</span>
            <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
              {isArabic
                ? 'كود QR يحتوي على جميع المعلومات: الاسم، رقم الحساب، المفتاح، ورقم الـ RIP — يمكن مسحه بأي هاتف.'
                : lang === 'fr'
                ? 'Le QR code contient toutes les informations : nom, CCP, clé et RIP — scannable par n\'importe quel smartphone.'
                : 'QR code contains all info: name, CCP, key & RIP — scannable by any smartphone.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RipSlipModal;
