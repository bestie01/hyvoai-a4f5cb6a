import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, Video, Zap, Users, ChevronRight, ChevronLeft, 
  Check, Wand2, Mic, MonitorPlay, Settings
} from 'lucide-react';

interface WelcomeWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Hyvo.ai',
    subtitle: 'Your AI-powered streaming companion',
    description: 'Let\'s get you set up to stream like a pro in just a few steps.',
    icon: Sparkles,
    color: 'from-primary to-accent',
  },
  {
    id: 'features',
    title: 'AI-Powered Features',
    subtitle: 'Supercharge your streams',
    description: 'Generate viral titles, thumbnails, and get real-time chat moderation with AI.',
    icon: Wand2,
    color: 'from-purple-500 to-pink-500',
    features: [
      { icon: Video, text: 'AI Thumbnail Generator' },
      { icon: Zap, text: 'Smart Title Suggestions' },
      { icon: Users, text: 'Chat Moderation' },
    ],
  },
  {
    id: 'streaming',
    title: 'Multi-Platform Streaming',
    subtitle: 'One click, everywhere',
    description: 'Stream to Twitch, YouTube, and more simultaneously with our relay service.',
    icon: MonitorPlay,
    color: 'from-blue-500 to-cyan-500',
    features: [
      { icon: Mic, text: 'Professional Audio Mixer' },
      { icon: Settings, text: 'Scene Management' },
      { icon: Video, text: 'Local Recording' },
    ],
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    subtitle: 'Start streaming today',
    description: 'Explore the dashboard, connect your platforms, and go live!',
    icon: Check,
    color: 'from-green-500 to-emerald-500',
  },
];

export function WelcomeWizard({ isOpen, onComplete }: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/50 bg-card">
        {/* Progress bar */}
        <div className="px-6 pt-6">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-2 text-right">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="px-6 py-8"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* Text */}
            <div className="text-center space-y-3">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-bold text-foreground"
              >
                {step.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-medium text-primary"
              >
                {step.subtitle}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-muted-foreground leading-relaxed"
              >
                {step.description}
              </motion.p>
            </div>

            {/* Features list */}
            {step.features && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 space-y-3"
              >
                {step.features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="p-2 rounded-md bg-primary/10">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <div>
            {currentStep > 0 ? (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip tour
              </Button>
            )}
          </div>
          
          <Button onClick={handleNext} className="min-w-[120px]">
            {currentStep === steps.length - 1 ? (
              <>
                Get Started
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
