import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShortcutCard } from "@/components/ui/shortcut-card";
import { Shortcut } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function RecentShortcuts() {
  const { toast } = useToast();
  
  // Mock user ID for now
  const userId = 1;
  
  const { data: shortcuts, isLoading, error } = useQuery<Shortcut[]>({
    queryKey: [`/api/shortcuts?userId=${userId}`],
  });

  // Get the most recent shortcuts (limited to 3)
  const recentShortcuts = shortcuts
    ?.sort((a, b) => {
      const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
      const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  const handleViewAll = () => {
    // This would typically navigate to the library page
    toast({
      title: "View All",
      description: "This would navigate to your shortcuts library",
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <div className="px-4 py-3 border-b border-ios-gray-4">
          <h3 className="font-medium">Recent Shortcuts</h3>
        </div>
        <div className="divide-y divide-ios-gray-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-ios-gray-4 mr-3"></div>
                <div className="flex-1">
                  <div className="h-5 bg-ios-gray-4 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-ios-gray-4 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error || !shortcuts) {
    return (
      <Card className="shadow-md">
        <div className="px-4 py-3 border-b border-ios-gray-4">
          <h3 className="font-medium">Recent Shortcuts</h3>
        </div>
        <div className="p-4 text-center text-ios-gray-1">
          <p>Could not load your shortcuts.</p>
          <p className="text-sm mt-1">Please try again later.</p>
        </div>
      </Card>
    );
  }

  if (recentShortcuts?.length === 0) {
    return (
      <Card className="shadow-md">
        <div className="px-4 py-3 border-b border-ios-gray-4">
          <h3 className="font-medium">Recent Shortcuts</h3>
        </div>
        <div className="p-4 text-center text-ios-gray-1">
          <p>You haven't created any shortcuts yet.</p>
          <p className="text-sm mt-1">Use the AI assistant to get started!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <div className="px-4 py-3 border-b border-ios-gray-4">
        <h3 className="font-medium">Recent Shortcuts</h3>
      </div>
      <div className="divide-y divide-ios-gray-4">
        {recentShortcuts?.map((shortcut) => (
          <ShortcutCard
            key={shortcut.id}
            shortcut={shortcut}
            iconName={shortcut.actions[0]?.iconName || "zap"}
            iconColor={shortcut.actions[0]?.iconColor || "#FF9500"}
            onClick={() => {
              toast({
                title: "Shortcut Selected",
                description: `You selected ${shortcut.title}`,
              });
            }}
          />
        ))}
        
        <div className="p-4 flex justify-center">
          <Button 
            variant="ghost"
            className="text-ios-blue font-medium"
            onClick={handleViewAll}
          >
            View All
          </Button>
        </div>
      </div>
    </Card>
  );
}
