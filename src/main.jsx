import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import DesignPage from './DesignPage.jsx'
import { sharedLink } from './lib.js'
import '../replica/design/tokens.css'
import './ui.css'

// Android share sheet (manifest share_target) opens ./?share=1&title=…&text=…&url=…; hash routes can't take that
// query, so move the link into #/import and drop the query from the address bar.
const params = new URLSearchParams(location.search)
if (params.has('share')) {
  const link = sharedLink(params)
  history.replaceState(null, '', `${location.pathname}#/import${link ? `?link=${encodeURIComponent(link)}` : ''}`)
}

const Root = params.has('design') ? DesignPage : App
createRoot(document.getElementById('root')).render(<Root />)
