import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Calendar, Shield, TrendingUp } from "lucide-react";
import { LiquidGlassCard } from "./ui/liquid-glass-card";

interface StreakTrackerProps {
  currentStreak?: number;
  longestStreak?: number;
  lastStreamDate?: string;
  streakProtection?: boolean;
}

export const StreakTracker = ({
  currentStreak = 12,
  longestStreak = 24,
  lastStreamDate = "Today",
  streakProtection = true,
}: StreakTrackerProps) => {
  const [animatedStreak, setAnimatedStreak] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStreak(currentStreak);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentStreak]);

  // Calculate streak status
  const isAtRisk = lastStreamDate !== "Today";
  const isOnFire = currentStreak >= 7;
  const isLegendary = currentStreak >= 30;

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const isStreamed = i <= currentStreak;
      days.push({
        date,
        streamed: isStreamed && i > 0,
        isToday: i === 0,
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <LiquidGlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Flame className={`h-5 w-5 ${isOnFire ? "text-orange-500" : "text-muted-foreground"}`} />
          Streaming Streak
        </h3>
        {streakProtection && (
          <div className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
            <Shield className="h-3 w-3" />
            Protected
          </div>
        )}
      </div>

      {/* Streak Counter */}
      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center">
          {/* Animated flame ring */}
          {isOnFire && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent, hsl(25 95% 53%), transparent)`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          )}
          
          <div className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center ${
            isLegendary 
              ? "bg-gradient-to-br from-orange-500 via-red-500 to-purple-500" 
              : isOnFire 
                ? "bg-gradient-to-br from-orange-500 to-yellow-500"
                : "bg-gradient-to-br from-primary/20 to-accent/20"
          }`}>
            <motion.div
              key={animatedStreak}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="text-4xl font-bold text-white"
            >
              {animatedStreak}
            </motion.div>
            <span className={`text-sm ${isOnFire ? "text-white/80" : "text-muted-foreground"}`}>
              {currentStreak === 1 ? "day" : "days"}
            </span>
          </div>
        </div>

        {/* Status message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 text-sm ${
            isAtRisk ? "text-yellow-500" : isLegendary ? "text-purple-400" : isOnFire ? "text-orange-400" : "text-muted-foreground"
          }`}
        >
          {isLegendary 
            ? "🔥 Legendary! You're on fire!" 
            : isOnFire 
              ? "🔥 You're on a hot streak!" 
              : isAtRisk 
                ? "⚠️ Stream today to keep your streak!"
                : "Keep going! Build your streak."}
        </motion.p>
      </div>

      {/* Mini Calendar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-muted-foreground">Last 7 days</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Week View
          </span>
        </div>
        <div className="flex gap-1 justify-between">
          {calendarDays.map((day, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center"
            >
              <span className="text-[10px] text-muted-foreground mb-1">
                {day.date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                  day.isToday 
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : day.streamed 
                      ? "bg-green-500/20 text-green-500 border border-green-500/30" 
                      : "bg-muted/50 text-muted-foreground"
                }`}
              >
                {day.streamed && !day.isToday ? "✓" : day.date.getDate()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Best Streak</span>
          </div>
          <span className="text-xl font-bold">{longestStreak} days</span>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Last Stream</span>
          </div>
          <span className="text-xl font-bold">{lastStreamDate}</span>
        </div>
      </div>
    </LiquidGlassCard>
  );
};
