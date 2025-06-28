"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { viewsService } from "@/lib/services/views-service"
import FieldRenderer from "./field-renderer"
import ActionRenderer from "./action-renderer"
import SearchResults from "./search-results"
import TabbedForm from "./tabbed-form"
import ConfirmationDialog from "./confirmation-dialog"
import FormHandler from "./form-handler"
import type { ViewDefinition, WizardStep, SearchResult, ConfirmationConfig } from "@/lib/types/views"
import React from "react"

interface WizardRendererProps {
  view: ViewDefinition
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export default function WizardRenderer({ view, onSuccess, onError }: WizardRendererProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchFormData, setSearchFormData] = useState<Record<string, any>>({})
  const [searchError, setSearchError] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    config: ConfirmationConfig
    onConfirm: () => void
  }>({ open: false, config: {} as ConfirmationConfig, onConfirm: () => {} })

  const currentStep = view.steps?.[currentStepIndex]
  const progress = view.steps ? ((currentStepIndex + 1) / view.steps.length) * 100 : 0

  const getStepFields = (step: WizardStep) => {
    if (!step.fields) return []
    return view.fields.filter(field => step.fields!.includes(field.name))
  }

  const getAllStepFields = (step: WizardStep) => {
    const directFields = step.fields || []
    const tabFields = step.tabs?.flatMap(tab => tab.fields) || []
    return [...directFields, ...tabFields]
  }

  const nextStep = () => {
    if (currentStepIndex < (view.steps?.length || 1) - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  // Validação específica para busca - permite pelo menos um campo preenchido
  const validateSearchForm = (formData: Record<string, any>) => {
    const nome = formData.searchNome?.trim()
    const cpf = formData.searchCpf?.trim()
    
    if (!nome && !cpf) {
      return "Preencha pelo menos um campo: Nome ou CPF"
    }
    
    return null
  }

  const handleSearch = async (searchData?: Record<string, any>) => {
    const dataToSearch = searchData || searchFormData
    
    // Validação específica para busca
    const validationError = validateSearchForm(dataToSearch)
    if (validationError) {
      setSearchError(validationError)
      return
    }

    if (!view.apiSearch) {
      onError?.('Endpoint de busca não configurado')
      return
    }

    console.log('Executando busca com dados:', dataToSearch)
    setSearchError(null)
    setIsSearching(true)
    
    try {
      // Filtrar campos vazios para enviar apenas os preenchidos
      const filteredData = Object.entries(dataToSearch).reduce((acc, [key, value]) => {
        if (value && value.toString().trim()) {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, any>)

      console.log('Dados filtrados para busca:', filteredData)
      
      const response = await viewsService.submitForm(view.apiSearch, filteredData, 'POST')
      console.log('Resposta da busca:', response)
      
      if (response.success && response.data?.results) {
        setSearchResults(response.data.results)
        console.log('Resultados encontrados:', response.data.results.length)
      } else {
        setSearchResults([])
        console.log('Nenhum resultado encontrado')
      }
    } catch (error: any) {
      console.error('Erro na busca:', error)
      setSearchError(error.message || 'Erro na busca')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectUser = async (result: SearchResult) => {
    if (!view.apiData) return

    try {
      const apiUrl = view.apiData.replace(':id', result.id)
      const response = await viewsService.fetchData(apiUrl)
      
      if (response.success) {
        setSelectedUser(response.data)
        nextStep()
      } else {
        throw new Error('Erro ao carregar dados do usuário')
      }
    } catch (error: any) {
      onError?.(error.message || 'Erro ao carregar usuário')
    }
  }

  const handleActionClick = async (action: any, formData?: Record<string, any>) => {
    console.log('Ação clicada:', action.type, action, formData)

    // Handle fetch action (busca)
    if (action.type === 'fetch') {
      if (formData) {
        await handleSearch(formData)
      } else {
        await handleSearch(searchFormData)
      }
      return
    }

    if (action.onClick) {
      if (typeof action.onClick === 'string') {
        if (action.onClick === 'previousStep') {
          previousStep()
          return
        }
      } else if (typeof action.onClick === 'object') {
        if (action.onClick.action === 'previousStep') {
          previousStep()
          return
        }
        
        if (action.onClick.confirm) {
          setConfirmDialog({
            open: true,
            config: action.onClick.confirm,
            onConfirm: () => {
              setConfirmDialog(prev => ({ ...prev, open: false }))
              if (action.onClick.navigate) {
                window.location.href = action.onClick.navigate
              }
            }
          })
          return
        }

        if (action.onClick.navigate) {
          window.location.href = action.onClick.navigate
          return
        }
      }
    }

    // Handle delete action
    if (action.type === 'delete' && selectedUser && view.apiDelete) {
      if (action.confirm) {
        setConfirmDialog({
          open: true,
          config: action.confirm,
          onConfirm: async () => {
            setConfirmDialog(prev => ({ ...prev, open: false }))
            try {
              const apiUrl = view.apiDelete!.replace(':id', selectedUser.id)
              const response = await viewsService.submitForm(apiUrl, {}, 'DELETE')
              
              if (response.success) {
                onSuccess?.(response)
                if (action.onSuccess?.navigate) {
                  setTimeout(() => {
                    window.location.href = action.onSuccess.navigate
                  }, 1000)
                }
              } else {
                throw new Error(response.message || 'Erro ao remover usuário')
              }
            } catch (error: any) {
              onError?.(error.message || 'Erro ao remover usuário')
            }
          }
        })
      }
    }
  }

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (!view.apiSubmit || !selectedUser) return

    try {
      const apiUrl = view.apiSubmit.replace(':id', selectedUser.id)
      const response = await viewsService.submitForm(apiUrl, formData, view.method || 'PUT')
      
      if (response.success) {
        onSuccess?.(response)
        // Navigate after success if configured
        const submitAction = currentStep?.actions.find(a => a.type === 'submit')
        if (submitAction?.onSuccess?.navigate) {
          setTimeout(() => {
            window.location.href = submitAction.onSuccess!.navigate!
          }, submitAction.onSuccess.delay || 1000)
        }
      } else {
        throw new Error(response.message || 'Erro ao salvar')
      }
    } catch (error: any) {
      onError?.(error.message || 'Erro ao salvar')
      throw error
    }
  }

  if (!currentStep) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Configuração de wizard inválida</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      {view.behaviors?.showProgress && view.steps && view.steps.length > 1 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              Etapa {currentStepIndex + 1} de {view.steps.length}
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Step Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {currentStep.icon && <span>{currentStep.icon}</span>}
            {currentStep.title}
          </h2>
          {currentStep.description && (
            <p className="text-muted-foreground">{currentStep.description}</p>
          )}
        </div>
        
        <Badge variant="outline">
          {currentStepIndex + 1}/{view.steps?.length || 1}
        </Badge>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep.id === 'search' ? (
            /* Search Step */
            <div className="space-y-6">
              {/* Erro de validação da busca */}
              {searchError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{searchError}</AlertDescription>
                </Alert>
              )}

              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  console.log('Form submitted com dados:', searchFormData)
                  handleSearch(searchFormData)
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getStepFields(currentStep).map((field) => (
                    <FieldRenderer
                      key={field.name}
                      field={field}
                      value={searchFormData[field.name] || ''}
                      onChange={(name, value) => {
                        console.log('Campo alterado:', name, value)
                        // Limpar erro quando usuário digitar
                        if (searchError) {
                          setSearchError(null)
                        }
                        setSearchFormData(prev => ({
                          ...prev,
                          [name]: value
                        }))
                      }}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  {currentStep.actions.map((action, index) => (
                    <ActionRenderer
                      key={index}
                      action={action}
                      isLoading={isSearching && action.type === 'fetch'}
                      onClick={() => {
                        console.log('ActionRenderer onClick:', action)
                        handleActionClick(action, searchFormData)
                      }}
                    />
                  ))}
                </div>
              </form>

              {/* Search Results */}
              {(searchResults.length > 0 || isSearching) && (
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Resultados da Busca</h3>
                  <SearchResults
                    results={searchResults}
                    onSelect={handleSelectUser}
                    isLoading={isSearching}
                    emptyMessage="Nenhum usuário encontrado com os critérios informados"
                    showAs="list"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Edit Step - mantido igual */
            selectedUser && (
              <FormHandler
                fields={view.fields.filter(f => getAllStepFields(currentStep).includes(f.name))}
                apiSubmit={view.apiSubmit?.replace(':id', selectedUser.id)}
                apiValidation={view.apiValidation}
                method={view.method}
                onSuccess={onSuccess}
                onError={onError}
              >
                {({ formData, errors, isSubmitting, submitSuccess, submitMessage, handleFieldChange, handleSubmit, handleFieldEvent, resetForm }) => {
                  // Initialize form with selected user data
                  React.useEffect(() => {
                    if (selectedUser && Object.keys(formData).length === 0) {
                      Object.entries(selectedUser).forEach(([key, value]) => {
                        handleFieldChange(key, value)
                      })
                    }
                  }, [selectedUser, formData, handleFieldChange])

                  return (
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      handleFormSubmit(formData)
                    }} className="space-y-6">
                      {/* User Info Header */}
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium">Editando usuário:</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedUser.nome} - {selectedUser.email}
                        </p>
                      </div>

                      {/* Tabbed Form */}
                      {currentStep.tabs ? (
                        <TabbedForm
                          tabs={currentStep.tabs}
                          fields={view.fields}
                          formData={formData}
                          errors={errors}
                          onFieldChange={handleFieldChange}
                          onFieldEvent={handleFieldEvent}
                          gridColumns={view.layout?.columns || 2}
                        />
                      ) : (
                        <div className={`grid grid-cols-1 md:grid-cols-${view.layout?.columns || 2} gap-4`}>
                          {getStepFields(currentStep).map((field) => (
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
                      )}

                      {/* Success/Error Messages */}
                      {submitMessage && (
                        <Alert variant={submitSuccess ? "default" : "destructive"}>
                          {submitSuccess ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <AlertDescription className="font-medium">
                            {submitMessage}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t">
                        {currentStep.actions.map((action, index) => (
                          <ActionRenderer
                            key={index}
                            action={action}
                            isLoading={isSubmitting && action.type === 'submit'}
                            onClick={() => handleActionClick(action, formData)}
                          />
                        ))}
                      </div>
                    </form>
                  )
                }}
              </FormHandler>
            )
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        config={confirmDialog.config}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
    </div>
  )
}