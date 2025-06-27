export interface Module {
  name: string
  title: string
  description: string
  version: string
  icon: string
  color: string
  category: string
  viewCount: number
  routeCount: number
}

export interface ModulesResponse {
  success: boolean
  data: {
    modules: Module[]
    total: number
  }
}