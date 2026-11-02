// Pure helpers for import-recipe: read the shared link, and clean the model's recipe (untrusted output).

export type Draft = {
  title: string
  servings: number
  prep_minutes: number | null
  ingredients: { name: string; quantity: string; grams: number | null }[]
  steps: string[]
}

const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'])

// -> 11-char video id for watch / shorts / live / youtu.be links, else null.
export function youtubeId(link: string): string | null {
  let u: URL
  try { u = new URL(link.trim()) } catch { return null }
  if (!/^https?:$/.test(u.protocol)) return null
  const id = u.hostname === 'youtu.be' ? u.pathname.slice(1)
    : YT_HOSTS.has(u.hostname) ? (u.searchParams.get('v') ?? u.pathname.match(/^\/(?:shorts|live)\/([^/]+)/)?.[1])
    : null
  return id && /^[\w-]{11}$/.test(id) ? id : null
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')
const int = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? Math.round(v) : null

// deno-lint-ignore no-explicit-any
export function checkDraft(raw: any): Draft | null {
  const ingredients = (Array.isArray(raw?.ingredients) ? raw.ingredients : []).slice(0, 40)
    // deno-lint-ignore no-explicit-any
    .map((i: any) => ({ name: str(i?.name, 80), quantity: str(i?.quantity, 40), grams: int(i?.grams, 1, 5000) }))
    .filter((i: { name: string }) => i.name)
  if (ingredients.length === 0) return null // not a recipe
  return {
    title: str(raw?.title, 80) || 'Recette importée',
    servings: int(raw?.servings, 1, 100) ?? 2,
    prep_minutes: int(raw?.prep_minutes, 1, 1440),
    ingredients,
    steps: (Array.isArray(raw?.steps) ? raw.steps : []).slice(0, 30).map((s: unknown) => str(s, 500)).filter(Boolean),
  }
}
