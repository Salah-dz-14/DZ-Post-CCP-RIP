
import { Language, TranslationStrings } from './types';

export const COLORS = {
  POSTE_YELLOW: '#FFD700',
  POSTE_BLUE: '#003366',
  POSTE_BLUE_LIGHT: '#004A8D',
};

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  ar: {
    title: 'بريدي RIP',
    subtitle: 'محول رقم الحساب الجاري (CCP) إلى رقم التعريف البريدي (RIP)',
    ccpInputLabel: 'رقم الحساب الجاري (CCP)',
    nameInputLabel: 'الاسم (اختياري للحفظ)',
    calculateBtn: 'تحويل واستخراج المفاتيح',
    saveBtn: 'حفظ في المفضلة',
    historyTitle: 'الحسابات المحفوظة',
    noHistory: 'لا توجد حسابات محفوظة بعد.',
    ccpKey: 'مفتاح CCP',
    ripKey: 'مفتاح RIP',
    fullRip: 'رقم RIP الكامل',
    copySuccess: 'تم النسخ بنجاح!',
    deleteConfirm: 'هل أنت متأكد من حذف هذا الحساب؟',
    placeholderCcp: 'أدخل رقم الحساب (مثلا: 12345678)',
    placeholderName: 'مثال: محمد، أبي، أخي...',
    invalidCcp: 'يرجى إدخال رقم CCP صحيح',
    footer: 'جميع الحقوق محفوظة © بريد الجزائر (أداة مساعدة)',
    aiHelper: '',
    offlineReady: 'يعمل في وضع عدم الاتصال (أوفلاين) - جميع العمليات آمنة ومحلية',
    onlineStatus: 'متصل بالإنترنت'
  },
  fr: {
    title: 'DZ Post RIP',
    subtitle: 'Convertisseur CCP vers RIP et calculateur de clés',
    ccpInputLabel: 'Numéro de compte CCP',
    nameInputLabel: 'Nom (optionnel pour sauvegarde)',
    calculateBtn: 'Convertir & Calculer',
    saveBtn: 'Sauvegarder',
    historyTitle: 'Comptes enregistrés',
    noHistory: 'Aucun compte enregistré pour le moment.',
    ccpKey: 'Clé CCP',
    ripKey: 'Clé RIP',
    fullRip: 'Numéro RIP complet',
    copySuccess: 'Copié avec succès !',
    deleteConfirm: 'Voulez-vous supprimer ce compte ?',
    placeholderCcp: 'Entrez le numéro (ex: 12345678)',
    placeholderName: 'Ex: Mohamed, Père, Travail...',
    invalidCcp: 'Veuillez entrer un numéro CCP valide',
    footer: 'Tous droits réservés © Algérie Poste (Outil d\'aide)',
    aiHelper: '',
    offlineReady: 'Mode hors-ligne actif - Calculs 100% locaux et sécurisés',
    onlineStatus: 'En ligne'
  },
  en: {
    title: 'Post Link DZ',
    subtitle: 'Algerian CCP to RIP Converter & Key Generator',
    ccpInputLabel: 'CCP Account Number',
    nameInputLabel: 'Name (optional for saving)',
    calculateBtn: 'Convert & Calculate',
    saveBtn: 'Save to Favorites',
    historyTitle: 'Saved Accounts',
    noHistory: 'No accounts saved yet.',
    ccpKey: 'CCP Key',
    ripKey: 'RIP Key',
    fullRip: 'Full RIP Number',
    copySuccess: 'Copied to clipboard!',
    deleteConfirm: 'Are you sure you want to delete this account?',
    placeholderCcp: 'Enter account number (e.g., 12345678)',
    placeholderName: 'e.g., John Doe, Dad, Office...',
    invalidCcp: 'Please enter a valid CCP number',
    footer: 'All rights reserved © Algérie Poste (Utility tool)',
    aiHelper: '',
    offlineReady: 'Offline Mode Ready - 100% local and secure calculation',
    onlineStatus: 'Online'
  }
};
