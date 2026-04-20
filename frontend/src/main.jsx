import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import AppRouter from './routes/AppRouter.jsx'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#FBF9E7',
          color: '#1f2937',
          border: '1px solid #cde8f4',
          fontSize: '13px'
        }
      }} />
    </QueryClientProvider>
  </StrictMode>
)
