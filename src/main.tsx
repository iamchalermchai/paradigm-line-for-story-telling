import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (thai + latin subsets) so nothing loads from a CDN and PNG
// export renders the real typefaces instead of a fallback.
import '@fontsource/trirong/latin-400.css'
import '@fontsource/trirong/latin-600.css'
import '@fontsource/trirong/latin-700.css'
import '@fontsource/trirong/thai-400.css'
import '@fontsource/trirong/thai-600.css'
import '@fontsource/trirong/thai-700.css'
import '@fontsource/noto-sans-thai/latin-400.css'
import '@fontsource/noto-sans-thai/latin-600.css'
import '@fontsource/noto-sans-thai/latin-700.css'
import '@fontsource/noto-sans-thai/thai-400.css'
import '@fontsource/noto-sans-thai/thai-600.css'
import '@fontsource/noto-sans-thai/thai-700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
