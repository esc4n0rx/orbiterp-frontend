"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import JsonField from "./json-field"
import type { ViewField } from "@/lib/types/views"

interface FieldRendererProps {
  field: ViewField
  value: any
  onChange: (name: string, value: any) => void
  onFieldChange?: (fieldName: string, value: any) => void
  error?: string
}

export default function FieldRenderer({ 
  field, 
  value, 
  onChange, 
  onFieldChange,
  error 
}: FieldRendererProps) {
  const handleChange = (newValue: any) => {
    onChange(field.name, newValue)
    
    // Trigger onChange event if defined
    if (field.onChange && onFieldChange) {
      onFieldChange(field.name, newValue)
    }
  }

  const applyMask = (value: string, mask: string) => {
    if (!mask || !value) return value
    
    let masked = value.replace(/\D/g, '')
    
    switch (mask) {
      case 'cpf':
        masked = masked.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        break
      case 'cep':
        masked = masked.replace(/(\d{5})(\d{3})/, '$1-$2')
        break
      case 'phone':
        if (masked.length === 11) {
          masked = masked.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        } else if (masked.length === 10) {
          masked = masked.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
        }
        break
      default:
        return value
    }
    
    return masked
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value
    
    if (field.mask) {
      newValue = applyMask(newValue, field.mask)
    }
    
    handleChange(newValue)
  }

  if (field.hidden) {
    return null
  }

  const fieldId = `field-${field.name}`
  const gridClasses = field.grid ? `col-span-${field.grid.span || 1}` : 'col-span-1'

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <Input
            id={fieldId}
            type={field.type}
            value={value || ''}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            required={field.required}
            readOnly={field.readonly}
            className={cn(error && "border-red-500", field.className)}
            min={field.validation?.min}
            max={field.validation?.max}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        )
      
      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            value={value || ''}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            required={field.required}
            readOnly={field.readonly}
            className={cn(error && "border-red-500", field.className)}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        )
      
      case 'json':
        return (
          <JsonField
            id={fieldId}
            label={field.label}
            value={value}
            onChange={handleChange}
            required={field.required}
            readonly={field.readonly}
            defaultValue={field.value || field.default}
            help={field.help}
            className={field.className}
            error={error}
          />
        )
      
      case 'select':
        return (
          <Select 
            value={value || ''} 
            onValueChange={handleChange}
            required={field.required}
            disabled={field.readonly}
          >
            <SelectTrigger className={cn(error && "border-red-500", field.className)}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              checked={Boolean(value)}
              onCheckedChange={handleChange}
              disabled={field.readonly}
              className={cn(error && "border-red-500")}
            />
            <Label 
              htmlFor={fieldId}
              className="text-sm font-normal cursor-pointer"
            >
              {field.label}
            </Label>
          </div>
        )
      
      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={handleChange}
            disabled={field.readonly}
            className={field.className}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={String(option.value)} 
                  id={`${fieldId}-${option.value}`}
                />
                <Label 
                  htmlFor={`${fieldId}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      
      case 'date':
      case 'time':
      case 'datetime-local':
        return (
          <Input
            id={fieldId}
            type={field.type}
            value={value || ''}
            onChange={handleInputChange}
            required={field.required}
            readOnly={field.readonly}
            className={cn(error && "border-red-500", field.className)}
          />
        )
      
      case 'file':
        return (
          <Input
            id={fieldId}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              handleChange(file)
            }}
            required={field.required}
            disabled={field.readonly}
            className={cn(error && "border-red-500", field.className)}
          />
        )
      
      default:
        return (
          <Input
            id={fieldId}
            type="text"
            value={value || ''}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            required={field.required}
            readOnly={field.readonly}
            className={cn(error && "border-red-500", field.className)}
          />
        )
    }
  }

  // Para checkbox e json, não mostrar label separado pois já está integrado
  if (field.type === 'checkbox' || field.type === 'json') {
    return (
      <div className={gridClasses}>
        {renderField()}
        {field.type === 'checkbox' && error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className={gridClasses}>
      <div className="space-y-2">
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {renderField()}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  )
}