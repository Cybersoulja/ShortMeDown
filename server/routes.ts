import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShortcutSchema, insertUserSchema } from "@shared/schema";
import OpenAI from "openai";
import z from "zod";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Validate OpenAI API key on startup
(async function validateApiKey() {
  try {
    // Simple API call to validate the key
    await openai.models.list();
    console.log("[OpenAI] API key validation successful");
  } catch (error: any) {
    console.error("[OpenAI] API key validation failed:", error.message);
    if (error.code === 'invalid_api_key') {
      console.error("[OpenAI] Please check that your API key is correct and properly configured.");
    }
  }
})();

export async function registerRoutes(app: Express): Promise<Server> {
  // === User routes ===
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid user data", error: error.message || "Unknown error" });
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
    } catch (error: any) {
      res.status(400).json({ message: "Invalid shortcut data", error: error.message || "Unknown error" });
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
      
      let shortcutData;
      
      try {
        // Attempt to use OpenAI API
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
        
        shortcutData = JSON.parse(response.choices[0].message.content);
      } catch (apiError: any) {
        console.error("OpenAI API error:", apiError.message);
        
        // If API fails, use a fallback response
        if (apiError.code === 'invalid_api_key' || apiError.status === 401) {
          console.warn("Using fallback template because of API key issues");
          
          // Get a random template to use as a fallback
          const templates = await storage.getAllShortcutTemplates();
          const fallbackTemplate = templates && templates.length > 0 
            ? templates[Math.floor(Math.random() * templates.length)]
            : generateFallbackTemplate(prompt);
          
          shortcutData = {
            title: fallbackTemplate.title,
            description: `${fallbackTemplate.description} (Note: This is a template suggestion based on your request: "${prompt}")`,
            tags: fallbackTemplate.tags,
            actions: fallbackTemplate.actions,
            integrations: fallbackTemplate.integrations
          };
        } else {
          // For other types of errors, re-throw
          throw apiError;
        }
      }
      
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
    } catch (error: any) {
      console.error("Error generating shortcut:", error);
      res.status(400).json({ 
        message: "Failed to generate shortcut", 
        error: error.message 
      });
    }
  });

  // Helper function to generate a fallback template when API is not available
  function generateFallbackTemplate(prompt: string) {
    // Extract keywords from the prompt
    const keywords = prompt.toLowerCase().split(' ');
    
    // Determine a suitable template based on keywords
    let templateType = "general";
    
    if (keywords.some(word => ['morning', 'wake', 'alarm', 'breakfast'].includes(word))) {
      templateType = "morning";
    } else if (keywords.some(word => ['focus', 'work', 'productive', 'study'].includes(word))) {
      templateType = "productivity";
    } else if (keywords.some(word => ['photo', 'image', 'picture', 'camera'].includes(word))) {
      templateType = "photos";
    } else if (keywords.some(word => ['location', 'map', 'drive', 'travel'].includes(word))) {
      templateType = "location";
    } else if (keywords.some(word => ['message', 'text', 'send', 'email'].includes(word))) {
      templateType = "messaging";
    }
    
    // Generate a basic template based on type
    switch (templateType) {
      case "morning":
        return {
          title: "Smart Morning Routine",
          description: "Start your day with weather, calendar events, and travel time to work",
          tags: ["morning", "productivity", "weather"],
          actions: [
            {
              id: "weather1",
              name: "Get Current Weather",
              description: "Fetches the current weather conditions for your location",
              iconName: "Cloud",
              iconColor: "#3498db"
            },
            {
              id: "calendar1",
              name: "Get Today's Events",
              description: "Retrieves your calendar events for today",
              iconName: "Calendar",
              iconColor: "#e74c3c"
            },
            {
              id: "travel1",
              name: "Calculate Travel Time",
              description: "Calculates travel time to your work location",
              iconName: "Clock",
              iconColor: "#2ecc71"
            },
            {
              id: "notif1",
              name: "Show Notification",
              description: "Displays a summary notification with all the information",
              iconName: "Bell",
              iconColor: "#f39c12"
            }
          ],
          integrations: {
            dataJar: false,
            drafts: false,
            pushcut: true
          }
        };
      
      case "productivity":
        return {
          title: "Focus Mode Activator",
          description: "Enable focus mode, set timers, and prepare your workspace",
          tags: ["productivity", "focus", "work"],
          actions: [
            {
              id: "focus1",
              name: "Enable Focus Mode",
              description: "Activates Do Not Disturb and Focus mode",
              iconName: "Focus",
              iconColor: "#9b59b6"
            },
            {
              id: "timer1",
              name: "Set Timer",
              description: "Sets a 25-minute focus timer (Pomodoro technique)",
              iconName: "Timer",
              iconColor: "#e67e22"
            },
            {
              id: "apps1",
              name: "Open Work Apps",
              description: "Opens your commonly used work applications",
              iconName: "Layers",
              iconColor: "#1abc9c"
            }
          ],
          integrations: {
            dataJar: true,
            drafts: false,
            pushcut: false
          }
        };
        
      case "photos":
        return {
          title: "Photo Processor",
          description: "Process, resize and share photos quickly",
          tags: ["photos", "images", "sharing"],
          actions: [
            {
              id: "select1",
              name: "Select Recent Photos",
              description: "Selects photos from your recent album",
              iconName: "Image",
              iconColor: "#3498db"
            },
            {
              id: "resize1",
              name: "Resize Photos",
              description: "Resizes the selected photos for sharing",
              iconName: "Maximize",
              iconColor: "#9b59b6"
            },
            {
              id: "share1",
              name: "Share Options",
              description: "Provides options to share the processed photos",
              iconName: "Share2",
              iconColor: "#e74c3c"
            }
          ],
          integrations: {
            dataJar: false,
            drafts: false,
            pushcut: false
          }
        };
          
      case "location":
        return {
          title: "Location Sharer",
          description: "Share your current location with contacts",
          tags: ["location", "maps", "sharing"],
          actions: [
            {
              id: "loc1",
              name: "Get Current Location",
              description: "Retrieves your current GPS coordinates",
              iconName: "MapPin",
              iconColor: "#e74c3c"
            },
            {
              id: "contacts1",
              name: "Select Contacts",
              description: "Lets you choose contacts to share your location with",
              iconName: "Users",
              iconColor: "#3498db"
            },
            {
              id: "message1",
              name: "Send Location",
              description: "Sends your location to selected contacts via message",
              iconName: "Send",
              iconColor: "#2ecc71"
            }
          ],
          integrations: {
            dataJar: false,
            drafts: false,
            pushcut: true
          }
        };
          
      case "messaging":
        return {
          title: "Quick Message Sender",
          description: "Compose and send messages with predefined templates",
          tags: ["messages", "communication", "templates"],
          actions: [
            {
              id: "template1",
              name: "Select Template",
              description: "Choose from saved message templates",
              iconName: "FileText",
              iconColor: "#f39c12"
            },
            {
              id: "contacts2",
              name: "Choose Recipients",
              description: "Select contacts to receive the message",
              iconName: "Users",
              iconColor: "#3498db"
            },
            {
              id: "customize1",
              name: "Customize Message",
              description: "Edit the template with custom information",
              iconName: "Edit2",
              iconColor: "#9b59b6"
            },
            {
              id: "send1",
              name: "Send Message",
              description: "Sends the message to selected recipients",
              iconName: "Send",
              iconColor: "#2ecc71"
            }
          ],
          integrations: {
            dataJar: true,
            drafts: true,
            pushcut: false
          }
        };
          
      default:
        return {
          title: "Custom Automation",
          description: "A customizable shortcut based on your request",
          tags: ["automation", "custom", "utility"],
          actions: [
            {
              id: "input1",
              name: "Ask for Input",
              description: "Prompts for user input to customize the shortcut",
              iconName: "Type",
              iconColor: "#3498db"
            },
            {
              id: "process1",
              name: "Process Input",
              description: "Processes the provided input",
              iconName: "Settings",
              iconColor: "#f39c12"
            },
            {
              id: "output1",
              name: "Display Result",
              description: "Shows the result of the processing",
              iconName: "CheckCircle",
              iconColor: "#2ecc71"
            }
          ],
          integrations: {
            dataJar: false,
            drafts: false,
            pushcut: false
          }
        };
    }
  }

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
