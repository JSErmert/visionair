// components/theme/Aurora.tsx
'use client';
import { useTheme } from '@/lib/theme/ThemeProvider';

// Five drifting, blurred orbs colored from --aurora-1/--aurora-2. Fixed, behind
// all content, pointer-inert. Hidden entirely when aurora is off. Motion is
// disabled under prefers-reduced-motion (handled in globals.css).
export default function Aurora() {
  const { settings } = useTheme();
  if (!settings.aurora) return null;
  return (
    <div className="aurora-field" aria-hidden="true">
      <span className="aurora-orb aurora-orb-1" />
      <span className="aurora-orb aurora-orb-2" />
      <span className="aurora-orb aurora-orb-3" />
      <span className="aurora-orb aurora-orb-4" />
      <span className="aurora-orb aurora-orb-5" />
    </div>
  );
}
