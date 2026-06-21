
import React from 'react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, onLangChange }) => {
  const langs: { code: Language; label: string }[] = [
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
  ];

  return (
    <div className="flex bg-white/20 backdrop-blur-md rounded-full p-1 border border-white/30 shadow-sm">
      {langs.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLangChange(lang.code)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            currentLang === lang.code
              ? 'bg-white text-[#003366] shadow-md'
              : 'text-white hover:bg-white/10'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
