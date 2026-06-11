// components/theme/SettingsPanel.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useTheme } from '@/lib/theme/ThemeProvider';

function Switch({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground/85">{label}</span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={on}
        onClick={onToggle}
        className={['relative h-[21px] w-[38px] rounded-full transition', on ? 'bg-foreground/70' : 'bg-foreground/20'].join(' ')}
      >
        <span className={['absolute top-[2.5px] h-4 w-4 rounded-full bg-card transition-all', on ? 'right-[2.5px]' : 'left-[2.5px]'].join(' ')} />
      </button>
    </div>
  );
}

export default function SettingsPanel() {
  const { settings, setTheme, toggleAurora, setPrimary, setSecondary } = useTheme();
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<null | 'primary' | 'secondary'>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className="fixed right-5 top-5 z-50">
      <button
        type="button"
        aria-label="App settings"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-border/15 bg-card/60 px-3 py-1.5 text-xs text-foreground/70 backdrop-blur transition hover:text-foreground"
      >
        Settings
      </button>
      {open && (
        <div className="mt-2 w-[250px] rounded-2xl border border-border/15 bg-card/80 p-4 shadow-lg backdrop-blur">
          <div className="mb-3 text-[11px] uppercase tracking-wider text-foreground/45">App settings</div>
          <Switch label="Theme" on={settings.theme === 'light'} onToggle={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')} />
          <Switch label="Aurora" on={settings.aurora} onToggle={toggleAurora} />
          <div
            data-testid="aurora-colors"
            data-disabled={!settings.aurora}
            className={['mt-3 border-t border-border/10 pt-3 transition', settings.aurora ? '' : 'pointer-events-none opacity-40'].join(' ')}
          >
            <div className="mb-1 text-[11px] uppercase tracking-wider text-foreground/40">Aurora colors</div>
            {!settings.aurora && <div className="mb-2 text-[10px] italic text-foreground/40">Turn Aurora on to customize</div>}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-foreground/85">Primary</span>
              <button type="button" aria-label="Primary color" onClick={() => setPicking(picking === 'primary' ? null : 'primary')}
                className="h-6 w-6 rounded-md border border-border/25" style={{ background: settings.primary }} />
            </div>
            {picking === 'primary' && (
              <div className="mb-2">
                <HexColorPicker color={settings.primary} onChange={setPrimary} />
                <label className="mt-2 block text-[10px] uppercase text-foreground/40">Primary hex
                  <input aria-label="Primary hex" value={settings.primary}
                    onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && setPrimary(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border/20 bg-background/40 px-2 py-1 text-xs text-foreground" />
                </label>
              </div>
            )}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-foreground/85">Secondary</span>
              <button type="button" aria-label="Secondary color" onClick={() => setPicking(picking === 'secondary' ? null : 'secondary')}
                className="h-6 w-6 rounded-md border border-border/25" style={{ background: settings.secondary }} />
            </div>
            {picking === 'secondary' && (
              <div className="mb-2">
                <HexColorPicker color={settings.secondary} onChange={setSecondary} />
                <label className="mt-2 block text-[10px] uppercase text-foreground/40">Secondary hex
                  <input aria-label="Secondary hex" value={settings.secondary}
                    onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && setSecondary(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border/20 bg-background/40 px-2 py-1 text-xs text-foreground" />
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
