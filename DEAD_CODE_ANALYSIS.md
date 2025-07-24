# Dead Code and Duplication Analysis Report

## Executive Summary

This report identifies unnecessary duplications, dead code, and inconsistencies in the task streaming and creation logic across the codebase.

## 1. Duplicate Task Parsing Logic

### Issue: Identical task parsing in multiple locations

**Location 1: `/src/hooks/use-task-stream.ts` lines 48-84 (onFinish)**
```typescript
const lines = completion.trim().split('\n')
const tasks: Task[] = []

for (const line of lines) {
  const trimmedLine = line.trim()
  if (trimmedLine) {
    try {
      const cleanLine = trimmedLine.replace(/^```(json)?|```$/g, '').trim()
      if (!cleanLine) continue
      
      const task = JSON.parse(cleanLine)
      if (task.id && task.title && task.description) {
        tasks.push({
          id: task.id.toString(),
          // ... rest of task object
        })
      }
    } catch (lineError) {
      // Silently skip invalid lines
    }
  }
}
```

**Location 2: `/src/hooks/use-task-stream.ts` lines 146-186 (useEffect)**
```typescript
// Almost identical parsing logic repeated
for (let i = processedLinesRef.current; i < lines.length; i++) {
  const line = lines[i].trim()
  if (line) {
    try {
      const cleanLine = line.replace(/^```(json)?|```$/g, '').trim()
      // ... identical logic
    }
  }
}
```

**Recommendation:** Extract common parsing logic into a reusable function.

## 2. Redundant State Management

### Issue: Multiple sources of truth for tasks

1. **`use-task-stream.ts`**: `parsedTasks` state
2. **`use-mcp.ts`**: `tasks` state  
3. **`dashboard/page.tsx`**: Conditional logic choosing between `parsedTasks` and `tasks`

**Problem Code:**
```typescript
// dashboard/page.tsx line 186-188
tasks={isGeneratingTasks || isExpandingTasks 
  ? (parsedTasks.length > 0 ? parsedTasks : tasks) 
  : tasks}
```

**Recommendation:** Use a single source of truth for tasks.

## 3. Dead Code

### Unused Variables and Imports

1. **`use-task-stream.ts`**:
   - `streamingContent` (line 358) - exported but never used
   - `processedLinesRef` - only used during streaming, could be local to useEffect

2. **`dashboard/page.tsx`**:
   - `displayContent` (line 137) - unnecessarily complex, could be simplified
   - `setTasks` imported from `useMCP` (line 54) but only used once

### Unused Functions/Features

1. **`use-mcp.ts`**:
   - `generateTasks` function (lines 20-64) - appears to be replaced by streaming version
   - `clearError` (line 255) - exported but never used
   - MCP-based task generation seems deprecated in favor of streaming

## 4. Naming Inconsistencies

### Issue: Mixed naming conventions

1. **Snake_case vs camelCase**:
   - `estimated_time` vs `estimatedTime` (used interchangeably)
   - `test_strategy` vs `testStrategy`
   - `acceptance_criteria` vs `acceptanceCriteria`

**Examples:**
```typescript
// use-task-stream.ts line 69
estimated_time: task.estimatedTime || task.estimated_time || '',

// use-task-stream.ts line 274
test_strategy: task.testStrategy || null,
```

## 5. Redundant Null Checks

### Issue: Excessive defensive programming

1. **Multiple checks for the same condition**:
```typescript
// use-task-stream.ts lines 142-143
if (!completion || !isLoading || isParsingComplete) return
```

2. **Redundant validation**:
```typescript
// use-mcp.ts lines 258-262
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

if (!uuidRegex.test(projectId)) {
  throw new Error('Invalid project ID format')
}
```
This validation is repeated in multiple places.

## 6. Unused Hooks and Effects

### Dead useEffect Dependencies

1. **`dashboard/page.tsx` line 126-128**:
```typescript
useEffect(() => {
  initializeProjects()
}, [initializeProjects])
```
This appears to be a one-time initialization that could be handled differently.

## 7. Complex Conditional Logic

### Issue: Overly complex ternary operators

**Location: `task-cards/index.tsx` lines 42-69**
```typescript
if (isLoading && tasks.length === 0) {
  // Show skeleton
}
```

Followed by:
```typescript
if (showBreakdownButton) {
  // Show breakdown button
}
```

And:
```typescript
if (!isLoading && tasks.length === 0) {
  // Show empty state
}
```

These conditions could be simplified into a single switch-like structure.

## 8. Duplicate Error Handling

### Issue: Similar error handling patterns repeated

1. **Silent error handling in multiple places**:
```typescript
// use-task-stream.ts line 81
} catch (lineError) {
  // Silently skip invalid lines
}

// use-task-stream.ts line 182
} catch {
  // 아직 완성되지 않은 JSON 라인은 무시
}
```

