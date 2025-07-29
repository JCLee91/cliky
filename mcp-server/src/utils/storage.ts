import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

interface StatusData {
  [taskId: string]: {
    status: TaskStatus;
    updatedAt: string;
    userId: string;
  };
}

/**
 * Persistent storage for task statuses
 * Stores status in a local JSON file per user
 */
export class TaskStatusStore {
  private statusFile: string;
  private statusData: StatusData = {};
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    const dataDir = join(__dirname, '../../.data');
    
    // Create data directory if it doesn't exist
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    
    this.statusFile = join(dataDir, `task-status-${userId}.json`);
    this.loadStatus();
  }

  private loadStatus(): void {
    try {
      if (existsSync(this.statusFile)) {
        const data = readFileSync(this.statusFile, 'utf-8');
        this.statusData = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load task status:', error);
      this.statusData = {};
    }
  }

  private saveStatus(): void {
    try {
      writeFileSync(this.statusFile, JSON.stringify(this.statusData, null, 2));
    } catch (error) {
      console.error('Failed to save task status:', error);
    }
  }

  get(taskId: string): TaskStatus | undefined {
    return this.statusData[taskId]?.status;
  }

  set(taskId: string, status: TaskStatus): void {
    this.statusData[taskId] = {
      status,
      updatedAt: new Date().toISOString(),
      userId: this.userId
    };
    this.saveStatus();
  }

  getAll(): Map<string, TaskStatus> {
    const map = new Map<string, TaskStatus>();
    for (const [taskId, data] of Object.entries(this.statusData)) {
      map.set(taskId, data.status);
    }
    return map;
  }

  // Get tasks by status
  getByStatus(status: TaskStatus): string[] {
    return Object.entries(this.statusData)
      .filter(([_, data]) => data.status === status)
      .map(([taskId]) => taskId);
  }

  // Clean up old completed tasks (older than 30 days)
  cleanup(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let changed = false;
    for (const [taskId, data] of Object.entries(this.statusData)) {
      if (data.status === 'completed') {
        const updatedAt = new Date(data.updatedAt);
        if (updatedAt < thirtyDaysAgo) {
          delete this.statusData[taskId];
          changed = true;
        }
      }
    }

    if (changed) {
      this.saveStatus();
    }
  }
}