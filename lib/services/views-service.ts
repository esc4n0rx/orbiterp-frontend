import api from './api'
import type { ViewResponse, ViewsListResponse } from '@/lib/types/views'

export const viewsService = {
  async getViews(params?: {
    module?: string
    category?: string
    type?: string
  }): Promise<ViewsListResponse> {
    try {
      const response = await api.get<ViewsListResponse>('/api/views', { params })
      return response.data
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar views'
      }
    }
  },

  async getView(viewId: string): Promise<ViewResponse> {
    try {
      const response = await api.get<ViewResponse>(`/api/views/${viewId}`)
      return response.data
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar view'
      }
    }
  },

  async getViewByAlias(alias: string): Promise<ViewResponse> {
    try {
      const response = await api.get<ViewResponse>(`/api/views/alias/${alias}`)
      return response.data
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar view'
      }
    }
  },

  async submitForm(endpoint: string, data: any, method: string = 'POST') {
    try {
      const response = await api.request({
        method,
        url: endpoint,
        data
      })
      return response.data
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Erro ao enviar formulário'
      }
    }
  },

  async validateField(endpoint: string, data: any) {
    try {
      const response = await api.post(endpoint, data)
      return response.data
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Erro na validação'
      }
    }
  },

  async fetchData(endpoint: string) {
    try {
      const response = await api.get(endpoint)
      return response.data
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar dados'
      }
    }
  },

  // Integração com ViaCEP
  async getAddressByCep(cep: string) {
    try {
      const cleanCep = cep.replace(/\D/g, '')
      if (cleanCep.length !== 8) {
        throw new Error('CEP inválido')
      }
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        throw new Error('CEP não encontrado')
      }
      
      return {
        success: true,
        data: {
          endereco: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf
        }
      }
    } catch (error: any) {
      throw {
        success: false,
        message: error.message || 'Erro ao buscar CEP'
      }
    }
  }
}