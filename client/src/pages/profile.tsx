import { Header } from "@/components/ui/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AirtableIntegration } from "@/components/airtable-integration";
import { BearIntegration } from "@/components/bear-integration";
import { GamificationDashboard } from "@/components/gamification-dashboard";
import { gamificationService } from "@/lib/gamification";
import { 
  Bell,
  Moon,
  User,
  LogOut,
  Bookmark,
  Settings,
  Info,
  HelpCircle,
  Database,
  BookOpen,
  Trophy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    dailySuggestions: true,
    notificationsEnabled: true,
    voiceAssistant: true,
    darkMode: false
  });

  // Fetch user shortcuts for integrations
  const { data: shortcuts = [] } = useQuery({
    queryKey: ['/api/shortcuts'],
  });

  // Mock gamification data for demo
  const mockUserProgress = gamificationService.calculateUserProgress({
    level: 3,
    experience: 245,
    streak: 5,
    totalShortcuts: 12,
    totalUsage: 89
  });

  const mockAchievements = gamificationService.getBuiltInAchievements().map((achievement, index) => ({
    ...achievement,
    id: index + 1,
    isUnlocked: index < 4,
    progress: index < 4 ? achievement.requirement : Math.floor(achievement.requirement * 0.6),
    progressPercentage: index < 4 ? 100 : 60
  }));

  const handlePreferenceChange = (preference: keyof typeof preferences) => {
    setPreferences(prev => {
      const updated = { ...prev, [preference]: !prev[preference] };
      
      // In a real app, this would save to the backend
      // For now, just show a toast
      toast({
        title: "Preference Updated",
        description: `${preference} is now ${updated[preference] ? "enabled" : "disabled"}`,
      });
      
      return updated;
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <div className="pb-24">
      <Header title="Profile" />
      
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <User className="h-5 w-5 mr-2 text-ios-blue" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">UserDemo</h3>
                <p className="text-sm text-ios-gray-1">demo@example.com</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            
            <div className="flex items-center space-x-2 py-2">
              <Bookmark className="h-5 w-5 text-ios-blue" />
              <span>15 Shortcuts</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Settings className="h-5 w-5 mr-2 text-ios-blue" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="daily-suggestions">Daily Suggestions</Label>
                <p className="text-sm text-ios-gray-1">Receive personalized shortcut suggestions</p>
              </div>
              <Switch 
                id="daily-suggestions" 
                checked={preferences.dailySuggestions}
                onCheckedChange={() => handlePreferenceChange('dailySuggestions')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="flex items-center">
                  <Bell className="h-4 w-4 mr-1 inline" />
                  Notifications
                </Label>
                <p className="text-sm text-ios-gray-1">Get tips and shortcut updates</p>
              </div>
              <Switch 
                id="notifications" 
                checked={preferences.notificationsEnabled}
                onCheckedChange={() => handlePreferenceChange('notificationsEnabled')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="voice-assistant">Voice Assistant</Label>
                <p className="text-sm text-ios-gray-1">Enable voice commands for shortcut creation</p>
              </div>
              <Switch 
                id="voice-assistant" 
                checked={preferences.voiceAssistant}
                onCheckedChange={() => handlePreferenceChange('voiceAssistant')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="flex items-center">
                  <Moon className="h-4 w-4 mr-1 inline" />
                  Dark Mode
                </Label>
                <p className="text-sm text-ios-gray-1">Switch to dark theme</p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={preferences.darkMode}
                onCheckedChange={() => handlePreferenceChange('darkMode')}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-ios-blue" />
              Progress & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GamificationDashboard 
              userProgress={mockUserProgress}
              achievements={mockAchievements}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Database className="h-5 w-5 mr-2 text-ios-blue" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AirtableIntegration 
              shortcuts={Array.isArray(shortcuts) ? shortcuts : []} 
              onShortcutSync={(shortcutId) => {
                toast({
                  title: "Shortcut Synced",
                  description: "Successfully synced to Airtable",
                });
              }}
            />
            
            <BearIntegration 
              shortcuts={Array.isArray(shortcuts) ? shortcuts : []}
              onNoteCreated={(noteId) => {
                toast({
                  title: "Note Created",
                  description: "Shortcut saved to Bear",
                });
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Info className="h-5 w-5 mr-2 text-ios-blue" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-1">
              <span>Version</span>
              <span className="text-ios-gray-1">1.0.0</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span>Privacy Policy</span>
              <Button variant="ghost" size="sm">View</Button>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span>Terms of Service</span>
              <Button variant="ghost" size="sm">View</Button>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="flex items-center gap-1">
                <HelpCircle className="h-4 w-4" />
                Help & Support
              </span>
              <Button variant="ghost" size="sm">Contact</Button>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          variant="destructive" 
          className="w-full mt-4 flex items-center justify-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
