'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Loader2 } from 'lucide-react'
import { DownloadMenu } from '@/components/ui/download-menu'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface PRDViewerProps {
  content: string
  isGenerating: boolean
}

export function PRDViewer({ content, isGenerating }: PRDViewerProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      toast.success('PRD copied to clipboard!')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy.')
    }
  }


  if (!content && !isGenerating) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <div className="text-4xl">📋</div>
            <h3 className="text-lg font-medium">PRD will appear here once generated</h3>
            <p className="text-sm text-muted-foreground">
              Complete the project form and click generate
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">📋 Product Requirements Document</CardTitle>
            {isGenerating && (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {content && !isGenerating && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  <AnimatePresence mode="wait">
                    {isCopied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </motion.div>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </AnimatePresence>
                  {isCopied ? 'Copied!' : 'Copy'}
                </Button>
                <DownloadMenu content={content} filename="PRD" />
              </>
            )}
          </div>
        </div>
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              AI is writing PRD in real-time...
            </div>
            <div className="w-full bg-secondary rounded-full h-1 overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        <div className="relative">
          {content && (
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-7 prose-pre:bg-slate-100 prose-pre:border prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-slate-800 dark:prose-pre:bg-slate-800 dark:prose-code:bg-slate-800 dark:prose-code:text-slate-200">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                h1: ({ children }) => (
                  <h1 className="flex items-center gap-2 border-b pb-2 mb-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="flex items-center gap-2 mt-8 mb-4">
                    {children}
                  </h2>
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className || !className.startsWith('language-')
                  if (isInline) {
                    return (
                      <code className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    )
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border px-4 py-2 bg-muted font-medium text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-4 py-2">
                    {children}
                  </td>
                )
              }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          
        </div>
      </CardContent>
    </Card>
  )
}