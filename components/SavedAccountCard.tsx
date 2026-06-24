import React, { useState } from 'react';
import { SavedAccount, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SavedAccountCardProps {
  account: SavedAccount;
  lang: Language;
  onSelect: () => void;
  onDelete: () => void;
}

const SavedAccountCard: React.FC<SavedAccountCardProps> = ({ account, lang, onSelect, onDelete }) => {
  const t = TRANSLATIONS[lang];
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleCopy = async (text: string, fieldId: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleShare = async () => {
    const shareText = lang === 'ar'
      ? `📋 تفاصيل الحساب الجاري البريدي (${account.name}):\n\n• رقم الحساب (CCP): ${account.ccp}\n• مفتاح الحساب (Clé CCP): ${account.ccpKey}\n• رقم التعريف الـ (RIP): ${account.fullRip}\n• مفتاح الـ (RIP): ${account.ripKey}\n\n✨ تم الحفظ والاستخراج محلياً وبأمان عبر تطبيق "بريدي RIP" - المطور Hadjar Salah Eddine`
      : lang === 'fr'
      ? `📋 Détails du Compte CCP de (${account.name}) :\n\n• Numéro CCP : ${account.ccp}\n• Clé CCP : ${account.ccpKey}\n• Numéro RIP : ${account.fullRip}\n• Clé RIP : ${account.ripKey}\n\n✨ Enregistré localement et en toute sécurité via l'application "Baridi RIP" - Développeur Hadjar Salah Eddine`
      : `📋 CCP Account Details of (${account.name}) (Algérie Poste):\n\n• CCP Number: ${account.ccp}\n• CCP Key: ${account.ccpKey}\n• RIP Number: ${account.fullRip}\n• RIP Key: ${account.ripKey}\n\n✨ Saved and generated securely via "Baridi RIP" - Developer Hadjar Salah Eddine`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'بريدي RIP',
          text: shareText
        });
      } catch (err) {
        const success = await copyToClipboard(shareText);
        if (success) {
          setCopiedField('share');
          setTimeout(() => setCopiedField(null), 2000);
        }
      }
    } else {
      const success = await copyToClipboard(shareText);
      if (success) {
        setCopiedField('share');
        setTimeout(() => setCopiedField(null), 2000);
      }
    }
  };

  const isArabic = lang === 'ar';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all relative overflow-hidden group">
      {/* Decorative side badge */}
      <div className={`absolute top-0 bottom-0 w-1 bg-[#FFD700] ${isArabic ? 'right-0' : 'left-0'}`}></div>
      
      {/* Header of the card */}
      <div className="flex items-center justify-between mb-4.5 gap-2">
        <div className="flex-1 min-w-0" onClick={onSelect}>
          <h3 className="font-bold text-[#003366] text-sm md:text-base leading-snug cursor-pointer hover:underline flex items-center gap-1.5">
            <span>👤 {account.name}</span>
          </h3>
          <span className="text-[10px] text-gray-400 font-mono tracking-tight font-medium">
            {new Date(account.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-US')}
          </span>
        </div>
        
        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onSelect}
            className="p-2 rounded-xl bg-blue-50/70 hover:bg-[#003366] text-[#003366] hover:text-white transition-all active:scale-95 shadow-sm border border-blue-100/50"
            title={lang === 'ar' ? 'فتح في الآلة الحاسبة' : lang === 'fr' ? 'Ouvrir' : 'Open'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white transition-all active:scale-95 shadow-sm border border-amber-200"
            title={t.shareBtn || "Share"}
          >
            {copiedField === 'share' ? (
              <span className="text-[10px] font-extrabold text-green-600">✓</span>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            )}
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 rounded-xl bg-red-50/70 hover:bg-red-500 text-red-500 hover:text-white transition-all active:scale-95 shadow-sm border border-red-100/50"
            title={lang === 'ar' ? 'حذف' : lang === 'fr' ? 'Supprimer' : 'Delete'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Structured Details Matrix */}
      <div className="space-y-3.5 bg-gray-50/50 rounded-xl p-3 border border-gray-100/50">
        
        {/* CCP Block */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide">CCP</span>
            <span className="font-mono font-extrabold text-[#003366] text-xs">
              {account.ccp} <span className="opacity-45">/</span> {account.ccpKey}
            </span>
          </div>
          <button
            onClick={() => handleCopy(`${account.ccp} ${account.ccpKey}`, 'ccp')}
            className="p-1.5 rounded-lg bg-white hover:bg-amber-50 text-gray-400 hover:text-[#003366] transition-all border border-gray-100 flex items-center justify-center gap-1 active:scale-90"
          >
            {copiedField === 'ccp' ? (
              <span className="text-[9px] font-black text-green-500 flex items-center gap-1 px-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                {t.copySuccess || 'تم!'}
              </span>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 00-2 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>
        </div>

        {/* RIP Block */}
        <div className="flex items-center justify-between text-xs font-semibold border-t border-gray-100 pt-2.5">
          <div className="flex flex-col min-w-0 max-w-[80%]">
            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide">RIP</span>
            <span className="font-mono font-extrabold text-[#003366] text-[11px] truncate select-all">
              {account.fullRip}
            </span>
          </div>
          <button
            onClick={() => handleCopy(account.fullRip, 'rip')}
            className="p-1.5 rounded-lg bg-white hover:bg-amber-50 text-gray-400 hover:text-[#003366] transition-all border border-gray-100 flex items-center justify-center gap-1 active:scale-90"
          >
            {copiedField === 'rip' ? (
              <span className="text-[9px] font-black text-green-500 flex items-center gap-1 px-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                {t.copySuccess || 'تم!'}
              </span>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 00-2 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SavedAccountCard;
