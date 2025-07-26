'use client'

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectStore } from '@/store/project-store'
import { FileEdit, Bot } from 'lucide-react'
import { motion } from 'framer-motion'
import { ANIMATION_PRESETS } from '@/lib/animation-presets'

export function ProjectMethodModal() {
  const { 
    isMethodModalOpen, 
    setIsMethodModalOpen, 
    setCreationMethod, 
    setIsFormOpen 
  } = useProjectStore()

  const handleMethodSelect = (method: 'classic' | 'guided') => {
    setCreationMethod(method)
    setIsMethodModalOpen(false)
    setIsFormOpen(true)
  }

  return (
    <Dialog open={isMethodModalOpen} onOpenChange={setIsMethodModalOpen}>
      <DialogContent className="max-w-3xl p-8">
        <DialogTitle className="text-2xl font-bold text-center mb-2">
          프로젝트를 어떻게 만드시겠어요?
        </DialogTitle>
        <DialogDescription className="text-center text-muted-foreground mb-8">
          선호하는 방법을 선택하여 시작하세요
        </DialogDescription>
        
        <div className="grid grid-cols-2 gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="cursor-pointer h-full hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary"
              onClick={() => handleMethodSelect('guided')}
            >
              <CardHeader className="text-center p-8">
                <Bot className="w-12 h-12 mb-4 mx-auto text-primary" />
                <CardTitle className="text-xl mb-3">원하는 것을 선택하기</CardTitle>
                <CardDescription className="text-base">
                  AI가 맞춤형 추천과 선택 옵션으로 단계별 프로세스를 안내해드립니다
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="cursor-pointer h-full hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary"
              onClick={() => handleMethodSelect('classic')}
            >
              <CardHeader className="text-center p-8">
                <FileEdit className="w-12 h-12 mb-4 mx-auto text-primary" />
                <CardTitle className="text-xl mb-3">처음부터 시작하기</CardTitle>
                <CardDescription className="text-base">
                  클래식한 4단계 폼을 사용하여 프로젝트 아이디어, 기능, 
                  사용자 흐름, 기술 선호도를 설명하세요
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}