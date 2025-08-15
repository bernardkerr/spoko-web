import { IBM_Plex_Mono } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import '@/styles/globals.css'
import '@/styles/theme-shim.css'
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
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </RadixThemeProvider>
      </body>
    </html>
  )
}
