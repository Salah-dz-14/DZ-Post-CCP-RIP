import React, { useRef, useState } from 'react';
import { SavedAccount, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { calculateCcpKey, calculateRipKey, generateId, padCcp } from '../utils/ccp-logic';

interface BackupRestoreProps {
  lang: Language;
  savedAccounts: SavedAccount[];
  onAccountsImported: (imported: SavedAccount[]) => void;
}

const BackupRestore: React.FC<BackupRestoreProps> = ({ lang, savedAccounts, onAccountsImported }) => {
  const t = TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isArabic = lang === 'ar';
  const MAX_BACKUP_BYTES = 1024 * 1024;
  const MAX_ACCOUNTS = 100;

  const handleExport = () => {
    try {
      if (savedAccounts.length === 0) {
        setStatus({
          type: 'error',
          message: isArabic 
            ? 'لا توجد حسابات مسجلة لتصديرها!' 
            : lang === 'fr' 
            ? 'Aucun compte enregistré à exporter !' 
            : 'No registered accounts available to export!'
        });
        setTimeout(() => setStatus(null), 4000);
        return;
      }

      const dataStr = JSON.stringify(savedAccounts, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `baridi_rip_backups_${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      setStatus({
        type: 'success',
        message: t.backupSuccess || 'تم تصدير النسخة الاحتياطية بنجاح!'
      });
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        message: isArabic ? 'حدث خطأ أثناء التصدير.' : 'Error exporting backup.'
      });
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > MAX_BACKUP_BYTES) {
      setStatus({
        type: 'error',
        message: isArabic ? 'حجم الملف كبير جداً.' : lang === 'fr' ? 'Le fichier est trop volumineux.' : 'The backup file is too large.'
      });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed)) {
          throw new Error('Not an array');
        }

        if (parsed.length > MAX_ACCOUNTS) {
          throw new Error('Too many accounts');
        }

        const validAccounts: SavedAccount[] = [];
        for (const item of parsed) {
          if (typeof item !== 'object' || item === null || Array.isArray(item)) continue;

          const candidate = item as Partial<SavedAccount>;
          if (typeof candidate.ccp !== 'string' || !/^\d{1,10}$/.test(candidate.ccp)) continue;

          const ccp = padCcp(candidate.ccp);
          const ccpKey = calculateCcpKey(ccp);
          const ripKey = calculateRipKey(ccp);
          const fullRip = `00799999${ccp}${ripKey}`;
          const name = typeof candidate.name === 'string' ? candidate.name.trim().slice(0, 100) : '';

          validAccounts.push({
            id: typeof candidate.id === 'string' && candidate.id.length <= 100 ? candidate.id : generateId(),
            name: name || `Account ${ccp}`,
            ccp,
            ccpKey,
            rip: fullRip,
            ripKey,
            fullRip,
            createdAt: typeof candidate.createdAt === 'number' && Number.isFinite(candidate.createdAt)
              ? candidate.createdAt
              : Date.now()
          });
        }

        if (validAccounts.length === 0) {
          throw new Error('No valid accounts found in backup');
        }

        onAccountsImported(validAccounts);
        setStatus({
          type: 'success',
          message: `${t.restoreSuccess || 'تمت استعادة البيانات بنجاح!'} (+${validAccounts.length})`
        });
        setTimeout(() => setStatus(null), 5000);
      } catch (err) {
        console.error(err);
        setStatus({
          type: 'error',
          message: t.restoreError || 'عذراً! الملف المحدد غير صالح.'
        });
        setTimeout(() => setStatus(null), 5000);
      }
      
      // Reset input value to allow selecting same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 p-5 mt-6 relative overflow-hidden">
      {/* Subtle warm decorative top accent line */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-[#FFD700]"></div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-base text-amber-500">🛡️</span>
        <h3 className="font-bold text-[#003366] text-sm md:text-base">
          {t.backupSectionTitle || 'النسخ الاحتياطي واستعادة البيانات'}
        </h3>
      </div>

      <p className="text-[11px] text-gray-400 font-medium mb-4 leading-normal">
        {isArabic 
          ? 'تصدير حساباتك المفضلة كملف احتياطي على جهازك لاستعادتها أو نقلها لهاتف آخر في أي وقت.' 
          : lang === 'fr'
          ? 'Exportez vos comptes favoris dans un fichier local de sauvegarde pour les réinstaller ou les transférer vers un autre appareil.'
          : 'Export your favorite accounts list as a secure file backup to download or transfer to another device at any time.'}
      </p>

      {/* Button controls row */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={handleExport}
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-orange-50 hover:bg-[#FFD700]/15 text-[#003366] font-extrabold text-xs transition-all active:scale-[0.98] border border-orange-100"
          title={t.backupBtn}
        >
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{isArabic ? 'حفظ نسخة احتياطية' : lang === 'fr' ? 'Créer une sauvegarde' : 'Save Backup'}</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-[#003366]/5 text-[#003366] font-extrabold text-xs transition-all active:scale-[0.98] border border-blue-100"
          title={t.restoreBtn}
        >
          <svg className="w-4 h-4 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>{isArabic ? 'استعادة نسخة سابقة' : lang === 'fr' ? 'Restaurer une sauvegarde' : 'Restore Backup'}</span>
        </button>

        {/* Hidden File Picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Real-time feed status notifications */}
      {status && (
        <div 
          className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 leading-snug animate-fade-in ${
            status.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}
        >
          {status.type === 'success' ? (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
};

export default BackupRestore;
