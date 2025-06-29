export interface ViewField {
  label: string
  name: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'date' | 'time' | 'datetime-local' | 'json'
  required?: boolean
  placeholder?: string
  value?: any
  default?: any
  help?: string
  options?: Array<{ 
    label: string
    value: any
    description?: string
    color?: string
    restricted?: boolean
  }>
  validation?: {
    pattern?: string
    message?: string
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    cpf?: boolean
    phone?: boolean
    strength?: boolean
  }
  onChange?: string | {
    debounce?: number
    validation?: string
    fetch?: string
    mapResult?: Record<string, string>
    onError?: string
  }
  mask?: string
  readonly?: boolean
  hidden?: boolean
  advanced?: boolean
  className?: string
  rows?: number
  minLength?: number
  maxLength?: number
  showStrength?: boolean
  conditional?: {
    field: string
    value: any
    show: string
  }
  grid?: {
    cols?: number
    span?: number
    xs?: number
    md?: number
  }
}

export interface ViewAction {
  type: 'submit' | 'button' | 'link' | 'reset' | 'fetch' | 'delete' | 'dropdown'
  label: string
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  successMessage?: string
  onClick?: string | {
    action?: string
    navigate?: string
    nextStep?: string
    confirm?: ConfirmationConfig
    modal?: string
    api?: string
    method?: string
    params?: Record<string, string>
    data?: any
  }
  href?: string
  target?: string
  className?: string
  api?: string
  method?: string
  mapFields?: Record<string, string>
  mapResult?: Record<string, string>
  showResultsAs?: 'list' | 'grid' | 'table'
  emptyMessage?: string
  onSelect?: {
    action: string
    nextStep?: string
  }
  onSuccess?: {
    navigate?: string
    delay?: number
  }
  confirm?: ConfirmationConfig
  tooltip?: string
  condition?: string
  items?: Array<{
    label: string
    icon?: string
    color?: string
    onClick?: any
    condition?: string
  }>
}

export interface ConfirmationConfig {
  title: string
  message: string
  confirmText: string
  cancelText: string
  type?: 'danger' | 'warning' | 'info'
}

export interface WizardStep {
  id: string
  title: string
  description?: string
  icon?: string
  fields?: string[]
  tabs?: Array<{
    id: string
    label: string
    icon?: string
    fields: string[]
  }>
  actions: ViewAction[]
}

// **NEW: Interfaces para datatable**
export interface DatatableColumn {
  key: string
  label: string
  type: string
  sortable?: boolean
  searchable?: boolean
  width?: number
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  sticky?: 'left' | 'right'
  render?: {
    type: 'text' | 'badge' | 'avatar' | 'link' | 'code' | 'mask' | 'datetime' | 'indicator' | 'actions'
    mapping?: Record<string, { label: string; color: string; icon?: string }>
    href?: string
    mask?: string
    format?: string
    placeholder?: string
  }
}

export interface DatatableFilter {
  label: string
  name: string
  type: 'text' | 'select' | 'date' | 'number'
  placeholder?: string
  options?: Array<{ value: string; label: string; color?: string }>
  debounce?: number
  grid?: {
    xs?: number
    md?: number
  }
}

export interface ViewDefinition {
  id: string
  title: string
  alias?: string
  code?: string
  type: 'form' | 'list' | 'detail' | 'dashboard' | 'wizard' | 'datatable'
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  apiSubmit?: string
  apiData?: string
  apiValidation?: string
  apiSearch?: string
  apiDelete?: string
  apiExport?: string
  apiBatch?: string
  auth: boolean
  fields: ViewField[]
  actions?: ViewAction[]
  steps?: WizardStep[]
  
  // **NEW: Propriedades específicas do datatable**
  filters?: DatatableFilter[]
  columns?: DatatableColumn[]
  rowActions?: ViewAction[]
  bulkActions?: ViewAction[]
  pagination?: {
    enabled: boolean
    pageSize: number
    pageSizeOptions: number[]
    showTotal?: boolean
    showQuickJumper?: boolean
  }
  sorting?: {
    enabled: boolean
    multiple?: boolean
    defaultSort?: {
      column: string
      direction: 'asc' | 'desc'
    }
  }
  selection?: {
    enabled: boolean
    type: 'checkbox' | 'radio'
    selectAll?: boolean
    preserveSelection?: boolean
  }
  export?: {
    enabled: boolean
    formats: string[]
    filename: string
    api: string
  }
  refresh?: {
    enabled: boolean
    interval?: number
    showButton?: boolean
  }
  emptyState?: {
    title: string
    description: string
    icon: string
    actions: ViewAction[]
  }
  
  layout?: {
    type?: 'grid' | 'flex' | 'stack'
    columns?: number
    gap?: number
    responsive?: boolean
    spacing?: 'small' | 'medium' | 'large'
    showFilters?: boolean
    showSearch?: boolean
    showExport?: boolean
    showRefresh?: boolean
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
    icon?: string
    color?: string
    tags?: string[]
    lastModified?: string
    estimatedTime?: string
  }
  permissions?: {
    required?: string[]
    forbidden?: string[]
  }
  behaviors?: {
    autoSave?: boolean
    validateOnBlur?: boolean
    showProgress?: boolean
    confirmBeforeLeave?: boolean
    resetAfterSubmit?: boolean
    autoRefresh?: boolean
    preserveFilters?: boolean
    rememberPageSize?: boolean
    rememberSort?: boolean
    stickyHeader?: boolean
    virtualScrolling?: boolean
  }
  notifications?: {
    success?: NotificationConfig
    error?: NotificationConfig
    delete?: NotificationConfig
  }
}

export interface NotificationConfig {
  title: string
  message: string
  duration?: number
}

export interface SearchResult {
  id: string
  title: string
  subtitle?: string
  description?: string
  badge?: string
  meta?: string
  [key: string]: any
}

export interface UserSearchResponse {
  success: boolean
  data: {
    users: Array<{
      id: number
      nome: string
      email: string
      username: string
      cpf: string
      role: string
      status: string
      statusLogin?: string
      createdAt: string
      [key: string]: any
    }>
    total: number
  }
}

export interface ViewResponse {
  success: boolean
  data: {
    view: ViewDefinition
  }
  message?: string
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