import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { authService } from '@/lib/services/api'
import type { AuthState, LoginRequest, User } from '@/lib/types/auth'

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        initializeAuth: () => {
          const token = localStorage.getItem('orbit-token')
          const userStr = localStorage.getItem('orbit-user')
          
          if (token && userStr) {
            try {
              const user: User = JSON.parse(userStr)
              set({
                token,
                user,
                isAuthenticated: true,
                error: null
              })
            } catch (error) {
              // Se dados corrompidos, limpar
              localStorage.removeItem('orbit-token')
              localStorage.removeItem('orbit-user')
            }
          }
        },

        login: async (credentials: LoginRequest) => {
          set({ isLoading: true, error: null })
          
          try {
            const response = await authService.login(credentials)
            
            if (response.success) {
              const { token, user } = response.data
              
              // Persistir no localStorage
              localStorage.setItem('orbit-token', token)
              localStorage.setItem('orbit-user', JSON.stringify(user))
              
              set({
                token,
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null
              })
            } else {
              throw { message: response.message }
            }
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Erro no login'
            })
            throw error
          }
        },

        logout: async () => {
          set({ isLoading: true })
          
          try {
            await authService.logout()
          } catch (error) {
            console.warn('Erro no logout:', error)
          } finally {
            // Sempre limpar dados locais
            localStorage.removeItem('orbit-token')
            localStorage.removeItem('orbit-user')
            
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
          }
        },

        clearError: () => {
          set({ error: null })
        }
      }),
      {
        name: 'orbit-auth',
        partialize: (state) => ({
          // Não persistir dados sensíveis no zustand persist
          // Usar localStorage diretamente para maior controle
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
)