"use client"

import { useEffect } from "react"
import { useModulesStore } from "@/lib/stores/modules-store"
import ModuleCard from "./module-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Package } from "lucide-react"
import type { Module } from "@/lib/types/modules"

interface ModulesGridProps {
  onModuleSelect?: (module: Module) => void
  onViewSelect?: (viewId: string, title: string) => void
}

export default function ModulesGrid({ onModuleSelect, onViewSelect }: ModulesGridProps) {
  const { modules, isLoading, error, fetchModules, clearError } = useModulesStore()

  useEffect(() => {
    if (modules.length === 0 && !isLoading) {
      fetchModules()
    }
  }, [modules.length, isLoading, fetchModules])

  const handleModuleClick = (module: Module) => {
    if (onModuleSelect) {
      onModuleSelect(module)
    } else if (onViewSelect) {
      // Se não há handler específico para módulo, pode abrir uma view padrão do módulo
      onViewSelect(`v-${module.name}-dashboard`, `${module.title} - Dashboard`)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          {error}
          <button 
            onClick={() => {
              clearError()
              fetchModules()
            }}
            className="underline text-sm"
          >
            Tentar novamente
          </button>
        </AlertDescription>
      </Alert>
    )
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum módulo encontrado</h3>
        <p className="text-muted-foreground">
          Não há módulos disponíveis no momento.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module) => (
        <ModuleCard
          key={module.name}
          module={module}
          onClick={handleModuleClick}
        />
      ))}
    </div>
  )
}