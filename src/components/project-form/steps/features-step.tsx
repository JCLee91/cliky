'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectFormData } from '@/types/project'
import { Plus, X } from 'lucide-react'

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
        {Object.entries(suggestedFeaturesByType).map(([category, categoryFeatures]) => {
          const availableFeatures = categoryFeatures.filter(feature => !features.includes(feature))
          if (availableFeatures.length === 0) return null
          
          return (
            <div key={category} className="space-y-2">
              <h5 className="text-sm font-semibold text-foreground/80 mb-1">{category}</h5>
              <div className="flex flex-wrap gap-2">
                {availableFeatures.map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 text-sm font-medium hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => {
                      const newFeatures = [...features, feature]
                      form.setValue('features', newFeatures)
                    }}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}