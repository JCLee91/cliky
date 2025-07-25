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
              <CardTitle>시스템 오류</CardTitle>
              <CardDescription>
                심각한 오류가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.
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
                페이지 새로고침
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}