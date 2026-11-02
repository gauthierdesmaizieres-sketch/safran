// S13 Détail recette : kcal par portion, ingrédients recalculés selon les portions, étapes, ajout au journal
import { useEffect, useState } from 'react'
import { ChefHat, Pencil, ShoppingBasket, Star } from 'lucide-react'
import { BottomSheet, Button, IconButton, Stepper, TextField } from '../ui.jsx'
import { localDay, MEALS, mealForHour, parseNumber, recipeFor, shoppingLines } from '../lib.js'
import { t, tn } from '../i18n.js'
import { addDiaryEntries, addShopping, getRecipe, isFavorite, setFavorite } from '../data.js'
import { go } from '../App.jsx'
import TopBar from './TopBar.jsx'
import { RecipePhoto, tagLabel } from './recipeParts.jsx'

export default function RecipeDetail({ recipeId, q, notify }) {
  const day = q.get('day') || localDay()
  const [r, setR] = useState(undefined)
  const [cookFor, setCookFor] = useState(null) // portions shown in the ingredient list
  const [fav, setFav] = useState(false)
  const [sheet, setSheet] = useState(!!q.get('meal'))
  const [meal, setMeal] = useState(q.get('meal') || mealForHour(new Date().getHours()))
  const [eaten, setEaten] = useState('1')
  const [clientId, setClientId] = useState(() => crypto.randomUUID())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const [shopping, setShopping] = useState(false)

  useEffect(() => {
    getRecipe(recipeId).then(x => { setR(x); setCookFor(x?.servings ?? 1) }).catch(() => setR(null))
    isFavorite({ recipe_id: recipeId }).then(setFav).catch(() => {})
  }, [recipeId])

  if (r === undefined) return <div className="page"><TopBar title={t('Plat')} /><div className="skeleton card-skel" /></div>
  if (r === null) return <div className="page"><TopBar title={t('Plat')} onBack={() => go('/recipes')} /><p role="alert">{t("Ce plat n'existe plus.")}</p></div>

  const one = recipeFor(r, 1)
  const n = parseNumber(eaten, 0.1, 20)
  const mine = !!r.owner_id
  const scale = cookFor / r.servings

  async function toggleFav() {
    const next = !fav
    setFav(next)
    try { await setFavorite({ recipe_id: r.id }, next) } catch { setFav(!next) }
  }

  async function toShopping() {
    setShopping(true)
    try {
      await addShopping(shoppingLines(r, cookFor))
      notify(`${r.recipe_ingredients.length} ingrédients ajoutés aux courses`, 'Voir', () => go('/shopping'))
    } catch {
      notify("L'ajout aux courses a échoué. Vérifie ta connexion.")
    }
    setShopping(false)
  }

  async function add() {
    setSaving(true)
    setError(false)
    try {
      await addDiaryEntries([{ logged_on: day, meal, recipe_id: r.id, label: r.title, servings: n, ...recipeFor(r, n), method: 'recipe', client_id: clientId }])
    } catch {
      setError(true)
      setSaving(false)
      return
    }
    notify(t('{name} ajouté · {kcal} kcal', { name: r.title, kcal: recipeFor(r, n).kcal }))
    go(day === localDay() ? '/diary' : `/diary?day=${day}`)
  }

  return (
    <div className="page">
      <TopBar title={t('Plat')} onBack={() => history.back()} />
      <RecipePhoto path={r.photo_path} alt={r.title} className="recipe-hero" />
      <header className="food-head">
        <div>
          <h1>{r.title}</h1>
          <p className="muted">
            {[r.prep_minutes != null && `${r.prep_minutes} min`, tn(r.servings, '{n} portion', '{n} portions'), ...r.tags.map(tagLabel)].filter(Boolean).join(' · ')}
          </p>
        </div>
        <IconButton label={fav ? t('Retirer des favoris') : t('Ajouter aux favoris')} icon={Star} aria-pressed={fav} variant={fav ? 'filled' : 'plain'} onClick={toggleFav} />
      </header>

      <section className="card stack" aria-label={t('Par portion')}>
        <p><span className="kcal-big">{one.kcal}</span> {t('kcal par portion')}</p>
        <p className="muted">{t('Glucides {c} g · Protéines {p} g · Lipides {f} g', { c: one.carbs, p: one.protein, f: one.fat })}</p>
      </section>

      <div className="stack">
        <Button block onClick={() => { setClientId(crypto.randomUUID()); setSheet(true) }}>{t('Ajouter au journal')}</Button>
        <Button variant="secondary" block onClick={() => go(`/cook/${r.id}?for=${cookFor}`)}><ChefHat size={18} aria-hidden="true" /> {t('Cuisiner')}</Button>
      </div>

      <section className="stack" aria-labelledby="ing-h">
        <div className="food-head">
          <h2 id="ing-h" className="section-title">{t('Ingrédients')}</h2>
          <Stepper value={cookFor} onChange={setCookFor} min={1} max={100} label={t('les portions à cuisiner')} />
        </div>
        <p className="muted">{t('Pour {p}', { p: tn(cookFor, '{n} portion', '{n} portions') })}</p>
        <ul className="ingredients">
          {r.recipe_ingredients.map(i => (
            <li key={i.id}><span>{i.foods.name}</span><span>{Math.round(i.grams * scale)} g</span></li>
          ))}
        </ul>
        <Button variant="secondary" block loading={shopping} onClick={toShopping}>
          <ShoppingBasket size={18} aria-hidden="true" /> Ajouter à la liste de courses
        </Button>
        {r.source_url && <a className="muted" href={r.source_url} target="_blank" rel="noopener noreferrer">Voir la recette d'origine</a>}
      </section>

      {r.steps?.length > 0 && (
        <section className="stack" aria-labelledby="steps-h">
          <h2 id="steps-h" className="section-title">{t('Étapes')}</h2>
          <ol className="steps">{r.steps.map((s, i) => <li key={i}>{s.text}</li>)}</ol>
        </section>
      )}

      {mine && <Button variant="ghost" onClick={() => go(`/recipe/${r.id}/edit`)}><Pencil size={16} aria-hidden="true" /> {t('Modifier le plat')}</Button>}

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title={t('Ajouter au journal')}>
        <div className="stack">
          <TextField id="eaten" label={t('Portions mangées')} inputMode="decimal" value={eaten} onChange={e => setEaten(e.target.value)}
            error={n == null ? t('Entre un nombre entre 0,1 et 20.') : undefined} />
          <div className="field">
            <label htmlFor="meal">{t('Repas')}</label>
            <select id="meal" className="select" value={meal} onChange={e => setMeal(e.target.value)}>
              {MEALS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <p aria-live="polite"><strong>{n ? recipeFor(r, n).kcal : '–'} kcal</strong></p>
          {error && <p className="form-error" role="alert">{t("L'ajout a échoué. Vérifie ta connexion et réessaie.")}</p>}
          <Button block loading={saving} disabled={!n} onClick={add}>{t('Ajouter')}</Button>
        </div>
      </BottomSheet>
    </div>
  )
}
