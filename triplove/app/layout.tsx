import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { DataProvider } from '@/context/DataContext'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TripLove 💕',
  description: 'Plan your trips together',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={geist.className} style={{ margin: 0, padding: 0, background: '#d0efff', minHeight: '100vh' }}>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  )
}