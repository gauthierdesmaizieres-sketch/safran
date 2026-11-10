// S15 Créer / modifier mon plat : photo, portions, ingrédients pesés -> kcal par portion, étapes
import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Pencil, Trash2 } from 'lucide-react'
import { BottomSheet, Button, Chip, FoodRow, IconButton, SearchField, Stepper, TextField } from '../ui.jsx'
import { maybeImage, nutrientsFor, parseGrams, parseNumber, totals } from '../lib.js'
import { t } from '../i18n.js'
import { deleteRecipe, getRecipe, removePhoto, saveRecipe, searchFoods, shrink, uploadRecipePhoto } from '../data.js'
import { go } from '../App.jsx'
import TopBar from './TopBar.jsx'
import { RecipePhoto, TAGS } from './recipeParts.jsx'
import { DRAFT_KEY } from './ImportRecipe.jsx'

const per100 = f => ({ kcal: f.kcal_100g, carbs: f.carbs_100g, protein: f.protein_100g, fat: f.fat_100g })

// Draft left by S16 (ImportRecipe), read once: matched ingredients become rows, the rest wait to be picked.
function takeDraft() {
  try {
    const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY))
    sessionStorage.removeItem(DRAFT_KEY)
    return d
  } catch { return null }
}

export default function RecipeEdit({ recipeId, q: route, notify }) {
  const isNew = !recipeId
  const [imported] = useState(() => (isNew && route?.get('import') ? takeDraft() : null))
  const [unmatched, setUnmatched] = useState(() => imported?.items.filter(i => !i.food) ?? [])
  const [pending, setPending] = useState(null) // the unmatched ingredient being searched for
  const [loaded, setLoaded] = useState(isNew ? {} : undefined)
  const d = imported?.draft
  const [title, setTitle] = useState(d?.title ?? '')
  const [servings, setServings] = useState(d?.servings ?? 2)
  const [minutes, setMinutes] = useState(d?.prep_minutes ?? '')
  const [tags, setTags] = useState([])
  const [items, setItems] = useState(() => (imported?.items ?? []).filter(i => i.food)
    .map(i => ({ key: crypto.randomUUID(), food: i.food, gramsText: String(i.grams ?? '') }))) // [{ key, food, gramsText }]
  const [stepsText, setStepsText] = useState(d?.steps.join('\n') ?? '')
  const [photoPath, setPhotoPath] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [q, setQ] = useState('')
  const [found, setFound] = useState([])
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (isNew) return
    getRecipe(recipeId).then(r => {
      if (!r || !r.owner_id) return setLoaded(null)
      setLoaded(r)
      setTitle(r.title); setServings(r.servings); setMinutes(r.prep_minutes ?? ''); setTags(r.tags)
      setPhotoPath(r.photo_path)
      setItems(r.recipe_ingredients.map(i => ({ key: i.id, food: i.foods, gramsText: String(i.grams) })))
      setStepsText((r.steps ?? []).map(s => s.text).join('\n'))
    }).catch(() => setLoaded(null))
  }, [recipeId])

  useEffect(() => {
    let live = true
    const timer = setTimeout(() => searchFoods(q).then(r => live && setFound(r)).catch(() => {}), 150)
    return () => { live = false; clearTimeout(timer) }
  }, [q])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  const rows = items.map(i => ({ ...i, grams: parseGrams(i.gramsText) }))
  const sum = totals(rows.filter(r => r.grams).map(r => nutrientsFor(per100(r.food), r.grams)))
  const mins = String(minutes).trim() === '' ? null : parseNumber(minutes, 0, 1440)
  const errors = {}
  if (!title.trim()) errors.title = t('Donne un nom à ton plat.')
  if (rows.length === 0) errors.items = t('Ajoute au moins un ingrédient.')
  if (rows.some(r => !r.grams)) errors.items = t("Chaque ingrédient a besoin d'un poids entre 1 et 5000 g.")
  if (mins === null && String(minutes).trim() !== '') errors.minutes = t('Entre un nombre de minutes.')
  const valid = Object.keys(errors).length === 0

  function pickPhoto(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f || !maybeImage(f)) return setError(t('Cette photo ne peut pas être lue.'))
    setError(null)
    // decoded now so a HEIC shows in the preview too
    shrink(f).then(jpg => { setPhotoFile(jpg); setPreview(URL.createObjectURL(jpg)) }, () => setError(t('Cette photo ne peut pas être lue.')))
  }

  function dropPhoto() {
    setPhotoFile(null); setPreview(null); setPhotoPath(null)
  }

  async function save() {
    setTouched(true)
    if (!valid) return
    setSaving(true)
    setError(null)
    try {
      const path = photoFile ? await uploadRecipePhoto(photoFile) : photoPath
      const id = await saveRecipe({
        id: recipeId ?? null, title: title.trim(), photo_path: path, servings, prep_minutes: mins == null ? null : Math.round(mins), tags,
        steps: stepsText.split('\n').map(s => s.trim()).filter(Boolean).map(text => ({ text })), source_url: imported?.source_url ?? null,
      }, rows.map(r => ({ food_id: r.food.id, grams: r.grams })))
      if (loaded?.photo_path && loaded.photo_path !== path) removePhoto(loaded.photo_path).catch(() => {}) // replaced or removed
      notify(isNew ? t('Plat créé') : t('Plat enregistré'))
      go(`/recipe/${id}`)
    } catch (e) {
      setError(e.message === 'not-image' ? t('Cette photo ne peut pas être lue.') : t("L'enregistrement a échoué. Vérifie ta connexion et réessaie : rien n'est perdu."))
      setSaving(false)
    }
  }

  async function remove() {
    try {
      await deleteRecipe(loaded)
      notify(t('{name} supprimé', { name: loaded.title }))
      go('/recipes')
    } catch {
      setConfirmDelete(false)
      setError(t('La suppression a échoué. Vérifie ta connexion et réessaie.'))
    }
  }

  if (loaded === undefined) return <div className="page"><TopBar title={t('Modifier le plat')} /><div className="skeleton row-skel" /></div>
  if (loaded === null) return <div className="page"><TopBar title={t('Modifier le plat')} onBack={() => go('/recipes')} /><p role="alert">{t("Ce plat n'existe plus.")}</p></div>

  return (
    <div className="page">
      <TopBar title={isNew ? t('Nouveau plat') : t('Modifier le plat')} onBack={() => go(isNew ? '/recipes' : `/recipe/${recipeId}`)} />
      {imported && <p className="muted">Importé et décodé par l'IA : vérifie les ingrédients et leurs poids.</p>}

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
      <button type="button" className="photo-pick" onClick={() => fileRef.current.click()} aria-label={preview || photoPath ? t('Changer la photo') : t('Ajouter une photo')}>
        {preview || photoPath ? <RecipePhoto path={photoPath} src={preview} alt="" /> : <span className="muted"><ImagePlus size={28} aria-hidden="true" /> {t('Ajouter une photo')}</span>}
        {(preview || photoPath) && <span className="photo-edit" aria-hidden="true"><Pencil size={14} /> {t('Changer')}</span>}
      </button>
      {(preview || photoPath) && <Button size="sm" variant="secondary" onClick={dropPhoto}><Trash2 size={16} aria-hidden="true" /> {t('Retirer la photo')}</Button>}

      <TextField id="title" label={t('Nom du plat')} value={title} onChange={e => setTitle(e.target.value)} error={touched ? errors.title : undefined} autoComplete="off" />

      <div className="portion">
        <div className="field">
          <span className="field-label">{t('Nombre de portions')}</span>
          <Stepper value={servings} onChange={setServings} min={1} max={100} label={t('les portions')} />
        </div>
        <TextField id="minutes" label={t('Préparation')} inputMode="numeric" suffix="min" value={minutes} onChange={e => setMinutes(e.target.value)}
          error={touched ? errors.minutes : undefined} />
      </div>

      <div className="chips" role="group" aria-label={t('Étiquettes')}>
        {TAGS.map(([id, label]) => (
          <Chip key={id} on={tags.includes(id)} onClick={() => setTags(ts => (ts.includes(id) ? ts.filter(x => x !== id) : [...ts, id]))}>{label}</Chip>
        ))}
      </div>

      <section className="stack" aria-labelledby="ing-h">
        <h2 id="ing-h" className="section-title">{t('Ingrédients (poids cru)')}</h2>
        {rows.length > 0 && (
          <ul className="review-list card">
            {rows.map(r => (
              <li key={r.key} className="review-item">
                <div className="review-name"><span>{r.food.name}</span></div>
                <div className="review-edit">
                  <div className={`field-box review-grams${r.grams ? '' : ' is-invalid'}`}>
                    <input inputMode="decimal" aria-label={t('Poids de {name} en grammes', { name: r.food.name })} value={r.gramsText} aria-invalid={!r.grams}
                      onChange={e => setItems(xs => xs.map(x => (x.key === r.key ? { ...x, gramsText: e.target.value } : x)))} />
                    <span className="field-suffix">g</span>
                  </div>
                  <span className="review-kcal">{r.grams ? nutrientsFor(per100(r.food), r.grams).kcal : '–'} kcal</span>
                  <IconButton label={t('Retirer {name}', { name: r.food.name })} icon={Trash2} onClick={() => setItems(xs => xs.filter(x => x.key !== r.key))} />
                </div>
              </li>
            ))}
          </ul>
        )}
        <SearchField value={q} onChange={setQ} label={t('Ajouter un ingrédient')} />
        {q && (
          <div aria-live="polite">
            {found.length === 0 && <p className="muted">{t("Aucun aliment trouvé. Crée-le d'abord depuis le journal (Ajouter → Créer un aliment).")}</p>}
            {found.slice(0, 8).map(f => (
              <FoodRow key={f.id} name={f.name} detail={t('pour 100 g')} kcal={f.kcal_100g}
                onClick={() => {
                  setItems(xs => [...xs, { key: crypto.randomUUID(), food: f, gramsText: String(pending?.grams ?? 100) }])
                  if (pending) setUnmatched(xs => xs.filter(x => x !== pending))
                  setPending(null)
                  setQ('')
                }} />
            ))}
          </div>
        )}
        {unmatched.length > 0 && (
          <div className="stack">
            <p className="muted">Pas trouvés dans la base (non comptés) : touche-en un pour le chercher.</p>
            <div className="unmatched">
              {unmatched.map((u, k) => (
                <Chip key={k} on={pending === u} onClick={() => { setPending(u); setQ(u.name) }}>
                  {u.name}{u.quantity ? ` · ${u.quantity}` : ''}
                </Chip>
              ))}
            </div>
          </div>
        )}
        {touched && errors.items && <p className="form-error" role="alert">{errors.items}</p>}
      </section>

      <div className="review-total card" aria-live="polite">
        <strong>{t('{kcal} kcal / portion', { kcal: servings > 0 ? Math.round(sum.kcal / servings) : 0 })}</strong>
        <span className="muted">{t('{kcal} kcal au total', { kcal: sum.kcal })}</span>
      </div>

      <div className="field">
        <label htmlFor="steps">{t('Étapes (une par ligne, facultatif)')}</label>
        <textarea id="steps" className="textarea" rows={6} value={stepsText} onChange={e => setStepsText(e.target.value)} />
      </div>

      {touched && !valid && <p className="form-error" role="alert">{t('Corrige les champs signalés.')}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <Button size="lg" block loading={saving} onClick={save}>{t('Enregistrer le plat')}</Button>
      {!isNew && <Button variant="ghost" onClick={() => setConfirmDelete(true)}>{t('Supprimer ce plat')}</Button>}

      <BottomSheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title={t('Supprimer ce plat ?')}>
        <div className="stack">
          <p>{t('La recette et sa photo seront effacées. Ce que tu as déjà noté dans ton journal reste.')}</p>
          <Button variant="danger" block onClick={remove}>{t('Supprimer')}</Button>
          <Button variant="secondary" block onClick={() => setConfirmDelete(false)}>{t('Annuler')}</Button>
        </div>
      </BottomSheet>
    </div>
  )
}
