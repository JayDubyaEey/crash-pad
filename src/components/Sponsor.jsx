import { sponsor } from '../sponsor.config'

function SponsorMark({ tagline }) {
  const content = (
    <>
      {sponsor.logo && <img src={sponsor.logo} alt={sponsor.name} className="max-w-full" />}
      <span className="text-xs font-medium text-foreground">{sponsor.name}</span>
      {tagline && sponsor.tagline && <span className="text-[10px] text-muted-foreground">{sponsor.tagline}</span>}
    </>
  )

  return sponsor.url ? (
    <a href={sponsor.url} target="_blank" rel="noopener" className="flex flex-col items-center gap-1.5 text-center">
      {content}
    </a>
  ) : (
    <div className="flex flex-col items-center gap-1.5 text-center">{content}</div>
  )
}

// Lives in the gutter outside the report's 900px column — only shown once
// there's actually room either side of it (900px column + two ~140px rails
// + breathing space) and stays fixed while the report scrolls underneath.
export function SponsorRails() {
  if (!sponsor.name) return null

  return (
    <>
      <div
        className="sponsor-rail sponsor-rail-left no-print fixed inset-y-0 hidden xl:flex"
        style={sponsor.accent ? { borderRightColor: sponsor.accent } : undefined}
      >
        <SponsorMark tagline />
      </div>
      <div
        className="sponsor-rail sponsor-rail-right no-print fixed inset-y-0 hidden xl:flex"
        style={sponsor.accent ? { borderLeftColor: sponsor.accent } : undefined}
      >
        <SponsorMark tagline />
      </div>
    </>
  )
}

// Below the xl breakpoint there's no gutter for rails, so the same branding
// moves into a slim banner above the toolbar instead.
export function SponsorBanner() {
  if (!sponsor.name) return null

  return (
    <div
      className="sponsor-banner no-print mb-3 flex items-center justify-center gap-2 rounded-lg border-t-2 border-border bg-muted/40 px-3 py-2 xl:hidden"
      style={sponsor.accent ? { borderTopColor: sponsor.accent } : undefined}
    >
      {sponsor.logo && <img src={sponsor.logo} alt={sponsor.name} className="h-6 w-auto" />}
      <span className="text-xs font-medium text-foreground">{sponsor.name}</span>
    </div>
  )
}
