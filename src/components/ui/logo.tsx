'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LogoProps {
  variant?: 'full' | 'symbol'
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export function Logo({ variant = 'full', className = '', width = 120, height = 32, priority = false }: LogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Default to light theme logo before mount to prevent flashing
  const defaultLogoSrc = variant === 'symbol' 
    ? '/image/logo_symbol.png'
    : '/image/logo.png'

  if (!mounted) {
    // Return default logo while mounting to prevent layout shift
    return (
      <div className={className} style={{ width, height, position: 'relative' }}>
        <Image
          src={defaultLogoSrc}
          alt="Logo"
          fill
          sizes={`${width}px`}
          style={{ objectFit: 'contain' }}
          priority={priority}
        />
      </div>
    )
  }

  const isDark = theme === 'dark' || resolvedTheme === 'dark'
  
  const logoSrc = variant === 'symbol' 
    ? '/image/logo_symbol.png'  // 심볼은 보라색으로 다크/라이트 모두 사용
    : isDark ? '/image/logo_white.png' : '/image/logo.png'  // 다크 테마에서는 흰색 텍스트 로고 사용

  return (
    <div className={className} style={{ width, height, position: 'relative' }}>
      <Image
        src={logoSrc}
        alt="Logo"
        fill
        sizes={`${width}px`}
        style={{ objectFit: 'contain' }}
        priority={priority}
      />
    </div>
  )
}