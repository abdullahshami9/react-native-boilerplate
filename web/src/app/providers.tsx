'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { SocketProvider } from '@/context/SocketContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