## 9. Unused API Endpoints

### In `api/taskmaster/route.ts`:

1. **Non-streaming task generation endpoints**:
   - `parse-prd` action (lines 221-231)
   - `expand-task` action (lines 233-243)
   - These appear to be replaced by streaming versions

2. **Unused task management actions**:
   - `next-task` (lines 245-257)
   - `update-task` (lines 259-276)
   - `calculate-progress` (lines 278-288)

## 10. Recommendations for Cleanup

### High Priority (Safe to Remove)

1. **Extract duplicate parsing logic** into a utility function
2. **Remove unused exports** from hooks:
   - `streamingContent` from `use-task-stream.ts`
   - `clearError` from `use-mcp.ts`
   - `generateTasks` from `use-mcp.ts` (if truly replaced by streaming)

3. **Standardize naming conventions**:
   - Use camelCase consistently for all task properties
   - Create a mapping function if needed for API compatibility

4. **Remove dead API actions** from `route.ts` if not used

### Medium Priority

1. **Consolidate state management**:
   - Consider using only streaming-based task generation
   - Remove redundant task state in `use-mcp.ts`

2. **Simplify conditional rendering** in `task-cards/index.tsx`

3. **Remove duplicate UUID validation** - create a shared validator

### Low Priority

1. **Optimize useEffect hooks** - some could be combined or removed
2. **Remove commented code** and outdated comments
3. **Consolidate error handling patterns**

## 11. Additional Findings

### Unused State Variables

1. **`expandingTaskIds` in `use-task-stream.ts`**:
   - Set in line 295: `setExpandingTaskIds(expandingIds)`
   - Cleared in line 344: `setExpandingTaskIds(new Set())`
   - Exported but never actually used for any logic
   - The `isExpandingTasks` boolean is sufficient

2. **Complex callback system in `use-task-stream.ts`**:
   - `callbacksRef` (lines 25-28) - overly complex for simple callbacks
   - Could use direct props instead of ref + dynamic callbacks

### Redundant Task Expansion Logic

The task expansion feature appears to be automatically triggered but the `expandingTaskIds` Set is never used to show which specific tasks are being expanded.

### Dead Import in dashboard

The `expandingTaskIds` is imported in `dashboard/page.tsx` (line 45) but never used.

## Code Metrics

- **Duplicate code blocks**: ~150 lines
- **Unused exports**: 5 functions/variables
- **Unused state variables**: 2 (expandingTaskIds, callbacksRef complexity)
- **Dead conditional branches**: 3-4 branches
- **Inconsistent naming**: ~20 instances
- **Potential reduction**: ~300-400 lines of code

## 12. Quick Implementation Guide

### Step 1: Extract Common Task Parsing Function

Create `/src/utils/task-parser.ts`:
```typescript
export function parseTaskLine(line: string): Task | null {
  const cleanLine = line.trim().replace(/^```(json)?|```$/g, '').trim()
  if (!cleanLine) return null
  
  try {
    const task = JSON.parse(cleanLine)
    if (task.id && task.title && task.description) {
      return {
        id: task.id.toString(),
        project_id: '',
        title: task.title,
        description: task.description,
        priority: task.priority || 'medium',
        estimated_time: task.estimatedTime || task.estimated_time || '',
        dependencies: task.dependencies || [],
        order_index: task.id,
        status: task.status || 'todo',
        created_at: new Date().toISOString(),
        details: task.details,
        testStrategy: task.testStrategy,
        acceptanceCriteria: task.acceptanceCriteria
      }
    }
  } catch {
    // Invalid JSON
  }
  return null
}
```

### Step 2: Remove Unused Exports

From `use-task-stream.ts`, remove:
- `streamingContent` from return object
- `expandingTaskIds` state and from return object

From `use-mcp.ts`, remove:
- `generateTasks` function (if confirmed unused)
- `clearError` from return object

### Step 3: Standardize Property Names

Create a mapping utility:
```typescript
export function normalizeTaskProperties(task: any): Task {
  return {
    ...task,
    estimated_time: task.estimated_time || task.estimatedTime,
    test_strategy: task.test_strategy || task.testStrategy,
    acceptance_criteria: task.acceptance_criteria || task.acceptanceCriteria
  }
}
```

### Step 4: Simplify Task Cards Rendering

Replace multiple if statements with a single function:
```typescript
function getTaskCardContent() {
  if (isLoading && tasks.length === 0) return <LoadingSkeleton />
  if (showBreakdownButton) return <BreakdownPrompt />
  if (!isLoading && tasks.length === 0) return <EmptyState />
  return <TaskList />
}
```