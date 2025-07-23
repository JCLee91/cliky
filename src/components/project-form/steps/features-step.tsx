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
    'Essential Foundation': [
      'User Authentication System',  // 로그인/회원가입/비밀번호 재설정 포함
      'User Dashboard',              // 마이페이지/프로필/설정 포함
      'Admin Panel',                 // 관리자 대시보드/통계/사용자 관리 포함
      'Search & Filter',             // 검색/필터/정렬 기능 포함
      'Email Notification System'    // 이메일 알림/템플릿/설정 포함
    ],
    'Business Features': [
      'Payment & Subscription',      // 결제/구독/청구서/환불 포함
      'Analytics Dashboard',         // 분석/통계/리포트 포함
      'Customer Support System',     // 문의/티켓/FAQ/채팅 포함
      'Content Management',          // CMS/에디터/미디어 관리 포함
      'Multi-language Support'       // 다국어/지역화 포함
    ],
    'User Engagement': [
      'Social Features',             // 팔로우/좋아요/공유/댓글 포함
      'Gamification System',         // 포인트/뱃지/리더보드 포함
      'Review & Rating System',      // 리뷰/평점/추천 포함
      'Referral Program',            // 추천/초대/리워드 포함
      'Community Features'           // 포럼/그룹/이벤트 포함
    ]
  }

  // 각 기능에 대한 상세 설명
  const featureDetails: Record<string, { description: string; includes: string[]; techStack: string[] }> = {
    'User Authentication System': {
      description: 'Complete user identity management system',
      includes: ['Login/Logout', 'Sign up', 'Password reset', 'Social login (Google, GitHub)', 'Email verification', 'JWT/Session management'],
      techStack: ['Clerk', 'Supabase Auth', 'Firebase Auth', 'NextAuth.js']
    },
    'User Dashboard': {
      description: 'Personal space for users to manage their account',
      includes: ['Profile management', 'Account settings', 'Activity history', 'Preferences', 'Security settings'],
      techStack: ['Tailwind UI', 'Shadcn/ui', 'Tremor', 'Chakra UI']
    },
    'Admin Panel': {
      description: 'Comprehensive management interface for administrators',
      includes: ['User management', 'Content moderation', 'System monitoring', 'Analytics overview', 'Settings configuration'],
      techStack: ['AdminJS', 'Retool', 'Forest Admin', 'Custom with Shadcn/ui']
    },
    'Search & Filter': {
      description: 'Advanced search and filtering capabilities',
      includes: ['Full-text search', 'Category filters', 'Sort options', 'Search suggestions', 'Recent searches'],
      techStack: ['Algolia', 'Typesense', 'MeiliSearch', 'Elasticsearch']
    },
    'Email Notification System': {
      description: 'Automated email communication system',
      includes: ['Transactional emails', 'Marketing emails', 'Email templates', 'Unsubscribe management', 'Email tracking'],
      techStack: ['SendGrid', 'Resend', 'Postmark', 'AWS SES']
    },
    'Payment & Subscription': {
      description: 'Complete payment processing and subscription management',
      includes: ['One-time payments', 'Recurring subscriptions', 'Invoice generation', 'Refund processing', 'Payment method management'],
      techStack: ['Stripe', 'Paddle', 'LemonSqueezy', 'PayPal']
    },
    'Analytics Dashboard': {
      description: 'Data visualization and business intelligence',
      includes: ['User analytics', 'Revenue metrics', 'Performance KPIs', 'Custom reports', 'Data export'],
      techStack: ['Posthog', 'Mixpanel', 'Plausible', 'Google Analytics']
    },
    'Customer Support System': {
      description: 'Multi-channel customer support infrastructure',
      includes: ['Support tickets', 'Live chat', 'FAQ section', 'Knowledge base', 'Email support'],
      techStack: ['Intercom', 'Crisp', 'Zendesk', 'Freshdesk']
    },
    'Content Management': {
      description: 'Flexible content creation and management system',
      includes: ['Rich text editor', 'Media library', 'Version control', 'SEO optimization', 'Content scheduling'],
      techStack: ['Sanity', 'Strapi', 'Contentful', 'Payload CMS']
    },
    'Multi-language Support': {
      description: 'Complete internationalization and localization',
      includes: ['Language switcher', 'RTL support', 'Currency conversion', 'Date/time formatting', 'Translation management'],
      techStack: ['next-i18next', 'react-intl', 'Crowdin', 'Lokalise']
    },
    'Social Features': {
      description: 'Social interaction and engagement tools',
      includes: ['Follow/Unfollow', 'Like/Unlike', 'Comments', 'Share functionality', 'Activity feed'],
      techStack: ['Stream', 'Sendbird', 'Custom with Socket.io', 'Supabase Realtime']
    },
    'Gamification System': {
      description: 'Engagement mechanics through game elements',
      includes: ['Points system', 'Achievements/Badges', 'Leaderboards', 'Progress tracking', 'Rewards'],
      techStack: ['Custom implementation', 'Gamify', 'BadgeOS', 'Pointagram']
    },
    'Review & Rating System': {
      description: 'User-generated feedback and ratings',
      includes: ['Star ratings', 'Written reviews', 'Review moderation', 'Helpful votes', 'Review responses'],
      techStack: ['Custom with Supabase', 'Trustpilot API', 'Google Reviews API', 'Yotpo']
    },
    'Referral Program': {
      description: 'User acquisition through referral incentives',
      includes: ['Unique referral codes', 'Tracking system', 'Reward distribution', 'Referral analytics', 'Social sharing'],
      techStack: ['ReferralCandy', 'Post Affiliate Pro', 'Rewardful', 'Custom implementation']
    },
    'Community Features': {
      description: 'Community building and engagement platform',
      includes: ['Forums/Discussions', 'User groups', 'Events calendar', 'Direct messaging', 'Notifications'],
      techStack: ['Discourse', 'Circle', 'Tribe', 'Custom with Next.js']
    }
  }

  // 모든 기능을 평면화
  const allSuggestedFeatures = Object.values(suggestedFeaturesByType).flat()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">List the core features</h3>
        <p className="text-muted-foreground">
          Add the main features you want to implement in your project
        </p>
      </div>

      {/* Tips section */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">💡 Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Think about features your users expect but might not explicitly ask for</li>
          <li>• Consider both user-facing and admin features</li>
          <li>• Include features that handle edge cases (errors, cancellations, etc.)</li>
          <li>• Don&apos;t forget about legal/compliance features if applicable</li>
        </ul>
      </div>

      <FormField
        control={form.control}
        name="features"
        render={() => (
          <FormItem>
            <FormLabel className="text-base">Add Core Features</FormLabel>
            <FormDescription>
              Type a feature name and press Enter or click the add button
            </FormDescription>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  placeholder="e.g., User Authentication, Product Search, Shopping Cart..."
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
          <h4 className="text-sm font-medium">Added Features ({features.length})</h4>
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
        <h4 className="text-sm font-medium text-muted-foreground">Commonly Missed MVP Features</h4>
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
                              <p className="text-xs font-medium mb-1">Such as:</p>
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