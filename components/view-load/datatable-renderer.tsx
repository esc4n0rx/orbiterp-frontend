"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  AlertCircle,
  Users,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import { viewsService } from "@/lib/services/views-service"
import type { ViewDefinition } from "@/lib/types/views"

interface DatatableRendererProps {
  view: ViewDefinition
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

interface TableData {
  rows: any[]
  total: number
  page: number
  pageSize: number
}

export default function DatatableRenderer({ view, onSuccess, onError }: DatatableRendererProps) {
  const [data, setData] = useState<TableData>({
    rows: [],
    total: 0,
    page: 1,
    pageSize: view.pagination?.pageSize || 10
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sortBy, setSortBy] = useState<string | null>(
    view.sorting?.defaultSort?.column || null
  )
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    view.sorting?.defaultSort?.direction || 'desc'
  )
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  // Carregar dados
  const loadData = useCallback(async () => {
    if (!view.apiData) return

    setLoading(true)
    try {
      const params: Record<string, string> = {
        page: String(data.page),
        pageSize: String(data.pageSize),
        sortBy: sortBy ?? '',
        sortDirection: sortDirection,
        search: searchQuery,
        ...Object.fromEntries(
          Object.entries(filters).map(([k, v]) => [k, v == null ? '' : String(v)])
        )
      }

      const response = await viewsService.fetchData(`${view.apiData}?${new URLSearchParams(params).toString()}`)
      
      if (response.success) {
        setData(prev => ({
          ...prev,
          rows: response.data.users || response.data.rows || [],
          total: response.data.total || 0
        }))
      } else {
        throw new Error('Erro ao carregar dados')
      }
    } catch (error: any) {
      onError?.(error.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [view.apiData, data.page, data.pageSize, sortBy, sortDirection, searchQuery, filters, onError])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtros
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setData(prev => ({ ...prev, page: 1 }))
  }

  // Busca
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setData(prev => ({ ...prev, page: 1 }))
  }

  // Paginação
  const handlePageChange = (newPage: number) => {
    setData(prev => ({ ...prev, page: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setData(prev => ({ 
      ...prev, 
      pageSize: newPageSize, 
      page: 1 
    }))
  }

  // Ordenação
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
    setData(prev => ({ ...prev, page: 1 }))
  }

  // Seleção
  const handleRowSelect = (rowId: string, selected: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(rowId)
      } else {
        newSet.delete(rowId)
      }
      return newSet
    })
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(new Set(data.rows.map(row => String(row.id))))
    } else {
      setSelectedRows(new Set())
    }
  }

  // Renderizar célula
  const renderCell = (column: any, row: any) => {
    const value = row[column.key]
    
    if (!column.render) {
      return value || '-'
    }

    switch (column.render.type) {
      case 'badge':
        const mapping = column.render.mapping?.[value]
        if (mapping) {
          return (
            <Badge 
              variant={mapping.color === 'green' ? 'default' : 'secondary'}
              className={mapping.color === 'red' ? 'bg-red-600 text-white' : ''}
            >
              {mapping.label}
            </Badge>
          )
        }
        return <Badge variant="secondary">{value}</Badge>

      case 'avatar':
        const initials = value?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
              {initials}
            </div>
            <span>{value}</span>
          </div>
        )

      case 'link':
        return (
          <a 
            href={column.render.href?.replace('{{value}}', value)} 
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        )

      case 'code':
        return (
          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
            {value}
          </code>
        )

      case 'mask':
        if (column.render.mask === '999.999.999-99' && value) {
          return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        }
        return value

      case 'datetime':
        if (value) {
          return new Date(value).toLocaleString('pt-BR')
        }
        return '-'

      case 'indicator':
        const indicatorMapping = column.render.mapping?.[value]
        if (indicatorMapping) {
          return (
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  indicatorMapping.color === 'green' ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <span className="text-sm">{indicatorMapping.label}</span>
            </div>
          )
        }
        return value

      case 'text':
        return value || column.render.placeholder || '-'

      default:
        return value || '-'
    }
  }

  // Ações da linha
  const renderRowActions = (row: any) => {
    if (!view.rowActions) return null

    return (
      <div className="flex items-center gap-1">
        {view.rowActions.map((action, index) => {
          if (action.type === 'button') {
            return (
              <Button
                key={index}
                variant={action.variant as any || 'ghost'}
                size={action.size as any || 'sm'}
                onClick={() => {
                  if (
                    action.onClick &&
                    typeof action.onClick === "object" &&
                    action.onClick.navigate
                  ) {
                    const url = action.onClick.navigate.replace('{{row.id}}', row.id)
                    window.location.href = url
                  }
                }}
              >
                {action.icon === 'edit' && <Edit className="h-4 w-4" />}
                {action.icon === 'eye' && <Eye className="h-4 w-4" />}
                {action.icon === 'trash-2' && <Trash2 className="h-4 w-4" />}
                <span className="sr-only">{action.label}</span>
              </Button>
            )
          }
          return null
        })}
      </div>
    )
  }

  const totalPages = Math.ceil(data.total / data.pageSize)

  if (loading && data.rows.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filtros</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              {view.export?.enabled && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {view.filters?.map((filter) => (
              <div key={filter.name} className="space-y-2">
                <label className="text-sm font-medium">{filter.label}</label>
                {filter.type === 'select' ? (
                  <Select
                    value={filters[filter.name] || ''}
                    onValueChange={(value) => handleFilterChange(filter.name, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={filter.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder={filter.placeholder}
                    value={filters[filter.name] || ''}
                    onChange={(e) => {
                      if (filter.debounce) {
                        const value = e.target.value
                        setTimeout(() => handleFilterChange(filter.name, value), filter.debounce)
                      } else {
                        handleFilterChange(filter.name, e.target.value)
                      }
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {view.selection?.enabled && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRows.size === data.rows.length && data.rows.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  {view.columns?.map((column) => (
                    <TableHead 
                      key={column.key}
                      className={`${column.align === 'center' ? 'text-center' : ''} ${
                        column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''
                      }`}
                      style={{ 
                        width: column.width, 
                        minWidth: column.minWidth 
                      }}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && sortBy === column.key && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={(view.columns?.length || 0) + (view.selection?.enabled ? 1 : 0)}
                      className="text-center py-8"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">Nenhum usuário encontrado</h3>
                          <p className="text-sm text-muted-foreground">
                            Ajuste os filtros ou cadastre um novo usuário
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.rows.map((row) => (
                    <TableRow key={row.id}>
                      {view.selection?.enabled && (
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(String(row.id))}
                            onCheckedChange={(checked) => 
                              handleRowSelect(String(row.id), Boolean(checked))
                            }
                          />
                        </TableCell>
                      )}
                      {view.columns?.map((column) => (
                        <TableCell 
                          key={column.key}
                          className={column.align === 'center' ? 'text-center' : ''}
                        >
                          {column.key === 'actions' ? 
                            renderRowActions(row) : 
                            renderCell(column, row)
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      {view.pagination?.enabled && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Mostrando {((data.page - 1) * data.pageSize) + 1} a{' '}
              {Math.min(data.page * data.pageSize, data.total)} de {data.total} resultados
            </span>
            {selectedRows.size > 0 && (
              <span className="ml-4">
                {selectedRows.size} selecionado(s)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={String(data.pageSize)}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {view.pagination.pageSizeOptions?.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm">
              {data.page} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}