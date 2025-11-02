import { motion } from "framer-motion";
import { useMemo } from "react";

interface ChatWordCloudProps {
  messages: Array<{ message: string }>;
  className?: string;
}

export const ChatWordCloud = ({ 
  messages, 
  className = "" 
}: ChatWordCloudProps) => {
  const wordFrequency = useMemo(() => {
    const words: Record<string, number> = {};
    
    messages.forEach(({ message }) => {
      message.split(/\s+/).forEach(word => {
        const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (cleaned.length > 3) { // Only words longer than 3 chars
          words[cleaned] = (words[cleaned] || 0) + 1;
        }
      });
    });
    
    return Object.entries(words)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));
  }, [messages]);

  const maxCount = Math.max(...wordFrequency.map(w => w.count), 1);

  return (
    <div className={`flex flex-wrap gap-3 justify-center items-center p-4 ${className}`}>
      {wordFrequency.map(({ word, count }, index) => {
        const size = 0.5 + (count / maxCount) * 1.5;
        const colors = [
          "text-primary",
          "text-accent", 
          "text-success",
          "text-secondary"
        ];
        
        return (
          <motion.span
            key={word}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6 + (count / maxCount) * 0.4, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`font-bold ${colors[index % colors.length]}`}
            style={{ fontSize: `${size}rem` }}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
};
