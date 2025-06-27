"use client"

import { useState, useEffect } from "react"
import LoginScreen from "@/components/login-screen"
import Dashboard from "@/components/dashboard"
import { ThemeProvider } from "@/components/theme-provider"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function Home() {
  const { isAuthenticated, user, initializeAuth, logout } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    initializeAuth()
    setIsInitialized(true)
  }, [initializeAuth])

  const handleLogin = (userData: { name: string; initials: string; environment: string }) => {
    // Login já foi processado pelo store, apenas fechar a tela de login
    console.log('Login successful:', userData)
  }

  const handleLogout = async () => {
    await logout()
  }

  // Aguardar inicialização para evitar flash
  if (!isInitialized) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true} disableTransitionOnChange={false}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true} disableTransitionOnChange={false}>
      <div className="min-h-screen bg-background transition-colors duration-300">
        {!isAuthenticated ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <Dashboard 
            user={{
              name: user?.nome || 'Usuário',
              initials: user?.nome?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
              environment: 'production' // Pode ser dinâmico posteriormente
            }} 
            onLogout={handleLogout} 
          />
        )}
      </div>
    </ThemeProvider>
  )
}