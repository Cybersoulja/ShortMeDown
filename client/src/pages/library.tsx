import { useState } from "react";
import { Header } from "@/components/ui/header";
import { useQuery } from "@tanstack/react-query";
import { ShortcutCard } from "@/components/ui/shortcut-card";
import { Shortcut } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ShortcutResult } from "@/components/shortcut-result";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShortcut, setSelectedShortcut] = useState<Shortcut | null>(null);
  const { toast } = useToast();
  
  // Mock user ID for now
  const userId = 1;
  
  const { data: shortcuts, isLoading, error } = useQuery<Shortcut[]>({
    queryKey: [`/api/shortcuts?userId=${userId}`],
  });

  const filterShortcuts = (shortcuts: Shortcut[] | undefined, query: string) => {
    if (!shortcuts) return [];
    
    if (!query) return shortcuts;
    
    const lowercaseQuery = query.toLowerCase();
    return shortcuts.filter(shortcut => 
      shortcut.title.toLowerCase().includes(lowercaseQuery) || 
      shortcut.description.toLowerCase().includes(lowercaseQuery) ||
      shortcut.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const filteredShortcuts = filterShortcuts(shortcuts, searchQuery);
  const favoriteShortcuts = filteredShortcuts.filter(shortcut => shortcut.isFavorite);
  const recentShortcuts = filteredShortcuts
    .sort((a, b) => {
      const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
      const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
      return dateB - dateA;
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtering is already reactive
  };

  const handleDeleteShortcut = () => {
    if (!selectedShortcut) return;
    
    // In a real app, this would call the API to delete the shortcut
    toast({
      title: "Shortcut Deleted",
      description: `"${selectedShortcut.title}" has been removed from your library`,
    });
    
    setSelectedShortcut(null);
  };

  if (selectedShortcut) {
    return (
      <div className="pb-24">
        <Header title="Shortcut Details" />
        <div className="p-4">
          <ShortcutResult
            title={selectedShortcut.title}
            description={selectedShortcut.description}
            tags={selectedShortcut.tags}
            actions={selectedShortcut.actions}
            integrations={selectedShortcut.integrations}
            onBack={() => setSelectedShortcut(null)}
          />
          
          <Button 
            variant="destructive" 
            className="w-full mt-4"
            onClick={handleDeleteShortcut}
          >
            Delete Shortcut
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <Header title="My Shortcuts" />
      
      <div className="p-4">
        <form onSubmit={handleSearch} className="relative mb-4">
          <Input
            className="w-full pl-10 py-2 border border-ios-gray-3 rounded-xl"
            placeholder="Search your shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-ios-gray-1" />
        </form>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">All Shortcuts</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-ios-gray-4 h-16 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : error || !shortcuts || recentShortcuts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-ios-gray-1 mb-2">
                  {error 
                    ? "Failed to load shortcuts" 
                    : searchQuery 
                      ? "No shortcuts match your search" 
                      : "You don't have any shortcuts yet"}
                </p>
                <p className="text-sm text-ios-gray-1">
                  {error 
                    ? "Please try again later" 
                    : searchQuery 
                      ? "Try a different search term" 
                      : "Create a new shortcut to get started"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentShortcuts.map(shortcut => (
                  <ShortcutCard
                    key={shortcut.id}
                    shortcut={shortcut}
                    iconName={shortcut.actions[0]?.iconName || "zap"}
                    iconColor={shortcut.actions[0]?.iconColor || "#FF9500"}
                    onClick={() => setSelectedShortcut(shortcut)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-ios-gray-4 h-16 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : error || !shortcuts || favoriteShortcuts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-ios-gray-1 mb-2">
                  {error 
                    ? "Failed to load favorites" 
                    : searchQuery 
                      ? "No favorites match your search" 
                      : "You don't have any favorite shortcuts"}
                </p>
                <p className="text-sm text-ios-gray-1">
                  {error 
                    ? "Please try again later" 
                    : searchQuery 
                      ? "Try a different search term" 
                      : "Mark shortcuts as favorites to see them here"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {favoriteShortcuts.map(shortcut => (
                  <ShortcutCard
                    key={shortcut.id}
                    shortcut={shortcut}
                    iconName={shortcut.actions[0]?.iconName || "zap"}
                    iconColor={shortcut.actions[0]?.iconColor || "#FF9500"}
                    onClick={() => setSelectedShortcut(shortcut)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
