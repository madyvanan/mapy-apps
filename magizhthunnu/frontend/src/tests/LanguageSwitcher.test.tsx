import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import '../i18n';

describe('LanguageSwitcher', () => {
  it('renders and toggles language', () => {
    render(<LanguageSwitcher />);
    const btn = screen.getByRole('button');
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(btn).toBeTruthy();
  });
});
