// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import Aurora from './Aurora';

afterEach(() => { localStorage.clear(); cleanup(); });

function withTheme(stored?: object) {
  if (stored) localStorage.setItem('visionair-theme', JSON.stringify(stored));
  return render(<ThemeProvider><Aurora /></ThemeProvider>);
}

describe('Aurora', () => {
  it('renders the field with orbs when aurora is on (default)', () => {
    const { container } = withTheme();
    expect(container.querySelector('.aurora-field')).not.toBeNull();
    expect(container.querySelectorAll('.aurora-orb').length).toBeGreaterThan(0);
  });
  it('renders nothing when aurora is off', () => {
    const { container } = withTheme({ theme: 'dark', aurora: false, primary: '#4E6EF5', secondary: '#9A5AE6' });
    expect(container.querySelector('.aurora-field')).toBeNull();
  });
});
