import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from 'react-joyride';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProductTourProps {
  run: boolean;
  onComplete: () => void;
}

const tourSteps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: 'Welcome to your Dashboard! This is your command center for managing streams, viewing analytics, and accessing all features.',
    title: '📊 Dashboard Overview',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="stream-button"]',
    content: 'Click here to start streaming! You can go live on multiple platforms simultaneously.',
    title: '🎬 Go Live',
    placement: 'bottom',
  },
  {
    target: '[data-tour="ai-tools"]',
    content: 'Access AI-powered tools like title generators, thumbnail creators, and chat moderation.',
    title: '🤖 AI Tools',
    placement: 'right',
  },
  {
    target: '[data-tour="analytics"]',
    content: 'Track your stream performance with real-time analytics and insights.',
    title: '📈 Analytics',
    placement: 'left',
  },
  {
    target: '[data-tour="settings"]',
    content: 'Configure your stream settings, connect platforms, and manage your account.',
    title: '⚙️ Settings',
    placement: 'bottom',
  },
];

export function ProductTour({ run, onComplete }: ProductTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onComplete();
    }

    if (type === EVENTS.STEP_AFTER) {
      setStepIndex(index + 1);
    }
  };

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      stepIndex={stepIndex}
      callback={handleCallback}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      spotlightClicks
      styles={{
        options: {
          arrowColor: 'hsl(var(--card))',
          backgroundColor: 'hsl(var(--card))',
          overlayColor: 'hsla(var(--background), 0.85)',
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
          spotlightShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: 700,
          marginBottom: '8px',
        },
        tooltipContent: {
          fontSize: '14px',
          lineHeight: 1.6,
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          padding: '10px 20px',
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: '14px',
          fontWeight: 500,
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: '14px',
        },
        spotlight: {
          borderRadius: '12px',
        },
      }}
      locale={{
        back: 'Previous',
        close: 'Close',
        last: 'Finish Tour',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}
