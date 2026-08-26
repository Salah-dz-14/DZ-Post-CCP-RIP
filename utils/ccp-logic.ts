/**
 * Algerian CCP and RIP Logic - Precise Implementation
 * 
 * Verified Math Rules (based on Algérie Poste standards):
 * - CCP Key (Clé CCP): Weighted digit algorithm. For a 10-padded account:
 *   Sum of (digit_at_index * (13 - index)) for index from 0 to 9, then sum % 100.
 * - RIP Key (Clé RIP): Standard ISO 7064 MOD 97-10 algorithm for Algérie Poste.
 *   Math: (Account * 100) % 97, then factoring in Bank Code (007) and Branch Code (99999).
 */

export const padCcp = (ccp: string): string => {
  return ccp.padStart(10, '0');
};

/**
 * Clean input and handle Account+Key inputs intelligently
 */
export const cleanAccountNumber = (input: string): string => {
  const trimmed = input.trim();
  // Support slash, dash or space separators for keys (e.g., 12345678/15, 12345678-15)
  const parts = trimmed.split(/[\/\-\s]+/);
  if (parts.length > 1) {
    const mainAcc = parts[0].replace(/\D/g, '');
    if (mainAcc) return mainAcc;
  }
  return trimmed.replace(/\D/g, '');
};

/**
 * CCP Key Algorithm: Weighted Modulo 100
 * Verified for account "1234567890" => Key: "45"
 */
export const calculateCcpKey = (ccp: string): string => {
  const account = cleanAccountNumber(ccp);
  if (!account) return "00";
  
  try {
    const padded = padCcp(account); // ensures exactly 10 digits
    let sum = 0;
    
    // Weighted sum of digits:
    // Leftmost digit (index 0) gets weight 13.
    // Rightmost digit (index 9) gets weight 4.
    for (let i = 0; i < padded.length; i++) {
      const digit = parseInt(padded.charAt(i), 10);
      const weight = 13 - i;
      sum += digit * weight;
    }
    
    const key = sum % 100;
    return key.toString().padStart(2, '0');
  } catch (e) {
    return "00";
  }
};

/**
 * RIP Key Algorithm: Standard ISO 7064 MOD 97-10 for Algérie Poste
 * Account is shifted, combined with bank/branch code modulos, and mapped.
 * Verified for account "1234567890" => Key: "06"
 */
export const calculateRipKey = (ccp: string): string => {
  const account = cleanAccountNumber(ccp);
  if (!account) return "00";
  
  try {
    const accountNum = parseInt(account, 10);
    if (isNaN(accountNum)) return "00";
    
    // Remainder of (account * 100) % 97
    const remainder = (accountNum * 100) % 97;
    
    // Incorporating bank_code "007" and branch_code "99999" portion (which contributes exactly 85 modulo 97)
    const val = remainder + 85;
    
    let x = 0;
    if (val > 97) {
      x = 97 - (val - 97);
    } else {
      x = 97 - val;
    }
    
    return x.toString().padStart(2, '0');
  } catch (e) {
    return "00";
  }
};

export const getFullRip = (ccp: string, ripKey: string): string => {
  const account = cleanAccountNumber(ccp);
  const padded = padCcp(account);
  return `00799999${padded}${ripKey}`;
};

/**
 * Official Algérie Poste CCP Withdrawal fee brackets
 * - 1 to 10,000 DA: 34 DA
 * - 10,001 to 18,000 DA: 43 DA
 * - 18,001 to 30,000 DA: 52 DA
 * - 30,001 to 50,000 DA: 67 DA
 * - 50,001 to 100,000 DA: 91 DA
 * - 100,001 to 200,000 DA: 142 DA
 * - 200,001 DA and above: 243 DA
 */
export const calculateWithdrawalFee = (amount: number): number => {
  if (amount <= 0) return 0;
  if (amount <= 10000) return 34;
  if (amount <= 18000) return 43;
  if (amount <= 30000) return 52;
  if (amount <= 50000) return 67;
  if (amount <= 100000) return 91;
  if (amount <= 200000) return 142;
  return 243;
};

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Failover safely to manual generator
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Validate user entered CCP key against the calculated CCP key
 */
export const validateEnteredCcpKey = (rawInput: string): { hasUserKey: boolean; isValid: boolean; expectedKey: string; enteredKey: string } => {
  const parts = rawInput.trim().split(/[\/\-\s]+/);
  if (parts.length >= 2 && parts[1].replace(/\D/g, '').length > 0) {
    const mainAcc = parts[0].replace(/\D/g, '');
    const userKey = parts[1].replace(/\D/g, '').padStart(2, '0');
    const expectedKey = calculateCcpKey(mainAcc);
    return {
      hasUserKey: true,
      isValid: userKey === expectedKey,
      expectedKey,
      enteredKey: userKey
    };
  }
  const mainAcc = cleanAccountNumber(rawInput);
  return {
    hasUserKey: false,
    isValid: true,
    expectedKey: calculateCcpKey(mainAcc),
    enteredKey: ''
  };
};

/**
 * Reverse fee calculation: Calculate maximum cash user can withdraw given total available account balance
 */
export const calculateMaxWithdrawalFromBalance = (totalBalance: number): { maxCash: number; fee: number } => {
  if (totalBalance <= 0) return { maxCash: 0, fee: 0 };
  
  // Try candidate fees in descending bracket order
  const brackets = [
    { threshold: 200000, fee: 243 },
    { threshold: 100000, fee: 142 },
    { threshold: 50000, fee: 91 },
    { threshold: 30000, fee: 67 },
    { threshold: 18000, fee: 52 },
    { threshold: 10000, fee: 43 },
    { threshold: 0, fee: 34 }
  ];

  for (const b of brackets) {
    const potentialMax = totalBalance - b.fee;
    if (potentialMax > b.threshold) {
      return { maxCash: Math.max(0, potentialMax), fee: b.fee };
    }
  }

  const fee = calculateWithdrawalFee(Math.max(0, totalBalance - 34));
  return { maxCash: Math.max(0, totalBalance - fee), fee };
};

/**
 * Edahabia ATM (DAB/GAB) Withdrawal Fee
 * Algérie Poste ATM: 30 DA fixed + 5 DA stamp = 35 DA per transaction
 * Interbancaire (CIB/Other Bank ATM): 50 DA fixed + 10 DA = 60 DA per transaction
 */
export const calculateEdahabiaAtmFee = (amount: number, isPosteAtm: boolean = true): number => {
  if (amount <= 0) return 0;
  return isPosteAtm ? 35 : 60;
};

/**
 * Convert DZD amount to Algerian Centimes string representation
 * (1 DZD = 100 Centimes)
 */
export const convertAmountToCentimes = (amount: number): string => {
  if (amount <= 0) return '0 سنتيم';
  const centimes = amount * 100;
  
  if (centimes >= 100000000) {
    const miliards = (centimes / 100000000).toFixed(2).replace(/\.00$/, '');
    return `${miliards} مليار سنتيم (${centimes.toLocaleString()} centimes)`;
  }
  if (centimes >= 1000000) {
    const millions = (centimes / 1000000).toFixed(2).replace(/\.00$/, '');
    return `${millions} مليون سنتيم (${centimes.toLocaleString()} centimes)`;
  }
  if (centimes >= 100000) {
    const hundredsOfThousands = (centimes / 1000).toFixed(0);
    return `${hundredsOfThousands} ألف سنتيم (${centimes.toLocaleString()} centimes)`;
  }
  return `${centimes.toLocaleString()} سنتيم`;
};




