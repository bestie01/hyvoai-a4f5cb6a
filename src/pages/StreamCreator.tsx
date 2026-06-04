import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ProFeatureGate } from "@/components/ProFeatureGate";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2 } from "lucide-react";

import { WizardShell, WizardStep } from "@/components/create/WizardShell";
import { SetupStep } from "@/components/create/steps/SetupStep";
import { MediaStep } from "@/components/create/steps/MediaStep";
import { StreamConfigStep } from "@/components/create/steps/StreamConfigStep";
import { ReviewStep } from "@/components/create/steps/ReviewStep";
import {
  createEmptyDraft,
  getDraftStream,
  saveDraftStream,
  type DraftStream,
} from "@/lib/draftStream";

const STEPS: WizardStep[] = [
  { id: "setup", label: "Setup", description: "Title & schedule" },
  { id: "media", label: "Media", description: "Thumbnail" },
  { id: "config", label: "Stream", description: "Quality & platforms" },
  { id: "review", label: "Review", description: "Launch" },
];

const StreamCreator = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();

  const [draft, setDraft] = useState<DraftStream>(() => getDraftStream() ?? createEmptyDraft());
  const [index, setIndex] = useState(0);

  // Auto-persist as the user edits
  useEffect(() => {
    saveDraftStream(draft);
  }, [draft]);

  if (authLoading || subLoading) return <LoadingScreen message="Loading Creator..." />;

  if (!user) {
    navigate("/auth", { state: { redirect: "/create" } });
    return null;
  }

  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto pt-10">
        <ProFeatureGate
          feature="Stream Creator"
          description="Plan, brand, and launch streams with a guided setup wizard. Upgrade to Pro to unlock."
        />
      </div>
    );
  }

  const onChange = (patch: Partial<DraftStream>) => setDraft((d) => ({ ...d, ...patch }));

  const canAdvance = (() => {
    if (index === 0) return draft.title.trim().length > 2;
    if (index === 2) return draft.platforms.length > 0;
    return true;
  })();

  const handleFinish = () => {
    if (!draft.title.trim()) {
      toast({ title: "Add a title", description: "Streams need at least a title.", variant: "destructive" });
      setIndex(0);
      return;
    }
    saveDraftStream(draft);
    toast({
      title: "Draft sent to Studio",
      description: "Your stream config is ready on the Ready-to-Stream dashboard.",
    });
    navigate("/ready-to-stream", { state: { draftStream: draft } });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Badge className="mb-3 bg-primary/15 text-white border border-primary/30">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Create
          </Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
            New stream setup
          </h1>
          <p className="text-white/60 mt-1 max-w-xl">
            Walk through a guided setup — your config syncs to the Studio automatically.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-white/40">
          <Wand2 className="w-4 h-4" />
          Auto-saved
        </div>
      </header>

      <WizardShell
        steps={STEPS}
        currentIndex={index}
        onChangeIndex={setIndex}
        canAdvance={canAdvance}
        onFinish={handleFinish}
      >
        {index === 0 && <SetupStep draft={draft} onChange={onChange} />}
        {index === 1 && <MediaStep draft={draft} onChange={onChange} />}
        {index === 2 && <StreamConfigStep draft={draft} onChange={onChange} />}
        {index === 3 && <ReviewStep draft={draft} />}
      </WizardShell>
    </div>
  );
};

export default StreamCreator;
