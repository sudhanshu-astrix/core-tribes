import type { AppProps } from 'next/app'
import { ThemeProvider } from '../components/providers/ThemeProvider'
import { AppLayout } from '../components/layout/AppLayout'
import '../app/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </ThemeProvider>
  )
} 