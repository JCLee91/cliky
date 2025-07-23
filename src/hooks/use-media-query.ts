import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)
    
    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    // Add event listener
    media.addEventListener('change', listener)
    
    // Clean up
    return () => {
      media.removeEventListener('change', listener)
    }
  }, [query])

  return matches
}

// Preset media queries
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)')
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}

export function useIsLargeDesktop() {
  return useMediaQuery('(min-width: 1280px)')
}

// Responsive breakpoints based on Tailwind defaults
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

export function useBreakpoint(breakpoint: keyof typeof breakpoints) {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]})`)
}

// Device orientation
export function useIsPortrait() {
  return useMediaQuery('(orientation: portrait)')
}

export function useIsLandscape() {
  return useMediaQuery('(orientation: landscape)')
}

// Reduced motion preference
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

// Dark mode preference
export function usePrefersDarkMode() {
  return useMediaQuery('(prefers-color-scheme: dark)')
}