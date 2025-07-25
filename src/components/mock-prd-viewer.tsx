'use client'

import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { ANIMATION_PRESETS } from '@/lib/animation-presets'

interface MockPRDViewerProps {
  content: string
  projectName?: string
}

export function MockPRDViewer({ content, projectName }: MockPRDViewerProps) {
  const router = useRouter()

  const handleInteraction = () => {
    router.push('/login')
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">📋 제품 요구사항 문서</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleInteraction}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              복사
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInteraction}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              다운로드
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
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
        </motion.div>
      </CardContent>
    </Card>
  )
}