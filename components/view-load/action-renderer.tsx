"use client"

import { Button } from "@/components/ui/button"
import { 
  Save, Send, Plus, Edit, Trash2, Download, Upload, 
  Settings, Search, RefreshCw, ArrowLeft, ArrowRight,
  Check, X, Home, ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewAction } from "@/lib/types/views"

interface ActionRendererProps {
  action: ViewAction
  onClick?: () => void
  isLoading?: boolean
}

const getActionIcon = (iconName?: string) => {
  if (!iconName) return null
  
  const icons: Record<string, any> = {
    save: Save,
    send: Send,
    plus: Plus,
    edit: Edit,
    trash: Trash2,
    'trash-2': Trash2,
    download: Download,
    upload: Upload,
    settings: Settings,
    search: Search,
    refresh: RefreshCw,
    'arrow-left': ArrowLeft,
    'arrow-right': ArrowRight,
    check: Check,
    x: X,
    home: Home,
    'external-link': ExternalLink
  }
  
  return icons[iconName] || null
}

const getButtonVariant = (color?: string, variant?: string) => {
  if (variant) return variant as any
  
  switch (color) {
    case 'primary':
      return 'default'
    case 'secondary':
      return 'secondary'
    case 'success':
      return 'default'
    case 'warning':
      return 'outline'
    case 'danger':
      return 'destructive'
    default:
      return 'default'
  }
}

export default function ActionRenderer({ 
  action, 
  onClick, 
  isLoading = false 
}: ActionRendererProps) {
  const Icon = getActionIcon(action.icon)
  const variant = getButtonVariant(action.color, action.variant)
  
  const handleClick = () => {
    if (action.disabled || isLoading) return
    
    console.log('ActionRenderer handleClick:', action.type, action)
    
    if (action.type === 'link' && action.href) {
      if (action.target === '_blank') {
        window.open(action.href, '_blank')
      } else {
        window.location.href = action.href
      }
      return
    }
    
    if (onClick) {
      onClick()
    }
  }

  // Para ações do tipo fetch ou button, sempre use type="button"
  const buttonType: "submit" | "button" | "reset" = (action.type === 'submit') ? 'submit' : 'button'

  const buttonProps = {
    type: buttonType,
    variant,
    size: action.size || 'default',
    disabled: action.disabled || isLoading,
    onClick: buttonType === 'button' ? handleClick : undefined,
    className: cn(action.className)
  }

  return (
    <Button {...buttonProps}>
      {isLoading && (action.type === 'submit' || action.type === 'fetch') ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        Icon && <Icon className="h-4 w-4 mr-2" />
      )}
      {isLoading && action.loadingText ? action.loadingText : action.label}
    </Button>
  )
}