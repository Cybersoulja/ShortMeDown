import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  TrendingUp, 
  Award,
  Crown,
  Zap,
  Calendar,
  Plus
} from "lucide-react";
import { gamificationService, UserProgress, AchievementProgress } from "@/lib/gamification";

interface GamificationDashboardProps {
  userProgress: UserProgress;
  achievements: AchievementProgress[];
}

export function GamificationDashboard({ userProgress, achievements }: GamificationDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const pendingAchievements = achievements.filter(a => !a.isUnlocked);
  const categorizedAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const categories = Array.from(new Set(achievements.map(a => a.category)));

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Plus, Star, Crown, Flame, Trophy, Calendar, Award, Zap, Target
    };
    return icons[iconName] || Trophy;
  };

  const motivationalMessage = gamificationService.getMotivationalMessage(
    userProgress.level, 
    userProgress.streak
  );

  return (
    <div className="space-y-6">
      {/* User Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level and XP */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {userProgress.level}
              </div>
              <div>
                <h3 className="font-semibold">Level {userProgress.level}</h3>
                <p className="text-sm text-muted-foreground">
                  {userProgress.experience} XP
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next Level</p>
              <p className="font-medium">{userProgress.nextLevelXp} XP</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {userProgress.level + 1}</span>
              <span>{Math.round(userProgress.progressPercentage)}%</span>
            </div>
            <Progress value={userProgress.progressPercentage} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <p className="font-semibold text-orange-600">{userProgress.streak}</p>
              <p className="text-xs text-orange-600/70">Day Streak</p>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <p className="font-semibold text-green-600">{userProgress.totalShortcuts}</p>
              <p className="text-xs text-green-600/70">Shortcuts</p>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <p className="font-semibold text-blue-600">{userProgress.totalUsage}</p>
              <p className="text-xs text-blue-600/70">Uses</p>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">{motivationalMessage}</p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Achievements
            <Badge variant="secondary" className="ml-auto">
              {unlockedAchievements.length}/{achievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.slice(0, 4).map(category => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid gap-4">
                {categorizedAchievements.map((achievement) => {
                  const IconComponent = getIcon(achievement.icon);
                  const rarityColor = gamificationService.getRarityColor(achievement.rarity);
                  const rarityGradient = gamificationService.getRarityGradient(achievement.rarity);

                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        achievement.isUnlocked 
                          ? 'border-yellow-200 bg-yellow-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                          style={{ background: rarityGradient }}
                        >
                          <IconComponent className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{achievement.name}</h4>
                            <Badge 
                              variant="outline" 
                              className="capitalize text-xs"
                              style={{ 
                                borderColor: rarityColor,
                                color: rarityColor 
                              }}
                            >
                              {achievement.rarity}
                            </Badge>
                            {achievement.isUnlocked && (
                              <Badge variant="default" className="text-xs bg-yellow-500">
                                +{achievement.experienceReward} XP
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {achievement.description}
                          </p>
                          
                          {!achievement.isUnlocked && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>{achievement.progress}/{achievement.requirement}</span>
                              </div>
                              <Progress 
                                value={achievement.progressPercentage} 
                                className="h-2"
                              />
                            </div>
                          )}
                        </div>
                        
                        {achievement.isUnlocked && (
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-white">
                            <Trophy className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {categorizedAchievements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No achievements in this category yet.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}