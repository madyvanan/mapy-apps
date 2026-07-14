import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import '../i18n';

describe('LanguageSwitcher', () => {
  it('toggles from English to Tamil and back to English', () => {
    render(<LanguageSwitcher />);
    const btn = screen.getByRole('button');
    expect(btn.title).toBe('தமிழில் காண்க');

    fireEvent.click(btn);
    expect(btn.title).toBe('Switch to English');

    fireEvent.click(btn);
    expect(btn.title).toBe('தமிழில் காண்க');
  });
});
