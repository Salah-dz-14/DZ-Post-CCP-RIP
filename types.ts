
export type Language = 'ar' | 'fr' | 'en';

export interface SavedAccount {
  id: string;
  name: string;
  ccp: string;
  ccpKey: string;
  rip: string;
  ripKey: string;
  fullRip: string;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  ccp: string;
  ccpKey: string;
  ripKey: string;
  fullRip: string;
  timestamp: number;
}

export interface CalculationResult {
  ccp: string;
  ccpKey: string;
  ripKey: string;
  fullRip: string;
}

export interface TranslationStrings {
  title: string;
  subtitle: string;
  ccpInputLabel: string;
  nameInputLabel: string;
  calculateBtn: string;
  saveBtn: string;
  historyTitle: string;
  noHistory: string;
  ccpKey: string;
  ripKey: string;
  fullRip: string;
  copySuccess: string;
  deleteConfirm: string;
  placeholderCcp: string;
  placeholderName: string;
  invalidCcp: string;
  footer: string;
  aiHelper: string;
  offlineReady: string;
  onlineStatus: string;
  feeCalculatorTitle: string;
  amountLabel: string;
  calculatedFee: string;
  payoutAmount: string;
  requiredBalance: string;
  privacyModalTitle: string;
  privacyModalText: string;
  devNameLabel: string;
  shareBtn: string;
  bracketInfo: string;
  backupBtn?: string;
  restoreBtn?: string;
  backupSuccess?: string;
  restoreSuccess?: string;
  restoreError?: string;
  backupSectionTitle?: string;
  historyLogTitle?: string;
  noHistoryLog?: string;
  clearHistoryBtn?: string;
}
