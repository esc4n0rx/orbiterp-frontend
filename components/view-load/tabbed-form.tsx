"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import FieldRenderer from "./field-renderer"
import type { ViewField } from "@/lib/types/views"

interface TabConfig {
  id: string
  label: string
  icon?: string
  fields: string[]
}

interface TabbedFormProps {
  tabs: TabConfig[]
  fields: ViewField[]
  formData: Record<string, any>
  errors: Record<string, string>
  onFieldChange: (name: string, value: any) => void
  onFieldEvent?: (fieldName: string, value: any) => void
  gridColumns?: number
}

export default function TabbedForm({
  tabs,
  fields,
  formData,
  errors,
  onFieldChange,
  onFieldEvent,
  gridColumns = 2
}: TabbedFormProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  const getFieldsByTab = (tabFields: string[]) => {
    return fields.filter(field => tabFields.includes(field.name))
  }

  const getTabErrors = (tabFields: string[]) => {
    return tabFields.filter(fieldName => errors[fieldName]).length
  }

  const gridClass = `grid grid-cols-1 md:grid-cols-${gridColumns} gap-4`

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        {tabs.map((tab) => {
          const errorCount = getTabErrors(tab.fields)
          return (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="relative"
            >
              <div className="flex items-center gap-2">
                {tab.icon && (
                  <span className="text-sm">{tab.icon}</span>
                )}
                <span>{tab.label}</span>
                {errorCount > 0 && (
                  <Badge variant="destructive" className="text-xs ml-1">
                    {errorCount}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          )
        })}
      </TabsList>

      {tabs.map((tab) => {
        const tabFields = getFieldsByTab(tab.fields)
        const tabErrors = getTabErrors(tab.fields)

        return (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tabErrors > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Esta aba contém {tabErrors} campo(s) com erro(s). 
                  Corrija-os antes de continuar.
                </AlertDescription>
              </Alert>
            )}

            <div className={gridClass}>
              {tabFields.map((field) => (
                <FieldRenderer
                  key={field.name}
                  field={field}
                  value={formData[field.name]}
                  onChange={onFieldChange}
                  onFieldChange={onFieldEvent}
                  error={errors[field.name]}
                />
              ))}
            </div>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}