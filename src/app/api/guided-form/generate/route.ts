import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { 
  PRODUCT_DESCRIPTION_PROMPT,
  USER_FLOW_PROMPT,
  FEATURES_ROLES_PROMPT,
  TECH_STACK_PROMPT,
  fillPromptTemplate 
} from '@/lib/prompts/guided-form-prompts'

const RequestSchema = z.object({
  type: z.enum(['product-descriptions', 'user-flows', 'features-roles', 'tech-stack']),
  data: z.record(z.any())
})

const PROMPT_MAP = {
  'product-descriptions': PRODUCT_DESCRIPTION_PROMPT,
  'user-flows': USER_FLOW_PROMPT,
  'features-roles': FEATURES_ROLES_PROMPT,
  'tech-stack': TECH_STACK_PROMPT
}

const RESPONSE_VALIDATORS = {
  'product-descriptions': (parsed: any) => {
    if (!parsed.optionA || !parsed.optionB) {
      throw new Error('Incomplete response: missing optionA or optionB')
    }
    return { optionA: parsed.optionA, optionB: parsed.optionB }
  },
  'user-flows': (parsed: any) => {
    if (!parsed.optionA || !parsed.optionB) {
      throw new Error('Incomplete response: missing optionA or optionB')
    }
    return { optionA: parsed.optionA, optionB: parsed.optionB }
  },
  'features-roles': (parsed: any) => {
    if (!Array.isArray(parsed.features) || !Array.isArray(parsed.roles)) {
      throw new Error('Incomplete response: features and roles must be arrays')
    }
    return { features: parsed.features, roles: parsed.roles }
  },
  'tech-stack': (parsed: any) => {
    return {
      frontend: Array.isArray(parsed.frontend) ? parsed.frontend : [],
      backend: Array.isArray(parsed.backend) ? parsed.backend : [],
      database: Array.isArray(parsed.database) ? parsed.database : [],
      infrastructure: Array.isArray(parsed.infrastructure) ? parsed.infrastructure : []
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }
    
    const body = await request.json()
    const { type, data } = RequestSchema.parse(body)
    
    // Get the appropriate prompt template
    const promptTemplate = PROMPT_MAP[type]
    if (!promptTemplate) {
      return NextResponse.json(
        { error: 'Invalid generation type' },
        { status: 400 }
      )
    }
    
    // Fill the prompt template with data
    const prompt = fillPromptTemplate(promptTemplate, data)
    
    // Generate AI response
    const model = openai(process.env.AI_MODEL || 'gpt-4o')
    
    console.log('Generating AI response for type:', type)
    console.log('Using model:', process.env.AI_MODEL || 'gpt-4o')
    
    const { text } = await generateText({
      model,
      prompt,
      temperature: type === 'tech-stack' || type === 'features-roles' ? 0.7 : 0.8,
      maxTokens: type === 'features-roles' ? 1000 : 800
    })
    
    console.log('AI response received, length:', text.length)
    
    // Parse the JSON response with error handling
    let parsed
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim()
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7) // Remove ```json
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3) // Remove ```
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3) // Remove trailing ```
      }
      cleanText = cleanText.trim()
      
      // Try to parse as-is first
      try {
        parsed = JSON.parse(cleanText)
      } catch (firstError) {
        // If that fails, try to fix common issues
        console.log('First parse attempt failed, trying to fix JSON...')
        
        // Replace actual newlines within string values with escaped newlines
        // This regex looks for content between quotes and replaces newlines
        cleanText = cleanText.replace(/"([^"]*)"/g, (match, content) => {
          // Replace newlines with \n
          const fixed = content.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
          return `"${fixed}"`
        })
        
        // Try parsing again
        parsed = JSON.parse(cleanText)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:')
      console.error('Raw text:', text)
      console.error('Parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid AI response format', details: text.substring(0, 200) },
        { status: 500 }
      )
    }
    
    // Validate and format the response based on type
    const validator = RESPONSE_VALIDATORS[type]
    const validatedResponse = validator(parsed)
    
    return NextResponse.json(validatedResponse)
    
  } catch (error) {
    console.error('Error in guided form generation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof Error && error.message.includes('Incomplete response')) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}