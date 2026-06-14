// Shared inline spinner (Tailwind animate-spin) used across Build Mode waits:
// the interview "thinking" pause, the pack "building" screen, and opening a
// saved session from the library. One component keeps the loading signal
// visually consistent everywhere.
export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/70 ${className}`}
    />
  );
}
