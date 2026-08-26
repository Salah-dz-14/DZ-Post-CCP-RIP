import React, { useState } from 'react';
import { CalculationResult, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { getIban } from '../utils/ccp-logic';
import { generateQrSvg } from '../utils/qr-code';

interface RipCertificateProps {
  result: CalculationResult;
  lang: Language;
  accountName?: string;
}

const RipCertificate: React.FC<RipCertificateProps> = ({ result, lang, accountName = '' }) => {
  const t = TRANSLATIONS[lang];
  const isArabic = lang === 'ar';
  const iban = getIban(result.ccp, result.ripKey);

  const [holderName, setHolderName] = useState<string>(accountName);
  const [copiedIban, setCopiedIban] = useState<boolean>(false);

  const qrSvgHtml = generateQrSvg(`DZ5600799999${result.ccp}${result.ripKey}`, 160);

  const handleCopyIban = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(iban);
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-[28px] shadow-xl p-6 border border-gray-100/90 mt-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xl">📄</span>
          <h3 className="font-black text-[#003366] text-base">
            {isArabic ? 'شهادة الـ RIP المطبوعة وكود QR' : lang === 'fr' ? 'Relevé RIP & QR Code' : 'RIP Certificate & QR Code'}
          </h3>
        </div>
        <button
          onClick={handlePrint}
          className="px-3.5 py-1.5 bg-[#003366] text-white hover:bg-[#002244] font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>{isArabic ? 'طباعة / حفظ PDF' : lang === 'fr' ? 'Imprimer / PDF' : 'Print / PDF'}</span>
        </button>
      </div>

      {/* Holder Name Input for slip customization */}
      <div className="mb-4 no-print">
        <label className="block text-[11px] font-extrabold text-[#003366] mb-1 opacity-80">
          {isArabic ? 'اسم صاحب الحساب (يظهر في الكارت المطبوع):' : 'Account Holder Name (Appears on slip):'}
        </label>
        <input
          type="text"
          value={holderName}
          onChange={(e) => setHolderName(e.target.value)}
          placeholder={isArabic ? 'مثال: بن علي محمد' : 'e.g., Mohamed Benali'}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-[#FFD700] outline-none"
        />
      </div>

      {/* Printable Certificate Card Component */}
      <div className="bg-gradient-to-br from-[#003366] to-[#002244] text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-white/10">
        {/* Subtle background stamps */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#FFD700]/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="flex justify-between items-start border-b border-white/15 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] animate-pulse"></span>
              <h4 className="font-black text-sm tracking-wide text-[#FFD700] uppercase">
                ALGÉRIE POSTE 🇩🇿 بريد الجزائر
              </h4>
            </div>
            <p className="text-[11px] font-bold opacity-80">
              {isArabic ? 'كارت تعريف الحساب البريدي الجاري (RIP)' : 'Relevé d\'Identité Postale (RIP Certificate)'}
            </p>
          </div>
          
          <div className="w-11 h-11 bg-white/10 rounded-xl p-1 shadow-inner border border-white/20 flex-shrink-0 overflow-hidden">
            <img src="/app_icon.jpg" alt="Algérie Poste Logo" className="w-full h-full object-cover rounded-lg" />
          </div>
        </div>

        {/* Card Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-3.5">
            {holderName && (
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-amber-300/80 font-bold mb-0.5">
                  {isArabic ? 'صاحب الحساب' : 'Account Holder'}
                </span>
                <span className="font-bold text-sm text-white">
                  👤 {holderName}
                </span>
              </div>
            )}

            <div>
              <span className="block text-[9px] uppercase tracking-widest text-amber-300/80 font-bold mb-0.5">
                {isArabic ? 'رقم الحساب البريدي والمفتاح (CCP)' : 'CCP Account Number & Key'}
              </span>
              <span className="font-mono text-base font-black text-white tracking-wider">
                {result.ccp} / {result.ccpKey}
              </span>
            </div>

            <div>
              <span className="block text-[9px] uppercase tracking-widest text-amber-300/80 font-bold mb-0.5">
                {t.fullRip} (20 Digits)
              </span>
              <span className="font-mono text-lg font-black text-[#FFD700] tracking-wider select-all break-all">
                {result.fullRip}
              </span>
            </div>

            <div>
              <span className="block text-[9px] uppercase tracking-widest text-amber-300/80 font-bold mb-0.5">
                IBAN International Format
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-100 tracking-wide select-all">
                  {iban}
                </span>
                <button
                  onClick={handleCopyIban}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] no-print transition-all"
                  title="Copy IBAN"
                >
                  {copiedIban ? '✓' : '📋'}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-inner border border-white/20">
            <div dangerouslySetInnerHTML={{ __html: qrSvgHtml }} className="w-28 h-28" />
            <span className="text-[9px] font-extrabold text-[#003366] mt-1 font-mono text-center">
              OFFLINE QR CODE
            </span>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] opacity-70">
          <span>{isArabic ? 'تم الاستخراج بضغطة زر - آمن ومحلي 100%' : '100% On-device Local Verification'}</span>
          <span className="font-mono font-bold">Baridi RIP App</span>
        </div>
      </div>
    </div>
  );
};

export default RipCertificate;
