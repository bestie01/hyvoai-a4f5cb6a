import { motion } from "framer-motion";
import { BarChart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface LivePollVisualizationProps {
  question: string;
  options: PollOption[];
  totalVotes: number;
  className?: string;
}

export const LivePollVisualization = ({ 
  question, 
  options, 
  totalVotes,
  className = "" 
}: LivePollVisualizationProps) => {
  const maxVotes = Math.max(...options.map(o => o.votes), 1);

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart className="w-5 h-5 text-primary" />
          Live Poll
        </CardTitle>
        <p className="text-sm text-muted-foreground">{question}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((option, index) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const barWidth = totalVotes > 0 ? (option.votes / maxVotes) * 100 : 0;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{option.text}</span>
                <span className="text-muted-foreground font-mono">
                  {percentage.toFixed(1)}% ({option.votes})
                </span>
              </div>
              <div className="relative h-8 bg-muted/30 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-glow rounded-lg"
                />
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs font-medium text-foreground mix-blend-difference">
                    {option.votes} votes
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
        
        <div className="pt-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Total Votes
          </div>
          <span className="font-mono font-semibold">{totalVotes}</span>
        </div>
      </CardContent>
    </Card>
  );
};
