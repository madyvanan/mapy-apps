import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ThemeSwitcher from '../components/ui/ThemeSwitcher';
import { ThemeProvider } from '../context/ThemeContext';

describe('ThemeSwitcher', () => {
  it('renders with the default R theme and switches themes on selection', () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>,
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('R');
    expect(document.documentElement.dataset.theme).toBe('R');

    fireEvent.change(select, { target: { value: 'G' } });
    expect(select.value).toBe('G');
    expect(document.documentElement.dataset.theme).toBe('G');

    fireEvent.change(select, { target: { value: 'B' } });
    expect(select.value).toBe('B');
    expect(document.documentElement.dataset.theme).toBe('B');
  });
});
