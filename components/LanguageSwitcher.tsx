
import React from 'react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, onLangChange }) => {
  const nextLangMap: Record<Language, Language> = {
    ar: 'fr',
    fr: 'en',
    en: 'ar',
  };

  const labelMap: Record<Language, string> = {
    ar: 'العربية',
    fr: 'Français',
    en: 'English',
  };

  return (
    <button
      onClick={() => onLangChange(nextLangMap[currentLang])}
      className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 transition-all text-xs font-black shadow-sm active:scale-95"
      title="تغيير اللغة / Changer la langue / Switch language"
    >
      <svg
        className="w-4 h-4 text-[#FFD700]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>
      <span>{labelMap[currentLang]}</span>
    </button>
  );
};

export default LanguageSwitcher;
