# Cliky MCP Task Manager

MCP (Model Context Protocol) server for managing Cliky tasks directly from Cursor or other MCP-compatible editors.

## Features

- 🚀 **Get Next Task**: Automatically fetches and starts the next pending task
- 📝 **Update Status**: Change task status (pending, in_progress, completed, blocked)
- 🔍 **Task Details**: View comprehensive task information including acceptance criteria
- ✅ **Complete & Continue**: Mark tasks complete and automatically start the next one
- 📋 **List Tasks**: View all your assigned tasks with filtering options

## Installation

### Prerequisites

- Node.js 18+ 
- Cliky account with existing projects and tasks
- Cursor (or other MCP-compatible editor)

### Setup

1. Install the package globally:
```bash
npm install -g @cliky/mcp-task-manager
```

2. Create a configuration file with your credentials:
```bash
# Create a .env file in a secure location
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
CLIKY_USER_ID=your-user-id
```

3. Configure Cursor to use the MCP server:

**Mac/Linux**: Edit `~/Library/Application Support/Cursor/User/globalStorage/cursor-ai/settings.json`
**Windows**: Edit `%APPDATA%\Cursor\User\globalStorage\cursor-ai\settings.json`

```json
{
  "mcpServers": {
    "cliky-tasks": {
      "command": "cliky-mcp",
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_ANON_KEY": "your-anon-key",
        "CLIKY_USER_ID": "your-user-id"
      }
    }
  }
}
```

4. Restart Cursor

## Usage

Once configured, you can use natural language to interact with your Cliky tasks:

### Starting Work
```
"Get my next task"
"Start working on the next pending task"
"What should I work on next?"
```

### During Development
```
"Show me the current task details"
"What are the acceptance criteria for this task?"
"Mark this task as blocked - waiting for API access"
```

### Completing Work
```
"I've finished this task, what's next?"
"Complete task #123 with notes: implemented user authentication"
"Mark current task as done and get the next one"
```

### Task Management
```
"List all my pending tasks"
"Show me my in-progress tasks"
"List tasks for project ABC"
```

## Getting Your Credentials

### Supabase URL and Anon Key
1. Go to your Cliky project's Supabase dashboard
2. Navigate to Settings → API
3. Copy the Project URL and anon key (public key)

### User ID
1. Log into Cliky
2. Open browser DevTools
3. Go to Application → Local Storage
4. Find your user ID in the auth data

## Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/JCLee91/cliky.git
cd cliky/mcp-server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Run in development mode
npm run dev
```

### Testing
```bash
# Run tests
npm test

# Test with MCP Inspector
npx @modelcontextprotocol/inspector node build/index.js
```

## Security Notes

- **Anon Key**: The anon key is safe for client-side use and works with Row Level Security (RLS)
- **User Isolation**: The server only accesses tasks assigned to the configured user ID
- **Environment Variables**: Store credentials in environment variables, not in code
- **Task Status Storage**: Task statuses are stored locally in `.data/` directory per user

## Troubleshooting

### Tasks not showing up
- Verify your user ID is correct
- Check that you have pending tasks assigned to you
- Ensure tasks are not soft-deleted

### Connection errors
- Verify Supabase URL and keys are correct
- Check network connectivity
- Ensure Cursor has been restarted after configuration

### Permission errors
- Confirm the anon key is correct
- Verify RLS policies allow access to your tasks
- Check that your user ID matches the authenticated user

## Contributing

Contributions are welcome! Please see the main Cliky repository for contribution guidelines.

## License

MIT License - see LICENSE file for details