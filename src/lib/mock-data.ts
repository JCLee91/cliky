// 목업 대시보드용 데이터
export const mockUser = {
  id: 'd8213643-a853-4714-8aa1-e8fc1bae51e9',
  email: 'Welcome@Cliky.ai',
  full_name: 'Steve',
  avatar_url: 'https://siinozkmozdwbwojoovi.supabase.co/storage/v1/object/public/avatars/d8213643-a853-4714-8aa1-e8fc1bae51e9/d8213643-a853-4714-8aa1-e8fc1bae51e9-1753324142894.png',
  created_at: '2025-07-24T02:29:54.795333+00:00',
  updated_at: '2025-07-24T02:34:26.723328+00:00'
}

export const mockProjects = [
  {
    "id": "bc9e79c8-8b0e-41fd-930c-f66e014daf22",
    "user_id": "d8213643-a853-4714-8aa1-e8fc1bae51e9",
    "name": "Sample Project",
    "idea": "Marketing SAAS for Asset Management",
    "features": [],
    "user_flow": "",
    "tech_preferences": [],
    "trd_content": "# Marketing SAAS for Asset Management PRD v1.0\n> A streamlined SAAS platform for managing marketing assets efficiently\n\n## 1. Project Goal\n**Develop a Marketing SAAS that enables asset managers to organize, categorize, and share marketing assets with ease, while providing analytics on asset performance.**\n\n---\n\n## 2. Tech Stack\n\n| Category             | Technology / Library                           | Reasoning                                                 |\n| -------------------- | ---------------------------------------------- | --------------------------------------------------------- |\n| Language             | TypeScript                                     | Ensures type safety and enhances code readability         |\n| Framework            | Next.js 15 (App Router) + React 19             | Modern SSR/SSG support, optimized for fast performance    |\n| UI Toolkit           | Tailwind CSS + shadcn/ui                       | Provides rapid styling capabilities and accessible components |\n| Database & Auth      | Supabase (Real-time subscriptions)             | Real-time updates and built-in authentication              |\n| Analytics            | Plausible Analytics                            | Lightweight, privacy-friendly analytics                    |\n| Forms & Validation   | React Hook Form + Zod                          | Declarative form management and schema-based validation   |\n| State Management     | Zustand                                        | Simple and scalable state management                      |\n| Utilities            | clsx, tailwind-merge, date-fns                 | Utility functions for class name merging and date formatting |\n\n---\n\n## 3. Key User Flows\n\n```\n[Login Page]\n    ↓ (Google OAuth)\n[Dashboard - Asset Overview]\n    ↓ (Create Asset Button Click)\n[Asset Upload Form]\n    ↓\n[AI-based Categorization & Tagging]\n    ├─ AI suggests categories and tags\n    └─ User confirmation and edits\n    ↓\n[Asset List with Performance Analytics]\n    ├─ View/Edit/Delete Assets\n    └─ Share Asset Links\n```\n\n---\n\n## UI Specifications by State\n\n### 1. Dashboard Overview\n```tsx\n<div className=\"flex items-center justify-center h-full\">\n  <Card className=\"max-w-3xl p-8 text-center\">\n    <h2 className=\"text-2xl font-bold mb-4\">Marketing Assets Overview</h2>\n    <Button size=\"lg\" className=\"rounded-full\">\n      <Plus className=\"mr-2\" /> Upload New Asset\n    </Button>\n    <AssetList assets={assets} />\n  </Card>\n</div>\n```\n\n### 2. Asset Upload Form\n```tsx\n<Dialog open={open} onOpenChange={setOpen}>\n  <DialogContent className=\"max-w-xl\">\n    <DialogHeader>\n      <DialogTitle>Upload Marketing Asset</DialogTitle>\n    </DialogHeader>\n    <form onSubmit={handleSubmit(onSubmit)}>\n      <Input type=\"file\" {...register(\"file\")} />\n      <Textarea placeholder=\"Description\" {...register(\"description\")} />\n      <Button type=\"submit\" disabled={isLoading}>\n        {isLoading ? \"Uploading...\" : \"Upload\"}\n      </Button>\n    </form>\n  </DialogContent>\n</Dialog>\n```\n\n---\n\n## 4. Directory Structure\n\n```\nsrc/\n├── app/\n│   ├── layout.tsx\n│   ├── page.tsx\n│   └── dashboard/\n│       ├── page.tsx              # Dashboard Overview\n│       └── upload/\n│           └── page.tsx          # Asset Upload Page\n│\n├── components/\n│   ├── asset/\n│   │   ├── asset-list.tsx\n│   │   ├── asset-card.tsx\n│   │   ├── upload-form.tsx\n│   └── ui/\n│       └── [shadcn components]\n│\n├── lib/\n│   ├── supabase/\n│   │   └── client.ts\n│   └── analytics/\n│       └── plausible.ts          # Plausible Analytics setup\n│\n└── hooks/\n    └── use-assets.ts             # Manage assets state\n```\n\n---\n\n## 5. AI Processing Prompts\n\n### System Prompt\n```typescript\nconst systemPrompt = `\nYou are an AI assistant for a marketing asset management platform.\nYour task is to:\n1. Automatically categorize marketing assets (e.g., 'Brochure', 'Video', 'Infographic')\n2. Suggest relevant tags based on the asset content\n3. Provide analytics insights on asset performance\n\nUse concise, professional language.\nRespond in JSON format.\n`;\n```\n\n---\n\n## 6. Core Features Summary\n- AI-based asset categorization and tagging\n- Upload and manage marketing assets\n- Share asset links with performance tracking\n- Real-time updates using Supabase\n- Integrated analytics for asset performance\n\n---\n\n## 7. Implementation Checklist\n\n### Phase 1: Initial Setup\n- [ ] Create Supabase project\n- [ ] Set up authentication and database schema\n- [ ] Initialize Next.js 15 with shadcn\n\n### Phase 2: Asset Management Features\n- [ ] Implement asset upload form with AI-based categorization\n- [ ] Develop asset list with performance analytics\n- [ ] Implement asset sharing and link generation\n\n### Phase 3: Analytics and User Interaction\n- [ ] Integrate Plausible Analytics for asset tracking\n- [ ] Implement real-time updates for asset changes\n- [ ] Develop user profile and asset history tracking\n\n---",
    "status": "trd_generated",
    "created_at": "2025-07-23T09:37:18.636263+00:00",
    "updated_at": "2025-07-23T09:37:39.865226+00:00",
    "deleted_at": null
  }
]

