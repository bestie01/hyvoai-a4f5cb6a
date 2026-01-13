import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Calendar, Settings, X, Menu, Zap } from "lucide-react";
import { Button } from "./button";
import { useNavigate } from "react-router-dom";

interface FloatingAction {
  icon: React.ReactNode;
  label: string;
  href: string;
  color?: string;
}

interface FloatingActionsProps {
  actions?: FloatingAction[];
  showAfterScroll?: number;
}

const defaultActions: FloatingAction[] = [
  { icon: <Play className="h-4 w-4" />, label: "Start Stream", href: "/streaming", color: "bg-green-500" },
  { icon: <Calendar className="h-4 w-4" />, label: "Schedule", href: "/schedule", color: "bg-blue-500" },
  { icon: <Settings className="h-4 w-4" />, label: "Settings", href: "/settings", color: "bg-purple-500" },
];

export const FloatingActions = ({
  actions = defaultActions,
  showAfterScroll = 300,
}: FloatingActionsProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfterScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAfterScroll]);

  const handleActionClick = (href: string) => {
    navigate(href);
    setIsExpanded(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3"
        >
          {/* Action buttons */}
          <AnimatePresence>
            {isExpanded && (
              <>
                {actions.map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      y: 0,
                      transition: { delay: index * 0.05 }
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.5, 
                      y: 20,
                      transition: { delay: (actions.length - index) * 0.05 }
                    }}
                    className="flex items-center gap-2"
                  >
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="bg-background/90 backdrop-blur-sm text-foreground text-sm font-medium px-3 py-1.5 rounded-full shadow-lg border border-border"
                    >
                      {action.label}
                    </motion.span>
                    <Button
                      size="icon"
                      className={`h-12 w-12 rounded-full shadow-lg ${action.color || "bg-primary"} hover:scale-110 transition-transform`}
                      onClick={() => handleActionClick(action.href)}
                    >
                      {action.icon}
                    </Button>
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Main toggle button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-br from-primary to-accent hover:shadow-glow-primary"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isExpanded ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
