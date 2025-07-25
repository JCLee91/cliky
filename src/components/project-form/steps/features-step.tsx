'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectFormData } from '@/types/project'
import { Plus, X, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function FeaturesStep() {
  const form = useFormContext<ProjectFormData>()
  const [currentFeature, setCurrentFeature] = useState('')
  const features = form.watch('features') || []

  const addFeature = () => {
    if (currentFeature.trim() && !features.includes(currentFeature.trim())) {
      const newFeatures = [...features, currentFeature.trim()]
      form.setValue('features', newFeatures)
      setCurrentFeature('')
    }
  }

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index)
    form.setValue('features', newFeatures)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addFeature()
    }
  }

  // MVP에서 자주 놓치는 필수 기능들 - 더 포괄적으로 구성
  const suggestedFeaturesByType = {
    '필수 기반 기능': [
      '사용자 인증 시스템',  // 로그인/회원가입/비밀번호 재설정 포함
      '사용자 대시보드',     // 마이페이지/프로필/설정 포함
      '관리자 패널',         // 관리자 대시보드/통계/사용자 관리 포함
      '검색 및 필터',        // 검색/필터/정렬 기능 포함
      '이메일 알림 시스템'   // 이메일 알림/템플릿/설정 포함
    ],
    '비즈니스 기능': [
      '결제 및 구독',              // 결제/구독/청구서/환불 포함
      '분석 대시보드',             // 분석/통계/리포트 포함
      '고객 지원 시스템',          // 문의/티켓/FAQ/채팅 포함
      '콘텐츠 관리',               // CMS/에디터/미디어 관리 포함
      '다국어 지원'                // 다국어/지역화 포함
    ],
    '사용자 참여': [
      '소셜 기능',                   // 팔로우/좋아요/공유/댓글 포함
      '게이미피케이션 시스템',       // 포인트/뱃지/리더보드 포함
      '리뷰 및 평점 시스템',         // 리뷰/평점/추천 포함
      '추천 프로그램',               // 추천/초대/리워드 포함
      '커뮤니티 기능'                // 포럼/그룹/이벤트 포함
    ]
  }

  // 각 기능에 대한 상세 설명
  const featureDetails: Record<string, { description: string; includes: string[]; techStack: string[] }> = {
    '사용자 인증 시스템': {
      description: '완전한 사용자 신원 관리 시스템',
      includes: ['로그인/로그아웃', '회원가입', '비밀번호 재설정', '소셜 로그인 (Google, GitHub)', '이메일 인증', 'JWT/세션 관리'],
      techStack: ['Clerk', 'Supabase Auth', 'Firebase Auth', 'NextAuth.js']
    },
    '사용자 대시보드': {
      description: '계정을 관리할 수 있는 개인 공간',
      includes: ['프로필 관리', '계정 설정', '활동 기록', '환경설정', '보안 설정'],
      techStack: ['Tailwind UI', 'Shadcn/ui', 'Tremor', 'Chakra UI']
    },
    '관리자 패널': {
      description: '관리자를 위한 포괄적인 관리 인터페이스',
      includes: ['사용자 관리', '콘텐츠 관리', '시스템 모니터링', '분석 개요', '설정 구성'],
      techStack: ['AdminJS', 'Retool', 'Forest Admin', 'Custom with Shadcn/ui']
    },
    '검색 및 필터': {
      description: '고급 검색 및 필터링 기능',
      includes: ['전체 텍스트 검색', '카테고리 필터', '정렬 옵션', '검색 제안', '최근 검색'],
      techStack: ['Algolia', 'Typesense', 'MeiliSearch', 'Elasticsearch']
    },
    '이메일 알림 시스템': {
      description: '자동화된 이메일 통신 시스템',
      includes: ['트랜잭션 이메일', '마케팅 이메일', '이메일 템플릿', '구독 취소 관리', '이메일 추적'],
      techStack: ['SendGrid', 'Resend', 'Postmark', 'AWS SES']
    },
    '결제 및 구독': {
      description: '완전한 결제 처리 및 구독 관리',
      includes: ['일회성 결제', '반복 구독', '청구서 생성', '환불 처리', '결제 수단 관리'],
      techStack: ['Stripe', 'Paddle', 'LemonSqueezy', 'PayPal']
    },
    '분석 대시보드': {
      description: '데이터 시각화 및 비즈니스 인텔리전스',
      includes: ['사용자 분석', '수익 지표', '성과 KPI', '사용자 정의 리포트', '데이터 내보내기'],
      techStack: ['Posthog', 'Mixpanel', 'Plausible', 'Google Analytics']
    },
    '고객 지원 시스템': {
      description: '멀티채널 고객 지원 인프라',
      includes: ['지원 티켓', '라이브 채팅', 'FAQ 섹션', '지식 베이스', '이메일 지원'],
      techStack: ['Intercom', 'Crisp', 'Zendesk', 'Freshdesk']
    },
    '콘텐츠 관리': {
      description: '유연한 콘텐츠 생성 및 관리 시스템',
      includes: ['리치 텍스트 에디터', '미디어 라이브러리', '버전 관리', 'SEO 최적화', '콘텐츠 예약'],
      techStack: ['Sanity', 'Strapi', 'Contentful', 'Payload CMS']
    },
    '다국어 지원': {
      description: '완전한 국제화 및 현지화',
      includes: ['언어 전환기', 'RTL 지원', '통화 변환', '날짜/시간 형식', '번역 관리'],
      techStack: ['next-i18next', 'react-intl', 'Crowdin', 'Lokalise']
    },
    '소셜 기능': {
      description: '소셜 상호작용 및 참여 도구',
      includes: ['팔로우/언팔로우', '좋아요/취소', '댓글', '공유 기능', '활동 피드'],
      techStack: ['Stream', 'Sendbird', 'Custom with Socket.io', 'Supabase Realtime']
    },
    '게이미피케이션 시스템': {
      description: '게임 요소를 통한 참여 메커니즘',
      includes: ['포인트 시스템', '업적/뱃지', '리더보드', '진행 추적', '보상'],
      techStack: ['Custom implementation', 'Gamify', 'BadgeOS', 'Pointagram']
    },
    '리뷰 및 평점 시스템': {
      description: '사용자 생성 피드백 및 평점',
      includes: ['별점 평가', '서면 리뷰', '리뷰 검토', '유용함 투표', '리뷰 응답'],
      techStack: ['Custom with Supabase', 'Trustpilot API', 'Google Reviews API', 'Yotpo']
    },
    '추천 프로그램': {
      description: '추천 인센티브를 통한 사용자 획득',
      includes: ['고유 추천 코드', '추적 시스템', '보상 분배', '추천 분석', '소셜 공유'],
      techStack: ['ReferralCandy', 'Post Affiliate Pro', 'Rewardful', 'Custom implementation']
    },
    '커뮤니티 기능': {
      description: '커뮤니티 구축 및 참여 플랫폼',
      includes: ['포럼/토론', '사용자 그룹', '이벤트 캘린더', '다이렉트 메시지', '알림'],
      techStack: ['Discourse', 'Circle', 'Tribe', 'Custom with Next.js']
    }
  }

  // 모든 기능을 평면화
  const allSuggestedFeatures = Object.values(suggestedFeaturesByType).flat()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">핵심 기능을 나열해주세요</h3>
        <p className="text-muted-foreground">
          프로젝트에 구현하고 싶은 주요 기능을 추가해주세요
        </p>
      </div>

      {/* Tips section */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 팁</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 사용자가 명시적으로 요구하지 않았지만 기대하는 기능을 생각해보세요</li>
          <li>• 사용자 기능과 관리자 기능을 모두 고려하세요</li>
          <li>• 엣지 케이스를 처리하는 기능을 포함하세요 (오류, 취소 등)</li>
          <li>• 해당되는 경우 법적/규정 준수 기능을 잊지 마세요</li>
        </ul>
      </div>

      <FormField
        control={form.control}
        name="features"
        render={() => (
          <FormItem>
            <FormLabel className="text-base">핵심 기능 추가</FormLabel>
            <FormDescription>
              기능 이름을 입력하고 Enter 키를 누르거나 추가 버튼을 클릭하세요
            </FormDescription>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  placeholder="예: 사용자 인증, 상품 검색, 장바구니..."
                  value={currentFeature}
                  onChange={(e) => setCurrentFeature(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-base"
                  autoComplete="off"
                />
              </FormControl>
              <Button 
                type="button" 
                onClick={addFeature}
                disabled={!currentFeature.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Added features */}
      {features.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">추가된 기능 ({features.length})</h4>
          <div className="flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm font-medium"
              >
                <span>{feature}</span>
                <button
                  type="button"
                  className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                  onClick={() => removeFeature(index)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested features by type */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">MVP에서 자주 놓치는 기능들</h4>
        <TooltipProvider delayDuration={300}>
          {Object.entries(suggestedFeaturesByType).map(([category, categoryFeatures]) => {
            const availableFeatures = categoryFeatures.filter(feature => !features.includes(feature))
            if (availableFeatures.length === 0) return null
            
            return (
              <div key={category} className="space-y-2">
                <h5 className="text-sm font-semibold text-foreground/80 mb-1">{category}</h5>
                <div className="flex flex-wrap gap-2">
                  {availableFeatures.map((feature) => {
                    const details = featureDetails[feature]
                    return (
                      <Tooltip key={feature}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 text-sm font-medium hover:scale-[1.02] active:scale-[0.98] group"
                            onClick={() => {
                              const newFeatures = [...features, feature]
                              form.setValue('features', newFeatures)
                            }}
                          >
                            {feature}
                            <Info className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </TooltipTrigger>
                        {details && (
                          <TooltipContent side="top" className="max-w-sm p-4 space-y-3">
                            <div>
                              <p className="font-semibold text-sm">{feature}</p>
                              <p className="text-xs text-muted-foreground mt-1">{details.description}</p>
                            </div>
                            
                            <div>
                              <p className="text-xs font-medium mb-1">포함 사항:</p>
                              <div className="flex flex-wrap gap-1">
                                {details.includes.map((item, idx) => (
                                  <span key={idx} className="text-xs px-2 py-0.5 bg-secondary rounded-md">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </TooltipProvider>
      </div>
    </div>
  )
}