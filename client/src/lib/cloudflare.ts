import { ShortcutAction } from '@shared/schema';

interface CloudflareConfig {
  workerUrl: string;
  environment: 'development' | 'staging' | 'production';
}

class CloudflareService {
  private config: CloudflareConfig;

  constructor() {
    // Configure based on environment
    const isDev = import.meta.env.DEV;
    const isStaging = window.location.hostname.includes('staging');
    
    if (isDev) {
      this.config = {
        workerUrl: 'http://localhost:8787', // Local Wrangler dev server
        environment: 'development'
      };
    } else if (isStaging) {
      this.config = {
        workerUrl: 'https://staging-api.oneseco.com',
        environment: 'staging'
      };
    } else {
      this.config = {
        workerUrl: 'https://api.oneseco.com',
        environment: 'production'
      };
    }
  }

  async generateShortcutWithAI(prompt: string, userId: number): Promise<{
    title: string;
    description: string;
    tags: string[];
    actions: ShortcutAction[];
    integrations: {
      dataJar: boolean;
      drafts: boolean;
      pushcut: boolean;
    };
  }> {
    const response = await fetch(`${this.config.workerUrl}/api/ai/generate-shortcut`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, userId })
    });

    if (!response.ok) {
      throw new Error(`Cloudflare AI generation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getPersonalizedRecommendations(userId: number): Promise<Array<{
    title: string;
    description: string;
    category: string;
    difficulty: string;
  }>> {
    const response = await fetch(`${this.config.workerUrl}/api/ai/recommendations/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Recommendations fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadAsset(file: File): Promise<{
    success: boolean;
    url: string;
    key: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.config.workerUrl}/api/assets/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Asset upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getUsageAnalytics(): Promise<{
    totalShortcuts: number;
    activeUsers: number;
    popularCategories: string[];
    timestamp: string;
  }> {
    const response = await fetch(`${this.config.workerUrl}/api/analytics/usage`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Analytics fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  getAssetUrl(key: string): string {
    return `${this.config.workerUrl}/api/assets/${key}`;
  }

  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version: string;
  }> {
    const response = await fetch(`${this.config.workerUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const cloudflareService = new CloudflareService();