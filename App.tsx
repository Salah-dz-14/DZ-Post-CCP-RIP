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
import RipSlipModal from './components/RipSlipModal';
import { calculateCcpKey, calculateRipKey, getFullRip, padCcp, cleanAccountNumber, generateId, validateEnteredCcpKey } from './utils/ccp-logic';

type AppTab = 'converter' | 'fee' | 'favorites';

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
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [slipAccount, setSlipAccount] = useState<SavedAccount | null>(null);

  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dz_post_saved_accounts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
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
          const parsed = JSON.parse(cachedHistory);
          return Array.isArray(parsed) ? parsed : [];
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
    let previousScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 80 || currentScrollY < previousScrollY - 8) {
        setIsBottomNavVisible(true);
      } else if (currentScrollY > previousScrollY + 8) {
        setIsBottomNavVisible(false);
      }

      previousScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('dz_post_saved_accounts', JSON.stringify(savedAccounts.slice(0, 100)));
    } catch (e) {
      console.error('Failed to save accounts locally', e);
    }
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
                <img src="/app_icon.png" alt="DZ Post Link Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
                <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest font-extrabold">ALGÉRIE POSTE 🇩🇿</span>
              </div>
            </div>
            <LanguageSwitcher currentLang={lang} onLangChange={setLang} />
          </div>

          <p className="text-[#FFD700] text-sm md:text-base font-bold opacity-90 mb-3">{t.subtitle}</p>

          {(!isOnline || (deferredPrompt && !isAppInstalled)) && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {!isOnline && (
                <div className="inline-flex items-center gap-2 bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-100 px-3.5 py-1.5 rounded-xl text-xs font-black">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span>⚡ {t.offlineReady}</span>
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
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 -mt-8 px-4 pb-36 max-w-xl mx-auto w-full relative z-20">
        
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

        {/* TAB 3: SAVED FAVORITES & BACKUP */}
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
                      onSlip={() => setSlipAccount(acc)}
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

      {/* Liquid Glass Bottom Navigation */}
      <nav
        aria-label={isArabic ? 'التنقل الرئيسي' : 'Main navigation'}
        className={`no-print fixed inset-x-0 bottom-0 z-50 transition-transform duration-500 ease-in-out pointer-events-none ${
          isBottomNavVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-md mx-auto px-4 mb-3 pointer-events-auto">
          {/* Outer glow / ambient light layer */}
          <div className="absolute inset-x-8 -top-2 h-6 rounded-full bg-[#003366]/20 blur-xl pointer-events-none" />

          {/* Glass container */}
          <div
            className="relative rounded-[28px] overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(0,51,102,0.92) 0%, rgba(0,34,68,0.97) 100%)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: '0 8px 32px rgba(0,51,102,0.45), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.15)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Inner highlight rim */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <div className="grid grid-cols-3 gap-1.5 p-2 w-full">
              {([
                {
                  id: 'converter' as const,
                  label: isArabic ? 'المحول' : 'Converter',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6">
                      <rect x="4" y="3" width="6" height="6" rx="1" />
                      <rect x="14" y="3" width="6" height="6" rx="1" />
                      <rect x="4" y="13" width="6" height="6" rx="1" />
                      <path d="M14 16h6M17 13v6" />
                    </svg>
                  ),
                },
                {
                  id: 'fee' as const,
                  label: isArabic ? 'الرسوم' : 'Fees',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9 9.5A2.5 2.5 0 0 1 14.5 12a2.5 2.5 0 0 1-2.5 2.5M12 7v1M12 16v1" />
                      <path d="M9.5 14.5S10.5 15 12 15" />
                    </svg>
                  ),
                },
                {
                  id: 'favorites' as const,
                  label: isArabic ? 'المفضلة' : 'Saved',
                  icon: (
                    <svg viewBox="0 0 24 24" fill={activeTab === 'favorites' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  ),
                },
              ]).map(({ id, icon, label }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                    className={`relative flex flex-col items-center justify-center gap-1 rounded-[20px] px-2 py-2.5 text-[11px] font-black leading-tight ${
                      isActive
                        ? 'text-[#003366]'
                        : 'text-white/60 hover:text-white/85'
                    }`}
                  >
                    {/* Active pill background */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-[20px]"
                        style={{
                          background: 'linear-gradient(145deg, #FFD700 0%, #FFC200 100%)',
                          boxShadow: '0 4px 14px rgba(255,215,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
                        }}
                      />
                    )}

                    {/* Icon */}
                    <span className="relative z-10 leading-none">{icon}</span>

                    {/* Label */}
                    <span className="relative z-10 whitespace-nowrap">{label}</span>

                    {/* Badge */}
                    {id === 'favorites' && savedAccounts.length > 0 && (
                      <span
                        className="absolute -top-1 end-1.5 h-4 min-w-4 rounded-full px-1 text-[9px] font-black leading-4 z-20 flex items-center justify-center"
                        style={{
                          background: isActive ? '#003366' : '#FFD700',
                          color: isActive ? '#FFD700' : '#003366',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        }}
                      >
                        {savedAccounts.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Saved RIP card — opens directly from Saved tab */}
      {slipAccount && (
        <RipSlipModal
          account={slipAccount}
          lang={lang}
          onClose={() => setSlipAccount(null)}
        />
      )}
    </div>
  );
};

export default App;
