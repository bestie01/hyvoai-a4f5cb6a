import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

interface ScrollProgressProps {
  className?: string;
  color?: "primary" | "accent" | "gradient";
  height?: number;
  showPercentage?: boolean;
}

export const ScrollProgress = ({
  className = "",
  color = "gradient",
  height = 3,
  showPercentage = false,
}: ScrollProgressProps) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      setPercentage(Math.round(latest * 100));
    });
  }, [scrollYProgress]);

  const getColorClass = () => {
    switch (color) {
      case "primary":
        return "bg-primary";
      case "accent":
        return "bg-accent";
      case "gradient":
      default:
        return "bg-gradient-to-r from-primary via-accent to-primary";
    }
  };

  return (
    <>
      <motion.div
        className={`fixed top-0 left-0 right-0 z-50 origin-left ${getColorClass()} ${className}`}
        style={{ scaleX, height }}
      />
      {showPercentage && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-foreground border border-border"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: percentage > 5 ? 1 : 0, y: percentage > 5 ? 0 : -20 }}
        >
          {percentage}%
        </motion.div>
      )}
    </>
  );
};
