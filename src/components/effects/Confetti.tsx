import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
  duration: number;
  shape: "square" | "circle" | "triangle";
}

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
  count?: number;
  colors?: string[];
  duration?: number;
  spread?: number;
}

const defaultColors = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#FFD700", // Gold
  "#FF6B6B", // Coral
  "#4ECDC4", // Teal
  "#95E1D3", // Mint
  "#F38181", // Salmon
  "#AA96DA", // Lavender
];

export function Confetti({ 
  isActive, 
  onComplete, 
  count = 100,
  colors = defaultColors,
  duration = 3000,
  spread = 100
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const generatePieces = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    const shapes: ("square" | "circle" | "triangle")[] = ["square", "circle", "triangle"];
    
    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * spread - spread / 2,
        y: -(Math.random() * 200 + 100),
        rotation: Math.random() * 720 - 360,
        scale: Math.random() * 0.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        duration: (Math.random() * 1 + 2),
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
    return newPieces;
  }, [count, colors, spread]);

  useEffect(() => {
    if (isActive) {
      setPieces(generatePieces());
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setPieces([]);
    }
  }, [isActive, generatePieces, duration, onComplete]);

  const renderShape = (shape: string, color: string) => {
    switch (shape) {
      case "circle":
        return (
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: color }} 
          />
        );
      case "triangle":
        return (
          <div 
            className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent"
            style={{ borderBottomColor: color }}
          />
        );
      default:
        return (
          <div 
            className="w-3 h-3" 
            style={{ backgroundColor: color }} 
          />
        );
    }
  };

  return (
    <AnimatePresence>
      {pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                transform: `scale(${piece.scale})`,
              }}
              initial={{
                x: 0,
                y: 0,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                x: piece.x * 10,
                y: [piece.y, window.innerHeight + 100],
                rotate: piece.rotation,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {renderShape(piece.shape, piece.color)}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Hook for easier confetti triggering
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = useCallback(() => {
    setIsActive(true);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    trigger,
    reset,
    Confetti: (props: Omit<ConfettiProps, "isActive" | "onComplete">) => (
      <Confetti 
        {...props} 
        isActive={isActive} 
        onComplete={reset} 
      />
    ),
  };
}

export default Confetti;
