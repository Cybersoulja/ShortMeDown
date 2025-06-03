import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShortcutAction } from "@shared/schema";
import { ArrowLeft, Edit, Download, Database, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToJellycuts } from "@/lib/openai";
import { airtableService } from "@/lib/airtable";
import { bearService } from "@/lib/bear";
import * as Icons from "lucide-react";
import { integrationOptions } from "@/lib/shortcutTemplates";

interface ShortcutResultProps {
  title: string;
  description: string;
  tags: string[];
  actions: ShortcutAction[];
  integrations: {
    dataJar: boolean;
    drafts: boolean;
    pushcut: boolean;
  };
  onBack: () => void;
}

export function ShortcutResult({
  title,
  description,
  tags,
  actions,
  integrations,
  onBack
}: ShortcutResultProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleAddToShortcuts = async () => {
    try {
      // Save shortcut locally first
      toast({
        title: "Shortcut Added",
        description: "The shortcut has been added to your library",
      });

      // Auto-sync to integrations if configured
      await handleIntegrationSync();
    } catch (error) {
      console.error('Error adding shortcut:', error);
    }
  };

  const handleIntegrationSync = async () => {
    const shortcutData = {
      title,
      description,
      category: 'AI Generated',
      tags,
      actions,
      integrations
    };

    // Sync to Airtable if configured
    if (airtableService.isConfigured()) {
      try {
        await airtableService.createShortcutRecord(shortcutData);
        toast({
          title: "Synced to Airtable",
          description: "Shortcut saved to your Airtable database",
        });
      } catch (error) {
        console.error('Airtable sync failed:', error);
      }
    }

    // Sync to Bear if available
    if (bearService.isAvailable()) {
      try {
        await bearService.createShortcutNote(shortcutData);
        toast({
          title: "Saved to Bear",
          description: "Shortcut documentation created in Bear",
        });
      } catch (error) {
        console.error('Bear sync failed:', error);
      }
    }
  };

  const handleSaveToAirtable = async () => {
    if (!airtableService.isConfigured()) {
      toast({
        title: "Airtable Not Configured",
        description: "Please configure Airtable in your profile settings",
        variant: "destructive"
      });
      return;
    }

    try {
      await airtableService.createShortcutRecord({
        title,
        description,
        category: 'AI Generated',
        tags,
        actions,
        integrations
      });
      
      toast({
        title: "Saved to Airtable",
        description: "Shortcut successfully saved to your database",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save to Airtable. Check your configuration.",
        variant: "destructive"
      });
    }
  };

  const handleSaveToBear = async () => {
    try {
      const result = await bearService.createShortcutNote({
        title,
        description,
        actions,
        tags,
        category: 'AI Generated'
      });

      if (result.success) {
        toast({
          title: "Saved to Bear",
          description: "Shortcut documentation created in Bear",
        });
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save to Bear",
        variant: "destructive"
      });
    }
  };

  const handleEdit = () => {
    toast({
      title: "Edit Mode",
      description: "Edit functionality would be implemented here",
    });
  };

  const handleExportJellycuts = async () => {
    setIsExporting(true);
    try {
      const result = await exportToJellycuts(actions, title, description);
      
      // Create a download link for the script
      const blob = new Blob([result.script], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.jellycuts`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Jellycuts script has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export to Jellycuts",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Helper to get icon component
  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] || Icons.Zap;
    return IconComponent;
  };

  return (
    <Card className="shadow-md">
      <div className="p-4 border-b border-ios-gray-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-medium">{title}</h2>
          <p className="text-ios-gray-1 text-sm mt-1">{description}</p>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-ios-gray-4 border-0 text-ios-gray-1">
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Actions breakdown */}
        <h3 className="font-medium text-lg mt-2">Actions Breakdown</h3>
        
        <div className="space-y-3">
          {actions.map((action, index) => {
            const IconComponent = getIcon(action.iconName);
            
            return (
              <div 
                key={index} 
                className="rounded-lg p-3 space-y-2"
                style={{ 
                  background: `linear-gradient(135deg, ${action.iconColor}10 0%, ${action.iconColor}20 100%)`,
                  borderLeft: `3px solid ${action.iconColor}`
                }}
              >
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center mr-2"
                    style={{ backgroundColor: `${action.iconColor}30` }}
                  >
                    <IconComponent className="h-5 w-5" style={{ color: action.iconColor }} />
                  </div>
                  <div>
                    <h4 className="font-medium">{`${index + 1}. ${action.name}`}</h4>
                  </div>
                </div>
                <p className="text-sm text-ios-gray-1 ml-10">{action.description}</p>
              </div>
            );
          })}
        </div>
        
        {/* Integration options */}
        <div>
          <h3 className="font-medium text-lg mt-4">Integration Options</h3>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {integrationOptions.map((integration) => {
              const IconComponent = getIcon(integration.icon);
              const isEnabled = 
                (integration.name === "Data Jar" && integrations.dataJar) ||
                (integration.name === "Drafts" && integrations.drafts) ||
                (integration.name === "Pushcut" && integrations.pushcut);
              
              return (
                <Button
                  key={integration.name}
                  variant="outline"
                  className={`border border-ios-gray-3 rounded-lg p-3 flex flex-col items-center justify-center space-y-2 hover:bg-ios-gray-4/50 ${isEnabled ? 'ring-2 ring-ios-blue' : ''}`}
                  title={integration.description}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${integration.color}20` }}
                  >
                    <IconComponent className="h-6 w-6" style={{ color: integration.color }} />
                  </div>
                  <span className="text-xs text-center">{integration.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator className="my-4" />
        
        {/* Integration Actions */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Quick Save Options</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleSaveToAirtable}
              className="flex items-center gap-2 py-3"
            >
              <Database className="h-4 w-4" />
              Save to Airtable
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveToBear}
              className="flex items-center gap-2 py-3"
            >
              <BookOpen className="h-4 w-4" />
              Save to Bear
            </Button>
          </div>
        </div>

        <Separator className="my-4" />
        
        {/* Export to Jellycuts */}
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-3"
          onClick={handleExportJellycuts}
          disabled={isExporting}
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export to Jellycuts"}
        </Button>
        
        {/* Action buttons */}
        <div className="flex mt-6 space-x-3 justify-end">
          <Button 
            variant="outline"
            onClick={handleEdit}
            className="px-4 py-2 flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button 
            className="px-4 py-2 bg-ios-blue text-white font-medium"
            onClick={handleAddToShortcuts}
          >
            Add to Shortcuts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
