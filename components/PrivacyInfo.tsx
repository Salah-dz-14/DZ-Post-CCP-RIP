import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface PrivacyInfoProps {
  lang: Language;
}

const PrivacyInfo: React.FC<PrivacyInfoProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [isOpen, setIsOpen] = useState(false);
  const isArabic = lang === 'ar';

  return (
    <div id="privacy-info-accordion" className="mt-8 bg-white/70 backdrop-blur-sm rounded-[24px] border border-gray-200/50 p-4 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between focus:outline-none"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center gap-3 text-right">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#003366] flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className={isArabic ? 'text-right' : 'text-left'}>
            <h4 className="text-sm font-black text-[#003366]">{t.privacyModalTitle}</h4>
            <span className="text-[10px] text-gray-400 font-semibold">{t.devNameLabel}: Hadjar Salah Eddine</span>
          </div>
        </div>
        <div className={`transform transition-transform duration-200 text-[#003366] ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 leading-relaxed font-semibold animate-in fade-in slide-in-from-top-1 duration-200" dir={isArabic ? 'rtl' : 'ltr'}>
          <p className="mb-3 whitespace-pre-line text-xs font-bold text-gray-600">
            {t.privacyModalText}
          </p>
          <div className="bg-[#003366]/5 rounded-xl p-3 text-[11px] text-[#003366] font-bold flex flex-col gap-1.5">
            <div>🚀 <b>{isArabic ? 'مميزات إضافية ذكية:' : 'Smart Premium Features:'}</b></div>
            <ul className={`list-disc ${isArabic ? 'pr-4 text-right' : 'pl-4 text-left'} space-y-1 font-medium text-gray-500 text-[10.5px]`}>
              <li>{isArabic ? 'حفظ تلقائي للعمليات الأخيرة في سجل الحسابات المحلي.' : lang === 'fr' ? 'Sauvegarde automatique des calculs récents dans l\'historique local.' : 'Automatic saving of recent runs into your local calculation logs.'}</li>
              <li>{isArabic ? 'استيراد وتصدير نسخة احتياطية من قائمة الحسابات المفضلة بأمان.' : lang === 'fr' ? 'Importer et exporter des sauvegardes de vos comptes favoris de manière sécurisée.' : 'Safely backup and restore your list of favorite accounts at any time.'}</li>
              <li>{isArabic ? 'مشاركة كارت بيانات الحساب بضغطة زر واحدة عبر برامج المحادثة.' : 'Share beautifully structured account details in one click via WhatsApp/Telegram.'}</li>
              <li>{isArabic ? 'التخزين الآمن محلياً في ذاكرة المتصفح المعزولة.' : 'Data is saved 100% locally in your browser storage. No cloud servers.'}</li>
            </ul>
          </div>
          <div className="mt-4 flex flex-col items-center gap-3">
            <a
              href="mailto:salah.bio14dz@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-[#FFD700] hover:text-[#ffdf33] font-extrabold text-xs shadow-md transition-all active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {isArabic ? 'اتصل بمطور التطبيق' : lang === 'fr' ? 'Contacter le développeur' : 'Contact Developer'}
            </a>
            
            <div className="text-center text-[10px] text-gray-400 font-mono mt-1">
              {t.devNameLabel}: Hadjar Salah Eddine | {isArabic ? 'جميع العمليات تجري محلياً 100%' : '100% On-Device execution'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyInfo;
