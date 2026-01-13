import { useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface CursorGlowProps {
  color?: "primary" | "accent" | "dynamic";
  size?: "sm" | "md" | "lg";
  trail?: boolean;
  magnetic?: boolean;
}

export const CursorGlow = ({
  color = "dynamic",
  size = "md",
  trail = false,
  magnetic = true,
}: CursorGlowProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Trail positions
  const [trailPositions, setTrailPositions] = useState<{ x: number; y: number }[]>([]);

  const sizeClasses = {
    sm: "w-64 h-64",
    md: "w-96 h-96",
    lg: "w-[32rem] h-[32rem]",
  };

  const getGradientColor = useCallback(() => {
    if (color === "dynamic" && hoveredColor) {
      return hoveredColor;
    }
    switch (color) {
      case "accent":
        return "hsl(var(--accent) / 0.15)";
      case "primary":
      default:
        return "hsl(var(--primary) / 0.15)";
    }
  }, [color, hoveredColor]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);

      if (trail) {
        setTrailPositions((prev) => {
          const newPositions = [...prev, { x: e.clientX, y: e.clientY }];
          return newPositions.slice(-5);
        });
      }

      // Dynamic color based on hovered element
      if (color === "dynamic") {
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element) {
          const computedStyle = getComputedStyle(element);
          const bgColor = computedStyle.backgroundColor;
          
          // Check if hovering over interactive element
          const isInteractive = 
            element.tagName === "BUTTON" ||
            element.tagName === "A" ||
            element.closest("button") ||
            element.closest("a");
          
          setIsHovering(!!isInteractive);
          
          if (bgColor && bgColor !== "rgba(0, 0, 0, 0)") {
            setHoveredColor(bgColor.replace("rgb", "rgba").replace(")", ", 0.15)"));
          } else {
            setHoveredColor(null);
          }
        }
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setTrailPositions([]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [cursorX, cursorY, trail, color]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s"
      }}
    >
      {/* Trail effect */}
      {trail && trailPositions.map((pos, index) => (
        <motion.div
          key={index}
          className="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: pos.x,
            top: pos.y,
            background: `radial-gradient(circle, ${getGradientColor()} 0%, transparent 70%)`,
            opacity: (index + 1) / trailPositions.length * 0.3,
            filter: "blur(10px)"
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        />
      ))}

      {/* Main glow */}
      <motion.div
        className={`absolute ${sizeClasses[size]} -translate-x-1/2 -translate-y-1/2`}
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          background: `radial-gradient(circle, ${getGradientColor()} 0%, transparent 70%)`,
          filter: "blur(40px)"
        }}
        animate={{
          scale: isHovering && magnetic ? 1.3 : 1,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Interactive hover ring */}
      {magnetic && isHovering && (
        <motion.div
          className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/50"
          style={{
            left: cursorXSpring,
            top: cursorYSpring,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        />
      )}
    </motion.div>
  );
};
