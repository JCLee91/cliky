# 🚀 Cliky

Fast, flawless product building tool for vibe coding

## ✨ Key Features

- 🤖 **AI PRD Generation**: Transform project ideas into comprehensive PRDs with GPT-4O real-time streaming
- 📋 **Automatic Task Breakdown**: Break down PRDs into actionable tasks with Claude 4.0 Sonnet
- 🎨 **Typeform-style UX**: Intuitive 4-step project creation flow
- 📱 **Responsive Dashboard**: Perfect user experience from mobile to desktop
- 🔐 **Supabase Auth**: Google/GitHub OAuth with RLS security

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd ClikyAI

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### 2. Supabase Database Setup

1. Create an account at [Supabase](https://supabase.com) and create a new project
2. Navigate to **SQL Editor** in your project dashboard
3. Copy and execute the contents of `scripts/database-setup.sql`
4. Copy your project URL and keys from **Settings** → **API**

### 3. API Key Configuration

Add the following API keys to your `.env.local` file:

```bash
# OpenAI (for PRD generation)
OPENAI_API_KEY=sk-proj-...

# Anthropic Claude (for task breakdown - also used by Taskmaster MCP)  
ANTHROPIC_API_KEY=sk-ant-api03-...

# Supabase (database) - copy from Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Brave Search API (for internet research)
BRAVE_API_KEY=BSA...
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤖 AI Model Configuration

### PRD Generation AI (OpenAI)
**Default**: `gpt-4o-mini`

```bash
AI_MODEL=gpt-4o-mini
```

**Other options**:
- `gpt-4o`: Latest multimodal model
- `gpt-4o-mini`: Fast and cost-effective (recommended)
- `gpt-4.1`: 2025 latest model
- `gpt-4.1-mini`: Latest compact model

### Task Breakdown AI (Anthropic Claude)
**Default**: `claude-sonnet-4-20250514`

```bash
TASKMASTER_MODEL=claude-sonnet-4-20250514
```

**Other options**:
- `claude-sonnet-4-20250514`: Claude 4.0 Sonnet (recommended)
- `claude-opus-4-20250514`: Claude 4.0 Opus (most powerful)
- `claude-3-7-sonnet-20250219`: Claude 3.7 Sonnet
- `claude-3-5-sonnet-20241022`: Claude 3.5 Sonnet

## 📚 Tech Stack

- [Next.js 15](https://nextjs.org) - React framework
- [React 19](https://react.dev) - UI library
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Shadcn UI](https://ui.shadcn.com) - Component library
- [Supabase](https://supabase.com) - Backend & Auth
- [Vercel AI SDK](https://sdk.vercel.ai) - AI streaming
- [Zod](https://zod.dev) - Schema validation
- [React Hook Form](https://react-hook-form.com) - Form handling
- [Framer Motion](https://www.framer.com/motion/) - Animations

## 🛠️ Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── project-form/     # Project creation form
│   ├── prd-viewer/       # PRD display component
│   └── task-cards/       # Task management UI
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── prompts/         # AI prompt management
│   │   ├── architect-prompts.ts    # PRD generation prompts
│   │   ├── taskmaster-prompts.ts   # Task breakdown prompts
│   │   ├── subtask-prompts.ts      # Subtask expansion prompts
│   │   ├── wizard-prompts.ts       # Guided form prompts
│   │   └── researcher-prompts.ts   # Search query prompts
│   ├── supabase/        # Database client
│   └── taskmaster/      # Task breakdown logic
├── store/               # State management
└── types/               # TypeScript types
```

## 🔧 Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.