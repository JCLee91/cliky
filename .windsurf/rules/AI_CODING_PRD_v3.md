---
trigger: manual
---

# AI 코딩 최적화 PRD v3.0
> Vercel AI SDK와 MCP를 활용한 차세대 AI 코딩 대시보드

## 🎯 프로젝트 목표
**사용자의 프로젝트 아이디어를 구조화된 TRD로 변환하고, Taskmaster MCP로 실행 가능한 작업으로 분해하는 AI 대시보드**

---

## 🔄 핵심 유저 플로우

### 메인 플로우 다이어그램
```
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
[TRD 생성 중 - 스트리밍]
    ├─ Brave Search로 최신 기술 검색
    ├─ Vercel AI SDK로 TRD 작성
    └─ 실시간 Markdown 렌더링
    ↓ (완료)
[TRD 뷰 + 작업 분리 버튼]
    ↓ (세부 작업으로 나누기)
[Taskmaster MCP 처리]
    └─ 작업 카드 생성
    ↓
[완성된 대시보드]
    ├─ 좌측: TRD 뷰어
    └─ 우측: 작업 카드 그리드
```

### 상태별 UI 스펙

#### 1. 빈 대시보드 상태
```jsx
// 중앙 정렬된 CTA
<div className="flex items-center justify-center h-full">
  <Card className="max-w-md p-8 text-center">
    <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
    <h2 className="text-2xl font-bold mb-2">첫 프로젝트를 만들어보세요</h2>
    <p className="text-muted-foreground mb-6">
      아이디어를 입력하면 AI가 TRD와 작업 목록을 생성합니다
    </p>
    <Button size="lg" className="rounded-2xl">
      <Plus className="mr-2" /> 새 프로젝트 만들기
    </Button>
  </Card>
</div>
```

#### 2. Typeform 질문 시퀀스
```jsx
// 풀스크린 모달 with 애니메이션
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-2xl h-[80vh]">
    {/* Progress Bar */}
    <div className="h-1 bg-secondary rounded-full overflow-hidden">
      <div 
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
    
    {/* Step Content with Framer Motion */}
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        {renderCurrentStep()}
      </motion.div>
    </AnimatePresence>
  </DialogContent>
</Dialog>
```

#### 3. TRD 스트리밍 뷰
```jsx
// 실시간 Markdown 렌더링
<div className="relative">
  {isStreaming && (
    <div className="absolute top-4 right-4">
      <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        <span className="text-sm">AI가 작성 중...</span>
      </div>
    </div>
  )}
  
  <ReactMarkdown
    className="prose prose-invert max-w-none"
    components={{
      code: ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }}
  >
    {trdContent}
  </ReactMarkdown>
</div>
```

---

## 📁 프로젝트 구조 (파일당 줄 수 제한 포함)

