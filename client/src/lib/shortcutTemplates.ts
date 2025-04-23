import { ShortcutAction } from "@shared/schema";

// Categories for shortcut templates
export const shortcutCategories = [
  "Productivity",
  "Communication",
  "Health",
  "Social Media",
  "Home Automation",
  "Travel",
  "Finance",
  "Entertainment",
  "Weather",
  "Photo & Video",
];

// Common shortcut icons with appropriate colors
export const shortcutIcons: Record<string, { color: string }> = {
  "clock": { color: "#FF9500" },         // Time/scheduling
  "calendar": { color: "#FF2D55" },      // Calendar/events
  "map-pin": { color: "#FF9500" },       // Location
  "message-square": { color: "#34C759" }, // Messaging
  "phone": { color: "#34C759" },         // Calls
  "mail": { color: "#5FC9F8" },          // Email
  "camera": { color: "#AF52DE" },        // Photo/video
  "music": { color: "#FF2D55" },         // Audio
  "bell": { color: "#FF9500" },          // Notifications
  "home": { color: "#5E5CE6" },          // Home automation
  "weather": { color: "#0A84FF" },       // Weather
  "wifi": { color: "#5FC9F8" },          // Connectivity
  "battery": { color: "#34C759" },       // Power/battery
  "moon": { color: "#5E5CE6" },          // Focus/DND
  "cloud": { color: "#0A84FF" },         // Weather/cloud
  "file-text": { color: "#5E5CE6" },     // Notes/text
  "credit-card": { color: "#34C759" },   // Finance
  "users": { color: "#0A84FF" },         // Contacts/social
  "heart": { color: "#FF2D55" },         // Health
  "clipboard": { color: "#5E5CE6" },     // Clipboard
  "database": { color: "#5E5CE6" },      // Data storage
  "volume-2": { color: "#FF3B30" },      // Audio/speaking
  "repeat": { color: "#34C759" },        // Automation/repeat
  "alert-triangle": { color: "#FF3B30" }, // Alerts/warnings
  "tag": { color: "#FF9500" },           // Tags/categories
  "link": { color: "#0A84FF" },          // Links/URLs
  "image": { color: "#AF52DE" },         // Images
  "shield": { color: "#FF3B30" },        // Security
  "activity": { color: "#FF2D55" },      // Health/activity
  "settings": { color: "#8E8E93" },      // Settings
};

// Sample shortcut for daily suggestion
export const dailySuggestion = {
  title: "Morning Routine Assistant",
  description: "Start your day right with weather, calendar events, and traffic updates.",
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
  ]
};

// Integration options
export interface IntegrationOption {
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const integrationOptions: IntegrationOption[] = [
  {
    name: "Data Jar",
    icon: "database",
    color: "#34C759",
    description: "Store and retrieve persistent data across shortcuts"
  },
  {
    name: "Drafts",
    icon: "file-text",
    color: "#0A84FF",
    description: "Capture and process text in your shortcuts"
  },
  {
    name: "Pushcut",
    icon: "bell",
    color: "#AF52DE",
    description: "Send notifications and trigger automation"
  }
];

// Function to format a shortcut for export to Jellycuts
export function formatJellycutsExport(shortcutActions: ShortcutAction[], title: string, description: string): string {
  return `// ${title}
// ${description}

import { Shortcut, Alert, Location, Map, Contact, Message } from "jellycuts"

const shortcut = new Shortcut("${title}")

${shortcutActions.map((action, index) => {
  // This is just a simplified example, real Jellycuts format would be more complex
  return `// Action ${index + 1}: ${action.name}
// ${action.description}
shortcut.${action.name.replace(/\s+/g, '')}(${JSON.stringify(action.parameters || {})})
`
}).join('\n')}

shortcut.complete()`;
}
