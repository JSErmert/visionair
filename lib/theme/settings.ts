// lib/theme/settings.ts
export type ThemeSettings = {
  theme: 'dark' | 'light';
  aurora: boolean;
  primary: string;
  secondary: string;
};

export const DEFAULTS: ThemeSettings = {
  theme: 'dark',
  aurora: true,
  primary: '#4E6EF5',
  secondary: '#9A5AE6',
};

export const STORAGE_KEY = 'visionair-theme';

const HEX = /^#[0-9a-fA-F]{6}$/;

export function parseSettings(raw: string | null): ThemeSettings {
  if (!raw) return { ...DEFAULTS };
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    return { ...DEFAULTS };
  }
  if (typeof obj !== 'object' || obj === null) return { ...DEFAULTS };
  const o = obj as Record<string, unknown>;
  return {
    theme: o.theme === 'light' ? 'light' : 'dark',
    aurora: typeof o.aurora === 'boolean' ? o.aurora : DEFAULTS.aurora,
    primary: typeof o.primary === 'string' && HEX.test(o.primary) ? o.primary : DEFAULTS.primary,
    secondary: typeof o.secondary === 'string' && HEX.test(o.secondary) ? o.secondary : DEFAULTS.secondary,
  };
}

export function serialize(settings: ThemeSettings): string {
  return JSON.stringify(settings);
}

export function applyToDocument(settings: ThemeSettings, html: HTMLElement): void {
  html.dataset.theme = settings.theme;
  html.dataset.aurora = settings.aurora ? 'on' : 'off';
  html.style.setProperty('--aurora-1', settings.primary);
  html.style.setProperty('--aurora-2', settings.secondary);
}
