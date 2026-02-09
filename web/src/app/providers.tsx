'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
