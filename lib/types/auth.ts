export interface User {
  id: number
  nome: string
  email: string
  role: string
}

export interface LoginRequest {
  user: string
  senha: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: User
  }
}

export interface ApiError {
  success: false
  message: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  initializeAuth: () => void
  clearError: () => void
  error: string | null
}