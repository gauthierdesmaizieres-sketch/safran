// S07 Scanner un code-barres (caméra arrière), avec saisie manuelle en secours
import { useEffect, useRef, useState } from 'react'
import { PackageSearch } from 'lucide-react'
import { Button, EmptyState, TextField } from '../ui.jsx'
import { mealLabel } from '../lib.js'
import { t } from '../i18n.js'
import { lookupBarcode } from '../data.js'
import { go } from '../App.jsx'
import TopBar from './TopBar.jsx'

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e']

// Native detector where it reads EAN (Chrome Android); ZXing/WASM ponyfill elsewhere (iOS, desktop).
// shortcut: the ponyfill fetches its .wasm from a CDN on first use; self-host it before going offline-first.
async function makeDetector() {
  if ('BarcodeDetector' in window) {
    const ok = await window.BarcodeDetector.getSupportedFormats().catch(() => [])
    if (FORMATS.some(f => ok.includes(f))) return new window.BarcodeDetector({ formats: FORMATS })
  }
  const { BarcodeDetector } = await import('barcode-detector/ponyfill')
  return new BarcodeDetector({ formats: FORMATS })
}

export default function BarcodeScan({ meal, q }) {
  const day = q.get('day') ?? ''
  const video = useRef(null)
  const [camera, setCamera] = useState('starting') // starting | on | off
  const [manual, setManual] = useState('')
  const [state, setState] = useState({ step: 'scan' }) // scan | busy | missing {ean, prefill} | error
  const done = useRef(false)

  async function handle(ean) {
    if (done.current) return
    done.current = true
    setState({ step: 'busy', ean })
    try {
      const res = await lookupBarcode(ean)
      if (res.food) go(`/food/${res.food.id}?meal=${meal}&day=${day}&via=barcode`)
      else setState({ step: 'missing', ean, prefill: res.prefill ?? {} })
    } catch {
      done.current = false
      setState({ step: 'error', ean })
    }
  }

  useEffect(() => {
    let stream, timer, stopped = false
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        if (stopped) return stream.getTracks().forEach(tr => tr.stop())
        video.current.srcObject = stream
        await video.current.play()
        setCamera('on')
        const detector = await makeDetector()
        const tick = async () => {
          if (stopped || done.current) return
          try {
            const [hit] = await detector.detect(video.current)
            if (hit?.rawValue && /^\d{8,14}$/.test(hit.rawValue)) return handle(hit.rawValue)
          } catch { /* frame not ready yet */ }
          timer = setTimeout(tick, 250)
        }
        tick()
      } catch {
        setCamera('off') // denied, no camera, or insecure origin
      }
    })()
    return () => { stopped = true; clearTimeout(timer); stream?.getTracks().forEach(tr => tr.stop()) }
  }, [])

  const create = s => go(`/new-food/${meal}?day=${day}&barcode=${s.ean}` +
    (s.prefill?.name ? `&name=${encodeURIComponent(s.prefill.name)}` : '') + (s.prefill?.brand ? `&brand=${encodeURIComponent(s.prefill.brand)}` : ''))
  const validManual = /^\d{8,14}$/.test(manual.trim())
  const title = t('Code-barres · {meal}', { meal: mealLabel(meal) })

  if (state.step === 'missing') {
    return (
      <div className="page">
        <TopBar title={title} />
        <EmptyState icon={PackageSearch} title={t('Produit inconnu')}
          text={state.prefill.name
            ? t("« {name} » existe, mais sans valeurs nutritionnelles complètes. Recopie-les depuis l'étiquette.", { name: state.prefill.name })
            : t("Le code {ean} n'est pas encore dans la base. Ajoute-le avec les valeurs de l'étiquette.", { ean: state.ean })}
          action={<Button onClick={() => create(state)}>{t('Créer cet aliment')}</Button>} />
        <Button variant="ghost" onClick={() => { done.current = false; setState({ step: 'scan' }); setManual('') }}>{t('Scanner un autre produit')}</Button>
      </div>
    )
  }

  return (
    <div className="page">
      <TopBar title={title} />
      <div className="scanner" aria-hidden={camera !== 'on'}>
        <video ref={video} muted playsInline aria-label={t('Aperçu de la caméra')} />
        {camera === 'on' && <div className="scanner-frame" />}
      </div>
      <p className="muted" aria-live="polite">
        {state.step === 'busy' ? t('Recherche du code {ean}…', { ean: state.ean })
          : camera === 'on' ? t('Place le code-barres dans le cadre.')
          : camera === 'off' ? t('Caméra indisponible ou refusée : saisis le code imprimé sous les barres.')
          : t('Ouverture de la caméra…')}
      </p>
      {state.step === 'error' && <p className="form-error" role="alert">{t('La recherche a échoué. Vérifie ta connexion et réessaie.')}</p>}
      <form className="stack" onSubmit={e => { e.preventDefault(); if (validManual) { done.current = false; handle(manual.trim()) } }}>
        <TextField id="ean" label={t('Saisir le code')} inputMode="numeric" autoComplete="off" value={manual}
          onChange={e => setManual(e.target.value)} error={manual && !validManual ? t('8 à 14 chiffres.') : undefined} />
        <Button type="submit" variant="secondary" disabled={!validManual} loading={state.step === 'busy'}>{t('Chercher')}</Button>
      </form>
    </div>
  )
}
