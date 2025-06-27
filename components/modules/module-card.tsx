"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Module } from "@/lib/types/modules"
import { 
  Users, Package, BarChart3, Settings, FileText, 
  Calculator, Briefcase, ShoppingCart, Truck, Home
} from "lucide-react"

interface ModuleCardProps {
  module: Module
  onClick: (module: Module) => void
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

export default function ModuleCard({ module, onClick }: ModuleCardProps) {
  const Icon = getModuleIcon(module.icon)
  
  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-l-4 group"
      style={{ borderLeftColor: module.color }}
      onClick={() => onClick(module)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg text-white group-hover:scale-110 transition-transform"
              style={{ backgroundColor: module.color }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{module.title}</CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                v{module.version}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {module.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{module.viewCount} views</span>
            <span>{module.routeCount} rotas</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {module.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}