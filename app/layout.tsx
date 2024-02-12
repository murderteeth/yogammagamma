import type { Metadata } from 'next'
import { Providers } from './providers'
import { JetBrains_Mono } from 'next/font/google'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'yo𝛄𝛄',
  description: 'claim rewards on yearn gamma strategies',
}

const inter = JetBrains_Mono({ subsets: ['latin'] })

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export default RootLayout
