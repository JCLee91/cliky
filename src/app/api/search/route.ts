import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Brave Search API 요청 스키마
const SearchRequestSchema = z.object({
  query: z.string().min(1).max(200),
  count: z.number().min(1).max(10).optional().default(5),
  freshness: z.enum(['pd', 'pw', 'pm', 'py']).optional() // past day/week/month/year
})

// Brave Search API 응답 타입
interface BraveSearchResult {
  title: string
  url: string
  description: string
  age?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 요청 검증
    const validatedData = SearchRequestSchema.parse(body)
    const { query, count, freshness } = validatedData
    
    // Brave Search API 키 확인
    const apiKey = process.env.BRAVE_SEARCH_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Search service not configured' },
        { status: 503 }
      )
    }
    
    // Start Brave Search
    
    // Brave Search API 호출
    const searchParams = new URLSearchParams({
      q: query,
      count: count.toString()
    })
    
    if (freshness) {
      searchParams.append('freshness', freshness)
    }
    
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${searchParams}`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 검색 결과 포맷팅
    const results: BraveSearchResult[] = data.web?.results?.map((result: any) => ({
      title: result.title,
      url: result.url,
      description: result.description,
      age: result.age
    })) || []
    
    // Search completed
    
    return NextResponse.json({
      success: true,
      data: {
        query,
        results,
        totalResults: results.length
      }
    })
    
  } catch (error) {
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request format',
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Brave Search API endpoint',
    usage: {
      method: 'POST',
      body: {
        query: 'search query (required)',
        count: 'number of results (optional, default: 5)',
        freshness: 'time filter: pd|pw|pm|py (optional)'
      }
    },
    configured: !!process.env.BRAVE_SEARCH_API_KEY
  })
}