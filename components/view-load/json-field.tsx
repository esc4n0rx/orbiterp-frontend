"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertCircle, Check, RotateCcw } from "lucide-react"

interface JsonFieldProps {
  id: string
  label: string
  value: any
  onChange: (value: any) => void
  required?: boolean
  readonly?: boolean
  defaultValue?: any
  help?: string
  className?: string
  error?: string
}

export default function JsonField({
  id,
  label,
  value,
  onChange,
  required = false,
  readonly = false,
  defaultValue,
  help,
  className,
  error
}: JsonFieldProps) {
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(true)

  // Inicializar o valor
  useEffect(() => {
    try {
      const initialValue = value || defaultValue || {}
      setJsonText(JSON.stringify(initialValue, null, 2))
      setIsValid(true)
      setJsonError(null)
    } catch (err) {
      setJsonText('{}')
      setIsValid(false)
      setJsonError('Valor inicial inválido')
    }
  }, [value, defaultValue])

  const validateAndUpdate = (text: string) => {
    setJsonText(text)
    
    if (!text.trim()) {
      if (required) {
        setJsonError('Campo obrigatório')
        setIsValid(false)
        return
      } else {
        setJsonError(null)
        setIsValid(true)
        onChange(null)
        return
      }
    }

    try {
      const parsed = JSON.parse(text)
      setJsonError(null)
      setIsValid(true)
      onChange(parsed)
    } catch (err: any) {
      setJsonError('JSON inválido: ' + err.message)
      setIsValid(false)
    }
  }

  const handleReset = () => {
    try {
      const resetValue = defaultValue || {}
      const resetText = JSON.stringify(resetValue, null, 2)
      setJsonText(resetText)
      setJsonError(null)
      setIsValid(true)
      onChange(resetValue)
    } catch (err) {
      setJsonText('{}')
      setJsonError(null)
      setIsValid(true)
      onChange({})
    }
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonText(formatted)
      setJsonError(null)
      setIsValid(true)
      onChange(parsed)
    } catch (err: any) {
      setJsonError('Não é possível formatar JSON inválido')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          <Badge 
            variant={isValid ? "secondary" : "destructive"} 
            className="ml-2 text-xs"
          >
            {isValid ? <Check className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
            {isValid ? 'Válido' : 'Inválido'}
          </Badge>
        </Label>
        
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={formatJson}
            disabled={readonly || !jsonText.trim()}
          >
            Formatar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={readonly}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Textarea
        id={id}
        value={jsonText}
        onChange={(e) => validateAndUpdate(e.target.value)}
        placeholder={`{\n  "type": "all"\n}`}
        readOnly={readonly}
        className={cn(
          "font-mono text-sm min-h-[120px]",
          !isValid && "border-red-500",
          error && "border-red-500",
          className
        )}
      />

      {help && (
        <p className="text-xs text-muted-foreground">{help}</p>
      )}

      {(jsonError || error) && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {jsonError || error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}