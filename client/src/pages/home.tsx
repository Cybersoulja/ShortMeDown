import { useState } from "react";
import { AskAISection } from "@/components/ask-ai-section";
import { DailySuggestion } from "@/components/daily-suggestion";
import { RecentShortcuts } from "@/components/recent-shortcuts";
import { ShortcutResult } from "@/components/shortcut-result";
import { ShortcutAction } from "@shared/schema";

export default function Home() {
  const [generatedShortcut, setGeneratedShortcut] = useState<{
    title: string;
    description: string;
    tags: string[];
    actions: ShortcutAction[];
    integrations: {
      dataJar: boolean;
      drafts: boolean;
      pushcut: boolean;
    };
  } | null>(null);

  const handleShortcutGenerated = (result: {
    title: string;
    description: string;
    tags: string[];
    actions: ShortcutAction[];
    integrations: {
      dataJar: boolean;
      drafts: boolean;
      pushcut: boolean;
    };
  }) => {
    setGeneratedShortcut(result);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToHome = () => {
    setGeneratedShortcut(null);
  };

  return (
    <div className="p-4 space-y-5 pb-24">
      {generatedShortcut ? (
        <ShortcutResult
          title={generatedShortcut.title}
          description={generatedShortcut.description}
          tags={generatedShortcut.tags}
          actions={generatedShortcut.actions}
          integrations={generatedShortcut.integrations}
          onBack={handleBackToHome}
        />
      ) : (
        <>
          <AskAISection onShortcutGenerated={handleShortcutGenerated} />
          <DailySuggestion />
          <RecentShortcuts />
        </>
      )}
    </div>
  );
}
