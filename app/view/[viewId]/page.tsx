"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import ViewLoad from "@/components/view-load"
import { useToast } from "@/hooks/use-toast"

interface ViewPageProps {
  params: Promise<{ viewId: string }>
}

export default function ViewPage({ params }: ViewPageProps) {
  const { viewId } = use(params)
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = (data: any) => {
    toast({
      title: "Sucesso",
      description: data.message || "Operação realizada com sucesso",
    })
  }

  const handleError = (error: string) => {
    toast({
      title: "Erro",
      description: error,
      variant: "destructive",
    })
  }

  const handleBack = () => {
    router.back()
  }

  // Verificar se é um alias (formato simples sem 'v-')
  const isAlias = viewId && !viewId.startsWith('v-') && viewId.length <= 10

  return (
    <div className="container mx-auto py-6">
      <ViewLoad
        viewId={isAlias ? undefined : viewId}
        alias={isAlias ? viewId : undefined}
        onSuccess={handleSuccess}
        onError={handleError}
        onBack={handleBack}
      />
    </div>
  )
}