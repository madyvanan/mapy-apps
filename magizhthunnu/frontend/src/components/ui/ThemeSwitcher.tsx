import type { ChangeEvent } from 'react';
import { useTheme, type ThemeName } from '../../context/ThemeContext';

const THEME_LABELS: Record<ThemeName, string> = {
  R: 'R',
  G: 'G',
  B: 'B',
};

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as ThemeName);
  };

  return (
    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer">
      <span
        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
        style={{ backgroundColor: 'var(--color-primary)' }}
        aria-hidden="true"
      />
      <select
        value={theme}
        onChange={handleChange}
        aria-label="Color theme"
        className="bg-transparent outline-none cursor-pointer"
      >
        {(Object.keys(THEME_LABELS) as ThemeName[]).map((name) => (
          <option key={name} value={name}>
            {THEME_LABELS[name]}
          </option>
        ))}
      </select>
    </label>
  );
};

export default ThemeSwitcher;
