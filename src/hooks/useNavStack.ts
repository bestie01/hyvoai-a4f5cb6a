import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const KEY = "hyvo.navStack";

function readStack(): string[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeStack(stack: string[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(stack.slice(-20)));
  } catch {}
}

/**
 * Tracks a small route history in sessionStorage to determine whether a
 * navigation is "forward" or "back" so PageTransition can slide accordingly.
 */
export function useNavStack(): "forward" | "back" | "replace" {
  const location = useLocation();
  const directionRef = useRef<"forward" | "back" | "replace">("forward");

  useEffect(() => {
    const stack = readStack();
    const path = location.pathname;
    const idx = stack.lastIndexOf(path);
    if (idx === -1) {
      directionRef.current = "forward";
      writeStack([...stack, path]);
    } else if (idx === stack.length - 1) {
      directionRef.current = "replace";
    } else {
      directionRef.current = "back";
      writeStack(stack.slice(0, idx + 1));
    }
  }, [location.pathname]);

  return directionRef.current;
}
