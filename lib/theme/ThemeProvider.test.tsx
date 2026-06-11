// lib/theme/ThemeProvider.test.tsx
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { STORAGE_KEY } from './settings';

function Probe() {
  const { settings, setTheme, toggleAurora } = useTheme();
  return (
    <div>
      <span data-testid="theme">{settings.theme}</span>
      <span data-testid="aurora">{String(settings.aurora)}</span>
      <button onClick={() => setTheme('light')}>to-light</button>
      <button onClick={toggleAurora}>toggle-aurora</button>
    </div>
  );
}

beforeEach(() => { localStorage.clear(); cleanup(); });

describe('ThemeProvider', () => {
  it('defaults to dark + aurora on', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('aurora').textContent).toBe('true');
  });
  it('hydrates from existing localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: 'light', aurora: false, primary: '#4E6EF5', secondary: '#9A5AE6' }));
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(screen.getByTestId('aurora').textContent).toBe('false');
  });
  it('setTheme updates state, DOM, and storage', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    fireEvent.click(screen.getByText('to-light'));
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).theme).toBe('light');
  });
});
