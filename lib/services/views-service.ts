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
      console.log('Buscando view por alias:', alias)
      const response = await api.get<ViewResponse>(`/api/views/alias/${alias}`)
      console.log('Resposta da API:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar view por alias:', error)
      throw {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar view'
      }
    }
  },

  // Método inteligente que tenta buscar por ID ou alias automaticamente
  async findView(identifier: string): Promise<ViewResponse> {
    try {
      console.log('Tentando encontrar view:', identifier)
      
      // Primeiro tenta como ID (se começa com v- ou tem formato de ID)
      if (identifier.startsWith('v-') || identifier.length > 10) {
        try {
          const response = await this.getView(identifier)
          console.log('Encontrada como ID:', response)
          return response
        } catch (error) {
          console.log('Não encontrada como ID, tentando como alias...')
        }
      }

      // Tenta como alias
      try {
        const response = await this.getViewByAlias(identifier)
        console.log('Encontrada como alias:', response)
        return response
      } catch (error) {
        console.log('Não encontrada como alias')
      }

      // Se não encontrou de nenhuma forma, tenta como ID novamente
      if (!identifier.startsWith('v-') && identifier.length <= 10) {
        try {
          const response = await this.getView(identifier)
          console.log('Encontrada como ID (segunda tentativa):', response)
          return response
        } catch (error) {
          console.log('Não encontrada como ID (segunda tentativa)')
        }
      }

      throw new Error('View não encontrada')
    } catch (error: any) {
      console.error('Erro na busca da view:', error)
      throw {
        success: false,
        message: error.message || 'View não encontrada'
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
  },

  // Validações específicas para campos
  async validateEmail(email: string) {
    try {
      const response = await api.post('/api/validate/email', { email })
      return response.data
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Erro na validação de email'
      }
    }
  },

  async validateUsername(username: string) {
    try {
      const response = await api.post('/api/validate/username', { username })
      return response.data
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Erro na validação de username'
      }
    }
  },

  async validateCPF(cpf: string) {
    try {
      const response = await api.post('/api/validate/cpf', { cpf })
      return response.data
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Erro na validação de CPF'
      }
    }
  }
}