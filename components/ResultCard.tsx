
import React, { useState } from 'react';
import { CalculationResult, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ResultCardProps {
  result: CalculationResult;
  lang: Language;
  onSave: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, lang, onSave }) => {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const ResultItem = ({ label, value, id, isFull = false }: { label: string; value: string; id: string; isFull?: boolean }) => (
    <div className={`flex flex-col mb-5 ${isFull ? 'col-span-2' : ''}`}>
      <span className="text-[10px] font-black text-[#003366]/60 mb-2 uppercase tracking-widest px-1">
        {label}
      </span>
      <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isFull ? 'bg-blue-50 border-blue-200 ring-4 ring-blue-500/5' : 'bg-gray-50 border-gray-100 hover:border-[#FFD700]'}`}>
        <span className={`font-mono font-black tracking-tight ${isFull ? 'text-xl text-[#003366]' : 'text-lg text-gray-700'}`}>
          {value}
        </span>
        <button
          onClick={() => handleCopy(value, id)}
          className="ml-3 p-2 rounded-xl bg-white shadow-sm text-gray-400 hover:text-[#003366] transition-all active:scale-90 border border-gray-100"
        >
          {copied === id ? (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[35px] shadow-2xl p-8 border border-gray-100 animate-in fade-in zoom-in duration-300 mt-8 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFD700]/10 rounded-full blur-3xl"></div>
      
      <div className="grid grid-cols-2 gap-x-4 relative z-10">
        <ResultItem label="CCP (Padded)" value={result.ccp} id="paddedCcp" />
        <ResultItem label={t.ccpKey} value={result.ccpKey} id="ccpKey" />
        <ResultItem label="Prefix (Bank/Branch)" value="007 99999" id="prefix" />
        <ResultItem label={t.ripKey} value={result.ripKey} id="ripKey" />
        <ResultItem label={t.fullRip} value={result.fullRip} id="fullRip" isFull />
      </div>
      
      <button
        onClick={onSave}
        className="w-full mt-2 py-4.5 bg-[#FFD700] hover:bg-[#ffdf33] text-[#003366] font-black rounded-2xl shadow-xl shadow-[#FFD700]/20 transition-all active:scale-[0.97] flex items-center justify-center gap-3 text-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t.saveBtn}
      </button>
    </div>
  );
};

export default ResultCard;
