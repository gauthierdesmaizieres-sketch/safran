// S09 Résultat du scan : corriger aliments et grammes, puis ajouter au journal
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react'
import { BottomSheet, Button, FoodRow, IconButton, SearchField } from '../ui.jsx'
import { localDay, MEALS, nutrientsFor, parseGrams, totals } from '../lib.js'
import { t, tn } from '../i18n.js'
import { addDiaryEntries, getScan, searchFoods, setScanStatus } from '../data.js'
import { go } from '../App.jsx'
import TopBar from './TopBar.jsx'

export default function ScanReview({ scanId, q, notify }) {
  const day = q.get('day') || localDay()
  const [meal, setMeal] = useState(q.get('meal') || 'lunch')
  const [items, setItems] = useState(null) // [{ key, label, gramsText, per100, confidence, food_id }]
  const [missing, setMissing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [picker, setPicker] = useState(null) // { key } to replace an item, { key: null } to add one
  const [q2, setQ2] = useState('')
  const [found, setFound] = useState([])

  useEffect(() => {
    let live = true
    const timer = setTimeout(() => searchFoods(q2).then(r => live && setFound(r)).catch(() => {}), 150)
    return () => { live = false; clearTimeout(timer) }
  }, [q2])

  useEffect(() => {
    getScan(scanId).then(s => {
      if (!s || s.status === 'confirmed') { setMissing(true); return }
      setItems(s.detected.map(i => ({ ...i, gramsText: String(i.grams) })))
    })
  }, [scanId])

  const rows = useMemo(() => (items ?? []).map(i => {
    const grams = parseGrams(i.gramsText)
    return { ...i, grams, ...nutrientsFor(i.per100, grams ?? 0) }
  }), [items])
  const sum = totals(rows)
  const invalid = rows.some(r => r.grams === null)

  const edit = (key, gramsText) => setItems(xs => xs.map(x => x.key === key ? { ...x, gramsText } : x))
  const drop = key => setItems(xs => xs.filter(x => x.key !== key))
  const openPicker = (key, label = '') => { setQ2(label); setPicker({ key }) }
  // A food picked by the user replaces the AI's guess (name + values per 100 g); grams stay as typed.
  function pick(f) {
    const fromBase = { label: f.name, food_id: f.id, confidence: 1, per100: { kcal: f.kcal_100g, carbs: f.carbs_100g, protein: f.protein_100g, fat: f.fat_100g } }
    setItems(xs => (picker.key
      ? xs.map(x => (x.key === picker.key ? { ...x, ...fromBase } : x))
      : [...xs, { key: crypto.randomUUID(), gramsText: '100', ...fromBase }]))
    setPicker(null)
  }

  async function save() {
    setSaving(true)
    setSaveError(false)
    try {
      // r.key is a uuid fixed per detected item, so a retry after a network error never logs twice
      await addDiaryEntries(rows.map(r => ({
        logged_on: day, meal, label: r.label, grams: r.grams, food_id: r.food_id,
        kcal: r.kcal, carbs: r.carbs, protein: r.protein, fat: r.fat,
        method: 'photo', photo_scan_id: scanId, client_id: r.key,
      })))
      await setScanStatus(scanId, 'confirmed')
    } catch {
      setSaveError(true) // keep the user's corrections on screen so they can retry
      setSaving(false)
      return
    }
    notify(tn(rows.length, '{n} aliment ajouté · {kcal} kcal', '{n} aliments ajoutés · {kcal} kcal', { kcal: sum.kcal }))
    go(day === localDay() ? '/diary' : `/diary?day=${day}`)
  }

  async function discard() {
    await setScanStatus(scanId, 'discarded')
    go('/diary')
  }

  if (missing) {
    return (
      <div className="page">
        <TopBar title={t('Résultat')} onBack={() => go('/diary')} />
        <p role="alert">{t("Ce scan n'existe plus ou a déjà été ajouté.")}</p>
        <Button variant="secondary" onClick={() => go('/diary')}>{t('Retour au journal')}</Button>
      </div>
    )
  }
  if (!items) return <div className="page"><TopBar title={t('Résultat')} /><div className="skeleton row-skel" /></div>

  return (
    <div className="page review">
      <TopBar title={t('Vérifie le résultat')} />
      <p className="muted">{t("Ajuste les quantités : l'estimation sur photo peut se tromper de 20 à 30 %.")}</p>

      <div className="field">
        <label htmlFor="meal">{t('Repas')}</label>
        <select id="meal" className="select" value={meal} onChange={e => setMeal(e.target.value)}>
          {MEALS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <p className="muted">{t('Plus aucun aliment. Reprends une photo ou abandonne ce scan.')}</p>
      ) : (
        <ul className="review-list card">
          {rows.map(r => (
            <li key={r.key} className="review-item">
              <div className="review-name">
                <span>{r.label}</span>
                {r.confidence < 0.7 && <span className="badge badge-warning">{t('peu sûr')}</span>}
              </div>
              <div className="review-edit">
                <div className={`field-box review-grams${r.grams === null ? ' is-invalid' : ''}`}>
                  <input inputMode="decimal" aria-label={t('Quantité de {name} en grammes', { name: r.label })} value={r.gramsText}
                    aria-invalid={r.grams === null} onChange={e => edit(r.key, e.target.value)} />
                  <span className="field-suffix">g</span>
                </div>
                <span className="review-kcal" aria-live="polite">{r.kcal} kcal</span>
                <IconButton label={t('Remplacer {name}', { name: r.label })} icon={ArrowLeftRight} onClick={() => openPicker(r.key, r.label.split(' ')[0])} />
                <IconButton label={t('Retirer {name}', { name: r.label })} icon={Trash2} onClick={() => drop(r.key)} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <Button variant="ghost" onClick={() => openPicker(null)}><Plus size={18} aria-hidden="true" /> {t('Ajouter un aliment oublié')}</Button>
      {invalid && <p className="form-error" role="alert">{t('Entre une quantité entre 1 et 5000 g pour chaque aliment.')}</p>}

      <div className="review-total card">
        <strong>{sum.kcal} kcal</strong>
        <span className="muted">{t('G {c} g · P {p} g · L {f} g', { c: sum.carbs, p: sum.protein, f: sum.fat })}</span>
      </div>

      {saveError && <p className="form-error" role="alert">{t("L'ajout au journal a échoué. Vérifie ta connexion et réessaie : tes corrections sont gardées.")}</p>}
      <Button size="lg" block loading={saving} disabled={invalid || rows.length === 0} onClick={save}>{t('Ajouter au journal')}</Button>
      <Button variant="ghost" block onClick={discard}>{t('Abandonner ce scan')}</Button>

      <BottomSheet open={!!picker} onClose={() => setPicker(null)} title={picker?.key ? t('Remplacer par') : t('Ajouter un aliment')}>
        <div className="stack picker">
          <SearchField value={q2} onChange={setQ2} label={t('Chercher dans la base')} />
          <div aria-live="polite">
            {q2 && found.length === 0 && <p className="muted">{t('Aucun aliment trouvé.')}</p>}
            {found.slice(0, 8).map(f => <FoodRow key={f.id} name={f.name} detail={t('pour 100 g')} kcal={f.kcal_100g} onClick={() => pick(f)} />)}
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
