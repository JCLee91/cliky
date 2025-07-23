'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileCode } from 'lucide-react'
import { toast } from 'sonner'

interface DownloadMenuProps {
  content: string | (() => string)
  filename: string
  className?: string
  customXMLConverter?: (content: string) => string
}

export function DownloadMenu({ content, filename, className, customXMLConverter }: DownloadMenuProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const getContent = () => {
    return typeof content === 'function' ? content() : content
  }

  const downloadFile = (fileContent: string, fullFilename: string, mimeType: string) => {
    const blob = new Blob([fileContent], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fullFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAsMarkdown = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    downloadFile(getContent(), `${filename}_${timestamp}.md`, 'text/markdown')
    // Success toast removed
  }

  const downloadAsXML = () => {
    const contentStr = getContent()
    const xmlContent = customXMLConverter ? customXMLConverter(contentStr) : convertToXML(contentStr, filename)
    const timestamp = new Date().toISOString().split('T')[0]
    downloadFile(xmlContent, `${filename}_${timestamp}.xml`, 'application/xml')
    // Success toast removed
  }

  const convertToXML = (markdown: string, type: string): string => {
    if (type.toLowerCase() === 'prd') {
      return convertPRDToXML(markdown)
    } else {
      // For other types, use a generic conversion
      return convertGenericToXML(markdown, type)
    }
  }

  const convertPRDToXML = (markdown: string): string => {
    const lines = markdown.split('\n')
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<prd>\n'
    let currentSection = ''
    let sectionContent = ''
    
    lines.forEach(line => {
      if (line.startsWith('# ')) {
        if (currentSection) {
          xml += `  <section name="${currentSection}">\n    <content><![CDATA[${sectionContent.trim()}]]></content>\n  </section>\n`
        }
        currentSection = line.substring(2).trim()
        sectionContent = ''
      } else if (line.startsWith('## ')) {
        if (currentSection) {
          xml += `  <section name="${currentSection}">\n    <content><![CDATA[${sectionContent.trim()}]]></content>\n  </section>\n`
        }
        currentSection = line.substring(3).trim()
        sectionContent = ''
      } else {
        sectionContent += line + '\n'
      }
    })
    
    if (currentSection) {
      xml += `  <section name="${currentSection}">\n    <content><![CDATA[${sectionContent.trim()}]]></content>\n  </section>\n`
    }
    
    xml += '</prd>'
    return xml
  }

  const convertGenericToXML = (content: string, type: string): string => {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<${type}>\n  <content><![CDATA[${content}]]></content>\n</${type}>`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isDownloading}
          className={`gap-2 ${className || ''}`}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={downloadAsMarkdown}>
          <FileText className="h-4 w-4 mr-2" />
          Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadAsXML}>
          <FileCode className="h-4 w-4 mr-2" />
          XML (.xml)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}