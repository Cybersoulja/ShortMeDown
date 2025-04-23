import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Shortcut, ShortcutTemplate } from "@shared/schema";
import * as Icons from "lucide-react";

interface ShortcutCardProps {
  shortcut: Shortcut | ShortcutTemplate;
  onClick?: () => void;
  className?: string;
  showChevron?: boolean;
  iconColor?: string;
  iconName?: string;
}

export function ShortcutCard({ 
  shortcut, 
  onClick, 
  className,
  showChevron = true,
  iconName = "zap", 
  iconColor = "#FF9500" 
}: ShortcutCardProps) {
  // Dynamically get the icon component
  const IconComponent = Icons[iconName as keyof typeof Icons] || Icons.Zap;
  
  return (
    <Card 
      className={cn("cursor-pointer hover:shadow-md transition-shadow", className)}
      onClick={onClick}
    >
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
            style={{ backgroundColor: `${iconColor}20` }} // 20% opacity version of the color
          >
            <IconComponent className="h-6 w-6" style={{ color: iconColor }} />
          </div>
          <div>
            <h4 className="font-medium">{shortcut.title}</h4>
            {"usageCount" in shortcut ? (
              <p className="text-xs text-ios-gray-1">
                {shortcut.actions.length} actions · {getLastUsedText(shortcut)}
              </p>
            ) : (
              <p className="text-xs text-ios-gray-1">
                {shortcut.actions.length} actions
              </p>
            )}
          </div>
        </div>
        {showChevron && (
          <div className="text-ios-blue">
            <ChevronRight className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to format last used text
function getLastUsedText(shortcut: Shortcut): string {
  if (!shortcut.lastUsed) return "Never used";
  
  const lastUsed = new Date(shortcut.lastUsed);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Used today";
  if (diffDays === 1) return "Used yesterday";
  return `Used ${diffDays} days ago`;
}
