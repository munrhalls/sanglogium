import type { Metadata } from 'next'
import './../globals.css'

export const metadata: Metadata = {
  title: 'Queue Skeleton Test',
  description: 'E2E test page for checkout queue skeleton',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
