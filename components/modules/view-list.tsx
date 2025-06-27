"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, Eye } from "lucide-react"

interface ViewItem {
  id: string
  title: string
  alias?: string
  code?: string
  type: string
  category: string
  description?: string
}

interface ViewListProps {
  views: ViewItem[]
  onViewSelect: (viewId: string, title: string, alias?: string) => void
  isLoading?: boolean
}

export default function ViewList({ views, onViewSelect, isLoading }: ViewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (views.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma view encontrada</h3>
        <p className="text-muted-foreground">
          Este módulo não possui views disponíveis no momento.
        </p>
      </div>
    )
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'form':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'list':
        return 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'dashboard':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'detail':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-4">
      {views.map((view) => (
        <Card 
          key={view.id} 
          className="hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => onViewSelect(view.id, view.title, view.alias)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  <FileText className="h-4 w-4" />
                  {view.title}
                  {view.alias && (
                    <Badge variant="outline" className="text-xs">
                      {view.alias}
                    </Badge>
                  )}
                </CardTitle>
                {view.code && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {view.code}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(view.type)}>
                  {view.type}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewSelect(view.id, view.title, view.alias)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {view.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {view.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {view.category}
              </Badge>
              
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}