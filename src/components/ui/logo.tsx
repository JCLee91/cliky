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
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Always use light theme logo for SSR and initial render
  const logoSrc = variant === 'symbol'
    ? '/image/logo_symbol.png'
    : mounted && resolvedTheme === 'dark' ? '/image/logo_white.png' : '/image/logo.png'

  return (
    <Image
      src={logoSrc}
      alt="Logo"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}