// Marketing SAAS 프로젝트의 태스크들
export const mockTasks = {
  'bc9e79c8-8b0e-41fd-930c-f66e014daf22': [
    { id: '9', title: 'Create Supabase project', status: 'completed', project_id: 'bc9e79c8-8b0e-41fd-930c-f66e014daf22', position: 0 },
    { id: '10', title: 'Set up authentication and database schema', status: 'completed', project_id: 'bc9e79c8-8b0e-41fd-930c-f66e014daf22', position: 1 },
    { id: '11', title: 'Initialize Next.js 15 with shadcn', status: 'completed', project_id: 'bc9e79c8-8b0e-41fd-930c-f66e014daf22', position: 2 },
    { id: '12', title: 'Implement asset upload form with AI-based categorization', status: 'in_progress', project_id: 'bc9e79c8-8b0e-41fd-930c-f66e014daf22', position: 3 },
    { id: '13', title: 'Develop asset list with performance analytics', status: 'in_progress', project_id: 'bc9e79c8-8b0e-41fd-930c-f66e014daf22', position: 4 },
    { id: '14', title: 'Implement asset sharing and link generation', status: 'todo', project_id: 'bc9e79c8-8b0e-41fd-930c-f66e014daf22', position: 5 },
    { id: '15', title: 'Integrate Plausible Analytics for asset tracking', status: 'todo', project_id: 'bc9e79c8-8b0e-41fd-930c-f66e014daf22', position: 6 }
  ]
}