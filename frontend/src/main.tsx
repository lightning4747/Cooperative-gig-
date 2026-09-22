import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import './i18n'
import './index.css'
import App from './App.tsx'

// Purge any stale mock items from localStorage so only real backend state is used
if (typeof window !== 'undefined') {
  ['coop_gig_jobs_v2', 'coop_gig_workers_v2', 'coop_gig_welfare_v2', 'coop_gig_ratings_v2'].forEach((k) => {
    try {
      const raw = localStorage.getItem(k)
      if (raw && (raw.includes('job-101') || raw.includes('wrk-ramesh-kumar') || raw.includes('WLF-BLR-01'))) {
        localStorage.removeItem(k)
      }
    } catch {}
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
