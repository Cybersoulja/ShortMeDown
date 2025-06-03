interface AirtableConfig {
  baseId: string;
  tableId: string;
  apiKey: string;
}

interface AirtableRecord {
  id?: string;
  fields: Record<string, any>;
  createdTime?: string;
}

interface ShortcutRecord {
  id?: string;
  fields: {
    Title: string;
    Description: string;
    Category: string;
    Tags: string[];
    Actions: string; // JSON string of actions
    CreatedDate: string;
    LastUsed?: string;
    UsageCount: number;
    IsFavorite: boolean;
    Integrations: string; // JSON string of integrations
  };
}

class AirtableService {
  private baseUrl = 'https://api.airtable.com/v0';
  private config: AirtableConfig | null = null;

  constructor() {
    // Configuration will be set when user provides API key
  }

  configure(config: AirtableConfig) {
    this.config = config;
  }

  private getHeaders() {
    if (!this.config?.apiKey) {
      throw new Error('Airtable API key not configured');
    }
    
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createShortcutRecord(shortcut: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    actions: any[];
    integrations: Record<string, boolean>;
  }): Promise<ShortcutRecord> {
    if (!this.config) {
      throw new Error('Airtable not configured');
    }

    const record: Omit<ShortcutRecord, 'id'> = {
      fields: {
        Title: shortcut.title,
        Description: shortcut.description,
        Category: shortcut.category,
        Tags: shortcut.tags,
        Actions: JSON.stringify(shortcut.actions),
        CreatedDate: new Date().toISOString(),
        UsageCount: 0,
        IsFavorite: false,
        Integrations: JSON.stringify(shortcut.integrations),
      }
    };

    const response = await fetch(
      `${this.baseUrl}/${this.config.baseId}/${this.config.tableId}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ records: [record] })
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.records[0];
  }

  async getShortcutRecords(): Promise<ShortcutRecord[]> {
    if (!this.config) {
      throw new Error('Airtable not configured');
    }

    const response = await fetch(
      `${this.baseUrl}/${this.config.baseId}/${this.config.tableId}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.records;
  }

  async updateShortcutRecord(recordId: string, updates: Partial<ShortcutRecord['fields']>): Promise<ShortcutRecord> {
    if (!this.config) {
      throw new Error('Airtable not configured');
    }

    const response = await fetch(
      `${this.baseUrl}/${this.config.baseId}/${this.config.tableId}/${recordId}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ fields: updates })
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    return await response.json();
  }

  async deleteShortcutRecord(recordId: string): Promise<boolean> {
    if (!this.config) {
      throw new Error('Airtable not configured');
    }

    const response = await fetch(
      `${this.baseUrl}/${this.config.baseId}/${this.config.tableId}/${recordId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    return response.ok;
  }

  async syncShortcutUsage(recordId: string): Promise<void> {
    if (!this.config) {
      throw new Error('Airtable not configured');
    }

    // Get current record to increment usage count
    const response = await fetch(
      `${this.baseUrl}/${this.config.baseId}/${this.config.tableId}/${recordId}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (response.ok) {
      const record = await response.json();
      const currentCount = record.fields.UsageCount || 0;
      
      await this.updateShortcutRecord(recordId, {
        UsageCount: currentCount + 1,
        LastUsed: new Date().toISOString(),
      });
    }
  }

  async searchShortcuts(query: string): Promise<ShortcutRecord[]> {
    if (!this.config) {
      throw new Error('Airtable not configured');
    }

    const filterFormula = `OR(
      SEARCH("${query}", {Title}),
      SEARCH("${query}", {Description}),
      SEARCH("${query}", {Category})
    )`;

    const params = new URLSearchParams({
      filterByFormula: filterFormula,
    });

    const response = await fetch(
      `${this.baseUrl}/${this.config.baseId}/${this.config.tableId}?${params}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.records;
  }

  async getShortcutsByCategory(category: string): Promise<ShortcutRecord[]> {
    if (!this.config) {
      throw new Error('Airtable not configured');
    }

    const filterFormula = `{Category} = "${category}"`;
    const params = new URLSearchParams({
      filterByFormula: filterFormula,
    });

    const response = await fetch(
      `${this.baseUrl}/${this.config.baseId}/${this.config.tableId}?${params}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.records;
  }

  isConfigured(): boolean {
    return !!(this.config?.apiKey && this.config?.baseId && this.config?.tableId);
  }
}

export const airtableService = new AirtableService();