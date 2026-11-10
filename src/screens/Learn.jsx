// Fiches nutrition : #/learn (liste) et #/learn/:id (fiche). Contenu dans src/sheets.js.
import { ChevronRight } from 'lucide-react'
import { NutritionLabel } from '../ui.jsx'
import { LANG, t } from '../i18n.js'
import { SHEETS, sheet } from '../sheets.js'
import TopBar from './TopBar.jsx'

const Note = () => (
  <p className="muted">
    {LANG !== 'fr' && <>{t('Ces fiches sont rédigées en français.')} </>}
    {t("Informations générales, qui ne remplacent pas l'avis d'un médecin ou d'un diététicien.")}
  </p>
)

export default function Learn({ sheetId }) {
  if (!sheetId) {
    return (
      <div className="page">
        <TopBar title={t('Comprendre la nutrition')} />
        <ul className="sheet-list">
          {SHEETS.map(s => (
            <li key={s.id}>
              <a className="card sheet-link" href={`#/learn/${s.id}`}>
                <span><strong>{s.title}</strong><span className="muted">{s.summary}</span></span>
                <ChevronRight size={20} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <Note />
      </div>
    )
  }

  const s = sheet(sheetId)
  if (!s) {
    return (
      <div className="page">
        <TopBar title={t('Comprendre la nutrition')} />
        <p role="alert">{t('Cette fiche n\'existe pas.')} <a href="#/learn">{t('Voir toutes les fiches')}</a></p>
      </div>
    )
  }
  return (
    <article className="page sheet" lang="fr">
      <TopBar title={s.title} />
      <p className="sheet-lead">{s.summary}</p>
      <section className="card">
        <NutritionLabel caption={t('Repères')} rows={s.facts.map(([k, v]) => [k, v, ''])} />
      </section>
      {s.sections.map(sec => (
        <section key={sec.h} className="stack">
          <h2>{sec.h}</h2>
          {sec.body.map((b, i) => Array.isArray(b)
            ? <ul key={i}>{b.map(li => <li key={li}>{li}</li>)}</ul>
            : <p key={i}>{b}</p>)}
        </section>
      ))}
      <section className="stack">
        <h2>{t('Sources')}</h2>
        <ol className="sheet-sources">
          {s.sources.map(src => <li key={src.label}>{src.url ? <a href={src.url} target="_blank" rel="noreferrer">{src.label}</a> : src.label}</li>)}
        </ol>
      </section>
      <Note />
      <a href="#/learn">{t('Voir toutes les fiches')}</a>
    </article>
  )
}
