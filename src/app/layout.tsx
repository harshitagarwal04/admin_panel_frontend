import type { Metadata } from 'next'
import { Inter, Lexend } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/contexts/QueryProvider'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const lexend = Lexend({ 
  subsets: ['latin'],
  variable: '--font-lexend'
})

export const metadata: Metadata = {
  title: 'ConversAI Labs Admin Panel',
  description: 'Admin panel for managing ConversAI Labs sales agents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${lexend.variable}`}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}