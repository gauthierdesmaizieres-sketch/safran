import { Hammer } from 'lucide-react'
import { EmptyState } from '../ui.jsx'
import { t } from '../i18n.js'

export default function Stub({ title, ids }) {
  return (
    <div className="page">
      <h1>{title}</h1>
      <EmptyState icon={Hammer} title={t('Pas encore construit')} text={t('Écrans {ids}, prévus après le parcours principal.', { ids })} />
    </div>
  )
}
