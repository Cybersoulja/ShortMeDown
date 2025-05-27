import { 
  users, type User, type InsertUser,
  shortcuts, type Shortcut, type InsertShortcut,
  shortcutTemplates, type ShortcutTemplate, type InsertTemplate
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with some template data on first run
    this.initializeTemplates();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPreferences(userId: number, preferences: Record<string, any>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ preferences })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Shortcut methods
  async getShortcut(id: number): Promise<Shortcut | undefined> {
    const [shortcut] = await db.select().from(shortcuts).where(eq(shortcuts.id, id));
    return shortcut || undefined;
  }

  async getUserShortcuts(userId: number): Promise<Shortcut[]> {
    return await db.select().from(shortcuts).where(eq(shortcuts.userId, userId));
  }

  async createShortcut(insertShortcut: InsertShortcut): Promise<Shortcut> {
    const [shortcut] = await db
      .insert(shortcuts)
      .values(insertShortcut)
      .returning();
    return shortcut;
  }

  async updateShortcut(id: number, shortcutData: Partial<InsertShortcut>): Promise<Shortcut | undefined> {
    const [shortcut] = await db
      .update(shortcuts)
      .set(shortcutData)
      .where(eq(shortcuts.id, id))
      .returning();
    return shortcut || undefined;
  }

  async deleteShortcut(id: number): Promise<boolean> {
    const result = await db.delete(shortcuts).where(eq(shortcuts.id, id));
    return (result.rowCount || 0) > 0;
  }

  async incrementShortcutUsage(id: number): Promise<boolean> {
    const shortcut = await this.getShortcut(id);
    if (!shortcut) return false;

    const [updated] = await db
      .update(shortcuts)
      .set({ 
        usageCount: shortcut.usageCount + 1,
        lastUsed: new Date()
      })
      .where(eq(shortcuts.id, id))
      .returning();
    return !!updated;
  }

  // Template methods
  async getShortcutTemplate(id: number): Promise<ShortcutTemplate | undefined> {
    const [template] = await db.select().from(shortcutTemplates).where(eq(shortcutTemplates.id, id));
    return template || undefined;
  }

  async getAllShortcutTemplates(): Promise<ShortcutTemplate[]> {
    return await db.select().from(shortcutTemplates);
  }

  async getShortcutTemplatesByCategory(category: string): Promise<ShortcutTemplate[]> {
    return await db.select().from(shortcutTemplates).where(eq(shortcutTemplates.category, category));
  }

  async searchShortcutTemplates(query: string): Promise<ShortcutTemplate[]> {
    const lowercaseQuery = `%${query.toLowerCase()}%`;
    return await db.select().from(shortcutTemplates).where(
      ilike(shortcutTemplates.title, lowercaseQuery)
    );
  }

  // Initialize with some template shortcuts
  private async initializeTemplates() {
    // Check if templates already exist
    const existing = await this.getAllShortcutTemplates();
    if (existing.length > 0) return;

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

    try {
      for (const template of templates) {
        await db.insert(shortcutTemplates).values(template);
      }
    } catch (error) {
      console.error('Failed to initialize templates:', error);
    }
  }
}

export const storage = new DatabaseStorage();
