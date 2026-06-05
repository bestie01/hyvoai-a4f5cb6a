import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useNavStack } from "@/hooks/useNavStack";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Direction-aware page transitions. Forward = slide left, back = slide right,
 * sibling/replace = subtle crossfade. Honors prefers-reduced-motion.
 */
export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const direction = useNavStack();
  const reduce = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const dx = direction === "back" ? -28 : direction === "forward" ? 28 : 0;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: dx, filter: "blur(6px)" }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, x: -dx * 0.6, filter: "blur(4px)" }}
        transition={{ duration: reduce ? 0.15 : 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{ minHeight: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
