# Development Standards for Claude Code

## Core Principles
Follow Test-Driven Development (TDD) and incremental development practices for all projects.

## Development Workflow

### 1. Test-First Approach
- Always write tests BEFORE implementing features
- Ensure tests fail initially (red phase)
- Implement only enough code to make tests pass (green phase)
- Refactor if needed while keeping tests green

### 2. Incremental Development
- Develop ONE feature at a time
- Complete each feature fully (including tests) before starting the next
- Break large features into smaller, testable components

### 3. Testing Requirements
- Run the complete test suite before EVERY commit
- Display test output and results before marking any task complete
- Fix all failing tests before proceeding

### 4. Version Control Standards
- Commit only when ALL tests pass and code is error-free
- Always ASK for permission before committing
- Use descriptive commit messages following conventional format: `type(scope): description`
- Example: `feat(auth): add user login validation`
- Never commit on main branch

### 5. Repository Hygiene
- DO NOT push temporary files, test artifacts, or migration scripts
- Question files to include: build artifacts, logs, test databases, temporary scripts
- When uncertain about a file's necessity, ASK before including it
- Maintain a clean .gitignore file

### 6. Communication
- Provide clear, step-by-step instructions for any manual steps required
- Share test results and important outputs explicitly

## Example Workflow
1. "I'll write tests for feature X"
2. "Running tests... [show output]"
3. "Implementing feature X to pass tests"
4. "All tests passing. May I commit with message: 'feat: add feature X'?"
5. "What should we work on next?"