```
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
│   │   └── header/
│   │       ├── index.tsx       # 헤더 컨테이너 (max 80줄)
│   │       └── theme-toggle.tsx # 다크모드 토글 (max 40줄)
│   │
│   ├── project-form/           # Typeform 스타일 폼
│   │   ├── index.tsx          # 폼 컨테이너 (max 120줄)
│   │   ├── steps/
│   │   │   ├── idea-step.tsx  # Step 1 (max 80줄)
│   │   │   ├── features-step.tsx # Step 2 (max 100줄)
│   │   │   ├── flow-step.tsx  # Step 3 (max 100줄)
│   │   │   └── tech-step.tsx  # Step 4 (max 80줄)
│   │   └── progress-bar.tsx   # 진행률 표시 (max 40줄)
│   │
│   ├── trd-viewer/
│   │   ├── index.tsx          # TRD 뷰어 메인 (max 150줄)
│   │   ├── markdown-renderer.tsx # Markdown 렌더러 (max 100줄)
│   │   └── copy-button.tsx    # 복사 버튼 (max 60줄)
│   │
│   ├── task-cards/
│   │   ├── index.tsx          # 작업 카드 그리드 (max 120줄)
│   │   ├── task-card.tsx      # 개별 카드 (max 100줄)
│   │   └── export-button.tsx  # 전체 내보내기 (max 80줄)
│   │
│   └── ui/                    # shadcn/ui 컴포넌트
│
├── hooks/
│   ├── use-project.ts         # 프로젝트 상태 관리 (max 100줄)
│   ├── use-ai-stream.ts       # AI 스트리밍 (max 80줄)
│   └── use-mcp.ts            # MCP 통합 (max 80줄)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # 클라이언트 설정 (max 30줄)
│   │   └── middleware.ts     # 미들웨어 (max 50줄)
│   ├── ai/
│   │   ├── prompts.ts        # 프롬프트 템플릿 (max 150줄)
│   │   └── vercel-ai.ts      # Vercel AI 설정 (max 50줄)
│   └── mcp/
│       └── taskmaster.ts     # Taskmaster MCP (max 100줄)
│
└── types/
    ├── project.ts            # 프로젝트 타입 (max 50줄)
    ├── trd.ts               # TRD 타입 (max 40줄)
    └── task.ts              # 작업 타입 (max 40줄)
```

---

## 🛠 기술 스택 상세

### 핵심 의존성
```json
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
    "rehype-highlight": "^7.0.0",
    
    // Utilities
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.0",
    "date-fns": "^4.1.0"
  }
}
```

### 환경 변수 구조
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# AI Services  
OPENAI_API_KEY=sk-...
BRAVE_SEARCH_API_KEY=BSA...

# Vercel AI SDK
AI_PROVIDER=openai
AI_MODEL=gpt-4o
```

---

## 💡 핵심 구현 패턴

### 1. Vercel AI SDK 스트리밍 구현
```typescript
// app/api/ai/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { prompt, context } = await req.json();
  
  // Brave Search 결과를 context에 포함
  const searchResults = await searchLatestTech(context.techStack);
  
  const result = streamText({
    model: openai('gpt-4o'),
    messages: [
      {
        role: 'system',
        content: 'You are an expert technical architect...'
      },
      {
        role: 'user',
        content: `${prompt}\n\nLatest tech info:\n${searchResults}`
      }
    ],
    temperature: 0.7,
  });
  
  return result.toDataStreamResponse();
}
```

### 2. MCP Taskmaster 통합
```typescript
// lib/mcp/taskmaster.ts
import { MCPClient } from '@modelcontextprotocol/sdk';

export async function breakdownToTasks(trd: string) {
  const mcp = new MCPClient({
    serverName: 'taskmaster',
    transport: 'stdio'
  });
  
  await mcp.connect();
  
  const result = await mcp.callTool('request_planning', {
    originalRequest: trd,
    tasks: await generateInitialTasks(trd)
  });
  
  return result.tasks;
}
```

### 3. 실시간 스트리밍 훅
```typescript
// hooks/use-ai-stream.ts
import { useCompletion } from 'ai/react';

export function useAIStream() {
  const { completion, isLoading, complete } = useCompletion({
    api: '/api/ai',
    onFinish: (prompt, completion) => {
      // TRD 생성 완료 후 자동 저장
      saveToSupabase(completion);
    }
  });
  
  return { 
    content: completion,
    isStreaming: isLoading,
    generate: complete
  };
}
```

---

## 🎨 UI 컴포넌트 상세 스펙

### 1. 사이드바 네비게이션
```jsx
// 반응형 드로어 + 데스크톱 고정
<aside className={cn(
  "fixed inset-y-0 z-50 flex h-full w-72 flex-col",
  "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
  "border-r transition-transform duration-300",
  // 모바일: 드로어 방식
  "lg:relative lg:translate-x-0",
  isOpen ? "translate-x-0" : "-translate-x-full"
)}>
  <SidebarHeader />
  <ProjectList projects={projects} />
  <SidebarFooter>
    <UserMenu />
  </SidebarFooter>
