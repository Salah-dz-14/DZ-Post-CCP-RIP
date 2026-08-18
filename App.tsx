import React, { useState, useEffect } from 'react';
import { Language, SavedAccount, CalculationResult, HistoryItem } from './types';
import { TRANSLATIONS } from './constants';
import LanguageSwitcher from './components/LanguageSwitcher';
import ResultCard from './components/ResultCard';
import PrivacyInfo from './components/PrivacyInfo';
import SavedAccountCard from './components/SavedAccountCard';
import BackupRestore from './components/BackupRestore';
import HistoryLog from './components/HistoryLog';
import FeeCalculator from './components/FeeCalculator';
import RipCertificate from './components/RipCertificate';
import { calculateCcpKey, calculateRipKey, getFullRip, padCcp, cleanAccountNumber, generateId, validateEnteredCcpKey } from './utils/ccp-logic';

type AppTab = 'converter' | 'fee' | 'slip' | 'favorites';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<AppTab>('converter');
  const [ccpInput, setCcpInput] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dz_post_saved_accounts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved accounts", e);
        }
      }
    }
    return [];
  });

  const [calculationHistory, setCalculationHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cachedHistory = localStorage.getItem('dz_post_calculation_history');
      if (cachedHistory) {
        try {
          return JSON.parse(cachedHistory);
        } catch (e) {
          console.error("Failed to parse cached calculation history", e);
        }
      }
    }
    return [];
  });

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);

  const t = TRANSLATIONS[lang];
  const isArabic = lang === 'ar';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dz_post_saved_accounts', JSON.stringify(savedAccounts));
  }, [savedAccounts]);

  const keyValidation = validateEnteredCcpKey(ccpInput);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanAccountNumber(ccpInput); 
    if (!cleaned) return;

    const cKey = calculateCcpKey(ccpInput);
    const rKey = calculateRipKey(ccpInput);
    const rip = getFullRip(ccpInput, rKey);
    const padded = padCcp(cleaned);

    const calcResult: CalculationResult = {
      ccp: padded,
      ccpKey: cKey,
      ripKey: rKey,
      fullRip: rip
    };

    setResult(calcResult);

    const newItem: HistoryItem = {
      id: generateId(),
      ccp: padded,
      ccpKey: cKey,
      ripKey: rKey,
      fullRip: rip,
      timestamp: Date.now()
    };

    setCalculationHistory(prev => {
      const filtered = prev.filter(item => item.ccp !== padded);
      const updated = [newItem, ...filtered].slice(0, 20);
      localStorage.setItem('dz_post_calculation_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleShareApp = async () => {
    const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://barid-rip.com';
    const text = `${t.shareAppText || ''} ${appUrl}`;
    
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: t.title,
          text: text,
          url: appUrl
        });
      } catch (err) {
        if (typeof navigator.clipboard !== 'undefined') {
          await navigator.clipboard.writeText(text);
          setCopiedAppUrl(true);
          setTimeout(() => setCopiedAppUrl(false), 2000);
        }
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopiedAppUrl(true);
      setTimeout(() => setCopiedAppUrl(false), 2000);
    }
  };

  const handleSave = (customName: string) => {
    if (!result) return;
    
    const newAccount: SavedAccount = {
      id: generateId(),
      name: customName.trim() || `${t.ccpKey} ${result.ccp}`,
      ccp: result.ccp,
      ccpKey: result.ccpKey,
      rip: result.fullRip,
      ripKey: result.ripKey,
      fullRip: result.fullRip,
      createdAt: Date.now()
    };

    setSavedAccounts(prev => [newAccount, ...prev]);
  };

  const deleteAccount = (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      setSavedAccounts(prev => prev.filter(acc => acc.id !== id));
    }
  };

  const filteredAccounts = savedAccounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.ccp.includes(searchQuery) ||
    acc.fullRip.includes(searchQuery)
  );

  return (
    <div className={`min-h-screen flex flex-col bg-[#F8FAFC] ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-gradient-to-b from-[#003366] to-[#002244] text-white pt-8 pb-14 px-6 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFD700]/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="max-w-xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="flex justify-between items-center w-full mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-white/20">
                <img src="/app_icon.jpg" alt="DZ Post Link Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
                <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest font-extrabold">ALGÉRIE POSTE 🇩🇿</span>
              </div>
            </div>
            <LanguageSwitcher currentLang={lang} onLangChange={setLang} />
          </div>

          <p className="text-[#FFD700] text-sm md:text-base font-bold opacity-90 mb-3">{t.subtitle}</p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {!isOnline ? (
              <div className="inline-flex items-center gap-2 bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-100 px-3.5 py-1.5 rounded-xl text-xs font-black">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span>⚡ {t.offlineReady}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 backdrop-blur-md border border-emerald-400/30 text-emerald-200 px-3 py-1 rounded-xl text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{isArabic ? 'جاهز ومتصل - يعمل بدون إنترنت' : 'Ready & Offline Capable'}</span>
              </div>
            )}

            {deferredPrompt && !isAppInstalled && (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 bg-[#FFD700] text-[#003366] hover:bg-[#ffdf33] px-3.5 py-1.5 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 border border-[#FFD700]"
              >
                <span>📲</span>
                <span>{isArabic ? 'تثبيت التطبيق' : 'Install App'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 -mt-8 px-4 pb-20 max-w-xl mx-auto w-full relative z-20">
        
        {/* Universal Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 shadow-xl border border-gray-100 mb-6 flex flex-wrap gap-2 text-xs font-black justify-center md:justify-between">
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex-1 md:flex-1 min-w-[120px] py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'converter' ? 'bg-[#003366] text-white shadow-md' : 'text-gray-500 hover:text-[#003366] hover:bg-gray-50'
            }`}
          >
            <span>🧮</span>
            <span className="truncate">{isArabic ? 'المحول' : 'Converter'}</span>
          </button>

          <button
            onClick={() => setActiveTab('fee')}
            className={`flex-1 md:flex-1 min-w-[110px] py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'fee' ? 'bg-[#003366] text-white shadow-md' : 'text-gray-500 hover:text-[#003366] hover:bg-gray-50'
            }`}
          >
            <span>💸</span>
            <span className="truncate">{isArabic ? 'حاسبة الرسوم' : 'Fee Calc'}</span>
          </button>

          <button
            onClick={() => setActiveTab('slip')}
            className={`flex-1 md:flex-1 min-w-[110px] py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'slip' ? 'bg-[#003366] text-white shadow-md' : 'text-gray-500 hover:text-[#003366] hover:bg-gray-50'
            }`}
          >
            <span>📄</span>
            <span className="truncate">{isArabic ? 'شهادة RIP' : 'RIP Slip'}</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 md:flex-1 min-w-[110px] py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'favorites' ? 'bg-[#003366] text-white shadow-md' : 'text-gray-500 hover:text-[#003366] hover:bg-gray-50'
            }`}
          >
            <span>⭐</span>
            <span className="truncate">{isArabic ? 'المفضلة' : 'Saved'}</span>
            {savedAccounts.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#FFD700] text-[#003366] text-[9px] font-black flex items-center justify-center ml-0.5">
                {savedAccounts.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: CONVERTER */}
        {activeTab === 'converter' && (
          <div className="space-y-6">
            {/* Quick App Share Banner */}
            <div className="bg-[#FFD700] text-[#003366] rounded-[24px] p-4 flex items-center justify-between gap-3 shadow-lg shadow-[#FFD700]/10 border border-[#FFD700]/20 relative overflow-hidden animate-in fade-in duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full translate-x-8 -translate-y-8 blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-3 relative z-10 min-w-0">
                <span className="text-2xl">📢</span>
                <div className="min-w-0">
                  <p className="font-black text-xs md:text-sm whitespace-normal leading-snug">
                    {lang === 'ar' ? 'أعجبك التطبيق؟ شاركه مع من تحب!' : lang === 'fr' ? 'Vous aimez l\'application ? Partagez-la !' : 'Love the app? Share it with friends!'}
                  </p>
                  <p className="text-[10px] opacity-80 whitespace-normal leading-normal font-semibold mt-0.5">
                    {lang === 'ar' ? 'ساعد أصدقاءك على استخراج الـ RIP والمفاتيح بضغطة زر' : lang === 'fr' ? 'Aidez vos proches à générer leur RIP facilement' : 'Help others calculate their RIP and keys easily'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleShareApp}
                className="px-4 py-2 bg-[#003366] text-white hover:bg-[#002244] font-black rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md flex-shrink-0 relative z-10"
              >
                {copiedAppUrl ? (
                  <>
                    <span>✓</span>
                    <span>{lang === 'ar' ? 'تم النسخ!' : lang === 'fr' ? 'Copié !' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    <span>{t.shareAppBtn || 'Share'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Input Form Card */}
            <div className="bg-white rounded-[28px] shadow-xl p-7 border border-gray-100">
              <form onSubmit={handleCalculate} className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <label className="block text-xs font-black text-[#003366] uppercase tracking-wider opacity-70">
                      {t.ccpInputLabel}
                    </label>
                    {ccpInput && (
                      <span className="text-[10px] font-mono font-bold text-gray-400">
                        {cleanAccountNumber(ccpInput).length} {isArabic ? 'أرقام' : 'digits'}
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={ccpInput}
                    onChange={(e) => setCcpInput(e.target.value.replace(/[^\d\s\-\/]/g, ''))}
                    placeholder={t.placeholderCcp}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 focus:ring-4 focus:ring-[#FFD700]/10 focus:border-[#FFD700] outline-none transition-all font-mono text-xl font-black text-center text-[#003366]"
                    required
                  />

                  {/* Smart Key Comparison Feedback */}
                  {keyValidation.hasUserKey ? (
                    keyValidation.isValid ? (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                        <span>✅</span>
                        <span>{isArabic ? `المفتاح المدخل (${keyValidation.enteredKey}) صحيح ومطابق للحساب!` : `Entered key (${keyValidation.enteredKey}) is valid!`}</span>
                      </div>
                    ) : (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                        <span>⚠️</span>
                        <span>{isArabic ? `المفتاح المدخل (${keyValidation.enteredKey}) يختلف عن المفتاح المحسوب (${keyValidation.expectedKey})` : `Entered key mismatch. Calculated: ${keyValidation.expectedKey}`}</span>
                      </div>
                    )
                  ) : (
                    <p className="mt-2 text-[10px] md:text-[11px] text-amber-600 font-extrabold px-1 text-center leading-normal">
                      ⚠️ {lang === 'ar' 
                        ? 'يمكنك إدخال رقم الحساب فقط، أو الحساب ومفتاحه (مثال: 12345678/45).' 
                        : lang === 'fr'
                        ? 'Saisissez le numéro de compte seul ou avec clé (ex: 12345678/45).'
                        : 'Enter account digits alone or with key (e.g. 12345678/45).'}
                    </p>
                  )}
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

            {/* Result Card */}
            {result && (
              <div className="space-y-4">
                <ResultCard result={result} lang={lang} onSave={handleSave} />
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('slip')}
                    className="flex-1 py-3 bg-amber-50 hover:bg-amber-100 text-[#003366] font-extrabold rounded-xl border border-amber-200 text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>📄</span>
                    <span>{isArabic ? 'معاينة وطباعة شهادة ה-RIP وكود QR' : 'View RIP Slip & QR Code'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Recent History Log */}
            <HistoryLog
              lang={lang}
              history={calculationHistory}
              onSelect={(item) => {
                setCcpInput(item.ccp);
                setResult({
                  ccp: item.ccp,
                  ccpKey: item.ccpKey,
                  ripKey: item.ripKey,
                  fullRip: item.fullRip
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={(id) => {
                setCalculationHistory(prev => {
                  const updated = prev.filter(item => item.id !== id);
                  localStorage.setItem('dz_post_calculation_history', JSON.stringify(updated));
                  return updated;
                });
              }}
              onClear={() => {
                if (window.confirm(isArabic ? 'هل أنت متأكد من مسح سجل العمليات الأخير بالكامل؟' : lang === 'fr' ? 'Voulez-vous effacer tout l\'historique ?' : 'Are you sure you want to clear the entire history log?')) {
                  setCalculationHistory([]);
                  localStorage.removeItem('dz_post_calculation_history');
                }
              }}
            />
          </div>
        )}

        {/* TAB 2: FEE CALCULATOR */}
        {activeTab === 'fee' && (
          <FeeCalculator lang={lang} />
        )}

        {/* TAB 3: PRINTABLE SLIP & QR CODE */}
        {activeTab === 'slip' && (
          <RipCertificate
            result={result || {
              ccp: '1234567890',
              ccpKey: '45',
              ripKey: '06',
              fullRip: '00799999123456789006'
            }}
            lang={lang}
          />
        )}

        {/* TAB 4: SAVED FAVORITES & BACKUP */}
        {activeTab === 'favorites' && (
          <div className="space-y-6 mt-2">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-black text-[#003366]">{t.historyTitle}</h2>
                <span className="text-xs font-mono font-bold text-gray-400">
                  {savedAccounts.length} {isArabic ? 'حسابات' : 'items'}
                </span>
              </div>

              {/* Search Filter */}
              {savedAccounts.length > 0 && (
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isArabic ? 'البحث بالاسم أو رقم الحساب...' : 'Search by name or CCP...'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-[#FFD700] outline-none pr-9"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}

              {filteredAccounts.length === 0 ? (
                <div className="text-center py-10 bg-white/40 rounded-[24px] border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold text-sm">
                    {savedAccounts.length === 0 ? t.noHistory : (isArabic ? 'لا توجد نتائج مطابقة للبحث.' : 'No matching accounts found.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAccounts.map((acc) => (
                    <SavedAccountCard
                      key={acc.id}
                      account={acc}
                      lang={lang}
                      onSelect={() => {
                        setCcpInput(acc.ccp);
                        setResult({
                          ccp: acc.ccp,
                          ccpKey: acc.ccpKey,
                          ripKey: acc.ripKey,
                          fullRip: acc.fullRip
                        });
                        setActiveTab('converter');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onDelete={() => deleteAccount(acc.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Backup & Restore Section */}
            <BackupRestore
              lang={lang}
              savedAccounts={savedAccounts}
              onAccountsImported={(imported) => {
                setSavedAccounts((prev) => {
                  const existingMap = new Map();
                  prev.forEach((acc) => existingMap.set(acc.ccp, acc));
                  imported.forEach((acc) => {
                    existingMap.set(acc.ccp, acc);
                  });
                  return Array.from(existingMap.values()) as SavedAccount[];
                });
              }}
            />
          </div>
        )}

        {/* Privacy Information & Developer Info */}
        <PrivacyInfo lang={lang} />
      </main>
    </div>
  );
};

export default App;
