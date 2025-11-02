import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface CountUpProps {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export const CountUp = ({ 
  value, 
  duration = 1.5, 
  suffix = "",
  className = "",
  decimals = 0
}: CountUpProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { 
    duration: duration * 1000,
    bounce: 0
  });

  useEffect(() => {
    spring.set(value);
    
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(latest);
    });

    return () => unsubscribe();
  }, [value, spring]);

  return (
    <motion.span className={className}>
      {displayValue.toFixed(decimals)}{suffix}
    </motion.span>
  );
};
