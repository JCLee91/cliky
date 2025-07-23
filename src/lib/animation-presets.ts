// 통일된 애니메이션 프리셋
export const ANIMATION_PRESETS = {
  // 페이지/섹션 전환
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } // Material Design ease
  },
  
  // 리스트 아이템 (태스크, 프로젝트 등)
  listItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: "easeOut" }
  },
  
  // 모달/오버레이
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: "easeOut" }
  },

  // 버튼/인터랙티브 요소
  button: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 }
  },

  // 페이드 전환
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },

  // 스켈레톤 로딩
  skeleton: {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
}

// 스태거 애니메이션 헬퍼
export const staggerDelay = (index: number, baseDelay: number = 0.05, maxDelay: number = 0.3) => {
  return Math.min(index * baseDelay, maxDelay)
}

// 애니메이션 비활성화 체크
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

// 조건부 애니메이션 적용
export const getAnimationProps = (preset: keyof typeof ANIMATION_PRESETS) => {
  if (shouldReduceMotion()) {
    return {
      initial: false,
      animate: false,
      exit: false,
      transition: { duration: 0 }
    }
  }
  return ANIMATION_PRESETS[preset]
}