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
  } catch (error) {
    console.error("Error generating shortcut:", error);
    throw new Error("Failed to generate shortcut: " + error.message);
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
  } catch (error) {
    console.error("Error exporting to Jellycuts:", error);
    throw new Error("Failed to export to Jellycuts: " + error.message);
  }
}

// Helper function to suggest daily shortcuts based on usage patterns
export async function suggestDailyShortcut(
  userId?: number
): Promise<GenerateShortcutResponse | null> {
  try {
    // This would ideally call a backend API that analyzes user patterns
    // and provides a personalized suggestion
    // For now, we'll mock the response for a user's morning routine
    
    const mockPrompt = "Suggest a shortcut for a morning routine that includes weather, calendar, and commute information";
    return await generateShortcut(mockPrompt, userId);
  } catch (error) {
    console.error("Error suggesting daily shortcut:", error);
    return null;
  }
}
