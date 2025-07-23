'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>System Error</CardTitle>
              <CardDescription>
                A critical error has occurred. Please refresh the page or try again later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs font-mono text-muted-foreground">
                    {error.message}
                    {error.digest && (
                      <span className="block mt-1">Digest: {error.digest}</span>
                    )}
                  </p>
                </div>
              )}
              <Button onClick={reset} className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}