import { ReactNode } from 'react'

type SecondaryButtonProps = {
  children: ReactNode
  onClick?: () => void
}

export default function SecondaryButton({
  children,
  onClick,
}: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-black/10 px-4 py-2 text-sm text-black/65 transition hover:border-black/20 hover:text-black"
    >
      {children}
    </button>
  )
}
