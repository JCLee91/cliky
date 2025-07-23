/**
 * PRD Generation Prompts
 * Product Requirements Document generation prompt management
 */

import { ProjectFormData } from '@/types/project'

/**
 * System prompt for PRD generation
 * Based on the MVP-optimized Few-Shot prompt
 */
export const PRD_SYSTEM_PROMPT = `
# AI PRD Generator - Few-Shot Prompt (MVP Optimized)

You are an AI product architect that creates complete, MVP-ready Product Requirements Documents (PRDs) for developers.

Your task is to:
1. Turn a short user idea into a structured, actionable PRD.
2. Use the latest stable SDKs, APIs, and patterns.
3. Ensure all source files are under 200 lines by splitting components finely.
4. Use Supabase for database/auth, Tailwind + shadcn/ui for UI.
5. Avoid overengineering — only include what's needed for a working MVP.
6. Always include real implementation code (e.g., component snippets, API routes, AI integration).
7. Output should be in Markdown format, and directly usable by developers.
`

/**
 * Generate PRD prompt based on project data and search results
 * Using Few-Shot learning with complete examples
 */
export function generatePRDPrompt(data: ProjectFormData, searchResults?: string): string {
  // Prepare user input section
  const userInput = `
Project Name: ${data.name}
Project Idea: ${data.idea}
${data.features && data.features.length > 0 ? `
Key Features:
${data.features.map((f, i) => `${i + 1}. ${f}`).join('\n')}
` : ''}
${data.userFlow ? `
User Flow:
${data.userFlow}
` : ''}
${data.techPreferences && data.techPreferences.length > 0 ? `
Tech Preferences: ${data.techPreferences.join(', ')}
` : ''}
`;

  // Return the complete prompt with examples and user input
  return `
---

## Few-shot Examples

---

### Example 1

#### Input
Project Name: AI Task Master
Project Idea: AI 코딩 툴을 만들고 싶어. 사용자 아이디어를 입력하면 구조화된 PRD와 작업 목록이 나오면 좋겠어.

Key Features:
1. 프로젝트 아이디어를 구조화된 PRD로 자동 변환
2. AI 기반 작업 분해 및 우선순위 설정
3. 실시간 스트리밍으로 PRD 생성 과정 표시
4. 작업 의존성 자동 분석

User Flow:
사용자 로그인 → 프로젝트 정보 입력 → AI PRD 생성 → 작업 목록 확인 및 관리

Tech Preferences: Next.js, TypeScript, Tailwind CSS

Available third-party services found:
- Vercel AI SDK: Stream AI responses for real-time PRD generation (https://sdk.vercel.ai)
- Taskmaster MCP: Task decomposition and management tool (https://github.com/eyaltoledano/claude-task-master)
- Supabase: Backend and authentication solution (https://supabase.com)

#### Output

# AI 코딩 최적화 PRD v3.0
> Vercel AI SDK와 MCP를 활용한 차세대 AI 코딩 대시보드

## 1. 프로젝트 목표
**사용자의 프로젝트 아이디어를 구조화된 PRD로 변환하고, Taskmaster MCP로 실행 가능한 작업으로 분해하는 AI 대시보드**

---

## 2. Tech Stack

| Category             | Technology / Library                       | Reasoning (선택 이유)                                    |
| -------------------- | ------------------------------------------ | -------------------------------------------------------- |
| Language             | TypeScript                                 | 정적 타입 검사로 안정성·가독성 확보                       |
| Framework            | Next.js 15 (App Router) + React 19         | 모던 SSR/SSG 지원, 파일 기반 라우팅, React 동적 기능       |
| UI Toolkit           | Tailwind CSS + shadcn/ui (Radix UI)        | 빠른 스타일링, 접근성 높은 컴포넌트 제공                 |
| Motion & Animation   | Framer Motion                              | UX 개선용 간편 애니메이션                                 |
| AI SDK               | \`ai\` (Vercel AI SDK)                       | 스트리밍 지원, Vercel 최적화                              |
| OpenAI Client        | \`openai\`                                   | GPT-4o 모델 활용                                          |
| Search API           | Brave Search API                           | 최신 기술 트렌드 실시간 검색                              |
| Database & Auth      | Supabase (\`@supabase/supabase-js\`, RLS)     | 빠른 개발, 내장 인증·데이터베이스                         |
| Task Orchestration   | \`@modelcontextprotocol/sdk\` (MCP)          | Taskmaster 기반 작업 분해                                 |
| Forms & Validation   | React Hook Form + Zod                      | 선언적 폼 관리·스키마 기반 유효성 검사                    |
| Markdown Rendering   | react-markdown + remark-gfm + rehype-highlight | 실시간 Markdown 파싱·하이라이팅                           |
| Utilities            | clsx, tailwind-merge, date-fns             | 클래스명 결합·유틸리티 함수                                |

---

## 3. 핵심 유저 플로우

### 메인 플로우 다이어그램
\`\`\`
[로그인 페이지]
    ↓ (Google/GitHub OAuth)
[대시보드 - 빈 상태]
    ↓ (새 프로젝트 버튼 클릭)
[Typeform 스타일 질문 시퀀스]
    ├─ Step 1: 프로젝트 아이디어 (textarea)
    ├─ Step 2: 핵심 기능들 (dynamic list)
    ├─ Step 3: 유저 플로우 (guided input)
    └─ Step 4: 기술 선호도 (optional chips)
    ↓ (생성하기)
[PRD 생성 중 - 스트리밍]
    ├─ Brave Search로 최신 기술 검색
    ├─ Vercel AI SDK로 PRD 작성
    └─ 실시간 Markdown 렌더링
    ↓ (완료)
[PRD 뷰 + 작업 분리 버튼]
    ↓ (세부 작업으로 나누기)
[Taskmaster MCP 처리]
    └─ 작업 카드 생성
    ↓
[완성된 대시보드]
    ├─ 좌측: PRD 뷰어
    └─ 우측: 작업 카드 그리드
\`\`\`

### 상태별 UI 스펙

#### 1. 빈 대시보드 상태
\`\`\`jsx
// 중앙 정렬된 CTA
<div className="flex items-center justify-center h-full">
  <Card className="max-w-md p-8 text-center">
    <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
    <h2 className="text-2xl font-bold mb-2">첫 프로젝트를 만들어보세요</h2>
    <p className="text-muted-foreground mb-6">
      아이디어를 입력하면 AI가 PRD와 작업 목록을 생성합니다
    </p>
    <Button size="lg" className="rounded-2xl">
      <Plus className="mr-2" /> 새 프로젝트 만들기
    </Button>
  </Card>
</div>
\`\`\`

---

## 프로젝트 구조 (파일당 줄 수 제한 포함)

\`\`\`
src/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx               # 루트 레이아웃 (max 80줄)
│   ├── page.tsx                 # 홈 → /dashboard 리다이렉트 (max 15줄)
│   ├── auth/
│   │   └── page.tsx            # Supabase Auth UI (max 100줄)
│   ├── dashboard/
│   │   ├── layout.tsx          # 대시보드 레이아웃 (max 120줄)
│   │   └── page.tsx            # 메인 대시보드 (max 150줄)
│   └── api/
│       ├── ai/
│       │   └── route.ts        # Vercel AI SDK 엔드포인트 (max 100줄)
│       └── search/
│           └── route.ts        # Brave Search API (max 80줄)
│
├── components/
│   ├── layout/
│   │   ├── sidebar/
│   │   │   ├── index.tsx       # 사이드바 컨테이너 (max 100줄)
│   │   │   ├── project-list.tsx # 프로젝트 목록 (max 80줄)
│   │   │   └── user-menu.tsx   # 유저 메뉴 (max 60줄)
│   ├── project-form/           # Typeform 스타일 폼
│   │   ├── index.tsx          # 폼 컨테이너 (max 120줄)
│   │   ├── steps/
│   │   │   ├── idea-step.tsx  # Step 1 (max 80줄)
│   │   │   ├── features-step.tsx # Step 2 (max 100줄)
│   │   │   ├── flow-step.tsx  # Step 3 (max 100줄)
│   │   │   └── tech-step.tsx  # Step 4 (max 80줄)
│   │   └── progress-bar.tsx   # 진행률 표시 (max 40줄)
│   └── ui/                    # shadcn/ui 컴포넌트
│
├── hooks/
│   ├── use-project.ts         # 프로젝트 상태 관리 (max 100줄)
│   ├── use-ai-stream.ts       # AI 스트리밍 (max 80줄)
│   └── use-mcp.ts            # MCP 통합 (max 80줄)
│
└── lib/
    ├── supabase/
    │   ├── client.ts         # 클라이언트 설정 (max 30줄)
    │   └── middleware.ts     # 미들웨어 (max 50줄)
    └── ai/
        ├── prompts.ts        # 프롬프트 템플릿 (max 150줄)
        └── vercel-ai.ts      # Vercel AI 설정 (max 50줄)
\`\`\`

---

## 기술 스택 상세

### 핵심 의존성
\`\`\`json
{
  "dependencies": {
    // Framework
    "next": "15.0.2",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    
    // AI & Streaming
    "ai": "^3.4.0",              // Vercel AI SDK
    "openai": "^4.72.0",         // OpenAI 클라이언트
    
    // Database & Auth
    "@supabase/supabase-js": "^2.46.0",
    "@supabase/ssr": "^0.5.1",
    
    // UI Components
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-tabs": "^1.1.1",
    "lucide-react": "^0.454.0",
    "framer-motion": "^11.11.0",
    
    // Forms & Validation
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.8",
    
    // Markdown
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0"
  }
}
\`\`\`

---

## 4. 핵심 구현 패턴

### 1. Vercel AI SDK 스트리밍 구현
\`\`\`typescript
// app/api/ai/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { prompt, context } = await req.json();
  
  const result = streamText({
    model: openai('gpt-4o'),
    messages: [
      {
        role: 'system',
        content: 'You are an expert technical architect...'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
  });
  
  return result.toDataStreamResponse();
}
\`\`\`

---

## 5. 구현 체크리스트

### Phase 1: 기초 설정 (3시간)
- [ ] Next.js 15 프로젝트 생성
- [ ] Supabase 프로젝트 설정 및 스키마 생성
- [ ] shadcn/ui 설치 (\`npx shadcn@latest init\`)
- [ ] 다크모드 테마 설정
- [ ] 환경 변수 구성

### Phase 2: 인증 & 레이아웃 (4시간)
- [ ] Supabase Auth 통합
- [ ] 사이드바 구현 (모바일 반응형)
- [ ] 헤더 & 테마 토글
- [ ] 프로젝트 목록 컴포넌트

### Phase 3: 핵심 기능 구현 (6시간)
- [ ] Typeform 스타일 프로젝트 생성 폼
- [ ] Vercel AI SDK 통합
- [ ] PRD 스트리밍 뷰어
- [ ] Markdown 렌더러 & 코드 하이라이팅
- [ ] 복사 기능 구현

---

### Example 2

#### Input
Project Name: AI Blog Editor
Project Idea: 블로그 글을 AI가 도와서 작성해주는 Notion 스타일 에디터를 만들고 싶어.

Key Features:
1. AI 기반 글 개요 자동 생성
2. 문단별 AI 작성 지원
3. Notion 스타일 블록 에디터
4. 실시간 마크다운 미리보기

User Flow:
로그인 → 새 글 작성 → 주제 입력 → AI 개요 생성 → 본문 작성 (AI 도움) → 저장 및 발행

Tech Preferences: Next.js, React

Available third-party services found:
- Vercel AI SDK: Streaming text generation for writing assistance (https://sdk.vercel.ai)
- TipTap: Extensible rich-text editor framework (https://tiptap.dev)
- Supabase: Database and authentication (https://supabase.com)

#### Output

# AI 블로그 에디터 PRD v3.0  
> Notion 스타일 UI 기반, AI 글쓰기 지원 웹앱 (Vercel AI SDK 기반)

## 1. 프로젝트 목표  
**사용자가 주제를 입력하면 AI가 개요 및 본문 초안을 생성해주고, 실시간 Markdown 에디터로 작성 결과를 관리하는 블로그 에디터.**

---

## 2. Tech Stack

| Category             | Technology / Library                       | Reasoning (선택 이유)                                    |
| -------------------- | ------------------------------------------ | -------------------------------------------------------- |
| Language             | TypeScript                                 | 정적 타입 검사로 안정성·가독성 확보                       |
| Framework            | Next.js 15 (App Router) + React 19         | 모던 SSR/SSG 지원, 파일 기반 라우팅                      |
| UI Toolkit           | Tailwind CSS + shadcn/ui                   | 빠른 스타일링, 접근성 높은 컴포넌트                       |
| Animation            | Framer Motion                              | 부드러운 페이지 전환 및 요소 애니메이션                    |
| AI SDK               | \`ai\` (Vercel AI SDK)                       | 스트리밍 텍스트 생성, Vercel 최적화                       |
| OpenAI Client        | \`openai\`                                   | GPT-4o 모델로 개요 및 문단 생성                           |
| Editor               | TipTap                                     | 확장 가능한 Notion 스타일 블록 에디터                     |
| Database & Auth      | Supabase                                   | 빠른 개발, 내장 인증·데이터베이스                         |
| Forms & Validation   | React Hook Form + Zod                      | 선언적 폼 관리·스키마 기반 유효성 검사                    |
| Markdown             | react-markdown + remark-gfm                | 실시간 마크다운 렌더링                                    |
| Utilities            | clsx, tailwind-merge                       | 클래스명 결합·스타일 관리                                 |

---

## 3. 핵심 유저 플로우

\`\`\`
[로그인 페이지]
    ↓ (OAuth - Google)
[대시보드 - 글 없음]
    ↓ (새 글 작성 버튼 클릭)
[주제 입력]
    ↓
[AI 개요 생성 → 본문 초안 제안]
    ↓
[사용자가 마크다운 편집기에서 수정/완성]
    ↓
[작성 완료 → 저장 → 리스트 보기]
\`\`\`

---

## 상태별 UI 스펙

### 1. 빈 블로그 상태
\`\`\`tsx
<div className="flex items-center justify-center h-full">
  <Card className="max-w-md p-8 text-center">
    <PenLine className="w-10 h-10 mx-auto mb-4 text-primary" />
    <h2 className="text-xl font-semibold mb-2">첫 글을 작성해보세요</h2>
    <p className="text-muted-foreground mb-4">
      주제를 입력하면 AI가 개요와 글 초안을 도와줍니다
    </p>
    <Button size="lg" className="rounded-full">
      <Plus className="mr-2" /> 새 글 작성
    </Button>
  </Card>
</div>
\`\`\`

### 2. 주제 입력 + 개요 생성
\`\`\`tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-xl space-y-6">
    <div>
      <Label>블로그 주제</Label>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
    </div>
    <Button onClick={handleGenerateOutline}>
      {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
      개요 생성
    </Button>
    {outline && (
      <Textarea className="mt-4" value={outline} readOnly rows={6} />
    )}
  </DialogContent>
</Dialog>
\`\`\`

---

## 4. 프로젝트 구조 (줄 수 제한 포함)

\`\`\`
src/
├── app/
│   ├── page.tsx                  # 루트 → 대시보드 리다이렉트 (max 15줄)
│   ├── dashboard/
│   │   ├── layout.tsx            # 대시보드 레이아웃 (max 100줄)
│   │   └── page.tsx              # 글 리스트 및 상태 처리 (max 150줄)
│   └── api/
│       └── ai/
│           ├── outline.ts        # 개요 생성 엔드포인트 (max 80줄)
│           └── paragraph.ts      # 문단 생성 엔드포인트 (max 100줄)
│
├── components/
│   ├── blog/
│   │   ├── new-dialog.tsx        # 주제 입력 및 개요 생성 (max 100줄)
│   │   ├── editor.tsx            # 마크다운 에디터 with AI (max 150줄)
│   │   └── helper-toolbar.tsx    # AI 도움말 버튼/토글 (max 60줄)
│   └── ui/                       # shadcn/ui 래퍼 컴포넌트
│
├── lib/
│   ├── ai/vercel.ts              # Vercel AI SDK 설정 (max 50줄)
│   ├── supabase/client.ts        # Supabase 클라이언트 (max 30줄)
│   └── prompts.ts                # 프롬프트 템플릿 (max 120줄)
│
└── hooks/
    ├── use-ai.ts                 # useCompletion 래퍼 (max 80줄)
    └── use-posts.ts              # 글 목록 관리 훅 (max 80줄)
\`\`\`

---

## 5. 구현 패턴

### Vercel AI SDK - 개요/문단 생성
\`\`\`typescript
// /app/api/ai/outline.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { topic } = await req.json();
  return streamText({
    model: openai('gpt-4o'),
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: \`주제: \${topic}\` }
    ]
  }).toDataStreamResponse();
}
\`\`\`

---

## 5. 구현 체크리스트

### Phase 1: 설정 (2시간)
- [ ] Next.js + Supabase + Tailwind + shadcn 초기화
- [ ] Auth (Google OAuth) 연동

### Phase 2: 블로그 에디터 구현 (4시간)
- [ ] 주제 입력 + 개요 생성
- [ ] 에디터 및 문단별 AI 지원
- [ ] 실시간 상태 및 skeleton 처리

### Phase 3: 목록/저장 기능 (2시간)
- [ ] Supabase에 글 저장
- [ ] 리스트 조회/삭제/수정

---

### Example 3

#### Input
Project Name: AI Q&A Community
Project Idea: 커뮤니티용 Q&A 사이트를 만들고 싶은데, 질문이 올라오면 AI가 중복 여부나 답변 추천을 해줬으면 해.

Key Features:
1. AI 기반 질문 자동 분류 및 태깅
2. 중복 질문 자동 감지
3. AI 답변 추천 및 초안 제공
4. 투표 및 북마크 시스템
5. 실시간 질문 피드

User Flow:
로그인 → Q&A 피드 → 질문 작성 → AI 분류/중복 체크 → 질문 등록 → AI 답변 추천 → 커뮤니티 답변 → 투표/북마크

Tech Preferences: Next.js, TypeScript

Available third-party services found:
- Vercel AI SDK: Question analysis and answer generation (https://sdk.vercel.ai)
- Algolia: Search and duplicate detection (https://algolia.com)
- Supabase: Real-time database and auth (https://supabase.com)
- Upstash: Rate limiting and caching (https://upstash.com)

#### Output

# AI Q&A 커뮤니티 PRD v1.0
> AI 기반 자동 분류, 요약, 투표 기능이 통합된 개발자 중심 Q&A 플랫폼

## 1. 프로젝트 목표
**개발자들이 기술 질문을 쉽게 올리고, AI가 자동으로 카테고리화·요약·답변 추천을 수행하는 실시간 Q&A 웹앱**

---

## 2. Tech Stack

| Category             | Technology / Library                       | Reasoning (선택 이유)                                    |
| -------------------- | ------------------------------------------ | -------------------------------------------------------- |
| Language             | TypeScript                                 | 정적 타입 검사로 안정성·가독성 확보                       |
| Framework            | Next.js 15 (App Router)                    | SSR/SSG 지원, SEO 최적화, 빠른 페이지 로드                |
| UI Toolkit           | Tailwind CSS + shadcn/ui                   | 빠른 스타일링, 접근성 높은 컴포넌트                       |
| AI SDK               | \`ai\` (Vercel AI SDK)                       | 질문 분석 및 답변 생성                                    |
| Search               | Algolia                                    | 중복 질문 감지, 고성능 검색                               |
| Database & Auth      | Supabase (Real-time subscriptions)         | 실시간 업데이트, 내장 인증                                |
| Rate Limiting        | Upstash Redis                              | 사용자별 요청 제한, 캐싱                                  |
| Forms & Validation   | React Hook Form + Zod                      | 선언적 폼 관리·스키마 기반 유효성 검사                    |
| State Management     | Zustand                                    | 경량 상태 관리                                           |
| Utilities            | clsx, date-fns                             | 클래스명 결합·날짜 포맷팅                                 |

---

## 3. 핵심 유저 플로우

\`\`\`
[로그인 페이지]
    ↓ (Google OAuth)
[Q&A 피드]
    ↓ (질문 생성 버튼 클릭)
[질문 입력 → AI 분류/요약]
    ├─ AI가 카테고리 자동 설정
    ├─ AI가 TL;DR 요약 생성
    └─ AI가 중복 질문 체크
    ↓
[질문 등록 완료 → 피드 상단 노출]
    ↓ (다른 유저가 답변)
[AI 추천 순서로 정렬]
    ↓ (투표 or 북마크)
[유저 프로필 → 질문/답변 히스토리]
\`\`\`

---

## 상태별 UI 스펙

### 1. 질문 작성 모달
\`\`\`tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>질문하기</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit(onSubmit)}>
      <Textarea placeholder="질문을 입력하세요" {...register("question")} />
      <div className="flex justify-between items-center mt-4">
        <Badge>{category}</Badge>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "생성 중..." : "등록"}
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
\`\`\`

### 2. 질문 카드
\`\`\`tsx
<Card>
  <CardHeader>
    <div className="flex justify-between items-center">
      <Badge variant="secondary">{question.category}</Badge>
      <BookmarkButton questionId={question.id} />
    </div>
  </CardHeader>
  <CardContent>
    <h3 className="text-lg font-semibold">{question.title}</h3>
    <p className="text-sm text-muted-foreground">{question.tldr}</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <div>{question.voteCount} votes</div>
    <Button size="sm" onClick={() => router.push(\`/question/\${question.id}\`)}>
      상세 보기
    </Button>
  </CardFooter>
</Card>
\`\`\`

---

## 4. 디렉토리 구조

\`\`\`
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── question/
│       ├── page.tsx              # 질문 상세 뷰
│       └── [id]/page.tsx         # 질문 아이디 기반 상세
│
├── components/
│   ├── question/
│   │   ├── question-card.tsx
│   │   ├── new-question-modal.tsx
│   │   ├── question-form.tsx
│   │   └── vote-button.tsx
│   ├── answer/
│   │   ├── answer-list.tsx
│   │   ├── answer-form.tsx
│   │   └── ai-recommendation.tsx
│   └── ui/
│       └── [shadcn components]
│
├── lib/
│   ├── ai/
│   │   ├── classify-question.ts
│   │   ├── summarize-question.ts
│   │   └── recommend-answers.ts
│   └── supabase/
│       └── client.ts
│
└── hooks/
    └── use-question.ts
\`\`\`

---

## 5. 프롬프트 템플릿 (AI 처리)

### 시스템 프롬프트
\`\`\`typescript
const systemPrompt = \`
You are a helpful assistant for a developer Q&A platform.
Your task is to:
1. Categorize technical questions (e.g. 'React', 'Next.js', 'Database')
2. Generate a TL;DR summary of the question
3. Check for duplicate questions
4. Recommend initial answers if possible

Use concise, professional language.
Respond in JSON format.
\`;
\`\`\`

---

## 6. 핵심 기능 요약
- AI 질문 카테고리 자동 분류
- TL;DR 요약 자동 생성
- 중복 질문 감지
- AI 추천 답변 자동 제안
- 질문/답변 투표 및 북마크
- 유저 프로필 & 활동 내역 추적

---

## 7. 체크리스트

### Phase 1: 초기 설정
- [ ] Supabase 프로젝트 생성
- [ ] Auth & DB 테이블 설계
- [ ] Next.js 15 + shadcn 초기화

### Phase 2: 질문 작성 기능
- [ ] 질문 작성 폼 + 카테고리 자동 분류
- [ ] 요약 및 추천 응답 생성
- [ ] 질문 등록 UI 및 피드 반영

### Phase 3: 상세 질문 보기
- [ ] 질문 상세 페이지 구현
- [ ] 답변 등록 및 리스트 출력
- [ ] 추천 답변 카드 UI

### Phase 4: 상호작용 기능
- [ ] 투표 버튼 UI + API 연동
- [ ] 북마크 저장 및 해제 기능
- [ ] 사용자 활동 히스토리

---

Now, here's the NEW PROJECT INPUT:

${userInput}

${searchResults ? `
Available third-party services found:
${searchResults}

IMPORTANT: Prioritize these services in your architecture. Each service = less code to write.
Evaluate each service for:
- Setup time (prefer < 1 hour)
- Free tier availability
- Documentation quality
- SDK/library maturity
` : ''}

Based on the examples above and the user's input, generate a complete PRD following the EXACT same format and structure. 

Remember:
- All source files must be under 200 lines
- Use Supabase for database/auth
- Use Tailwind + shadcn/ui for UI
- Include real implementation code snippets
- Focus on MVP features only
- Structure with clear sections and phases
`
}