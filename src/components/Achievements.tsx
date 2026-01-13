import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Flame, 
  Users, 
  Clock, 
  Zap, 
  Award,
  Lock,
  Sparkles
} from "lucide-react";
import { LiquidGlassCard } from "./ui/liquid-glass-card";
import { Progress } from "./ui/progress";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  tier: "bronze" | "silver" | "gold" | "platinum";
  unlockedAt?: string;
}

const tierColors = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-slate-400 to-slate-300",
  gold: "from-yellow-500 to-yellow-300",
  platinum: "from-purple-500 to-pink-400",
};

const tierBorderColors = {
  bronze: "border-amber-500/50",
  silver: "border-slate-400/50",
  gold: "border-yellow-400/50",
  platinum: "border-purple-400/50",
};

const demoAchievements: Achievement[] = [
  {
    id: "first-stream",
    name: "First Steps",
    description: "Complete your first stream",
    icon: <Zap className="h-6 w-6" />,
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    tier: "bronze",
    unlockedAt: "Jan 5, 2025",
  },
  {
    id: "viewer-milestone",
    name: "Rising Star",
    description: "Reach 100 concurrent viewers",
    icon: <Users className="h-6 w-6" />,
    progress: 67,
    maxProgress: 100,
    unlocked: false,
    tier: "silver",
  },
  {
    id: "stream-hours",
    name: "Marathon Streamer",
    description: "Stream for 100 hours total",
    icon: <Clock className="h-6 w-6" />,
    progress: 42,
    maxProgress: 100,
    unlocked: false,
    tier: "gold",
  },
  {
    id: "streak-master",
    name: "Consistency King",
    description: "Maintain a 30-day streaming streak",
    icon: <Flame className="h-6 w-6" />,
    progress: 12,
    maxProgress: 30,
    unlocked: false,
    tier: "gold",
  },
  {
    id: "multi-platform",
    name: "Platform Master",
    description: "Stream to 5 platforms simultaneously",
    icon: <Star className="h-6 w-6" />,
    progress: 3,
    maxProgress: 5,
    unlocked: false,
    tier: "platinum",
  },
  {
    id: "community-builder",
    name: "Community Builder",
    description: "Get 1000 followers across all platforms",
    icon: <Award className="h-6 w-6" />,
    progress: 456,
    maxProgress: 1000,
    unlocked: false,
    tier: "platinum",
  },
];

export const Achievements = () => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const unlockedCount = demoAchievements.filter(a => a.unlocked).length;
  const totalPoints = demoAchievements.filter(a => a.unlocked).reduce((acc, a) => {
    const points = { bronze: 10, silver: 25, gold: 50, platinum: 100 };
    return acc + points[a.tier];
  }, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </h3>
          <p className="text-muted-foreground text-sm">
            {unlockedCount} of {demoAchievements.length} unlocked
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{totalPoints}</div>
          <p className="text-muted-foreground text-xs">Total Points</p>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {demoAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedAchievement(achievement)}
            className="cursor-pointer"
          >
            <LiquidGlassCard
              className={`p-4 relative overflow-hidden ${
                achievement.unlocked ? tierBorderColors[achievement.tier] : "border-border/50"
              } ${achievement.unlocked ? "border-2" : ""}`}
            >
              {/* Background glow for unlocked */}
              {achievement.unlocked && (
                <div className={`absolute inset-0 bg-gradient-to-br ${tierColors[achievement.tier]} opacity-10`} />
              )}

              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  achievement.unlocked 
                    ? `bg-gradient-to-br ${tierColors[achievement.tier]} text-white` 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {achievement.unlocked ? achievement.icon : <Lock className="h-5 w-5" />}
                </div>

                <h4 className={`font-semibold text-sm mb-1 ${!achievement.unlocked && "text-muted-foreground"}`}>
                  {achievement.name}
                </h4>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {achievement.description}
                </p>

                {!achievement.unlocked && (
                  <div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-1.5 mb-1" 
                    />
                    <p className="text-xs text-muted-foreground">
                      {achievement.progress} / {achievement.maxProgress}
                    </p>
                  </div>
                )}

                {achievement.unlocked && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    {achievement.unlockedAt}
                  </div>
                )}
              </div>
            </LiquidGlassCard>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <LiquidGlassCard className="p-6 max-w-sm text-center">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  selectedAchievement.unlocked 
                    ? `bg-gradient-to-br ${tierColors[selectedAchievement.tier]} text-white` 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {selectedAchievement.unlocked ? selectedAchievement.icon : <Lock className="h-8 w-8" />}
                </div>

                <h3 className="text-xl font-bold mb-2">{selectedAchievement.name}</h3>
                <p className="text-muted-foreground mb-4">{selectedAchievement.description}</p>

                {selectedAchievement.unlocked ? (
                  <div className="text-sm text-green-500">
                    ✓ Unlocked on {selectedAchievement.unlockedAt}
                  </div>
                ) : (
                  <div>
                    <Progress 
                      value={(selectedAchievement.progress / selectedAchievement.maxProgress) * 100} 
                      className="h-2 mb-2" 
                    />
                    <p className="text-sm text-muted-foreground">
                      {selectedAchievement.progress} / {selectedAchievement.maxProgress}
                    </p>
                  </div>
                )}
              </LiquidGlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
