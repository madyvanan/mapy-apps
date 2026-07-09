import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeName = 'R' | 'G' | 'B';

const THEME_STORAGE_KEY = 'magizhthunnu-theme';
const THEMES: ThemeName[] = ['R', 'G', 'B'];

const isThemeName = (value: string | null): value is ThemeName =>
  value !== null && THEMES.includes(value as ThemeName);

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeName(stored) ? stored : 'R';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
