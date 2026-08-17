import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { calculateWithdrawalFee, calculateMaxWithdrawalFromBalance, calculateEdahabiaAtmFee } from '../utils/ccp-logic';

interface FeeCalculatorProps {
  lang: Language;
}

const FeeCalculator: React.FC<FeeCalculatorProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const isArabic = lang === 'ar';

  const [mode, setMode] = useState<'withdraw' | 'balance' | 'atm'>('withdraw');
  const [inputValue, setInputValue] = useState<string>('20000');
  const [isPosteAtm, setIsPosteAtm] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const numVal = Math.max(0, parseFloat(inputValue) || 0);

  let fee = 0;
  let netPayout = 0;
  let totalBalanceNeeded = 0;

  if (mode === 'withdraw') {
    fee = calculateWithdrawalFee(numVal);
    netPayout = numVal;
    totalBalanceNeeded = numVal + fee;
  } else if (mode === 'balance') {
    const res = calculateMaxWithdrawalFromBalance(numVal);
    netPayout = res.maxCash;
    fee = res.fee;
    totalBalanceNeeded = numVal;
  } else {
    fee = calculateEdahabiaAtmFee(numVal, isPosteAtm);
    netPayout = numVal;
    totalBalanceNeeded = numVal + fee;
  }

  const quickAmounts = [5000, 10000, 18000, 20000, 50000, 100000, 200000];

  const handleCopySummary = async () => {
    const summary = isArabic
      ? `💸 محاكاة سحب بريد الجزائر:\n• المبلغ: ${numVal.toLocaleString()} دج\n• الرسوم المستقطعة: ${fee.toLocaleString()} دج\n• الصافي المستلم: ${netPayout.toLocaleString()} دج\n• الرصيد الإجمالي المطلـوب: ${totalBalanceNeeded.toLocaleString()} دج\n✨ عبر تطبيق "بريدي RIP"`
      : lang === 'fr'
      ? `💸 Simulation de Retrait CCP Algérie Poste :\n• Montant : ${numVal.toLocaleString()} DZD\n• Taxe déduite : ${fee.toLocaleString()} DZD\n• Net perçu : ${netPayout.toLocaleString()} DZD\n• Solde total requis : ${totalBalanceNeeded.toLocaleString()} DZD\n✨ App Baridi RIP`
      : `💸 Algérie Poste Withdrawal Simulation:\n• Amount: ${numVal.toLocaleString()} DZD\n• Fee: ${fee.toLocaleString()} DZD\n• Net Payout: ${netPayout.toLocaleString()} DZD\n• Total Required Balance: ${totalBalanceNeeded.toLocaleString()} DZD\n✨ Baridi RIP App`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-[28px] shadow-xl p-6 border border-gray-100/90 mt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 text-lg shadow-sm">
            💸
          </div>
          <div>
            <h3 className="font-black text-[#003366] text-base leading-tight">
              {t.feeCalculatorTitle}
            </h3>
            <span className="text-[10.5px] text-gray-400 font-bold">
              {isArabic ? 'حساب الرسوم الرسمية لسحب الأموال من بريد الجزائر' : lang === 'fr' ? 'Calcul officiel des taxes de retrait Algérie Poste' : 'Official Algérie Poste withdrawal tax simulator'}
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Mode Selector */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-gray-100/80 rounded-2xl mb-5 text-xs font-black">
        <button
          onClick={() => setMode('withdraw')}
          className={`py-2.5 px-2 rounded-xl transition-all ${mode === 'withdraw' ? 'bg-[#003366] text-white shadow-md' : 'text-gray-600 hover:text-[#003366]'}`}
        >
          {isArabic ? 'سحب كاش' : lang === 'fr' ? 'Retrait Guichet' : 'Cash Withdrawal'}
        </button>

        <button
          onClick={() => setMode('balance')}
          className={`py-2.5 px-2 rounded-xl transition-all ${mode === 'balance' ? 'bg-[#003366] text-white shadow-md' : 'text-gray-600 hover:text-[#003366]'}`}
        >
          {isArabic ? 'حسب الرصيد' : lang === 'fr' ? 'Par Solde Total' : 'From Balance'}
        </button>

        <button
          onClick={() => setMode('atm')}
          className={`py-2.5 px-2 rounded-xl transition-all ${mode === 'atm' ? 'bg-[#003366] text-white shadow-md' : 'text-gray-600 hover:text-[#003366]'}`}
        >
          {isArabic ? 'موزع آلي (DAB)' : lang === 'fr' ? 'GAB / ATM' : 'ATM / GAB'}
        </button>
      </div>

      {mode === 'atm' && (
        <div className="flex gap-2 mb-4 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50 text-xs font-extrabold">
          <label className="flex items-center gap-2 cursor-pointer flex-1 text-[#003366]">
            <input
              type="radio"
              name="atmType"
              checked={isPosteAtm}
              onChange={() => setIsPosteAtm(true)}
              className="accent-[#003366]"
            />
            <span>{isArabic ? 'موزع بريد الجزائر (35 دج)' : 'Algérie Poste ATM (35 DZD)'}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer flex-1 text-[#003366]">
            <input
              type="radio"
              name="atmType"
              checked={!isPosteAtm}
              onChange={() => setIsPosteAtm(false)}
              className="accent-[#003366]"
            />
            <span>{isArabic ? 'موزع بنكي CIB (60 دج)' : 'Bank CIB ATM (60 DZD)'}</span>
          </label>
        </div>
      )}

      {/* Input Field */}
      <div className="mb-4">
        <label className="block text-xs font-black text-[#003366] mb-1.5 uppercase tracking-wider opacity-75">
          {mode === 'balance' 
            ? (isArabic ? 'الرصيد الكلي المتوفر في الحساب (دج)' : lang === 'fr' ? 'Solde total disponible (DZD)' : 'Total available balance (DZD)')
            : t.amountLabel}
        </label>
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="20000"
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3.5 text-xl font-mono font-black text-center text-[#003366] focus:ring-4 focus:ring-[#FFD700]/15 focus:border-[#FFD700] outline-none transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-gray-400">
            DZD / دج
          </span>
        </div>
      </div>

      {/* Quick Amount Chips */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            onClick={() => setInputValue(amt.toString())}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
              numVal === amt 
                ? 'bg-[#FFD700] text-[#003366] border-[#FFD700] shadow-sm scale-105' 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200/70'
            }`}
          >
            {amt.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Results Display */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-[#003366]/5 p-3.5 rounded-2xl border border-[#003366]/10 text-center">
          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1">
            {t.calculatedFee}
          </span>
          <span className="font-mono text-lg font-black text-rose-600">
            -{fee.toLocaleString()} <span className="text-xs">دج</span>
          </span>
        </div>

        <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 text-center">
          <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-wide mb-1">
            {t.payoutAmount}
          </span>
          <span className="font-mono text-lg font-black text-emerald-700">
            {netPayout.toLocaleString()} <span className="text-xs">دج</span>
          </span>
        </div>

        <div className="col-span-2 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/60 flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#003366]">
            {t.requiredBalance}:
          </span>
          <span className="font-mono text-base font-black text-[#003366]">
            {totalBalanceNeeded.toLocaleString()} دج
          </span>
        </div>
      </div>

      <button
        onClick={handleCopySummary}
        className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-[#003366] font-extrabold rounded-xl border-2 border-gray-200/60 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs shadow-sm mb-4"
      >
        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        <span>{copied ? t.copySuccess : (isArabic ? 'نسخ ملخص الرسوم' : 'Copy Summary')}</span>
      </button>

      {/* Official Tax Table Accordion */}
      <details className="bg-gray-50 rounded-2xl p-3 border border-gray-200/60 text-xs font-semibold text-gray-600">
        <summary className="cursor-pointer font-black text-[#003366] hover:underline flex items-center justify-between">
          <span>📋 {t.bracketInfo}</span>
          <span className="text-[10px] text-gray-400">▼</span>
        </summary>
        <div className="mt-3 space-y-1.5 font-mono text-[11px] border-t border-gray-200/60 pt-2.5">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span>1 - 10,000 دج</span>
            <span className="font-bold text-[#003366]">34 دج</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span>10,001 - 18,000 دج</span>
            <span className="font-bold text-[#003366]">43 دج</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span>18,001 - 30,000 دج</span>
            <span className="font-bold text-[#003366]">52 دج</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span>30,001 - 50,000 دج</span>
            <span className="font-bold text-[#003366]">67 دج</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span>50,001 - 100,000 دج</span>
            <span className="font-bold text-[#003366]">91 دج</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span>100,001 - 200,000 دج</span>
            <span className="font-bold text-[#003366]">142 دج</span>
          </div>
          <div className="flex justify-between py-1">
            <span>أكثر من 200,000 دج</span>
            <span className="font-bold text-[#003366]">243 دج</span>
          </div>
        </div>
      </details>
    </div>
  );
};

export default FeeCalculator;
