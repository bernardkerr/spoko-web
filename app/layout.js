import { IBM_Plex_Mono } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import '@/styles/globals.css'
import '@radix-ui/themes/styles.css'
import RadixThemeProvider from '@/components/providers/RadixThemeProvider'

const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400','500','600','700'] })

export const metadata = {
  title: 'SPOKO',
  description: 'SPOKO site',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={ibmPlexMono.className}>
        <RadixThemeProvider>
          <div className="app-root">
            <Navbar />
            <main className="app-main">{children}</main>
            <Footer />
          </div>
        </RadixThemeProvider>
      </body>
    </html>
  )
}
