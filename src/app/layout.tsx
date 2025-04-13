import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Project Manager',
  description: 'Manage your projects efficiently'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-900" suppressHydrationWarning>
      <body className={`${inter.className} h-full`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
} 