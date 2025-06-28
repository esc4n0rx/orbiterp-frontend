"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText } from "lucide-react"
import type { SearchResult } from "@/lib/types/views"

interface SearchResultsProps {
  results: SearchResult[]
  onSelect: (result: SearchResult) => void
  emptyMessage?: string
  showAs?: 'list' | 'grid' | 'table'
  isLoading?: boolean
}

export default function SearchResults({
  results,
  onSelect,
  emptyMessage = "Nenhum resultado encontrado",
  showAs = 'list',
  isLoading = false
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum resultado</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  if (showAs === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result) => (
          <Card 
            key={result.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelect(result)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium truncate">{result.title}</h4>
                  {result.badge && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      {result.badge}
                    </Badge>
                  )}
                </div>
                {result.subtitle && (
                  <p className="text-sm text-muted-foreground truncate">
                    {result.subtitle}
                  </p>
                )}
                {result.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {result.description}
                  </p>
                )}
                {result.meta && (
                  <Badge variant="outline" className="text-xs">
                    {result.meta}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <Card 
          key={result.id} 
          className="cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => onSelect(result)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium truncate">{result.title}</h4>
                  {result.badge && (
                    <Badge 
                      variant={result.badge === 'ATIVO' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {result.badge}
                    </Badge>
                  )}
                </div>
                
                {result.subtitle && (
                  <p className="text-sm text-muted-foreground mb-1 truncate">
                    {result.subtitle}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {result.description && (
                    <span>{result.description}</span>
                  )}
                  {result.meta && (
                    <Badge variant="outline" className="text-xs">
                      {result.meta}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}