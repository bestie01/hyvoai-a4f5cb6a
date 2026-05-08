import { Navigate, useLocation } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { LoadingScreen } from "@/components/ui/loading-screen";

/**
 * Gates a route behind a paid Pro/Year One plan.
 * Free users get redirected to /pricing with an `upgrade` hint.
 */
export function RequirePro({ children, feature = "this" }: { children: React.ReactNode; feature?: string }) {
  const { isPro, initialLoading } = useSubscription();
  const location = useLocation();

  if (initialLoading) return <LoadingScreen />;
  if (!isPro) {
    return <Navigate to={`/subscription?upgrade=${encodeURIComponent(feature)}`} replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
