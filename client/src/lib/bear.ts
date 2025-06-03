interface BearNote {
  id: string;
  title: string;
  text: string;
  tags: string[];
  createdAt: string;
  modifiedAt: string;
  archived: boolean;
  pinned: boolean;
}

interface BearConfig {
  apiToken?: string;
  baseUrl: string;
}

class BearService {
  private config: BearConfig = {
    baseUrl: 'bear://x-callback-url'
  };

  configure(apiToken?: string) {
    this.config.apiToken = apiToken;
  }

  async createNote(content: {
    title: string;
    text: string;
    tags?: string[];
    pin?: boolean;
  }): Promise<{ success: boolean; noteId?: string; url?: string }> {
    const { title, text, tags = [], pin = false } = content;
    
    // Format content for Bear
    let noteContent = `# ${title}\n\n${text}`;
    
    // Add tags
    if (tags.length > 0) {
      noteContent += '\n\n' + tags.map(tag => `#${tag.replace(/\s+/g, '_')}`).join(' ');
    }

    const params = new URLSearchParams({
      title,
      text: noteContent,
      pin: pin ? '1' : '0',
      show_window: '1',
      open_note: '1'
    });

    const bearUrl = `${this.config.baseUrl}/create?${params}`;

    try {
      // For web environment, we'll create a downloadable Bear note
      if (typeof window !== 'undefined') {
        // Create a note in Bear format and provide download
        const bearContent = this.formatBearNote(title, text, tags);
        this.downloadBearNote(title, bearContent);
        
        return {
          success: true,
          url: bearUrl,
          noteId: `bear_${Date.now()}`
        };
      }

      return {
        success: true,
        url: bearUrl
      };
    } catch (error) {
      console.error('Bear note creation failed:', error);
      return { success: false };
    }
  }

  async createShortcutNote(shortcut: {
    title: string;
    description: string;
    actions: any[];
    tags: string[];
    category: string;
  }): Promise<{ success: boolean; noteId?: string; url?: string }> {
    const { title, description, actions, tags, category } = shortcut;

    const noteContent = this.formatShortcutForBear(shortcut);
    const noteTags = [...tags, 'shortcuts', category.toLowerCase()];

    return this.createNote({
      title: `Shortcut: ${title}`,
      text: noteContent,
      tags: noteTags,
      pin: false
    });
  }

  async createActionLog(action: {
    shortcutTitle: string;
    actionName: string;
    result: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; noteId?: string }> {
    const { shortcutTitle, actionName, result, timestamp, metadata } = action;

    const logContent = `
## Action Executed
**Shortcut:** ${shortcutTitle}
**Action:** ${actionName}
**Time:** ${new Date(timestamp).toLocaleString()}
**Result:** ${result}

${metadata ? `**Metadata:**\n\`\`\`json\n${JSON.stringify(metadata, null, 2)}\n\`\`\`` : ''}
`;

    return this.createNote({
      title: `Log: ${shortcutTitle} - ${actionName}`,
      text: logContent,
      tags: ['logs', 'shortcut_execution', shortcutTitle.toLowerCase()],
      pin: false
    });
  }

  async searchNotes(query: string): Promise<{ success: boolean; url?: string }> {
    const params = new URLSearchParams({
      term: query,
      show_window: '1'
    });

    const bearUrl = `${this.config.baseUrl}/search?${params}`;
    
    if (typeof window !== 'undefined') {
      window.open(bearUrl, '_blank');
    }

    return {
      success: true,
      url: bearUrl
    };
  }

  async openTag(tag: string): Promise<{ success: boolean; url?: string }> {
    const params = new URLSearchParams({
      name: tag,
      show_window: '1'
    });

    const bearUrl = `${this.config.baseUrl}/open-tag?${params}`;
    
    if (typeof window !== 'undefined') {
      window.open(bearUrl, '_blank');
    }

    return {
      success: true,
      url: bearUrl
    };
  }

  async addToNote(noteId: string, content: string): Promise<{ success: boolean; url?: string }> {
    const params = new URLSearchParams({
      id: noteId,
      text: content,
      mode: 'append',
      show_window: '1'
    });

    const bearUrl = `${this.config.baseUrl}/add-text?${params}`;
    
    if (typeof window !== 'undefined') {
      window.open(bearUrl, '_blank');
    }

    return {
      success: true,
      url: bearUrl
    };
  }

  private formatShortcutForBear(shortcut: {
    title: string;
    description: string;
    actions: any[];
    tags: string[];
    category: string;
  }): string {
    const { title, description, actions, category } = shortcut;

    let content = `## ${title}\n\n${description}\n\n`;
    content += `**Category:** ${category}\n\n`;
    
    if (actions.length > 0) {
      content += `### Actions\n`;
      actions.forEach((action, index) => {
        content += `${index + 1}. **${action.name}**\n`;
        content += `   - ${action.description}\n`;
        if (action.parameters) {
          content += `   - Parameters: \`${JSON.stringify(action.parameters)}\`\n`;
        }
        content += '\n';
      });
    }

    content += `\n**Created:** ${new Date().toLocaleString()}\n`;
    content += `**Source:** AI Shortcut Companion\n`;

    return content;
  }

  private formatBearNote(title: string, content: string, tags: string[]): string {
    let bearNote = `# ${title}\n\n${content}`;
    
    if (tags.length > 0) {
      bearNote += '\n\n' + tags.map(tag => `#${tag.replace(/\s+/g, '_')}`).join(' ');
    }

    return bearNote;
  }

  private downloadBearNote(title: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  generateBearUrl(action: string, params: Record<string, string>): string {
    const urlParams = new URLSearchParams(params);
    return `${this.config.baseUrl}/${action}?${urlParams}`;
  }

  isAvailable(): boolean {
    // Check if Bear app is available (iOS/macOS environment)
    if (typeof window !== 'undefined') {
      return /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);
    }
    return false;
  }

  getQuickActions() {
    return [
      {
        name: 'Create Shortcut Note',
        description: 'Save shortcut details to Bear',
        action: 'createShortcutNote'
      },
      {
        name: 'Log Action Result',
        description: 'Log shortcut execution results',
        action: 'createActionLog'
      },
      {
        name: 'Search Notes',
        description: 'Search Bear notes for shortcuts',
        action: 'searchNotes'
      },
      {
        name: 'View Shortcut Tags',
        description: 'Open shortcuts tag in Bear',
        action: () => this.openTag('shortcuts')
      }
    ];
  }
}

export const bearService = new BearService();