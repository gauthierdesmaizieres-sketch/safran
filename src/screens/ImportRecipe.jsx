// S16 Importer une recette : lien Instagram / YouTube (collé ou partagé depuis Android) -> ingrédients + étapes
// -> plat maison (S15 pré-rempli) ou liste de courses (S17).
import { useState } from 'react'
import { Button, TextField } from '../ui.jsx'
import { addShopping, getAccessCode, importRecipe, searchFoods, setAccessCode } from '../data.js'
import { go } from '../App.jsx'
import TopBar from './TopBar.jsx'

export const DRAFT_KEY = 'safran:import-draft'

const ERRORS = {
  need_text: "Instagram ne laisse pas lire ses publications : copie la légende de la recette et colle-la dans le champ texte.",
  empty: "Colle un lien YouTube ou le texte de la recette.",
  video: "Cette vidéo ne peut pas être lue (privée ou non répertoriée). Colle sa description dans le champ texte.",
  not_recipe: "Aucune recette trouvée dans ce contenu. Colle la liste des ingrédients dans le champ texte.",
  too_long: "Le texte est trop long (10 000 caractères maximum).",
  busy: "Le service d'analyse est saturé. Réessaie dans une minute.",
  network: "Le décodage a échoué. Vérifie ta connexion et réessaie.",
}

export default function ImportRecipe({ q, notify }) {
  const [url, setUrl] = useState(q.get('link') ?? '')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [askCode, setAskCode] = useState(false)
  const [code, setCode] = useState(getAccessCode)
  const [res, setRes] = useState(null) // { draft, source_url }
  const [next, setNext] = useState(null) // 'dish' | 'list' while that button works
  const insta = /instagram\.com/i.test(url)

  async function decode() {
    setBusy(true)
    setError(null)
    try {
      setRes(await importRecipe(url.trim(), text.trim()))
    } catch (e) {
      if (e.message === 'code') {
        setAskCode(true)
        setError(getAccessCode() ? "Code d'accès incorrect." : null)
      } else setError(ERRORS[e.message] ?? ERRORS.network)
    }
    setBusy(false)
  }

  function saveCode(e) {
    e.preventDefault()
    if (!code.trim()) return
    setAccessCode(code.trim())
    setAskCode(false)
    decode()
  }

  // Best guess per ingredient from the food base; S15 lists what found nothing so the user picks it.
  async function toDish() {
    setNext('dish')
    const items = await Promise.all(res.draft.ingredients.map(async i => ({
      ...i, food: (await searchFoods(i.name).catch(() => []))[0] ?? null,
    })))
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...res, items })) } catch { /* private mode */ }
    go('/recipe/new?import=1')
  }

  async function toList() {
    setNext('list')
    try {
      await addShopping(res.draft.ingredients.map(i => [i.quantity, i.name].filter(Boolean).join(' ')))
      notify(`${res.draft.ingredients.length} ingrédients ajoutés aux courses`)
      go('/shopping')
    } catch {
      setError(ERRORS.network)
      setNext(null)
    }
  }

  if (res) {
    const d = res.draft
    return (
      <div className="page">
        <TopBar title="Recette décodée" onBack={() => setRes(null)} />
        <header>
          <h2 className="section-title">{d.title}</h2>
          <p className="muted">
            {[`${d.servings} portion${d.servings > 1 ? 's' : ''}`, d.prep_minutes && `${d.prep_minutes} min`, `${d.steps.length} étape${d.steps.length > 1 ? 's' : ''}`].filter(Boolean).join(' · ')}
          </p>
        </header>
        <ul className="ingredients" aria-label="Ingrédients">
          {d.ingredients.map((i, k) => <li key={k}><span>{i.name}</span><span>{i.quantity || (i.grams ? `${i.grams} g` : '')}</span></li>)}
        </ul>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="stack">
          <Button size="lg" block loading={next === 'dish'} disabled={!!next} onClick={toDish}>Créer le plat</Button>
          <Button variant="secondary" block loading={next === 'list'} disabled={!!next} onClick={toList}>Ajouter à la liste de courses</Button>
          <p className="muted">Le décodage par l'IA peut se tromper : vérifie les quantités avant d'enregistrer.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <TopBar title="Importer une recette" onBack={() => go('/recipes')} />
      <TextField id="link" label="Lien Instagram ou YouTube" type="url" inputMode="url" autoComplete="off" value={url} onChange={e => setUrl(e.target.value)} />
      <div className="field">
        <label htmlFor="caption">Texte de la recette {insta ? '(obligatoire pour Instagram)' : '(facultatif)'}</label>
        <textarea id="caption" className="textarea" rows={6} value={text} onChange={e => setText(e.target.value)}
          aria-describedby="caption-hint" />
        <p id="caption-hint" className="muted">
          {insta
            ? "Instagram ne permet pas aux apps de lire une publication : ouvre-la, copie la légende et colle-la ici."
            : "YouTube : la vidéo publique est lue directement. Tu peux aussi coller la description ou une liste d'ingrédients."}
        </p>
      </div>

      {askCode ? (
        <form className="card stack" onSubmit={saveCode}>
          <p>Le décodage par l'IA est réservé au propriétaire de l'app. Entre ton code d'accès : il sera retenu sur ce téléphone.</p>
          <TextField id="access-code" label="Code d'accès" type="password" autoComplete="current-password" value={code}
            onChange={e => setCode(e.target.value)} error={error ?? undefined} />
          <Button type="submit" block disabled={!code.trim()}>Valider et décoder</Button>
        </form>
      ) : error && <p className="form-error" role="alert">{error}</p>}

      {!askCode && (
        <Button size="lg" block loading={busy} disabled={!url.trim() && !text.trim()} onClick={decode}>
          {busy ? "Décodage… (jusqu'à 2 min)" : 'Décoder la recette'}
        </Button>
      )}
    </div>
  )
}
