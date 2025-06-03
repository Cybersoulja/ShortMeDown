export class CloudflareAI {
  private ai: any;

  constructor(ai: any) {
    this.ai = ai;
  }

  async generateShortcut(prompt: string) {
    try {
      const response = await this.ai.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant specialized in creating iOS Shortcuts. Generate a detailed shortcut based on the user's request. Respond with valid JSON containing these fields:
            - title: A short, descriptive name for the shortcut
            - description: A brief explanation of what the shortcut does
            - tags: An array of relevant tags/categories for this shortcut
            - actions: An array of shortcut actions with id, name, description, iconName, iconColor
            - integrations: Object with dataJar, drafts, pushcut boolean values`
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      // Parse the response and ensure it matches our expected format
      let result;
      if (typeof response.response === 'string') {
        try {
          result = JSON.parse(response.response);
        } catch {
          // If JSON parsing fails, create a structured response
          result = this.createFallbackShortcut(prompt, response.response);
        }
      } else {
        result = this.createFallbackShortcut(prompt, 'AI response parsing failed');
      }

      return this.validateAndFormatShortcut(result, prompt);

    } catch (error) {
      console.error('Cloudflare AI error:', error);
      throw error;
    }
  }

  async generateRecommendations(userId: string) {
    try {
      const response = await this.ai.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [
          {
            role: 'system',
            content: 'Generate 5 personalized iOS shortcut recommendations based on common productivity and automation needs. Return as JSON array with title, description, category, and difficulty level.'
          },
          {
            role: 'user',
            content: `Generate shortcut recommendations for user ${userId}`
          }
        ]
      });

      let recommendations;
      try {
        recommendations = JSON.parse(response.response);
      } catch {
        recommendations = this.getDefaultRecommendations();
      }

      return Array.isArray(recommendations) ? recommendations : this.getDefaultRecommendations();

    } catch (error) {
      console.error('Recommendation generation error:', error);
      return this.getDefaultRecommendations();
    }
  }

  private createFallbackShortcut(prompt: string, aiResponse: string) {
    // Extract key information from the prompt to create a meaningful shortcut
    const lowerPrompt = prompt.toLowerCase();
    
    let title = 'Custom Shortcut';
    let category = 'Productivity';
    let actions = [];

    if (lowerPrompt.includes('weather')) {
      title = 'Weather Check';
      category = 'Utilities';
      actions = [
        {
          id: '1',
          name: 'Get Current Weather',
          description: 'Retrieves current weather conditions',
          iconName: 'cloud',
          iconColor: '#007AFF'
        }
      ];
    } else if (lowerPrompt.includes('message') || lowerPrompt.includes('text')) {
      title = 'Quick Message';
      category = 'Communication';
      actions = [
        {
          id: '1',
          name: 'Send Message',
          description: 'Sends a quick text message',
          iconName: 'message-circle',
          iconColor: '#32D74B'
        }
      ];
    } else if (lowerPrompt.includes('reminder') || lowerPrompt.includes('note')) {
      title = 'Quick Reminder';
      category = 'Productivity';
      actions = [
        {
          id: '1',
          name: 'Create Reminder',
          description: 'Creates a new reminder',
          iconName: 'bell',
          iconColor: '#FF9500'
        }
      ];
    } else {
      // Generic automation shortcut
      actions = [
        {
          id: '1',
          name: 'Custom Action',
          description: 'Performs the requested automation',
          iconName: 'zap',
          iconColor: '#5E5CE6'
        }
      ];
    }

    return {
      title,
      description: `AI-generated shortcut: ${aiResponse.substring(0, 100)}...`,
      tags: [category.toLowerCase(), 'ai-generated'],
      actions,
      integrations: {
        dataJar: false,
        drafts: false,
        pushcut: false
      }
    };
  }

  private validateAndFormatShortcut(result: any, originalPrompt: string) {
    // Ensure the result has all required fields
    return {
      title: result.title || 'Generated Shortcut',
      description: result.description || `Shortcut generated from: ${originalPrompt}`,
      tags: Array.isArray(result.tags) ? result.tags : ['ai-generated'],
      actions: Array.isArray(result.actions) ? result.actions : [
        {
          id: '1',
          name: 'Custom Action',
          description: 'AI-generated action',
          iconName: 'zap',
          iconColor: '#5E5CE6'
        }
      ],
      integrations: result.integrations || {
        dataJar: false,
        drafts: false,
        pushcut: false
      }
    };
  }

  private getDefaultRecommendations() {
    return [
      {
        title: 'Morning Routine',
        description: 'Start your day with weather, calendar, and traffic updates',
        category: 'Productivity',
        difficulty: 'Easy'
      },
      {
        title: 'Quick Note Capture',
        description: 'Instantly save ideas and thoughts',
        category: 'Note-taking',
        difficulty: 'Beginner'
      },
      {
        title: 'Smart Home Control',
        description: 'Control lights, temperature, and devices',
        category: 'Home Automation',
        difficulty: 'Intermediate'
      },
      {
        title: 'Travel Assistant',
        description: 'Get directions, traffic, and travel info',
        category: 'Travel',
        difficulty: 'Easy'
      },
      {
        title: 'Focus Mode',
        description: 'Block distractions and enhance productivity',
        category: 'Productivity',
        difficulty: 'Intermediate'
      }
    ];
  }
}