type ScreenIntroProps = {
  eyebrow?: string
  title: string
  description?: string
}

export default function ScreenIntro({
  eyebrow,
  title,
  description,
}: ScreenIntroProps) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="mb-3 text-sm tracking-wide text-foreground/50">
          {eyebrow}
        </p>
      )}

      <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>

      {description && (
        <p className="max-w-2xl text-base leading-7 text-foreground/70">
          {description}
        </p>
      )}
    </div>
  )
}
