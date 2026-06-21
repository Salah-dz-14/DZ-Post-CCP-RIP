
import React, { useState, useEffect } from 'react';
import { Language, SavedAccount, CalculationResult } from './types';
import { TRANSLATIONS } from './constants';
import LanguageSwitcher from './components/LanguageSwitcher';
import ResultCard from './components/ResultCard';
import FeeCalculator from './components/FeeCalculator';
import PrivacyInfo from './components/PrivacyInfo';
import SavedAccountCard from './components/SavedAccountCard';
import BackupRestore from './components/BackupRestore';
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

    // Request persistent storage so the browser does not evict local storage on low disk space
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((persisted) => {
        if (persisted) {
          console.log('[PWA] Storage persistence granted.');
        } else {
          console.log('[PWA] Storage persistence not granted.');
        }
      }).catch((err) => {
        console.error('[PWA] Error requesting storage persistence:', err);
      });
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
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-white/20">
                <img src="/app_icon.jpg" alt="DZ Post Link Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
          <ResultCard result={result} lang={lang} onSave={handleSave} accountName={nameInput} />
        )}

        {/* Cash Withdrawal Fee Calculator */}
        <FeeCalculator lang={lang} />

        {/* Favorite Saved Accounts */}
        <div id="favorites-section" className="mt-10">
          <h2 className="text-xl font-black text-[#003366] mb-4 px-2">{t.historyTitle}</h2>
          {savedAccounts.length === 0 ? (
            <div className="text-center py-10 bg-white/40 rounded-[30px] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold text-sm">{t.noHistory}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedAccounts.map((acc) => (
                <SavedAccountCard
                  key={acc.id}
                  account={acc}
                  lang={lang}
                  onSelect={() => {
                    setCcpInput(acc.ccp);
                    setNameInput(acc.name);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onDelete={() => deleteAccount(acc.id)}
                />
              ))}
            </div>
          )}

          {/* Backup & Restore Controls */}
          <BackupRestore
            lang={lang}
            savedAccounts={savedAccounts}
            onAccountsImported={(imported) => {
              setSavedAccounts((prev) => {
                const existingMap = new Map();
                // Load existing
                prev.forEach((acc) => existingMap.set(acc.ccp, acc));
                // Merge unique (if imported card has same CCP, it will safely overwrite)
                imported.forEach((acc) => {
                  existingMap.set(acc.ccp, acc);
                });
                return Array.from(existingMap.values()) as SavedAccount[];
              });
            }}
          />
        </div>

        {/* Privacy Regulation Accordion & Developer Reference */}
        <PrivacyInfo lang={lang} />
      </main>
    </div>
  );
};

export default App;
