import { useState } from "react";
import { Header } from "@/components/ui/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShortcutCard } from "@/components/ui/shortcut-card";
import { shortcutCategories } from "@/lib/shortcutTemplates";
import { useQuery } from "@tanstack/react-query";
import { ShortcutTemplate } from "@shared/schema";
import { Search } from "lucide-react";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch all templates
  const { data: templates, isLoading } = useQuery<ShortcutTemplate[]>({
    queryKey: ['/api/templates'],
  });

  // Filter templates based on search query and active category
  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = searchQuery 
      ? template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    
    const matchesCategory = activeCategory === "All" || template.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is already reactive based on searchQuery state
  };

  return (
    <div className="pb-24 flex flex-col h-full">
      <Header title="Explore Shortcuts" />
      
      <div className="p-4">
        <form onSubmit={handleSearch} className="relative mb-4">
          <Input
            className="w-full pl-10 py-2 border border-ios-gray-3 rounded-xl"
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-ios-gray-1" />
        </form>

        <Tabs defaultValue="All" className="mb-6" onValueChange={setActiveCategory}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="bg-ios-gray-4 p-1">
              <TabsTrigger value="All" className="rounded-md">All</TabsTrigger>
              {shortcutCategories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="rounded-md whitespace-nowrap"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value="All" className="mt-4">
            <ShortcutGrid templates={filteredTemplates} isLoading={isLoading} />
          </TabsContent>
          
          {shortcutCategories.map(category => (
            <TabsContent key={category} value={category} className="mt-4">
              <ShortcutGrid 
                templates={filteredTemplates} 
                isLoading={isLoading}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

interface ShortcutGridProps {
  templates?: ShortcutTemplate[];
  isLoading: boolean;
}

function ShortcutGrid({ templates, isLoading }: ShortcutGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-ios-gray-4 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-ios-gray-4 rounded w-full mb-3"></div>
              <div className="flex space-x-2 mb-3">
                <div className="h-6 bg-ios-gray-4 rounded-full w-16"></div>
                <div className="h-6 bg-ios-gray-4 rounded-full w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-ios-gray-1 mb-2">No shortcuts found</p>
        <p className="text-sm text-ios-gray-1">Try adjusting your search or category filter</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map(template => (
        <ShortcutCard
          key={template.id}
          shortcut={template}
          iconName={template.actions[0]?.iconName || "zap"}
          iconColor={template.actions[0]?.iconColor || "#FF9500"}
        />
      ))}
    </div>
  );
}
