/**
 * Search Query Generation
 * Brave Search를 위한 검색 쿼리 생성 로직
 */

import { ProjectFormData } from '@/types/project'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

/**
 * AI를 사용하여 프로젝트 데이터 기반 검색 쿼리 생성
 * @param projectData 프로젝트 정보
 * @returns 검색 쿼리 배열
 */
export async function generateSearchQueriesWithAI(projectData: ProjectFormData): Promise<string[]> {
  const systemPrompt = `You are an expert at finding the LATEST third-party services, APIs, and SDKs for MVP development.
Your goal is to find MANAGED SOLUTIONS that reduce implementation complexity and errors.

IMPORTANT: Language Rule for Search Queries
- ALWAYS generate search queries in ENGLISH regardless of the input language
- This ensures finding the best technical documentation and latest services
- Technical terms, API names, and service names are primarily in English

# Search Query Generation Strategy

## Priority Order (ALWAYS follow this):
1. **Fully Managed Services** (Clerk, Stripe, SendGrid, Vercel)
2. **Backend-as-a-Service** (Supabase, Firebase, Planetscale)
3. **Developer-First APIs** (OpenAI, Anthropic, Twilio)
4. **UI Component Libraries** (Shadcn/ui, Tremor, Aceternity)
5. **Infrastructure Tools** (Vercel, Railway, Render)

## Query Patterns to Use:
- "[Feature] as a service API 2024"
- "[Technology] managed service pricing"
- "[Problem] SaaS solution developer documentation"
- "Best [feature] API for Next.js 15"
- "[Feature] serverless API free tier"
- "[Core functionality] SDK npm install"

## Keywords to Include:
- Managed, Hosted, Serverless, API, SDK
- "No infrastructure", "Quick setup", "Free tier"
- "Production ready", "Enterprise ready"
- "Next.js 15", "React 19", "TypeScript"
- Current year (2024/2025)

## Examples:
- Bad: "user authentication best practices"
- Good: "Clerk Auth Next.js 15 integration guide"

- Bad: "real-time chat implementation"  
- Good: "Pusher Channels React SDK pricing"

- Bad: "file upload handling"
- Good: "UploadThing Next.js API documentation"

Requirements:
- Generate exactly 3 SPECIFIC queries targeting actual services/products
- Focus on finding EXISTING solutions, not tutorials
- Include service names when relevant to the features
- Mix general feature searches with specific service searches
- Always prefer "X as a service" over "how to build X"

Output: Return exactly 3 queries in ENGLISH, one per line.`

  const userPrompt = `Project: ${projectData.name}
Core Problem: ${projectData.idea}
Must-Have Features: ${projectData.features?.slice(0, 5).join(', ') || 'Not specified'}
Tech Preference: ${projectData.techPreferences?.join(', ') || 'Next.js, React, TypeScript'}

IMPORTANT: Generate all search queries in ENGLISH, even if the input above is in another language.

Analyze the core features and generate search queries to find:
1. The BEST managed service for the primary feature
2. Supporting APIs/SDKs for secondary features
3. UI/UX solutions that require minimal custom code
4. Infrastructure/deployment solutions

Focus on solutions that can be integrated in hours, not days.`

  try {
    const { text } = await generateText({
      model: openai(process.env.AI_MODEL || 'gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 200
    })

    // 줄바꿈으로 쿼리 분리 및 정리
    const queries = text
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 10) // 너무 짧은 쿼리 제외
      .slice(0, 3) // 정확히 3개만

    // AI 생성 실패 시 빈 배열 반환
    if (queries.length === 0) {
      return []
    }

    return queries
  } catch (error) {
    // AI search query generation error - return empty array
    return []
  }
}

