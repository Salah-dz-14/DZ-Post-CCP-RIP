import React, { useState } from 'react';
import { CalculationResult, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ResultCardProps {
  result: CalculationResult;
  lang: Language;
  onSave: (customName: string) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, lang, onSave }) => {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localNameInput, setLocalNameInput] = useState('');

  const isArabic = lang === 'ar';

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn("Navigator clipboard copy failed, attempting fallback...", err);
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return !!success;
    } catch (err) {
      console.error("Fallback copy failed too:", err);
      return false;
    }
  };

  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleShare = async () => {
    const shareText = lang === 'ar'
      ? `📋 تفاصيل الحساب الجاري البريدي (بريد الجزائر):\n\n• رقم الحساب (CCP): ${result.ccp}\n• مفتاح الحساب (Clé CCP): ${result.ccpKey}\n• رقم التعريف الـ (RIP): ${result.fullRip}\n• مفتاح الـ (RIP): ${result.ripKey}\n\n✨ تم الاستخراج محلياً وبأمان عبر تطبيق "بريدي RIP" - المطور Hadjar Salah Eddine`
      : lang === 'fr'
      ? `📋 Détails du Compte CCP (Algérie Poste) :\n\n• Numéro CCP : ${result.ccp}\n• Clé CCP : ${result.ccpKey}\n• Numéro RIP : ${result.fullRip}\n• Clé RIP : ${result.ripKey}\n\n✨ Généré localement et en toute sécurité via l'application "Baridi RIP" - Développeur Hadjar Salah Eddine`
      : `📋 CCP Account Details (Algérie Poste):\n\n• CCP Number: ${result.ccp}\n• CCP Key: ${result.ccpKey}\n• RIP Number: ${result.fullRip}\n• RIP Key: ${result.ripKey}\n\n✨ Generated locally and securely via "Baridi RIP" - Developer Hadjar Salah Eddine`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'بريدي RIP',
          text: shareText
        });
      } catch (err) {
        const success = await copyToClipboard(shareText);
        if (success) {
          setCopied('share');
          setTimeout(() => setCopied(null), 2000);
        }
      }
    } else {
      const success = await copyToClipboard(shareText);
      if (success) {
        setCopied('share');
        setTimeout(() => setCopied(null), 2000);
      }
    }
  };

  const ResultItem = ({ label, value, id, isFull = false, highlight = false }: { label: string; value: string; id: string; isFull?: boolean; highlight?: boolean }) => (
    <div className={`flex flex-col mb-4 ${isFull ? 'col-span-2' : ''}`}>
      <span className="text-[10px] font-black text-[#003366]/60 mb-1.5 uppercase tracking-widest px-1">
        {label}
      </span>
      <div className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${highlight ? 'bg-amber-50 border-amber-200 ring-4 ring-amber-500/5' : isFull ? 'bg-blue-50 border-blue-100 ring-4 ring-blue-500/5' : 'bg-gray-50 border-gray-100 hover:border-[#FFD700]'}`}>
        <span className={`font-mono font-black tracking-tight select-all break-all ${highlight ? 'text-lg text-[#003366]' : isFull ? 'text-lg text-[#003366]' : 'text-base text-gray-700'}`}>
          {value}
        </span>
        <button
          onClick={() => handleCopy(value, id)}
          className="ml-2.5 p-2 rounded-xl bg-white shadow-sm text-gray-400 hover:text-[#003366] transition-all active:scale-90 border border-gray-100 flex-shrink-0"
        >
          {copied === id ? (
            <svg className="w-4 h-4 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[32px] shadow-xl p-6 border border-gray-100/80 animate-in fade-in zoom-in duration-300 mt-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="grid grid-cols-2 gap-x-3.5 relative z-10">
        <ResultItem label="CCP" value={result.ccp} id="paddedCcp" />
        <ResultItem label={t.ccpKey} value={result.ccpKey} id="ccpKey" />
        <ResultItem label="Prefix (Code)" value="007 99999" id="prefix" />
        <ResultItem label={t.ripKey} value={result.ripKey} id="ripKey" />
        <ResultItem label={t.fullRip} value={result.fullRip} id="fullRip" isFull />
      </div>
      
      {!isSaving ? (
        <div className="grid grid-cols-2 gap-3 mt-3 relative z-10">
          <button
            onClick={handleShare}
            className="py-3 px-4 bg-gray-50 hover:bg-gray-100 text-[#003366] font-extrabold rounded-xl border-2 border-gray-200/50 transition-all active:scale-[0.97] flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 10.742l4.632-2.316a3 3 0 11.517 1.03l-4.632 2.316m0 0a3 3 0 11-.517-1.03l4.632-2.316m-4.632 2.316a3 3 0 11-.517 1.03" />
            </svg>
            {copied === 'share' ? t.copySuccess : t.shareBtn}
          </button>

          <button
            onClick={() => setIsSaving(true)}
            className="py-3 px-4 bg-[#FFD700] hover:bg-[#ffdf33] text-[#003366] font-extrabold rounded-xl shadow-lg shadow-[#FFD700]/10 transition-all active:scale-[0.97] flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.saveBtn}
          </button>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-amber-50/40 rounded-[24px] border-2 border-[#FFD700]/30 relative z-10 animate-in slide-in-from-bottom-3 duration-200">
          <label className="block text-xs font-black text-[#003366] mb-2 px-1 uppercase tracking-wider opacity-80 text-right">
            {t.placeholderName}
          </label>
          <input
            type="text"
            value={localNameInput}
            onChange={(e) => setLocalNameInput(e.target.value)}
            placeholder={t.placeholderName}
            className="w-full bg-white border-2 border-gray-100 rounded-xl px-3.5 py-3 text-sm font-bold focus:ring-4 focus:ring-[#FFD700]/15 focus:border-[#FFD700] outline-none transition-all mb-3 text-center"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onSave(localNameInput);
                setLocalNameInput('');
                setIsSaving(false);
              }}
              className="flex-1 py-2.5 px-4 bg-[#003366] hover:bg-[#002244] text-white font-black rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <span>{isArabic ? 'تأكيد وحفظ' : lang === 'fr' ? 'Confirmer' : 'Confirm'}</span>
            </button>
            <button
              onClick={() => {
                setIsSaving(false);
                setLocalNameInput('');
              }}
              className="py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-500 font-bold rounded-lg text-xs border border-gray-200 transition-all active:scale-[0.98]"
            >
              {isArabic ? 'إلغاء' : lang === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
