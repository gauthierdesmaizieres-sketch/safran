// First launch, no session yet: create the anonymous account (no email, no password), then App moves on.
import { useEffect, useState } from 'react'
import { Button } from '../ui.jsx'
import { t } from '../i18n.js'
import { startAnonymous } from '../data.js'

export default function Welcome() {
  const [failed, setFailed] = useState(false)
  const start = () => { setFailed(false); startAnonymous().catch(() => setFailed(true)) } // success -> auth listener in App
  useEffect(start, [])

  return (
    <div className="page login" aria-busy={!failed}>
      <h1>{t('Ton journal repas')}</h1>
      {failed ? (
        <>
          <p role="alert">{t("Impossible de préparer l'app. Vérifie ta connexion internet.")}</p>
          <Button size="lg" block onClick={start}>{t('Réessayer')}</Button>
        </>
      ) : (
        <p className="muted">{t('Préparation de ton journal…')}</p>
      )}
      <p className="muted credits"><a href="./privacy.html">{t('Confidentialité')}</a></p>
    </div>
  )
}
