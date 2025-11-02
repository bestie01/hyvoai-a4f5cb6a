import { motion } from "framer-motion";
import { useState } from "react";

interface Ripple {
  x: number;
  y: number;
  id: number;
}

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
}

export const RippleEffect = ({ children, className = "" }: RippleEffectProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          initial={{
            width: 0,
            height: 0,
            opacity: 0.5,
            x: ripple.x,
            y: ripple.y
          }}
          animate={{
            width: 500,
            height: 500,
            opacity: 0,
            x: ripple.x - 250,
            y: ripple.y - 250
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute rounded-full bg-primary/30 pointer-events-none"
        />
      ))}
    </div>
  );
};
