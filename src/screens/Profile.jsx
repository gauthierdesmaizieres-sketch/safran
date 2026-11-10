// S19 Profil (slice: goals, language, access code, delete account). The account is anonymous: no sign-out (it would lose it).
import { useState } from 'react'
import { BottomSheet, Button } from '../ui.jsx'
import { LANG, LANGS, setLang, t } from '../i18n.js'
import { deleteAccount, getAccessCode, setAccessCode } from '../data.js'
import { go } from '../App.jsx'

export default function Profile({ notify }) {
  const [confirm, setConfirm] = useState(false)
  const [hasCode, setHasCode] = useState(() => !!getAccessCode())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  async function remove() {
    setBusy(true)
    setError(false)
    try {
      await deleteAccount() // auth listener in App starts a fresh account
    } catch {
      setError(true)
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <h1>{t('Profil')}</h1>
      <section className="card stack">
        <p className="muted">{t('Ton compte')}</p>
        <p>{t('Il est lié à ce navigateur, sans e-mail ni mot de passe. Si tu effaces les données de Chrome ou changes de téléphone, ton journal sera perdu.')}</p>
      </section>
      <section className="card stack">
        <p className="muted">{t('Objectif, poids, activité')}</p>
        <Button variant="secondary" onClick={() => go('/goals')}>{t('Modifier mes objectifs')}</Button>
      </section>
      <section className="card stack">
        <p className="muted">{t('Comprendre la nutrition')}</p>
        <p>{t('Protéines, glucides, fibres, acides gras, microbiote : des fiches détaillées et sourcées.')}</p>
        <Button variant="secondary" onClick={() => go('/learn')}>{t('Lire les fiches')}</Button>
      </section>
      <section className="card stack">
        <div className="field">
          <label htmlFor="lang">{t('Langue')}</label>
          <select id="lang" className="select" value={LANG} onChange={e => setLang(e.target.value)}>
            {Object.entries(LANGS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>
      </section>
      {hasCode && (
        <section className="card stack">
          <p className="muted">{t('Analyse photo')}</p>
          <Button variant="secondary" onClick={() => { setAccessCode(null); setHasCode(false); notify?.(t("Code d'accès oublié sur ce téléphone")) }}>
            {t("Oublier le code d'accès")}
          </Button>
        </section>
      )}
      <Button variant="ghost" onClick={() => setConfirm(true)}>{t('Supprimer mon compte')}</Button>
      <p className="muted credits">
        {t('Valeurs nutritionnelles :')} <a href="https://ciqual.anses.fr" target="_blank" rel="noreferrer">Anses. 2025. Table de composition nutritionnelle des aliments Ciqual</a> (Licence Ouverte) ·
        {' '}{t('produits :')} <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer">Open Food Facts</a> (ODbL).
        <br /><a href="./privacy.html">{t('Confidentialité')}</a>
      </p>

      <BottomSheet open={confirm} onClose={() => setConfirm(false)} title={t('Supprimer le compte ?')}>
        <div className="stack">
          <p>{t('Ton journal, tes plats, tes photos et ton compte seront effacés définitivement. Impossible de revenir en arrière.')}</p>
          {error && <p className="form-error" role="alert">{t('La suppression a échoué. Réessaie.')}</p>}
          <Button variant="danger" block loading={busy} onClick={remove}>{t('Supprimer définitivement')}</Button>
          <Button variant="secondary" block disabled={busy} onClick={() => setConfirm(false)}>{t('Annuler')}</Button>
        </div>
      </BottomSheet>
    </div>
  )
}
