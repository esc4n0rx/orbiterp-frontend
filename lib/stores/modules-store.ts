import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { modulesService } from '@/lib/services/modules-service'
import type { Module } from '@/lib/types/modules'

interface ModulesState {
  modules: Module[]
  isLoading: boolean
  error: string | null
  fetchModules: () => Promise<void>
  clearError: () => void
}

export const useModulesStore = create<ModulesState>()(
  devtools(
    (set, get) => ({
      modules: [],
      isLoading: false,
      error: null,

      fetchModules: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await modulesService.getModules()
          
          if (response.success) {
            set({
              modules: response.data.modules,
              isLoading: false,
              error: null
            })
          } else {
            throw new Error('Erro ao carregar módulos')
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro ao carregar módulos'
          })
        }
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'modules-store',
    }
  )
)