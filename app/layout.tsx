import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orbit ERP',
  description: 'A modern ERP solution for small and medium businesses',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
