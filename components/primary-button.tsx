import { ReactNode } from 'react'

type PrimaryButtonProps = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'rounded-2xl px-5 py-3 text-sm font-medium transition',
        disabled
          ? 'cursor-not-allowed border border-border/10 bg-foreground/5 text-foreground/30'
          : 'border border-foreground bg-foreground text-background hover:opacity-90',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
