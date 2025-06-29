"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, Package, AlertCircle, Users, 
  FileText, BarChart3, Settings, Calculator,
  Briefcase, ShoppingCart, Truck, Home
} from "lucide-react"
import ViewList from "./view-list"
import { modulesService } from "@/lib/services/modules-service"
import type { Module } from "@/lib/types/modules"

interface ModuleDetailProps {
  moduleName: string
  onBack: () => void
  onViewSelect: (viewId: string, title: string, alias?: string) => void
}

interface ModuleDetailData {
  module: Module
  views: Array<{
    id: string
    title: string
    alias?: string
    code?: string
    type: string
    category: string
    description?: string
  }>
}

const getModuleIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    users: Users,
    package: Package,
    'bar-chart-3': BarChart3,
    settings: Settings,
    'file-text': FileText,
    calculator: Calculator,
    briefcase: Briefcase,
    'shopping-cart': ShoppingCart,
    truck: Truck,
    home: Home
  }
  
  return icons[iconName] || FileText
}

export default function ModuleDetail({ moduleName, onBack, onViewSelect }: ModuleDetailProps) {
  const [data, setData] = useState<ModuleDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadModuleDetail = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        console.log('Carregando detalhes do módulo:', moduleName)
        const response = await modulesService.getModule(moduleName)
        
        if (response.success) {
          console.log('Dados do módulo carregados:', response.data)
          setData(response.data)
        } else {
          throw new Error('Módulo não encontrado')
        }
      } catch (err: any) {
        console.error('Erro ao carregar módulo:', err)
        setError(err.message || 'Erro ao carregar detalhes do módulo')
      } finally {
        setIsLoading(false)
      }
    }

    loadModuleDetail()
  }, [moduleName])

  // **FIX: Função para lidar com seleção de view melhorada**
  const handleViewSelect = (viewId: string, title: string, alias?: string) => {
    console.log('View selecionada:', { viewId, title, alias })
    
    // Determinar o identificador correto para usar
    const identifier = alias || viewId
    
    // Chamar a função de callback do pai
    onViewSelect(identifier, title, alias)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        
        {/* Module info skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Views skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <ViewList views={[]} onViewSelect={handleViewSelect} isLoading={true} />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos Módulos
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Módulo não encontrado</h3>
        <p className="text-muted-foreground mb-4">
          O módulo solicitado não foi encontrado.
        </p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos Módulos
        </Button>
      </div>
    )
  }

  const { module, views } = data
  const Icon = getModuleIcon(module.icon)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-lg text-white"
              style={{ backgroundColor: module.color }}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{module.title}</h1>
              <p className="text-muted-foreground">{module.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informações do Módulo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{views.length}</div>
              <div className="text-sm text-muted-foreground">Views Disponíveis</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{module.routeCount}</div>
              <div className="text-sm text-muted-foreground">Rotas da API</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">v{module.version}</div>
              <div className="text-sm text-muted-foreground">Versão Atual</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{module.category}</Badge>
            <Badge variant="secondary">v{module.version}</Badge>
            <Badge 
              variant="outline" 
              className="border-green-500 text-green-700 dark:text-green-300"
            >
              Ativo
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Views List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Views do Módulo ({views.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ViewList 
            views={views} 
            onViewSelect={handleViewSelect}
            isLoading={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}