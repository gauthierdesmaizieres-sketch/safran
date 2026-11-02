// S17 Liste de courses : interne (synchronisée, cochable en magasin) + partage en texte vers Keep, WhatsApp, SMS…
import { useEffect, useState } from 'react'
import { Share2 } from 'lucide-react'
import { Avocado } from '../FoodMotion.jsx'
import { Button, EmptyState, TextField } from '../ui.jsx'
import { shoppingText } from '../lib.js'
import { addShopping, deleteShopping, listShopping, setShoppingChecked } from '../data.js'
import TopBar from './TopBar.jsx'

export default function Shopping({ notify }) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [text, setText] = useState('')

  const load = () => { setError(null); listShopping().then(setItems).catch(() => setError('load')) }
  useEffect(load, [])

  async function add(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    try {
      const rows = await addShopping([t])
      setItems(xs => [...xs, ...rows])
      setText('')
    } catch { setError("L'ajout a échoué. Vérifie ta connexion et réessaie.") }
  }

  async function toggle(it) {
    setItems(xs => xs.map(x => (x.id === it.id ? { ...x, checked: !it.checked } : x)))
    try { await setShoppingChecked(it.id, !it.checked) } catch {
      setItems(xs => xs.map(x => (x.id === it.id ? it : x)))
    }
  }

  async function clearChecked() {
    const done = items.filter(i => i.checked)
    try {
      await deleteShopping(done.map(i => i.id))
      setItems(xs => xs.filter(x => !x.checked))
      notify(`${done.length} article${done.length > 1 ? 's' : ''} retiré${done.length > 1 ? 's' : ''}`)
    } catch { setError("La suppression a échoué. Vérifie ta connexion et réessaie.") }
  }

  async function share() {
    const body = shoppingText(items)
    try {
      if (navigator.share) await navigator.share({ title: 'Liste de courses', text: body })
      else { await navigator.clipboard.writeText(body); notify('Liste copiée') }
    } catch { /* share sheet closed */ }
  }

  const checked = items?.filter(i => i.checked).length ?? 0
  return (
    <div className="page">
      <TopBar title="Liste de courses" />
      {error === 'load' ? (
        <div className="stack">
          <p role="alert">Impossible de charger ta liste.</p>
          <Button variant="secondary" onClick={load}>Réessayer</Button>
        </div>
      ) : error && <p className="form-error" role="alert">{error}</p>}

      <form className="shop-add" onSubmit={add}>
        <TextField id="shop-new" label="Ajouter un article" autoComplete="off" maxLength={200} value={text} onChange={e => setText(e.target.value)} />
        <Button type="submit" variant="secondary" disabled={!text.trim()}>Ajouter</Button>
      </form>

      {items?.length === 0 && (
        <EmptyState icon={Avocado} title="Ta liste est vide"
          text="Ajoute les ingrédients d'un plat depuis sa fiche, ou d'une recette importée." />
      )}
      {items?.length > 0 && (
        <>
          <ul className="shop-list card">
            {items.map(it => (
              <li key={it.id}>
                <label className={it.checked ? 'is-done' : ''}>
                  <input type="checkbox" checked={it.checked} onChange={() => toggle(it)} />
                  <span>{it.text}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="stack">
            <Button block disabled={checked === items.length} onClick={share}><Share2 size={18} aria-hidden="true" /> Partager la liste</Button>
            {checked > 0 && <Button variant="ghost" onClick={clearChecked}>Retirer les articles cochés ({checked})</Button>}
          </div>
        </>
      )}
      {!items && !error && <div className="skeleton row-skel" />}
    </div>
  )
}
