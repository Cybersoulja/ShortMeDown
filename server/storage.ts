import { 
  users, type User, type InsertUser,
  shortcuts, type Shortcut, type InsertShortcut,
  shortcutTemplates, type ShortcutTemplate, type InsertTemplate
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: number, preferences: Record<string, any>): Promise<User | undefined>;

  // Shortcut methods
  getShortcut(id: number): Promise<Shortcut | undefined>;
  getUserShortcuts(userId: number): Promise<Shortcut[]>;
  createShortcut(shortcut: InsertShortcut): Promise<Shortcut>;
  updateShortcut(id: number, shortcut: Partial<InsertShortcut>): Promise<Shortcut | undefined>;
  deleteShortcut(id: number): Promise<boolean>;
  incrementShortcutUsage(id: number): Promise<boolean>;
  
  // Template methods
  getShortcutTemplate(id: number): Promise<ShortcutTemplate | undefined>;
  getAllShortcutTemplates(): Promise<ShortcutTemplate[]>;
  getShortcutTemplatesByCategory(category: string): Promise<ShortcutTemplate[]>;
  searchShortcutTemplates(query: string): Promise<ShortcutTemplate[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private shortcuts: Map<number, Shortcut>;
  private shortcutTemplates: Map<number, ShortcutTemplate>;
  private userId: number;
  private shortcutId: number;
  private templateId: number;

  constructor() {
    this.users = new Map();
    this.shortcuts = new Map();
    this.shortcutTemplates = new Map();
    this.userId = 1;
    this.shortcutId = 1;
    this.templateId = 1;
    
    // Populate with starter templates
    this.initializeTemplates();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUserPreferences(userId: number, preferences: Record<string, any>): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...preferences }
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Shortcut methods
  async getShortcut(id: number): Promise<Shortcut | undefined> {
    return this.shortcuts.get(id);
  }

  async getUserShortcuts(userId: number): Promise<Shortcut[]> {
    return Array.from(this.shortcuts.values()).filter(
      (shortcut) => shortcut.userId === userId
    );
  }

  async createShortcut(insertShortcut: InsertShortcut): Promise<Shortcut> {
    const id = this.shortcutId++;
    const now = new Date();
    const shortcut: Shortcut = { 
      ...insertShortcut, 
      id, 
      createdAt: now,
      lastUsed: now,
    };
    this.shortcuts.set(id, shortcut);
    return shortcut;
  }

  async updateShortcut(id: number, shortcutData: Partial<InsertShortcut>): Promise<Shortcut | undefined> {
    const shortcut = await this.getShortcut(id);
    if (!shortcut) return undefined;

    const updatedShortcut = { ...shortcut, ...shortcutData };
    this.shortcuts.set(id, updatedShortcut);
    return updatedShortcut;
  }

  async deleteShortcut(id: number): Promise<boolean> {
    return this.shortcuts.delete(id);
  }

  async incrementShortcutUsage(id: number): Promise<boolean> {
    const shortcut = await this.getShortcut(id);
    if (!shortcut) return false;

    const updatedShortcut = { 
      ...shortcut,
      usageCount: shortcut.usageCount + 1,
      lastUsed: new Date()
    };
    
    this.shortcuts.set(id, updatedShortcut);
    return true;
  }

  // Template methods
  async getShortcutTemplate(id: number): Promise<ShortcutTemplate | undefined> {
    return this.shortcutTemplates.get(id);
  }

  async getAllShortcutTemplates(): Promise<ShortcutTemplate[]> {
    return Array.from(this.shortcutTemplates.values());
  }

  async getShortcutTemplatesByCategory(category: string): Promise<ShortcutTemplate[]> {
    return Array.from(this.shortcutTemplates.values()).filter(
      (template) => template.category === category
    );
  }

  async searchShortcutTemplates(query: string): Promise<ShortcutTemplate[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.shortcutTemplates.values()).filter(
      (template) => 
        template.title.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Initialize with some template shortcuts
  private initializeTemplates() {
    const templates: InsertTemplate[] = [
      {
        title: "Morning Routine Assistant",
        description: "Start your day right with weather, calendar events, and traffic updates.",
        category: "Productivity",
        tags: ["Weather", "Calendar", "Maps"],
        actions: [
          {
            id: "1",
            name: "Get Current Weather",
            description: "Fetches the current weather for your location",
            iconName: "cloud",
            iconColor: "#0A84FF"
          },
          {
            id: "2",
            name: "Get Calendar Events",
            description: "Retrieves today's calendar events",
            iconName: "calendar",
            iconColor: "#FF9500"
          },
          {
            id: "3",
            name: "Get Commute Time",
            description: "Checks current traffic to work",
            iconName: "map",
            iconColor: "#34C759"
          },
          {
            id: "4",
            name: "Speak Text",
            description: "Reads out the morning briefing",
            iconName: "volume-2",
            iconColor: "#FF3B30"
          }
        ],
        popularity: 150
      },
      {
        title: "Focus Mode Timer",
        description: "Set a focus timer that blocks distractions and logs your productive time.",
        category: "Productivity",
        tags: ["Focus", "Timer", "DND"],
        actions: [
          {
            id: "1",
            name: "Set Focus Mode",
            description: "Enables Do Not Disturb mode",
            iconName: "moon",
            iconColor: "#5E5CE6"
          },
          {
            id: "2",
            name: "Set Timer",
            description: "Creates a countdown timer",
            iconName: "clock",
            iconColor: "#FF9500"
          },
          {
            id: "3",
            name: "Log to Data Jar",
            description: "Records focus session in Data Jar",
            iconName: "database",
            iconColor: "#34C759"
          }
        ],
        popularity: 89
      },
      {
        title: "Share My Location",
        description: "Quickly share your current location with selected contacts.",
        category: "Communication",
        tags: ["Location", "Sharing", "Contacts"],
        actions: [
          {
            id: "1",
            name: "Get Current Location",
            description: "Retrieves your current GPS coordinates",
            iconName: "map-pin",
            iconColor: "#FF9500"
          },
          {
            id: "2",
            name: "Choose Contact",
            description: "Selects who to share location with",
            iconName: "users",
            iconColor: "#0A84FF"
          },
          {
            id: "3",
            name: "Send Message",
            description: "Sends location via Messages",
            iconName: "message-square",
            iconColor: "#34C759"
          }
        ],
        popularity: 124
      },
      {
        title: "Weather Alert",
        description: "Get notifications about weather changes in your area.",
        category: "Weather",
        tags: ["Weather", "Notifications", "Automation"],
        actions: [
          {
            id: "1",
            name: "Get Weather Forecast",
            description: "Fetches weather forecast for your location",
            iconName: "cloud",
            iconColor: "#0A84FF"
          },
          {
            id: "2",
            name: "Check Conditions",
            description: "Checks for rain, snow, or extreme temperatures",
            iconName: "alert-triangle",
            iconColor: "#FF3B30"
          },
          {
            id: "3",
            name: "Create Notification",
            description: "Sends alert if conditions meet criteria",
            iconName: "bell",
            iconColor: "#FF9500"
          },
          {
            id: "4",
            name: "Repeat Daily",
            description: "Sets shortcut to run every morning",
            iconName: "repeat",
            iconColor: "#34C759"
          },
          {
            id: "5",
            name: "Log to Data Jar",
            description: "Records weather alerts in Data Jar",
            iconName: "database",
            iconColor: "#5E5CE6"
          }
        ],
        popularity: 76
      }
    ];

    templates.forEach(template => {
      const id = this.templateId++;
      this.shortcutTemplates.set(id, { ...template, id });
    });
  }
}

export const storage = new MemStorage();