</aside>
```

### 2. 작업 카드 드래그 앤 드롭
```jsx
// Framer Motion으로 순서 변경
<Reorder.Group values={tasks} onReorder={setTasks}>
  {tasks.map((task) => (
    <Reorder.Item
      key={task.id}
      value={task}
      className="group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <TaskCard task={task} />
    </Reorder.Item>
  ))}
</Reorder.Group>
```

### 3. 복사 버튼 피드백
```jsx
// 복사 성공 시 애니메이션
<Button
  onClick={handleCopy}
  variant="ghost"
  size="sm"
  className="gap-2"
>
  <AnimatePresence mode="wait">
    {isCopied ? (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
      >
        <Check className="h-4 w-4 text-green-500" />
      </motion.div>
    ) : (
      <Copy className="h-4 w-4" />
    )}
  </AnimatePresence>
  {isCopied ? "복사됨!" : "복사"}
</Button>
```

---

## 📋 프롬프트 엔지니어링

### TRD 생성 프롬프트
```typescript
const TRD_SYSTEM_PROMPT = `
You are an expert technical architect specializing in modern web development.
Your task is to create a comprehensive Technical Requirements Document (TRD).

Guidelines:
1. Use the latest stable versions of technologies
2. Prioritize developer experience and maintainability
3. Include specific implementation details
4. Structure the document with clear sections
5. Provide code examples where relevant

Output Format:
- Use Markdown with proper headings
- Include code blocks with syntax highlighting
- Add tables for API endpoints and data models
- Keep sections concise but complete
`;

const generateTRDPrompt = (data: ProjectFormData) => `
Project Idea: ${data.idea}

Core Features:
${data.features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

User Flow:
${data.userFlow}

Tech Preferences: ${data.techPreferences?.join(', ') || 'No specific preferences'}

Based on the above information and the latest tech trends from Brave Search,
create a comprehensive TRD that includes:

1. Executive Summary
2. Technical Architecture
3. Component Structure  
4. API Design
5. Database Schema
6. Security Considerations
7. Performance Optimization
8. Deployment Strategy
`;
```

---

## 🚀 구현 체크리스트

### Phase 1: 기초 설정 (3시간)
- [ ] Next.js 15 프로젝트 생성
- [ ] Supabase 프로젝트 설정 및 스키마 생성
- [ ] shadcn/ui 설치 (`npx shadcn@latest init`)
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
- [ ] TRD 스트리밍 뷰어
- [ ] Markdown 렌더러 & 코드 하이라이팅
- [ ] 복사 기능 구현

### Phase 4: MCP & 작업 관리 (5시간)
- [ ] Taskmaster MCP 연동
- [ ] 작업 카드 UI
- [ ] 드래그 앤 드롭
- [ ] 전체 내보내기 기능
- [ ] Brave Search API 통합

### Phase 5: 마무리 (2시간)
- [ ] 에러 처리 & 로딩 상태
- [ ] 성능 최적화
- [ ] 배포 준비
- [ ] 테스트 & 디버깅

---

## 🔍 핵심 차별화 요소

1. **실시간 AI 스트리밍**: Vercel AI SDK로 TRD가 실시간으로 생성되는 것을 시각적으로 확인
2. **Taskmaster MCP 통합**: 단순 텍스트가 아닌 구조화된 작업 단위로 자동 분해
3. **최신 기술 반영**: Brave Search로 실시간 기술 트렌드 검색 후 TRD에 반영
4. **Typeform UX**: 단계별 가이드로 사용자 부담 최소화
5. **원클릭 복사**: TRD와 작업 목록을 즉시 다른 AI 도구에서 활용 가능

이 PRD는 AI가 코드를 생성할 때 필요한 모든 구현 디테일을 포함하면서도, 
불필요한 마이크로매니징을 피하고 개발자의 창의성을 존중하는 균형을 맞췄습니다.
