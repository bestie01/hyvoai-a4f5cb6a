import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursor?: boolean;
  onComplete?: () => void;
}

export const TypewriterText = ({
  text,
  speed = 50,
  delay = 0,
  className = "",
  cursor = true,
  onComplete,
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  }, [displayedText, text, speed, started, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && !isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block w-[3px] h-[1em] bg-primary ml-1 align-middle"
        />
      )}
    </span>
  );
};
