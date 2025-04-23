import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShortcutTemplate } from "@shared/schema";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export function DailySuggestion() {
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Fetch daily suggestion from API
  const { data: dailySuggestion, isLoading, error } = useQuery({
    queryKey: ['/api/templates'],
    select: (data: ShortcutTemplate[]) => {
      // For now, just select the first template as the daily suggestion
      // In a real app, this would be a personalized suggestion from the backend
      return data && data.length > 0 ? data[0] : null;
    }
  });

  useEffect(() => {
    if (dailySuggestion) {
      // Update the timestamp when we get a new suggestion
      setLastUpdated(new Date());
    }
  }, [dailySuggestion]);

  const handleAdd = () => {
    toast({
      title: "Shortcut Added",
      description: `${dailySuggestion?.title} has been added to your library`,
    });
  };

  const handleViewDetails = () => {
    // This would navigate to a detailed view in a real app
    toast({
      title: "View Details",
      description: "This would show detailed information about the shortcut",
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-md animate-pulse">
        <div className="bg-ios-blue/10 px-4 py-2 flex justify-between items-center">
          <h3 className="text-ios-blue font-medium">Daily Suggestion</h3>
          <span className="text-xs text-ios-gray-1">Loading...</span>
        </div>
        <div className="p-4">
          <div className="h-6 bg-ios-gray-4 rounded-md w-3/4 mb-3"></div>
          <div className="h-4 bg-ios-gray-4 rounded-md w-full mb-4"></div>
          <div className="flex space-x-3 mb-4">
            <div className="h-6 bg-ios-gray-4 rounded-full w-16"></div>
            <div className="h-6 bg-ios-gray-4 rounded-full w-20"></div>
            <div className="h-6 bg-ios-gray-4 rounded-full w-14"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !dailySuggestion) {
    return (
      <Card className="shadow-md">
        <div className="bg-ios-blue/10 px-4 py-2 flex justify-between items-center">
          <h3 className="text-ios-blue font-medium">Daily Suggestion</h3>
          <span className="text-xs text-ios-gray-1">Not Available</span>
        </div>
        <div className="p-4 text-center text-ios-gray-1">
          <p>Sorry, we couldn't load a suggestion right now.</p>
          <p className="text-sm mt-1">Please check back later.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-md overflow-hidden">
      <div className="bg-ios-blue/10 px-4 py-2 flex justify-between items-center">
        <h3 className="text-ios-blue font-medium">Daily Suggestion</h3>
        <span className="text-xs text-ios-gray-1">
          Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
        </span>
      </div>
      <div className="p-4">
        <h4 className="font-medium text-lg">{dailySuggestion.title}</h4>
        <p className="text-ios-gray-1 mt-1 mb-3">{dailySuggestion.description}</p>
        
        <div className="flex space-x-3 mb-4 flex-wrap">
          {dailySuggestion.tags.map((tag, index) => (
            <span 
              key={index} 
              className="text-xs bg-ios-gray-4 text-ios-gray-1 px-2 py-1 rounded-full mb-1"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost"
            className="text-ios-blue font-medium"
            onClick={handleViewDetails}
          >
            See Details
          </Button>
          <Button 
            className="bg-ios-green text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1"
            onClick={handleAdd}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
