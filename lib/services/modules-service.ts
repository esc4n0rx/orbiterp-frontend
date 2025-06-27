import api from './api'
import type { ModulesResponse, Module } from '@/lib/types/modules'

export const modulesService = {
  async getModules(): Promise<ModulesResponse> {
    try {
      const response = await api.get<ModulesResponse>('/api/modules')
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar módulos:', error)
      throw {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar módulos'
      }
    }
  },

  async getModule(moduleName: string): Promise<{ success: boolean; data: { module: Module; views: any[] } }> {
    try {
      const response = await api.get(`/api/modules/${moduleName}`)
      return response.data
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar módulo'
      }
    }
  }
}