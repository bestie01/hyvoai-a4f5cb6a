import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const CursorGlow = () => {
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s"
      }}
    >
      <motion.div
        className="absolute w-96 h-96 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
          filter: "blur(40px)"
        }}
      />
    </motion.div>
  );
};
