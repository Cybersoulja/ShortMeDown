import { Settings } from "lucide-react";
import { Button } from "./button";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "AI Shortcut Companion" }: HeaderProps) {
  return (
    <header className="px-4 py-3 bg-white border-b border-ios-gray-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Button variant="ghost" className="p-2 rounded-full" size="icon">
          <Settings className="h-6 w-6 text-ios-gray-1" />
        </Button>
      </div>
    </header>
  );
}
