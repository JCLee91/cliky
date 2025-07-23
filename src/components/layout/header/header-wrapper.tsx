'use client'

import { Suspense } from 'react'
import { Header } from './index'

interface HeaderWrapperProps {
  onMenuClick?: () => void
}

export function HeaderWrapper({ onMenuClick }: HeaderWrapperProps) {
  return (
    <Suspense fallback={<div className="h-16 border-b" />}>
      <Header onMenuClick={onMenuClick} />
    </Suspense>
  )
}