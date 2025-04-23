import { apiRequest } from "./queryClient";
import { ShortcutAction } from "@shared/schema";

interface GenerateShortcutResponse {
  title: string;
  description: string;
  tags: string[];
  actions: ShortcutAction[];
  integrations: {
    dataJar: boolean;
    drafts: boolean;
    pushcut: boolean;
  };
  id?: number;
  saved?: boolean;
}

interface ExportJellycutsResponse {
  script: string;
}

export async function generateShortcut(
  prompt: string,
  userId?: number
): Promise<GenerateShortcutResponse> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/generate-shortcut",
      { prompt, userId }
    );
    return await response.json();
  } catch (error: any) {
    console.error("Error generating shortcut:", error);
    throw new Error("Failed to generate shortcut: " + (error.message || "Unknown error"));
  }
}

export async function exportToJellycuts(
  actions: ShortcutAction[],
  title: string,
  description: string
): Promise<ExportJellycutsResponse> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/export-jellycuts",
      { actions, title, description }
    );
    return await response.json();
  } catch (error: any) {
    console.error("Error exporting to Jellycuts:", error);
    throw new Error("Failed to export to Jellycuts: " + (error.message || "Unknown error"));
  }
}

// Helper function to suggest daily shortcuts based on usage patterns
export async function suggestDailyShortcut(
  userId?: number
): Promise<GenerateShortcutResponse | null> {
  try {
    // Get current time to provide context-aware suggestions
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Create a contextual prompt based on time of day
    let contextualPrompt = "";
    
    if (hour >= 5 && hour < 10) {
      contextualPrompt = "Suggest a smart morning routine shortcut that includes checking weather, calendar events, and commute information.";
    } else if (hour >= 10 && hour < 16) {
      contextualPrompt = "Suggest a productivity shortcut that helps organize tasks, send quick messages, and check project status.";
    } else if (hour >= 16 && hour < 22) {
      contextualPrompt = "Suggest an evening shortcut that helps wind down, summarize the day's tasks, and prepare for tomorrow.";
    } else {
      contextualPrompt = "Suggest a shortcut that helps with late night focus, reducing screen brightness, and enabling focus modes.";
    }
    
    // Add weekend/weekday context
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      contextualPrompt += " Make it suitable for weekend activities.";
    } else {
      contextualPrompt += " Make it suitable for a work day.";
    }
    
    // Make the API call with our smart contextual prompt
    return await generateShortcut(contextualPrompt, userId);
  } catch (error: any) {
    console.error("Error suggesting daily shortcut:", error);
    return null;
  }
}
