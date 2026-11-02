// POST { url?, text? } -> { draft: { title, servings, prep_minutes, ingredients: [{ name, quantity, grams }], steps }, source_url }
// No scraping: a public YouTube video is read by Gemini itself (official video input); Instagram gives no API
// access to a reel without a reviewed Meta app, so its caption must be pasted as `text` by the user.
import { createClient } from 'npm:@supabase/supabase-js@2.118.0'
import { codeOk, cors, json } from '../_shared/http.ts'
import { checkDraft, youtubeId } from './parse.ts'

const MODEL = Deno.env.get('AI_MODEL') || 'gemini-3.6-flash'
const GEMINI_FALLBACK = 'gemini-3.5-flash-lite'
const MAX_TEXT = 10_000

const PROMPT = `Tu extrais une recette pour un carnet de plats maison, en français.
Donne le titre, le nombre de portions, le temps total en minutes s'il est connu, chaque ingrédient avec
son nom court (ex. « oignon », « crème fraîche »), la quantité telle qu'écrite ou dite (ex. « 2 », « 20 cl »)
et une estimation en grammes, puis les étapes, une phrase chacune.
Si ce n'est pas une recette, renvoie une liste d'ingrédients vide.`

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    servings: { type: 'number' },
    prep_minutes: { type: 'number' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, quantity: { type: 'string' }, grams: { type: 'number' } },
        required: ['name', 'quantity', 'grams'],
        additionalProperties: false,
      },
    },
    steps: { type: 'array', items: { type: 'string' } },
  },
  required: ['title', 'servings', 'ingredients', 'steps'],
  additionalProperties: false,
}

class AiError extends Error {
  constructor(public code: string, public status: number, detail?: string) { super(detail ?? code) }
}

// deno-lint-ignore no-explicit-any
async function ask(model: string, input: any[]) {
  const key = Deno.env.get('GEMINI_API_KEY')
  if (!key) throw new AiError('ai', 502, 'GEMINI_API_KEY missing')
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input, response_format: { type: 'text', mime_type: 'application/json', schema: SCHEMA } }),
    signal: AbortSignal.timeout(120_000), // a video takes longer than a photo; edge wall clock is 150 s
  }).catch(e => {
    throw e?.name === 'TimeoutError' ? new AiError('busy', 503, `${model} timeout`) : e
  })
  if (res.status === 429 || res.status === 503) throw new AiError('busy', 503, `${model} ${res.status}`)
  const body = await res.json().catch(() => null)
  if (res.status === 400) throw new AiError('video', 422, JSON.stringify(body?.error ?? body).slice(0, 300)) // private/unlisted video
  if (!res.ok) throw new AiError('ai', 502, `${res.status} ${JSON.stringify(body?.error ?? body).slice(0, 300)}`)
  if (body?.status !== 'completed') throw new AiError('refused', 422, JSON.stringify(body?.errors ?? body?.status))
  // deno-lint-ignore no-explicit-any
  const text = body.output_text ?? (body.steps ?? []).filter((s: any) => s.type === 'model_output')
    // deno-lint-ignore no-explicit-any
    .flatMap((s: any) => s.content ?? []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('')
  return JSON.parse(text || '{}')
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method' }, 405)

  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return json({ error: 'auth' }, 401)
  if (!(await codeOk(req))) return json({ error: 'code' }, 403)
  // shortcut: no daily quota (unlike scan-photo); the access code limits it to the owner. Add one if it's shared.

  const body = await req.json().catch(() => null)
  const url = typeof body?.url === 'string' ? body.url.trim().slice(0, 500) : ''
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  if (text.length > MAX_TEXT) return json({ error: 'too_long' }, 413)
  const video = url ? youtubeId(url) : null
  if (!video && text.length < 20) return json({ error: url ? 'need_text' : 'empty' }, 400)

  const input = [{ type: 'text', text: text ? `${PROMPT}\n\nTexte fourni (légende ou description) :\n${text}` : PROMPT }]
  if (video) input.push({ type: 'video', uri: `https://www.youtube.com/watch?v=${video}` } as never)

  let raw
  try {
    try { raw = await ask(MODEL, input) } catch (e) {
      if (!(e instanceof AiError && e.code === 'busy') || MODEL === GEMINI_FALLBACK) throw e
      raw = await ask(GEMINI_FALLBACK, input)
    }
  } catch (e) {
    console.error(e)
    return e instanceof AiError ? json({ error: e.code }, e.status) : json({ error: 'ai' }, 502)
  }
  const draft = checkDraft(raw)
  if (!draft) return json({ error: 'not_recipe' }, 422)
  return json({ draft, source_url: /^https?:\/\//i.test(url) ? url : null })
})
