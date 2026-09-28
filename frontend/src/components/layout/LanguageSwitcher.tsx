import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? 'en';

  return (
    <div className="relative inline-flex items-center">
      <Languages className="pointer-events-none absolute left-2 h-4 w-4 text-slate-400" />
      <select
        value={current}
        onChange={(e) => void i18n.changeLanguage(e.target.value)}
        aria-label="Select language"
        className="cursor-pointer appearance-none rounded-lg border border-transparent bg-transparent py-2 pl-8 pr-2 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:border-brand-500 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="text-slate-900">
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
