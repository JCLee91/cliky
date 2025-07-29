import { describe, it, expect, beforeAll } from 'vitest';
import { spawn } from 'child_process';
import { join } from 'path';

describe('MCP Server', () => {
  it('should start without errors', async () => {
    const serverPath = join(__dirname, '..', 'build', 'index.js');
    
    const server = spawn('node', [serverPath], {
      env: {
        ...process.env,
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_KEY: 'test-key',
        CLIKY_USER_ID: 'test-user'
      }
    });

    let errorOutput = '';
    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Give server time to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if server started successfully
    expect(errorOutput).toContain('Cliky MCP Task Manager started successfully');
    
    // Clean up
    server.kill();
  });
});