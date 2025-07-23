'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Dashboard Error</CardTitle>
          <CardDescription>
            There was a problem loading the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-mono text-muted-foreground line-clamp-3">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button 
              onClick={() => router.back()} 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}