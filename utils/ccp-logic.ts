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
