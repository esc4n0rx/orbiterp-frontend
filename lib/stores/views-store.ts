import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { viewsService } from '@/lib/services/views-service'
import type { ViewDefinition } from '@/lib/types/views'

interface ViewsState {
  views: Record<string, ViewDefinition>
  recentViews: Array<{
    id: string
    title: string
    description?: string
    lastAccessed: string
    module?: string
  }>
  isLoading: boolean
  error: string | null
  fetchView: (viewId: string) => Promise<ViewDefinition | null>
  fetchViewByAlias: (alias: string) => Promise<ViewDefinition | null>
  findView: (identifier: string) => Promise<ViewDefinition | null>
  addToRecentViews: (view: { id: string; title: string; description?: string; module?: string }) => void
  clearError: () => void
}

export const useViewsStore = create<ViewsState>()(
  devtools(
    (set, get) => ({
      views: {},
      recentViews: [],
      isLoading: false,
      error: null,

      fetchView: async (viewId: string) => {
        const { views } = get()
        
        // Retorna do cache se já existe
        if (views[viewId]) {
          return views[viewId]
        }

        set({ isLoading: true, error: null })
        
        try {
          const response = await viewsService.getView(viewId)
          
          if (response.success) {
            const view = response.data.view
            set((state) => ({
              views: { ...state.views, [viewId]: view },
              isLoading: false,
              error: null
            }))
            return view
          } else {
            throw new Error('View não encontrada')
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro ao carregar view'
          })
          return null
        }
      },

      fetchViewByAlias: async (alias: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await viewsService.getViewByAlias(alias)
          
          if (response.success) {
            const view = response.data.view
            set((state) => ({
              views: { ...state.views, [view.id]: view },
              isLoading: false,
              error: null
            }))
            return view
          } else {
            throw new Error('View não encontrada')
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro ao carregar view'
          })
          return null
        }
      },

      findView: async (identifier: string) => {
        const { views } = get()
        
        // Primeiro verifica se já existe no cache (por ID)
        if (views[identifier]) {
          return views[identifier]
        }

        // Verifica se existe no cache por alias
        const cachedView = Object.values(views).find(view => view.alias === identifier)
        if (cachedView) {
          return cachedView
        }

        set({ isLoading: true, error: null })
        
        try {
          const response = await viewsService.findView(identifier)
          
          if (response.success) {
            const view = response.data.view
            set((state) => ({
              views: { ...state.views, [view.id]: view },
              isLoading: false,
              error: null
            }))
            return view
          } else {
            throw new Error('View não encontrada')
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro ao carregar view'
          })
          return null
        }
      },

      addToRecentViews: (view) => {
        set((state) => {
          const existingIndex = state.recentViews.findIndex(rv => rv.id === view.id)
          const newRecentView = {
            ...view,
            lastAccessed: new Date().toISOString()
          }
          
          let newRecentViews = [...state.recentViews]
          
          if (existingIndex >= 0) {
            // Remove existing and add to beginning
            newRecentViews.splice(existingIndex, 1)
          }
          
          // Add to beginning and limit to 10
          newRecentViews.unshift(newRecentView)
          newRecentViews = newRecentViews.slice(0, 10)
          
          return { recentViews: newRecentViews }
        })
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'views-store',
    }
  )
)