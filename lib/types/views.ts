export interface ViewField {
  label: string
  name: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'date' | 'time' | 'datetime-local'
  required?: boolean
  placeholder?: string
  value?: any
  options?: Array<{ label: string; value: any }>
  validation?: {
    pattern?: string
    message?: string
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
  }
  onChange?: string // Nome do evento onChange
  mask?: string
  readonly?: boolean
  hidden?: boolean
  className?: string
  grid?: {
    cols?: number
    span?: number
  }
}

export interface ViewAction {
  type: 'submit' | 'button' | 'link' | 'reset'
  label: string
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: string
  href?: string
  target?: string
  className?: string
}

export interface ViewDefinition {
  id: string
  title: string
  alias?: string
  code?: string
  type: 'form' | 'list' | 'detail' | 'dashboard'
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  apiSubmit?: string
  apiData?: string
  apiValidation?: string
  auth: boolean
  fields: ViewField[]
  actions: ViewAction[]
  layout?: {
    type?: 'grid' | 'flex' | 'stack'
    columns?: number
    gap?: number
  }
  theme?: {
    primaryColor?: string
    backgroundColor?: string
  }
  metadata?: {
    module?: string
    category?: string
    description?: string
    version?: string
  }
}

export interface ViewResponse {
  success: boolean
  data: {
    view: ViewDefinition
  }
}

export interface ViewsListResponse {
  success: boolean
  data: {
    views: Array<{
      id: string
      title: string
      alias?: string
      code?: string
      type: string
      module: string
      category: string
      description?: string
    }>
    total: number
    modules: string[]
  }
}