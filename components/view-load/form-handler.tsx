"use client"

import { useState, useCallback } from "react"
import { viewsService } from "@/lib/services/views-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import type { ViewField } from "@/lib/types/views"

interface FormHandlerProps {
  fields: ViewField[]
  apiSubmit?: string
  apiValidation?: string
  method?: string
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  children: (props: {
    formData: Record<string, any>
    errors: Record<string, string>
    isSubmitting: boolean
    submitSuccess: boolean
    submitMessage: string | null
    handleFieldChange: (name: string, value: any) => void
    handleSubmit: (e: React.FormEvent) => void
    handleFieldEvent: (fieldName: string, value: any) => void
    resetForm: () => void
  }) => React.ReactNode
}

export default function FormHandler({
  fields,
  apiSubmit,
  apiValidation,
  method = 'POST',
  onSuccess,
  onError,
  children
}: FormHandlerProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {}
    fields.forEach(field => {
      if (field.value !== undefined) {
        initial[field.name] = field.value
      } else if (field.default !== undefined) {
        initial[field.name] = field.default
      }
    })
    return initial
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    const initial: Record<string, any> = {}
    fields.forEach(field => {
      if (field.default !== undefined) {
        initial[field.name] = field.default
      }
    })
    setFormData(initial)
    setErrors({})
    setSubmitSuccess(false)
    setSubmitMessage(null)
  }, [fields])

  const validateField = useCallback(async (fieldName: string, value: any) => {
    const field = fields.find(f => f.name === fieldName)
    if (!field?.validation) return

    let error = ''

    // Validação local
    if (field.required && (!value || value === '')) {
      error = `${field.label} é obrigatório`
    } else if (field.validation.pattern && value) {
      const regex = new RegExp(field.validation.pattern)
      if (!regex.test(value)) {
        error = field.validation.message || `${field.label} tem formato inválido`
      }
    } else if (field.validation.minLength && value && value.length < field.validation.minLength) {
      error = `${field.label} deve ter pelo menos ${field.validation.minLength} caracteres`
    } else if (field.validation.maxLength && value && value.length > field.validation.maxLength) {
      error = `${field.label} deve ter no máximo ${field.validation.maxLength} caracteres`
    }

    // Validação remota
    if (!error && apiValidation && (field.name === 'email' || field.name === 'username' || field.name === 'cpf')) {
      try {
        const response = await viewsService.validateField(apiValidation, {
          [fieldName]: value
        })
        
        if (response.success && response.data) {
          const fieldAvailable = response.data[fieldName]
          if (fieldAvailable === false) {
            error = `${field.label} já está em uso`
          }
        }
      } catch (err: any) {
        error = err.message || 'Erro na validação'
      }
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }))

    return error
  }, [fields, apiValidation])

  const handleFieldChange = useCallback(async (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpar mensagens de sucesso quando usuário editar
    if (submitSuccess) {
      setSubmitSuccess(false)
      setSubmitMessage(null)
    }

    // Limpar erro quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Validação assíncrona com debounce
    const timeoutId = setTimeout(() => {
      validateField(name, value)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [errors, validateField, submitSuccess])

  const handleFieldEvent = useCallback(async (fieldName: string, value: any) => {
    const field = fields.find(f => f.name === fieldName)
    if (!field?.onChange) return

    try {
      // Eventos especiais baseados no nome do campo
      if (fieldName === 'cep' && value && value.replace(/\D/g, '').length === 8) {
        const response = await viewsService.getAddressByCep(value)
        if (response.success) {
          setFormData(prev => ({
            ...prev,
            ...response.data
          }))
        }
      }
    } catch (error: any) {
      console.warn('Erro no evento do campo:', error.message)
    }
  }, [fields])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!apiSubmit) {
      const errorMsg = 'Endpoint de submissão não configurado'
      setSubmitMessage(errorMsg)
      onError?.(errorMsg)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    setSubmitSuccess(false)
    setSubmitMessage(null)

    try {
      // Validar todos os campos
      const fieldErrors: Record<string, string> = {}
      
      for (const field of fields) {
        if (field.required && (!formData[field.name] || formData[field.name] === '')) {
          fieldErrors[field.name] = `${field.label} é obrigatório`
        }
      }

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
        setSubmitMessage('Corrija os erros antes de continuar')
        return
      }

      // Submeter formulário
      const response = await viewsService.submitForm(apiSubmit, formData, method)
      
      if (response.success) {
        setSubmitSuccess(true)
        setSubmitMessage(response.message || 'Formulário enviado com sucesso!')
        onSuccess?.(response)
        
        // Reset form after success
        setTimeout(() => {
          resetForm()
        }, 2000)
      } else {
        throw new Error(response.message || 'Erro ao enviar formulário')
      }
    } catch (error: any) {
      setSubmitSuccess(false)
      setSubmitMessage(error.message || 'Erro ao enviar formulário')
      onError?.(error.message || 'Erro ao enviar formulário')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Feedback de sucesso/erro */}
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

      {children({
        formData,
        errors,
        isSubmitting,
        submitSuccess,
        submitMessage,
        handleFieldChange,
        handleSubmit,
        handleFieldEvent,
        resetForm
      })}
    </div>
  )
}