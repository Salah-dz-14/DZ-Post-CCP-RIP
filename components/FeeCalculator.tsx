import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { calculateWithdrawalFee } from '../utils/ccp-logic';

interface FeeCalculatorProps {
  lang: Language;
}

const FeeCalculator: React.FC<FeeCalculatorProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [amountInput, setAmountInput] = useState('');
  
  const amount = parseFloat(amountInput) || 0;
  const fee = calculateWithdrawalFee(amount);
  const payout = amount > fee ? amount - fee : 0;
  const requiredTotal = amount > 0 ? amount + fee : 0;

  const isArabic = lang === 'ar';

  return (
    <div id="fee-calculator-box" className="bg-white rounded-[28px] shadow-xl p-6 border border-gray-100/80 mt-8">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-lg bg-[#FFD700]/20 flex items-center justify-center text-[#003366]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-[#003366]">{t.feeCalculatorTitle}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 px-1">
            {t.amountLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="10000"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3.5 focus:ring-4 focus:ring-[#FFD700]/10 focus:border-[#FFD700] outline-none transition-all font-mono text-lg font-black text-center text-[#003366]"
            />
            <span className={`absolute top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 ${isArabic ? 'left-4' : 'right-4'}`}>
              DA / دج
            </span>
          </div>
        </div>

        {amount > 0 && (
          <div className="bg-[#003366]/5 rounded-2xl p-4.5 space-y-3 border border-[#003366]/5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">{t.calculatedFee}</span>
              <span className="font-mono font-black text-red-600">-{fee} DA / دج</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">{t.payoutAmount}</span>
              <span className="font-mono font-black text-green-600">+{payout} DA / دج</span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center text-sm">
              <span className="text-[#003366] font-black">{t.requiredBalance}</span>
              <span className="font-mono font-black text-[#003366] text-base">{requiredTotal} DA / دج</span>
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-3.5 text-[10px] text-gray-400 leading-normal border border-gray-100 flex items-start gap-1.5 font-medium">
          <svg className="w-5 h-5 text-[#003366] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="font-black text-[#003366] block mb-1">{t.bracketInfo}:</span>
            • 1 - 10,000 DA → 34 DA | • 10,001 - 18,000 DA → 43 DA | • 18,001 - 30,000 DA → 52 DA | • 30,001 - 50,000 DA → 67 DA | • 50,001 - 100,000 DA → 91 DA | • 100,001 - 200,000 DA → 142 DA | • {isArabic ? 'أكثر من' : 'Plus de'} 200,000 DA → 243 DA
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeCalculator;
