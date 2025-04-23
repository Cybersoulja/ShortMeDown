import { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { VoiceModal } from "@/components/ui/voice-modal";
import { generateShortcut } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { ShortcutAction } from "@shared/schema";

interface AskAISectionProps {
  onShortcutGenerated: (result: {
    title: string;
    description: string;
    tags: string[];
    actions: ShortcutAction[];
    integrations: {
      dataJar: boolean;
      drafts: boolean;
      pushcut: boolean;
    };
  }) => void;
}

export function AskAISection({ onShortcutGenerated }: AskAISectionProps) {
  const [userInput, setUserInput] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateShortcut = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe what you want to automate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateShortcut(userInput);
      onShortcutGenerated(result);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate shortcut. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setUserInput(transcript);
  };

  return (
    <>
      <Card className="shadow-md">
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-medium">Create a Shortcut</h2>
          <p className="text-ios-gray-1">Describe what you want to automate in plain language</p>
          
          <div className="relative mt-2">
            <Textarea
              className="w-full border border-ios-gray-3 rounded-xl p-4 pr-12 h-24 focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent"
              placeholder="e.g., I want a shortcut that shares my current location with my spouse when I leave work"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            
            {/* Voice Input Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 bottom-3 text-ios-blue p-2 rounded-full hover:bg-ios-gray-4"
              onClick={() => setIsVoiceModalOpen(true)}
            >
              <Mic className="h-6 w-6" />
            </Button>
          </div>
          
          <Button
            className="w-full bg-ios-blue text-white py-3 rounded-xl font-medium shadow-sm"
            onClick={handleGenerateShortcut}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Shortcut"}
          </Button>
        </CardContent>
      </Card>

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptComplete={handleVoiceInput}
      />
    </>
  );
}
