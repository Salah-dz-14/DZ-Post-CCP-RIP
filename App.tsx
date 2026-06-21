
import React, { useState, useEffect } from 'react';
import { Language, SavedAccount, CalculationResult } from './types';
import { TRANSLATIONS } from './constants';
import LanguageSwitcher from './components/LanguageSwitcher';
import ResultCard from './components/ResultCard';
import { calculateCcpKey, calculateRipKey, getFullRip, padCcp, cleanAccountNumber } from './utils/ccp-logic';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [ccpInput, setCcpInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const t = TRANSLATIONS[lang];
  const isArabic = lang === 'ar';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('dz_post_saved_accounts');
    if (saved) {
      try {
        setSavedAccounts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved accounts", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dz_post_saved_accounts', JSON.stringify(savedAccounts));
  }, [savedAccounts]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    // Intelligent cleaning happens inside the utility functions
    const cleaned = cleanAccountNumber(ccpInput); 
    if (!cleaned) return;

    const cKey = calculateCcpKey(ccpInput);
    const rKey = calculateRipKey(ccpInput);
    const rip = getFullRip(ccpInput, rKey);

    setResult({
      ccp: padCcp(cleaned),
      ccpKey: cKey,
      ripKey: rKey,
      fullRip: rip
    });
  };

  const handleSave = () => {
    if (!result) return;
    
    const newAccount: SavedAccount = {
      id: crypto.randomUUID(),
      name: nameInput.trim() || `${t.ccpKey} ${result.ccp}`,
      ccp: result.ccp,
      ccpKey: result.ccpKey,
      rip: result.fullRip,
      ripKey: result.ripKey,
      fullRip: result.fullRip,
      createdAt: Date.now()
    };

    setSavedAccounts(prev => [newAccount, ...prev]);
    setNameInput('');
    setResult(null);
    setCcpInput('');
  };

  const deleteAccount = (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      setSavedAccounts(prev => prev.filter(acc => acc.id !== id));
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#F8FAFC] ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-[#003366] text-white pt-8 pb-14 px-6 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        
        <div className="max-w-xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="flex justify-between items-center w-full mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFD700] rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-[#003366]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
            </div>
            <LanguageSwitcher currentLang={lang} onLangChange={setLang} />
          </div>
          <p className="text-[#FFD700] text-base font-bold opacity-90">{t.subtitle}</p>
          {!isOnline && (
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-400/20 backdrop-blur-md border border-yellow-400/30 text-yellow-100 px-4 py-2 rounded-xl text-xs font-bold leading-none">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
              </span>
              <span>{t.offlineReady}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 -mt-8 px-4 pb-20 max-w-xl mx-auto w-full relative z-20">
        <div className="bg-white rounded-[28px] shadow-xl p-7 border border-gray-100">
          <form onSubmit={handleCalculate} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-[#003366] mb-2 px-1 uppercase tracking-wider opacity-70">
                {t.ccpInputLabel}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={ccpInput}
                onChange={(e) => setCcpInput(e.target.value.replace(/[^\d\s\-\/]/g, ''))}
                placeholder={t.placeholderCcp}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 focus:ring-4 focus:ring-[#FFD700]/10 focus:border-[#FFD700] outline-none transition-all font-mono text-xl font-black text-center text-[#003366]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#003366] mb-2 px-1 uppercase tracking-wider opacity-70">
                {t.nameInputLabel}
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t.placeholderName}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 focus:ring-4 focus:ring-[#FFD700]/10 focus:border-[#FFD700] outline-none transition-all text-sm font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#003366] text-white font-black rounded-xl shadow-lg transition-all hover:bg-[#002244] active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
            >
              <span>{t.calculateBtn}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>
        </div>

        {result && (
          <ResultCard result={result} lang={lang} onSave={handleSave} />
        )}

        <div className="mt-10">
          <h2 className="text-xl font-black text-[#003366] mb-4 px-2">{t.historyTitle}</h2>
          {savedAccounts.length === 0 ? (
            <div className="text-center py-10 bg-white/40 rounded-[30px] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold text-sm">{t.noHistory}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedAccounts.map((acc) => (
                <div key={acc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#003366] truncate">{acc.name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">CCP: {acc.ccp} | RIP: ...{acc.rip.slice(-4)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCcpInput(acc.ccp);
                        setNameInput(acc.name);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-3 rounded-lg bg-blue-50 text-[#003366] hover:bg-[#003366] hover:text-white transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="p-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
