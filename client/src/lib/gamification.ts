import { Achievement, UserAchievement } from "@shared/schema";

export interface UserProgress {
  level: number;
  experience: number;
  streak: number;
  totalShortcuts: number;
  totalUsage: number;
  nextLevelXp: number;
  currentLevelXp: number;
  progressPercentage: number;
}

export interface AchievementProgress extends Achievement {
  isUnlocked: boolean;
  progress: number;
  progressPercentage: number;
}

class GamificationService {
  private readonly XP_PER_LEVEL = 100;
  private readonly XP_MULTIPLIER = 1.5;

  // Experience rewards
  private readonly REWARDS = {
    CREATE_SHORTCUT: 10,
    USE_SHORTCUT: 5,
    DAILY_LOGIN: 15,
    FIRST_INTEGRATION: 25,
    SHARE_SHORTCUT: 20,
    COMPLETE_TUTORIAL: 50,
  };

  // Built-in achievements
  private readonly BUILT_IN_ACHIEVEMENTS: Omit<Achievement, 'id'>[] = [
    {
      name: "First Steps",
      description: "Create your first shortcut",
      icon: "Plus",
      category: "creation",
      requirement: 1,
      experienceReward: 25,
      rarity: "bronze"
    },
    {
      name: "Getting Started",
      description: "Create 5 shortcuts",
      icon: "Zap",
      category: "creation",
      requirement: 5,
      experienceReward: 50,
      rarity: "bronze"
    },
    {
      name: "Shortcut Enthusiast",
      description: "Create 25 shortcuts",
      icon: "Star",
      category: "creation",
      requirement: 25,
      experienceReward: 100,
      rarity: "silver"
    },
    {
      name: "Automation Master",
      description: "Create 100 shortcuts",
      icon: "Crown",
      category: "creation",
      requirement: 100,
      experienceReward: 250,
      rarity: "gold"
    },
    {
      name: "Power User",
      description: "Use shortcuts 50 times",
      icon: "Flame",
      category: "usage",
      requirement: 50,
      experienceReward: 75,
      rarity: "bronze"
    },
    {
      name: "Efficiency Expert",
      description: "Use shortcuts 500 times",
      icon: "Lightning",
      category: "usage",
      requirement: 500,
      experienceReward: 200,
      rarity: "silver"
    },
    {
      name: "Automation Addict",
      description: "Use shortcuts 2000 times",
      icon: "Trophy",
      category: "usage",
      requirement: 2000,
      experienceReward: 500,
      rarity: "gold"
    },
    {
      name: "Streak Keeper",
      description: "Maintain a 7-day streak",
      icon: "Calendar",
      category: "streak",
      requirement: 7,
      experienceReward: 100,
      rarity: "silver"
    },
    {
      name: "Dedication",
      description: "Maintain a 30-day streak",
      icon: "Award",
      category: "streak",
      requirement: 30,
      experienceReward: 300,
      rarity: "gold"
    },
    {
      name: "Connected",
      description: "Connect your first integration",
      icon: "Link",
      category: "integration",
      requirement: 1,
      experienceReward: 50,
      rarity: "bronze"
    },
    {
      name: "Social Butterfly",
      description: "Share 10 shortcuts",
      icon: "Share",
      category: "social",
      requirement: 10,
      experienceReward: 75,
      rarity: "silver"
    }
  ];

  calculateUserProgress(user: {
    level: number;
    experience: number;
    streak: number;
    totalShortcuts: number;
    totalUsage: number;
  }): UserProgress {
    const currentLevelXp = this.getXpForLevel(user.level);
    const nextLevelXp = this.getXpForLevel(user.level + 1);
    const progressInLevel = user.experience - currentLevelXp;
    const xpForNextLevel = nextLevelXp - currentLevelXp;
    const progressPercentage = Math.min((progressInLevel / xpForNextLevel) * 100, 100);

    return {
      level: user.level,
      experience: user.experience,
      streak: user.streak,
      totalShortcuts: user.totalShortcuts,
      totalUsage: user.totalUsage,
      nextLevelXp,
      currentLevelXp,
      progressPercentage
    };
  }

  private getXpForLevel(level: number): number {
    if (level <= 1) return 0;
    let totalXp = 0;
    for (let i = 1; i < level; i++) {
      totalXp += Math.floor(this.XP_PER_LEVEL * Math.pow(this.XP_MULTIPLIER, i - 1));
    }
    return totalXp;
  }

  calculateLevelFromXp(experience: number): number {
    let level = 1;
    let requiredXp = 0;
    
    while (experience >= requiredXp) {
      level++;
      requiredXp = this.getXpForLevel(level);
    }
    
    return level - 1;
  }

  getAchievementProgress(
    achievements: Achievement[],
    userAchievements: UserAchievement[],
    userStats: {
      totalShortcuts: number;
      totalUsage: number;
      streak: number;
    }
  ): AchievementProgress[] {
    return achievements.map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
      const isUnlocked = !!userAchievement;
      
      let progress = 0;
      switch (achievement.category) {
        case 'creation':
          progress = userStats.totalShortcuts;
          break;
        case 'usage':
          progress = userStats.totalUsage;
          break;
        case 'streak':
          progress = userStats.streak;
          break;
        case 'integration':
        case 'social':
          progress = userAchievement?.progress || 0;
          break;
      }

      const progressPercentage = Math.min((progress / achievement.requirement) * 100, 100);

      return {
        ...achievement,
        isUnlocked,
        progress,
        progressPercentage
      };
    });
  }

  getExperienceReward(action: keyof typeof this.REWARDS): number {
    return this.REWARDS[action] || 0;
  }

  getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#6B7280';
    }
  }

  getRarityGradient(rarity: string): string {
    switch (rarity) {
      case 'bronze': return 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)';
      case 'silver': return 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)';
      case 'gold': return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
      case 'platinum': return 'linear-gradient(135deg, #E5E4E2 0%, #BCC6CC 100%)';
      default: return 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)';
    }
  }

  getBuiltInAchievements(): Omit<Achievement, 'id'>[] {
    return this.BUILT_IN_ACHIEVEMENTS;
  }

  calculateStreakBonus(streak: number): number {
    if (streak >= 30) return 2.0;
    if (streak >= 14) return 1.5;
    if (streak >= 7) return 1.25;
    if (streak >= 3) return 1.1;
    return 1.0;
  }

  getMotivationalMessage(level: number, streak: number): string {
    if (streak >= 30) {
      return "Incredible dedication! You're a true automation master!";
    }
    if (streak >= 7) {
      return "Amazing streak! Keep up the fantastic work!";
    }
    if (level >= 10) {
      return "You're becoming a shortcut expert!";
    }
    if (level >= 5) {
      return "Great progress! You're really getting the hang of this!";
    }
    return "Keep creating and using shortcuts to level up!";
  }
}

export const gamificationService = new GamificationService();