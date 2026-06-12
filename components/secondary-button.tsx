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
      className="rounded-2xl border border-border/10 px-4 py-2 text-sm text-foreground/65 transition hover:border-border/20 hover:text-foreground"
    >
      {children}
    </button>
  )
}
