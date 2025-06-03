import React, { useState } from "react";
import { Header } from "@/components/ui/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AskAISection } from "@/components/ask-ai-section";
import { ShortcutResult } from "@/components/shortcut-result";
import { ShortcutAction } from "@shared/schema";
import {
  ArrowRight,
  Plus,
  Edit,
  Trash,
  MoveUp,
  MoveDown,
  AlertCircle,
} from "lucide-react";
import * as Icons from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { shortcutIcons } from "@/lib/shortcutTemplates";
import { useToast } from "@/hooks/use-toast";

export default function Create() {
  const [activeTab, setActiveTab] = useState("ai");
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
  const [customShortcut, setCustomShortcut] = useState<{
    title: string;
    description: string;
    tags: string[];
    actions: ShortcutAction[];
    integrations: {
      dataJar: boolean;
      drafts: boolean;
      pushcut: boolean;
    };
  }>({
    title: "",
    description: "",
    tags: [],
    actions: [],
    integrations: {
      dataJar: false,
      drafts: false,
      pushcut: false,
    },
  });
  
  // Action editor state
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ShortcutAction | null>(null);
  const [actionIndex, setActionIndex] = useState<number | null>(null);
  const { toast } = useToast();

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
  };

  const handleBackToCreate = () => {
    setGeneratedShortcut(null);
  };

  // Action management functions
  const handleAddAction = () => {
    setCurrentAction({
      id: Date.now().toString(),
      name: "",
      description: "",
      iconName: "zap",
      iconColor: "#FF9500",
    });
    setActionIndex(null);
    setIsActionDialogOpen(true);
  };

  const handleEditAction = (index: number) => {
    setCurrentAction({ ...customShortcut.actions[index] });
    setActionIndex(index);
    setIsActionDialogOpen(true);
  };

  const handleDeleteAction = (index: number) => {
    const newActions = [...customShortcut.actions];
    newActions.splice(index, 1);
    setCustomShortcut({ ...customShortcut, actions: newActions });
  };

  const handleMoveAction = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === customShortcut.actions.length - 1)
    ) {
      return;
    }

    const newActions = [...customShortcut.actions];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newActions[index], newActions[newIndex]] = [newActions[newIndex], newActions[index]];
    setCustomShortcut({ ...customShortcut, actions: newActions });
  };

  const handleSaveAction = () => {
    if (!currentAction || !currentAction.name || !currentAction.description) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    const newActions = [...customShortcut.actions];
    
    if (actionIndex !== null) {
      newActions[actionIndex] = currentAction;
    } else {
      newActions.push(currentAction);
    }
    
    setCustomShortcut({ ...customShortcut, actions: newActions });
    setIsActionDialogOpen(false);
    setCurrentAction(null);
    setActionIndex(null);
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (newTag && !customShortcut.tags.includes(newTag)) {
        setCustomShortcut({
          ...customShortcut,
          tags: [...customShortcut.tags, newTag]
        });
        e.currentTarget.value = '';
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCustomShortcut({
      ...customShortcut,
      tags: customShortcut.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleCreateCustomShortcut = () => {
    if (!customShortcut.title || !customShortcut.description || customShortcut.actions.length === 0) {
      toast({
        title: "Incomplete Shortcut",
        description: "Please add a title, description, and at least one action",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would save the shortcut to the backend
    setGeneratedShortcut(customShortcut);
    toast({
      title: "Shortcut Created",
      description: "Your custom shortcut has been created successfully",
    });
  };

  return (
    <div className="pb-24 flex flex-col h-full">
      <Header title="Create Shortcut" />
      
      {generatedShortcut ? (
        <div className="p-4">
          <ShortcutResult
            title={generatedShortcut.title}
            description={generatedShortcut.description}
            tags={generatedShortcut.tags}
            actions={generatedShortcut.actions}
            integrations={generatedShortcut.integrations}
            onBack={handleBackToCreate}
          />
        </div>
      ) : (
        <div className="p-4">
          <Tabs 
            defaultValue="ai" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="ai">AI Assistant</TabsTrigger>
              <TabsTrigger value="manual">Build Your Own</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai" className="space-y-4">
              <AskAISection onShortcutGenerated={handleShortcutGenerated} />
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Shortcut Builder</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter shortcut title"
                      value={customShortcut.title}
                      onChange={(e) => setCustomShortcut({...customShortcut, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="What does this shortcut do?"
                      value={customShortcut.description}
                      onChange={(e) => setCustomShortcut({...customShortcut, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (press Enter to add)</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {customShortcut.tags.map((tag, i) => (
                        <div key={i} className="flex items-center bg-ios-gray-4 text-ios-gray-1 px-2 py-1 rounded-full text-sm">
                          {tag}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Input 
                      id="tags" 
                      placeholder="Add tags..."
                      onKeyDown={handleTagInput}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Actions</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleAddAction}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Action
                      </Button>
                    </div>
                    
                    {customShortcut.actions.length === 0 ? (
                      <div className="text-center p-6 border border-dashed rounded-lg">
                        <AlertCircle className="h-8 w-8 mx-auto text-ios-gray-1 mb-2" />
                        <p className="text-ios-gray-1">No actions added yet</p>
                        <p className="text-xs text-ios-gray-1 mt-1">Click "Add Action" to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {customShortcut.actions.map((action, index) => (
                          <div 
                            key={action.id}
                            className="flex items-center justify-between p-3 rounded-lg"
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
                                {React.createElement(
                                  (Icons as any)[action.iconName] || (Icons as any).Zap, 
                                  { className: "h-5 w-5", style: { color: action.iconColor } }
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{action.name}</h4>
                                <p className="text-xs text-ios-gray-1">{action.description}</p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleMoveAction(index, "up")}
                                disabled={index === 0}
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleMoveAction(index, "down")}
                                disabled={index === customShortcut.actions.length - 1}
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleEditAction(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleDeleteAction(index)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Integrations</Label>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="dataJar"
                          checked={customShortcut.integrations.dataJar}
                          onChange={(e) => setCustomShortcut({
                            ...customShortcut, 
                            integrations: {
                              ...customShortcut.integrations,
                              dataJar: e.target.checked
                            }
                          })}
                          className="rounded border-ios-gray-3"
                        />
                        <Label htmlFor="dataJar" className="text-sm">Data Jar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="drafts"
                          checked={customShortcut.integrations.drafts}
                          onChange={(e) => setCustomShortcut({
                            ...customShortcut, 
                            integrations: {
                              ...customShortcut.integrations,
                              drafts: e.target.checked
                            }
                          })}
                          className="rounded border-ios-gray-3"
                        />
                        <Label htmlFor="drafts" className="text-sm">Drafts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="pushcut"
                          checked={customShortcut.integrations.pushcut}
                          onChange={(e) => setCustomShortcut({
                            ...customShortcut, 
                            integrations: {
                              ...customShortcut.integrations,
                              pushcut: e.target.checked
                            }
                          })}
                          className="rounded border-ios-gray-3"
                        />
                        <Label htmlFor="pushcut" className="text-sm">Pushcut</Label>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCreateCustomShortcut}
                    className="w-full mt-4 bg-ios-blue"
                  >
                    Create Shortcut
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Action Editor Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionIndex !== null ? "Edit Action" : "Add Action"}</DialogTitle>
            <DialogDescription>
              Define the details for this shortcut action
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="actionName">Action Name</Label>
              <Input
                id="actionName"
                placeholder="e.g., Get Current Location"
                value={currentAction?.name || ""}
                onChange={(e) => setCurrentAction(curr => curr ? {...curr, name: e.target.value} : null)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="actionDescription">Description</Label>
              <Textarea
                id="actionDescription"
                placeholder="What does this action do?"
                value={currentAction?.description || ""}
                onChange={(e) => setCurrentAction(curr => curr ? {...curr, description: e.target.value} : null)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="iconName">Icon</Label>
                <Select
                  value={currentAction?.iconName || "zap"}
                  onValueChange={(value) => setCurrentAction(curr => curr ? {...curr, iconName: value} : null)}
                >
                  <SelectTrigger id="iconName">
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(shortcutIcons).map(iconName => (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center">
                          {React.createElement(
                            (Icons as any)[iconName] || (Icons as any).Zap, 
                            { className: "h-4 w-4 mr-2" }
                          )}
                          {iconName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="iconColor">Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="iconColor"
                    value={currentAction?.iconColor || "#FF9500"}
                    onChange={(e) => setCurrentAction(curr => curr ? {...curr, iconColor: e.target.value} : null)}
                    className="h-10 w-10 border-0 p-0 rounded"
                  />
                  <Input
                    value={currentAction?.iconColor || "#FF9500"}
                    onChange={(e) => setCurrentAction(curr => curr ? {...curr, iconColor: e.target.value} : null)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAction}>
              Save Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
