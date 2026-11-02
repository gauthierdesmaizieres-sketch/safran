// Shared by the AI functions (scan-photo, import-recipe): CORS, JSON replies and the owner's access code.

// Accounts are anonymous (anyone can get one), so the paid/quota'd AI call also needs the owner's access code.
// Unset (local dev) = no check.
const ACCESS_CODE = Deno.env.get('APP_ACCESS_CODE') ?? ''

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-code',
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

// Compare SHA-256 digests in constant time so the code can't be guessed character by character.
export async function codeOk(req: Request) {
  if (!ACCESS_CODE) return true
  const h = async (s: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))
  const [a, b] = await Promise.all([h(req.headers.get('x-app-code') ?? ''), h(ACCESS_CODE)])
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}
