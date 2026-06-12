// components/theme/SettingsPanel.test.tsx
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import SettingsPanel from './SettingsPanel';

afterEach(() => { localStorage.clear(); cleanup(); });
const open = (stored?: object) => {
  if (stored) localStorage.setItem('visionair-theme', JSON.stringify(stored));
  render(<ThemeProvider><SettingsPanel /></ThemeProvider>);
  fireEvent.click(screen.getByRole('button', { name: /settings/i }));
};

describe('SettingsPanel', () => {
  it('opens to reveal Theme and Aurora switches', () => {
    open();
    expect(screen.getByRole('switch', { name: /theme/i })).toBeTruthy();
    expect(screen.getByRole('switch', { name: /aurora/i })).toBeTruthy();
  });
  it('toggling the theme switch flips data-theme', () => {
    open();
    fireEvent.click(screen.getByRole('switch', { name: /theme/i }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
  it('greys out the color section when aurora is off', () => {
    open({ theme: 'dark', aurora: false, primary: '#4E6EF5', secondary: '#9A5AE6' });
    expect(screen.getByTestId('aurora-colors').getAttribute('data-disabled')).toBe('true');
  });
  it('closes on Escape', () => {
    open();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('switch', { name: /theme/i })).toBeNull();
  });

  it('opens a hex-input picker when a Primary swatch is clicked (aurora on)', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: /primary color/i }));
    const hex = screen.getByLabelText(/primary hex/i) as HTMLInputElement;
    fireEvent.change(hex, { target: { value: '#112233' } });
    expect(document.documentElement.style.getPropertyValue('--aurora-1')).toBe('#112233');
  });
});
