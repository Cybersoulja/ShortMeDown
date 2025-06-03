import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  preferences: jsonb("preferences").default({}).notNull(),
  level: integer("level").default(1).notNull(),
  experience: integer("experience").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastActiveDate: timestamp("last_active_date").defaultNow(),
  totalShortcuts: integer("total_shortcuts").default(0).notNull(),
  totalUsage: integer("total_usage").default(0).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  preferences: true,
});

// Shortcut schema
export const shortcuts = pgTable("shortcuts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags").array().notNull(),
  actions: jsonb("actions").notNull(),
  integrations: jsonb("integrations").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used"),
  usageCount: integer("usage_count").default(0).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
});

export const insertShortcutSchema = createInsertSchema(shortcuts).omit({
  id: true,
  createdAt: true,
});

// Shortcut template schema for gallery
export const shortcutTemplates = pgTable("shortcut_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull(),
  actions: jsonb("actions").notNull(),
  popularity: integer("popularity").default(0).notNull(),
});

export const insertTemplateSchema = createInsertSchema(shortcutTemplates).omit({
  id: true,
});

// Achievements schema
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  requirement: integer("requirement").notNull(),
  experienceReward: integer("experience_reward").notNull(),
  rarity: text("rarity").notNull(), // bronze, silver, gold, platinum
});

// User achievements tracking
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  progress: integer("progress").default(0).notNull(),
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Shortcut = typeof shortcuts.$inferSelect;
export type InsertShortcut = z.infer<typeof insertShortcutSchema>;

export type ShortcutTemplate = typeof shortcutTemplates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// Action type for easier handling
export type ShortcutAction = {
  id: string;
  name: string;
  description: string;
  iconName: string;
  iconColor: string;
  parameters?: Record<string, any>;
};
