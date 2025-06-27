import axios, { AxiosInstance } from 'axios'
import type { LoginRequest, LoginResponse, ApiError } from '@/lib/types/auth'

// Configuração base do axios
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptador para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('orbit-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptador para lidar com respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - limpar autenticação
      localStorage.removeItem('orbit-token')
      localStorage.removeItem('orbit-user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Serviços de autenticação
export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/api/login', credentials)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ApiError
      }
      throw {
        success: false,
        message: 'Erro de conexão com o servidor'
      } as ApiError
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/logout')
    } catch (error) {
      // Mesmo com erro, limpar dados locais
      console.warn('Erro no logout:', error)
    }
  },

  async checkHealth(): Promise<boolean> {
    try {
      const response = await api.get('/health')
      return response.data.success === true
    } catch (error) {
      return false
    }
  }
}

export default api