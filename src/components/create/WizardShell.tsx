import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
}

interface WizardShellProps {
  steps: WizardStep[];
  currentIndex: number;
  onChangeIndex: (i: number) => void;
  canAdvance?: boolean;
  onFinish?: () => void;
  finishLabel?: string;
  children: ReactNode;
}

export function WizardShell({
  steps,
  currentIndex,
  onChangeIndex,
  canAdvance = true,
  onFinish,
  finishLabel = "Send to Studio",
  children,
}: WizardShellProps) {
  const isLast = currentIndex === steps.length - 1;
  const isFirst = currentIndex === 0;

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <GlassPanel variant="raised" className="p-5">
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, idx) => {
            const done = idx < currentIndex;
            const active = idx === currentIndex;
            return (
              <div key={step.id} className="flex-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => idx <= currentIndex && onChangeIndex(idx)}
                  className={cn(
                    "flex items-center gap-3 group",
                    idx <= currentIndex ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                  )}
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full grid place-items-center text-sm font-semibold transition-all border",
                      done && "bg-[hsl(var(--neon-cyan))/0.15] border-[hsl(var(--neon-cyan))] text-[hsl(var(--neon-cyan))]",
                      active && "bg-primary/20 border-primary text-white shadow-[0_0_24px_-6px_hsl(var(--primary)/0.8)]",
                      !done && !active && "bg-white/[0.04] border-white/10 text-white/50",
                    )}
                  >
                    {done ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className={cn("text-sm font-medium", active ? "text-white" : "text-white/60")}>
                      {step.label}
                    </div>
                    {step.description && (
                      <div className="text-[11px] text-white/40">{step.description}</div>
                    )}
                  </div>
                </button>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-white/5" />
                )}
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* Step body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={steps[currentIndex].id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="liquid-glass-button"
          disabled={isFirst}
          onClick={() => onChangeIndex(currentIndex - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {isLast ? (
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-[hsl(var(--neon-violet))] text-white shadow-[0_0_32px_-8px_hsl(var(--primary)/0.7)] hover:opacity-95"
            onClick={onFinish}
            disabled={!canAdvance}
          >
            {finishLabel}
          </Button>
        ) : (
          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
            disabled={!canAdvance}
            onClick={() => onChangeIndex(currentIndex + 1)}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
