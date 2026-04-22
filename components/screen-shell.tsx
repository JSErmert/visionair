import { ReactNode } from 'react'

type ScreenShellProps = {
  children: ReactNode
  className?: string
}

export default function ScreenShell({
  children,
  className = '',
}: ScreenShellProps) {
  return (
    <div className="flex min-h-[70vh] flex-col justify-center">
      <div
        className={[
          'mx-auto w-full max-w-3xl rounded-3xl border border-black/10 bg-white/80 p-8 shadow-sm',
          className,
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}
