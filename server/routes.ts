import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShortcutSchema, insertUserSchema } from "@shared/schema";
import OpenAI from "openai";
import z from "zod";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo-api-key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // === User routes ===
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });

  app.patch("/api/users/:id/preferences", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const updatedUser = await storage.updateUserPreferences(id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(updatedUser);
  });

  // === Shortcut routes ===
  app.get("/api/shortcuts", async (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    
    if (userId) {
      const shortcuts = await storage.getUserShortcuts(userId);
      res.json(shortcuts);
    } else {
      res.status(400).json({ message: "User ID is required" });
    }
  });

  app.post("/api/shortcuts", async (req, res) => {
    try {
      const shortcutData = insertShortcutSchema.parse(req.body);
      const shortcut = await storage.createShortcut(shortcutData);
      res.status(201).json(shortcut);
    } catch (error) {
      res.status(400).json({ message: "Invalid shortcut data", error: error.message });
    }
  });

  app.get("/api/shortcuts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid shortcut ID" });
    }
    
    const shortcut = await storage.getShortcut(id);
    if (!shortcut) {
      return res.status(404).json({ message: "Shortcut not found" });
    }
    
    res.json(shortcut);
  });

  app.patch("/api/shortcuts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid shortcut ID" });
    }
    
    try {
      const updatedShortcut = await storage.updateShortcut(id, req.body);
      if (!updatedShortcut) {
        return res.status(404).json({ message: "Shortcut not found" });
      }
      
      res.json(updatedShortcut);
    } catch (error) {
      res.status(400).json({ message: "Invalid shortcut data", error: error.message });
    }
  });

  app.delete("/api/shortcuts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid shortcut ID" });
    }
    
    const success = await storage.deleteShortcut(id);
    if (!success) {
      return res.status(404).json({ message: "Shortcut not found" });
    }
    
    res.status(204).end();
  });

  app.post("/api/shortcuts/:id/usage", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid shortcut ID" });
    }
    
    const success = await storage.incrementShortcutUsage(id);
    if (!success) {
      return res.status(404).json({ message: "Shortcut not found" });
    }
    
    res.status(200).json({ success: true });
  });

  // === Template routes ===
  app.get("/api/templates", async (req, res) => {
    const category = req.query.category as string | undefined;
    const query = req.query.q as string | undefined;
    
    if (category) {
      const templates = await storage.getShortcutTemplatesByCategory(category);
      res.json(templates);
    } else if (query) {
      const templates = await storage.searchShortcutTemplates(query);
      res.json(templates);
    } else {
      const templates = await storage.getAllShortcutTemplates();
      res.json(templates);
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    
    const template = await storage.getShortcutTemplate(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.json(template);
  });

  // === OpenAI API routes ===
  const generateShortcutSchema = z.object({
    prompt: z.string().min(5),
    userId: z.number().optional(),
  });

  app.post("/api/generate-shortcut", async (req, res) => {
    try {
      const { prompt, userId } = generateShortcutSchema.parse(req.body);
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant specialized in creating iOS Shortcuts. 
                     Generate a detailed shortcut based on the user's request.
                     Format the response as a JSON object with these fields:
                     - title: A short, descriptive name for the shortcut
                     - description: A brief explanation of what the shortcut does
                     - tags: An array of relevant tags/categories for this shortcut
                     - actions: An array of actions where each action has:
                       - id: A unique string identifier
                       - name: The name of the action
                       - description: What this specific action does in the context of this shortcut
                       - iconName: A suggested icon name (from Lucide icons)
                       - iconColor: A hex color code appropriate for this action
                       - parameters: (optional) Any parameters this action would need
                     - integrations: An object with boolean flags for compatible integrations (dataJar, drafts, pushcut)`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const shortcutData = JSON.parse(response.choices[0].message.content);
      
      // If user ID is provided, save the shortcut to their account
      if (userId) {
        try {
          const newShortcut = await storage.createShortcut({
            userId,
            title: shortcutData.title,
            description: shortcutData.description,
            tags: shortcutData.tags,
            actions: shortcutData.actions,
            integrations: shortcutData.integrations,
            usageCount: 0,
            isFavorite: false
          });
          
          return res.json({
            ...shortcutData,
            id: newShortcut.id,
            saved: true
          });
        } catch (error) {
          console.error("Error saving shortcut:", error);
        }
      }
      
      res.json(shortcutData);
    } catch (error) {
      console.error("Error generating shortcut:", error);
      res.status(400).json({ 
        message: "Failed to generate shortcut", 
        error: error.message 
      });
    }
  });

  // Export to Jellycuts format
  app.post("/api/export-jellycuts", async (req, res) => {
    try {
      const { actions, title, description } = req.body;
      
      if (!actions || !Array.isArray(actions) || !title) {
        return res.status(400).json({ message: "Invalid shortcut data for export" });
      }
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert in Jellycuts scripting language for iOS shortcuts. 
                     Convert the provided shortcut actions into valid Jellycuts script format.
                     Include appropriate comments and organize the code cleanly.`
          },
          {
            role: "user",
            content: `Convert this shortcut to Jellycuts format:
                     Title: ${title}
                     Description: ${description || "No description provided"}
                     Actions: ${JSON.stringify(actions, null, 2)}`
          }
        ]
      });

      const jellycutsScript = response.choices[0].message.content;
      
      res.json({ script: jellycutsScript });
    } catch (error) {
      console.error("Error exporting to Jellycuts:", error);
      res.status(400).json({ 
        message: "Failed to export to Jellycuts", 
        error: error.message 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
