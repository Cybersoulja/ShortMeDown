export class ShortcutCache {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  async store(key: string, data: any, ttl: number = 3600): Promise<void> {
    const cacheKey = this.generateCacheKey(key);
    await this.kv.put(cacheKey, JSON.stringify(data), {
      expirationTtl: ttl
    });
  }

  async get(key: string): Promise<any | null> {
    const cacheKey = this.generateCacheKey(key);
    const cached = await this.kv.get(cacheKey);
    
    if (!cached) {
      return null;
    }

    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    const cacheKey = this.generateCacheKey(key);
    await this.kv.delete(cacheKey);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // List all keys matching the pattern and delete them
    const list = await this.kv.list({ prefix: pattern });
    const deletePromises = list.keys.map(key => this.kv.delete(key.name));
    await Promise.all(deletePromises);
  }

  private generateCacheKey(key: string): string {
    // Create a normalized cache key
    return `shortcut:${key.toLowerCase().replace(/\s+/g, '-')}`;
  }
}