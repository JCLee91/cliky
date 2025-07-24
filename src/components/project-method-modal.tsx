'use client'

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectStore } from '@/store/project-store'
import { FileEdit, Sparkles } from 'lucide-react'
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
          How would you like to create your project?
        </DialogTitle>
        <DialogDescription className="text-center text-muted-foreground mb-8">
          Choose your preferred method to start building
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
                <Sparkles className="w-12 h-12 mb-4 mx-auto text-primary" />
                <CardTitle className="text-xl mb-3">Choose what I want</CardTitle>
                <CardDescription className="text-base">
                  Let AI guide you through a step-by-step process with personalized recommendations
                  and options to choose from
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
                <CardTitle className="text-xl mb-3">Start from scratch</CardTitle>
                <CardDescription className="text-base">
                  Use our classic 4-step form to describe your project idea, features, 
                  user flow, and tech preferences
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}