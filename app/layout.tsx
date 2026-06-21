import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono, Cairo } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { MobileTabBar } from '@/components/mobile-tab-bar'
import { SplashScreen } from '@/components/splash-screen'
import { Toaster } from 'sonner'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const cairo = Cairo({ variable: '--font-cairo', subsets: ['arabic', 'latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Zyncleen — Ménage à domicile & nettoyage professionnel à Dijon',
  description:
    "Ménage à domicile avec crédit d'impôt de 50 %, remise en état, nettoyage de vitres, canapés, terrasses et bureaux à Dijon. Un seul prestataire pour tout nettoyer. Devis gratuit.",
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#16233a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${cairo.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased pb-16 lg:pb-0">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <I18nProvider>
            <SplashScreen />
            {children}
            <MobileTabBar />
            <Toaster richColors position="top-right" />
          </I18nProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
