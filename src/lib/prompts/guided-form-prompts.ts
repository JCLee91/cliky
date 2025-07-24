/**
 * Guided Form AI Prompts
 * Centralized prompt management for the guided project creation flow
 */

export const PRODUCT_DESCRIPTION_PROMPT = `You are an exceptional startup product planner. Your role is to transform a one-line product idea into concrete product specifications.

Project Name: {name}
Idea: {idea}

Present two different product directions (Option A and Option B) from different perspectives. Format each option as follows:

Items and constraints for each option:
• Problem Definition (within 100 characters)
• Target Users (within 80 characters)
• Usage Scenario (4 steps, each step within 50 characters)
• Core Value (within 200 characters)

Important guidelines:
• DO NOT include any technical, algorithmic, or system architecture descriptions
• Write naturally as if for an actual product introduction
• Keep all descriptions intuitive and clear
• Provide ONLY product descriptions without any additional commentary
• NO implementation details, only user-facing product features

IMPORTANT: Language Matching Rule
- Detect the language of the user's input and respond in the SAME language
- If the input is in Korean, use Korean labels: 문제 정의, 주요 사용자, 사용 시나리오, 핵심 가치
- If the input is in English, use English labels: Problem Definition, Target Users, Usage Scenario, Core Value
- Match ALL text including headings/labels to the input language
- Technical terms (e.g., API names, library names) can remain in English

Respond with ONLY valid JSON, no markdown formatting or code blocks:
{
  "optionA": "Label1: ...\nLabel2: ...\nLabel3:\n1. ...\n2. ...\n3. ...\n4. ...\nLabel4: ...",
  "optionB": "Label1: ...\nLabel2: ...\nLabel3:\n1. ...\n2. ...\n3. ...\n4. ...\nLabel4: ..."
}`

export const USER_FLOW_PROMPT = `You are a UX expert. Based on the following project details, generate two different user flow approaches.

Project Name: {name}
Original Idea: {idea}
Selected Product Description: {productDescription}
{productDescriptionNotes}

Generate two distinct user flow options (Option A and Option B) that:
1. Take different approaches to user experience (e.g., one more guided, one more flexible)
2. Each should describe the main user journey in 4-6 steps
3. Focus on the core user experience from start to finish
4. Be specific about key interactions and decision points
5. Consider different user types or use cases

Format each flow as a numbered list with clear steps.

IMPORTANT: Language Matching Rule
- Detect the language of the user's input and respond in the SAME language
- If the input is in Korean, write the entire response in Korean
- If the input is in English, write the entire response in English
- Match ALL text including step descriptions to the input language
- Technical terms (e.g., API names, library names) can remain in English

Respond with ONLY valid JSON, no markdown formatting or code blocks:
{
  "optionA": "1. First step description\n2. Second step description\n3. Third step description\n4. Fourth step description\n5. Fifth step description",
  "optionB": "1. First step description\n2. Second step description\n3. Third step description\n4. Fourth step description\n5. Fifth step description"
}`

export const FEATURES_ROLES_PROMPT = `You are a product manager. Based on the following project details, recommend core features and user roles.

Project Name: {name}
Original Idea: {idea}
Product Description: {productDescription}
User Flow: {userFlow}
{userFlowNotes}

Generate recommendations for:
1. Core Features: 8-12 specific, implementable features that support the user flow
2. User Roles: 3-5 distinct user types who would interact with the system

For features:
- Be specific and action-oriented
- Focus on MVP features that deliver core value
- Consider the technical feasibility

For roles:
- Include primary and secondary user types
- Consider administrative roles if needed
- Be specific about each role's main activities

IMPORTANT: Language Matching Rule
- Detect the language of the user's input and respond in the SAME language
- If the input is in Korean, write the entire response in Korean
- If the input is in English, write the entire response in English
- Match ALL text including feature descriptions and role names to the input language
- Technical terms (e.g., API names, library names) can remain in English

Respond with ONLY valid JSON, no markdown formatting or code blocks:
{
  "features": [
    "Feature 1 description",
    "Feature 2 description",
    ...
  ],
  "roles": [
    "Role 1: Description of responsibilities",
    "Role 2: Description of responsibilities",
    ...
  ]
}`

export const TECH_STACK_PROMPT = `You are a technical architect. Based on the following project details, recommend a modern tech stack.

Project Name: {name}
Original Idea: {idea}
Product Description: {productDescription}
User Flow: {userFlow}
Core Features: {coreFeatures}
{featuresNotes}

Recommend technologies for:
1. Frontend: 3-4 technologies/frameworks
2. Backend: 3-4 technologies/frameworks
3. Database: 2-3 database solutions
4. Infrastructure: 3-4 deployment/hosting solutions

Consider:
- Modern, production-ready technologies (2024 standards)
- Good ecosystem and community support
- Scalability and maintainability
- Cost-effectiveness for MVP
- Integration capabilities between chosen technologies

IMPORTANT: Language Matching Rule
- Detect the language of the user's input and respond in the SAME language
- Technology names should remain in English (e.g., "React", "Node.js")
- But any descriptive text or explanations should match the input language
- If the input is in Korean, category names can be in Korean (e.g., "프론트엔드" instead of "frontend")

Respond with ONLY valid JSON, no markdown formatting or code blocks:
{
  "frontend": ["Tech 1", "Tech 2", ...],
  "backend": ["Tech 1", "Tech 2", ...],
  "database": ["Tech 1", "Tech 2", ...],
  "infrastructure": ["Tech 1", "Tech 2", ...]
}`

/**
 * Helper function to replace template variables in prompts
 */
export function fillPromptTemplate(template: string, variables: Record<string, any>): string {
  let filled = template
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    if (value !== undefined && value !== null) {
      filled = filled.replace(placeholder, String(value))
    } else {
      // Remove optional placeholders if value is not provided
      filled = filled.replace(placeholder, '')
    }
  })
  
  return filled
}