import type { Metadata } from 'next'
import { Indie_Flower, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const indieFlower = Indie_Flower({
  subsets: ['latin'],
  variable: '--font-indie-flower',
  weight: ['400']
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  weight: ['400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  title: 'Çiftopia - Çiftlerin Özel Dijital Alanı',
  description: 'Anılarınızı biriktirin, şiirlerinizi yazın ve size özel dijital dünyanızı oluşturun.',
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/favicon/site.webmanifest'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${indieFlower.className} ${playfairDisplay.variable} ${indieFlower.variable}`} suppressHydrationWarning>
        {children}
        <Toaster position="top-right" expand={false} visibleToasts={5} />
      </body>
    </html>
  )
}
