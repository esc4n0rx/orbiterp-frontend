"use client"

import { useEffect, useState } from "react"
import { useViewsStore } from "@/lib/stores/views-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft, FileText, Zap, Table } from "lucide-react"
import FieldRenderer from "./field-renderer"
import ActionRenderer from "./action-renderer"
import FormHandler from "./form-handler"
import WizardRenderer from "./wizard-renderer"
import DatatableRenderer from "./datatable-renderer"
import { cn } from "@/lib/utils"
import type { ViewDefinition } from "@/lib/types/views"
import { Button } from "@/components/ui/button"

interface ViewLoadProps {
  viewId?: string
  alias?: string
  identifier?: string
  className?: string
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  onBack?: () => void
}

export default function ViewLoad({ 
  viewId, 
  alias, 
  identifier,
  className,
  onSuccess,
  onError,
  onBack
}: ViewLoadProps) {
  const { fetchView, fetchViewByAlias, findView, addToRecentViews, isLoading, error } = useViewsStore()
  const [view, setView] = useState<ViewDefinition | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    const loadView = async () => {
      setLocalError(null)
      
      try {
        let loadedView: ViewDefinition | null = null
        
        if (identifier) {
          console.log('Carregando view com identifier:', identifier)
          loadedView = await findView(identifier)
        } else if (viewId) {
          loadedView = await fetchView(viewId)
        } else if (alias) {
          loadedView = await fetchViewByAlias(alias)
        } else {
          setLocalError('Identificador da view deve ser fornecido')
          return
        }

        if (loadedView) {
          setView(loadedView)
          addToRecentViews({
            id: loadedView.id,
            title: loadedView.title,
            description: loadedView.metadata?.description,
            module: loadedView.metadata?.module
          })
        }
      } catch (err: any) {
        setLocalError(err.message || 'Erro ao carregar view')
      }
    }

    if ((identifier || viewId || alias) && !view) {
      loadView()
    }
  }, [identifier, viewId, alias, fetchView, fetchViewByAlias, findView, addToRecentViews, view])

  const handleSuccess = (data: any) => {
    setLocalError(null)
    onSuccess?.(data)
  }

  const handleError = (errorMessage: string) => {
    setLocalError(errorMessage)
    onError?.(errorMessage)
  }

  const currentError = localError || error

  const getViewTypeIcon = (type: string) => {
    switch (type) {
      case 'wizard':
        return <Zap className="h-5 w-5" />
      case 'form':
        return <FileText className="h-5 w-5" />
      case 'datatable':
        return <Table className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getViewTypeBadge = (type: string) => {
    switch (type) {
      case 'wizard':
        return <Badge variant="default" className="bg-purple-600">Wizard</Badge>
      case 'form':
        return <Badge variant="secondary">Formulário</Badge>
      case 'list':
        return <Badge variant="outline">Lista</Badge>
      case 'datatable':
        return <Badge variant="default" className="bg-green-600">Tabela</Badge>
      case 'dashboard':
        return <Badge variant="default" className="bg-blue-600">Dashboard</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentError) {
    return (
      <div className={cn("space-y-4", className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{currentError}</AlertDescription>
        </Alert>
        
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}
      </div>
    )
  }

  if (!view) {
    return (
      <div className={cn("text-center py-12", className)}>
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">View não encontrada</h3>
        <p className="text-muted-foreground">
          A view solicitada não foi encontrada ou não está disponível.
        </p>
        
        {onBack && (
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}
      </div>
    )
  }

  const gridColumns = view.layout?.columns || 1
  const gridClass = `grid grid-cols-1 md:grid-cols-${gridColumns} gap-4`

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {getViewTypeIcon(view.type)}
            <h1 className="text-2xl font-bold">{view.title}</h1>
            {getViewTypeBadge(view.type)}
            {view.alias && (
              <Badge variant="outline" className="text-xs">
                {view.alias}
              </Badge>
            )}
            {view.metadata?.module && (
              <Badge variant="secondary" className="text-xs">
                {view.metadata.module}
              </Badge>
            )}
          </div>
          
          {view.metadata?.description && (
            <p className="text-muted-foreground">{view.metadata.description}</p>
          )}
          
          {view.metadata?.estimatedTime && (
            <p className="text-xs text-muted-foreground">
              Tempo estimado: {view.metadata.estimatedTime}
            </p>
          )}
        </div>

        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}
      </div>

      {/* Content based on view type */}
      {view.type === 'wizard' ? (
        <WizardRenderer
          view={view}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      ) : view.type === 'datatable' ? (
        <DatatableRenderer
          view={view}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      ) : view.type === 'form' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {view.title}
              {view.code && (
                <Badge variant="outline" className="text-xs font-mono">
                  {view.code}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormHandler
              fields={view.fields}
              apiSubmit={view.apiSubmit}
              apiValidation={view.apiValidation}
              method={view.method}
              onSuccess={handleSuccess}
              onError={handleError}
            >
              {({ formData, errors, isSubmitting, submitSuccess, submitMessage, handleFieldChange, handleSubmit, handleFieldEvent, resetForm }) => (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Fields */}
                  <div className={gridClass}>
                    {view.fields.map((field) => (
                      <FieldRenderer
                        key={field.name}
                        field={field}
                        value={formData[field.name]}
                        onChange={handleFieldChange}
                        onFieldChange={handleFieldEvent}
                        error={errors[field.name]}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  {view.actions && view.actions.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      {view.actions.map((action, index) => (
                        <ActionRenderer
                          key={index}
                          action={action}
                          isLoading={isSubmitting && action.type === 'submit'}
                          onClick={action.type === 'reset' ? resetForm : undefined}
                        />
                      ))}
                    </div>
                  )}
                </form>
              )}
            </FormHandler>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tipo de view não suportado</h3>
              <p className="text-muted-foreground">
                O tipo de view "{view.type}" ainda não foi implementado.
              </p>
              {onBack && (
                <Button variant="outline" onClick={onBack} className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}