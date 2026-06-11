// lib/theme/ThemeProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeSettings, DEFAULTS, STORAGE_KEY, parseSettings, serialize, applyToDocument } from './settings';

type ThemeCtx = {
  settings: ThemeSettings;
  setTheme: (t: ThemeSettings['theme']) => void;
  toggleAurora: () => void;
  setPrimary: (hex: string) => void;
  setSecondary: (hex: string) => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start at DEFAULTS so SSR and the first client render MATCH (no hydration
  // mismatch for theme-dependent children like Aurora). Hydrate from storage in
  // an effect after mount. The no-flash script already fixed the <html> visuals
  // before paint, so the base theme never flashes; the apply-effect is gated on
  // `mounted` so it never stomps the script's value with DEFAULTS.
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setSettings(parseSettings(localStorage.getItem(STORAGE_KEY)));
    } catch {
      // storage unavailable — keep DEFAULTS
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyToDocument(settings, document.documentElement);
    try {
      localStorage.setItem(STORAGE_KEY, serialize(settings));
    } catch {
      // storage unavailable — best-effort
    }
  }, [settings, mounted]);

  const value: ThemeCtx = {
    settings,
    setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
    toggleAurora: () => setSettings((s) => ({ ...s, aurora: !s.aurora })),
    setPrimary: (primary) => setSettings((s) => ({ ...s, primary })),
    setSecondary: (secondary) => setSettings((s) => ({ ...s, secondary })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
