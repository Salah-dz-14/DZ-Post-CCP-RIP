import React, { useState } from 'react';
import { HistoryItem, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface HistoryLogProps {
  lang: Language;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const HistoryLog: React.FC<HistoryLogProps> = ({ lang, history, onSelect, onDelete, onClear }) => {
  const t = TRANSLATIONS[lang];
  const isArabic = lang === 'ar';
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base text-gray-500">📋</span>
          <h3 className="font-bold text-[#003366] text-sm md:text-base">
            {t.historyLogTitle || 'سجل العمليات الأخير'}
          </h3>
        </div>
        <p className="text-xs text-gray-400 text-center py-4 font-bold">
          {t.noHistoryLog || 'لا توجد عمليات سابقة في السجل.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 mt-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base text-amber-500">📋</span>
          <h3 className="font-bold text-[#003366] text-sm md:text-base">
            {t.historyLogTitle || 'سجل العمليات الأخير'}
          </h3>
        </div>
        <button
          onClick={onClear}
          className="text-[10px] md:text-xs font-black text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all active:scale-95"
        >
          🗑️ {t.clearHistoryBtn || 'مسح السجل بالكامل'}
        </button>
      </div>

      <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto pr-1">
        {history.map((item) => {
          const dateStr = new Date(item.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={item.id} className="py-3.5 flex items-center justify-between gap-3 group hover:bg-gray-50/50 rounded-xl px-2 transition-all">
              <div 
                className="flex flex-col min-w-0 cursor-pointer flex-1"
                onClick={() => onSelect(item)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-black text-[#003366]">
                    {item.ccp}-{item.ccpKey}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold bg-gray-100 rounded-md px-1.5 py-0.5">
                    {dateStr}
                  </span>
                </div>
                <div className="font-mono text-[10.5px] text-gray-500 truncate font-semibold">
                  RIP: {item.fullRip}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(item.fullRip, item.id)}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-amber-50 text-gray-400 hover:text-[#003366] transition-all border border-gray-100"
                  title={t.copySuccess || "Copy RIP"}
                >
                  {copiedId === item.id ? (
                    <span className="text-[10px] text-green-500 font-extrabold flex items-center gap-0.5">
                      ✓
                    </span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-all border border-gray-100"
                  title="Remove from Log"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryLog;
