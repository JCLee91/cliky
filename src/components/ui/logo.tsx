'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LogoProps {
  variant?: 'full' | 'symbol'
  className?: string
  width?: number
  height?: number
}

export function Logo({ variant = 'full', className = '', width = 120, height = 32 }: LogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with same dimensions to prevent layout shift
    return <div className={className} style={{ width, height }} />
  }

  const isDark = theme === 'dark' || resolvedTheme === 'dark'
  
  const logoSrc = variant === 'symbol' 
    ? isDark ? '/image/logo_symbol_white.png' : '/image/logo_symbol.png'
    : isDark ? '/image/logo_white.png' : '/image/logo.png'

  return (
    <Image
      src={logoSrc}
      alt="Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}