import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'

export const metadata: Metadata = {
  title: 'VisionAir',
  description:
    'A guided intelligence environment that helps capable but unclear people turn what they already carry into a structured, trustworthy path they can begin building.',
}

const NO_FLASH = `(function(){try{var s=localStorage.getItem('visionair-theme');if(!s)return;var o=JSON.parse(s);var h=document.documentElement;if(o.theme==='light'||o.theme==='dark')h.dataset.theme=o.theme;h.dataset.aurora=o.aurora?'on':'off';if(/^#[0-9a-fA-F]{6}$/.test(o.primary))h.style.setProperty('--aurora-1',o.primary);if(/^#[0-9a-fA-F]{6}$/.test(o.secondary))h.style.setProperty('--aurora-2',o.secondary);}catch(e){}})();`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-aurora="on" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
