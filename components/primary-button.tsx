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
          ? 'cursor-not-allowed border border-black/10 bg-black/5 text-black/30'
          : 'border border-black bg-black text-white hover:opacity-90',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
