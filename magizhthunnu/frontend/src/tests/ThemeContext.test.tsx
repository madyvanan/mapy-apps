import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

const THEME_STORAGE_KEY = 'magizhthunnu-theme';

afterEach(() => localStorage.removeItem(THEME_STORAGE_KEY));

const Probe = () => {
  const { theme } = useTheme();
  return <span data-testid="theme">{theme}</span>;
};

describe('ThemeProvider', () => {
  it('restores a previously stored theme from localStorage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'G');
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme').textContent).toBe('G');
  });
});

describe('useTheme', () => {
  it('throws when used outside a ThemeProvider', () => {
    expect(() => render(<Probe />)).toThrow('useTheme must be used within ThemeProvider');
  });
});
