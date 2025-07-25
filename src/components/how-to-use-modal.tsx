'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FolderOpen, FileText, Terminal, CheckCircle2, Copy } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface HowToUseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HowToUseModal({ open, onOpenChange }: HowToUseModalProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const { toast } = useToast()
  
  const promptText = `## Instruction 
1. Read both the PRD and the Tasks file in the \`root/Cliky-DOC\` folder of this project to familiarize yourself with the project you'll be developing. 
2. Work through the tasks in the order listed in the Tasks documentation. 
3. Update your progress in the Tasks file as you complete each task. 
4. Anything I have to do myself (ex setting environment variables), write it all out in a MD file in the \`root/SET-GUIDE\` folder at the end of the task.

**IMPORTANT RULE: Read the PRD file evertime before starting next task as context.**

When you've read the documentation and understand the project and these instructions, say 'I&apos;m ready to make something cool'.`
  
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText)
    setCopiedPrompt(true)
    toast({
      title: "프롬프트가 복사되었습니다!",
      description: "AI 개발 도구에 붙여넣으세요.",
    })
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Cliky 사용법</DialogTitle>
          <DialogDescription>
            Cliky로 생성한 PRD와 작업 목록을 AI 개발 도구와 함께 사용하는 방법
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">1</span>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                PRD 및 작업 목록 생성
              </h3>
              <p className="text-sm text-muted-foreground">
                먼저 Cliky를 사용하여 프로젝트 아이디어를 입력하고 상세한 PRD와 작업 목록을 생성하세요.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">2</span>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                프로젝트 구조 설정
              </h3>
              <p className="text-sm text-muted-foreground">
                프로젝트 디렉토리에 <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">DOC</code> 폴더를 만들고 
                다운로드한 PRD와 작업 목록 파일을 넣으세요.
              </p>
              <div className="bg-muted/50 p-3 rounded-md">
                <pre className="text-xs font-mono">
{`📁 your-project/
  └── 📁 Cliky-DOC/
      ├── 📄 PRD.md
      └── 📄 tasks.json (or tasks.md)`}
                </pre>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">3</span>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                AI 도구에 프롬프트 입력
              </h3>
              <p className="text-sm text-muted-foreground">
                Claude, Cursor 또는 다른 AI 개발 도구에 다음 프롬프트를 입력하세요:
              </p>
              <div className="bg-muted/50 p-4 rounded-md relative">
                <pre className="text-xs font-mono whitespace-pre-wrap pr-16 max-h-24 overflow-y-auto">
{promptText}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyPrompt}
                  className="absolute top-3 right-10"
                >
                  {copiedPrompt ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">4</span>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                개발 시작
              </h3>
              <p className="text-sm text-muted-foreground">
                AI가 PRD와 작업 목록을 이해하면 개발할 준비가 된 것입니다. 
                작업 목록에 따라 순차적으로 개발을 진행할 수 있습니다. 
                AI는 각 작업의 세부 사항, 구현 방법 및 테스트 전략에 따라 코드를 생성합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={() => onOpenChange(false)}>
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}