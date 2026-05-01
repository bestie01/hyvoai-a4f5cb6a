import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Catches uncaught errors and unhandled promise rejections at the window level
 * so users see a friendly message instead of a silent failure.
 * Mounted once, near the root.
 */
export function GlobalErrorListener() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      // Ignore ResizeObserver loop noise and benign script-error cross-origin reports
      if (event.message?.includes("ResizeObserver loop")) return;
      console.error("[GlobalError]", event.error || event.message);
      toast.error("Something went wrong", {
        description: "An unexpected error occurred. Please try again.",
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        reason instanceof Error ? reason.message : typeof reason === "string" ? reason : "";
      // Filter out common abort errors that aren't user-actionable
      if (message?.includes("AbortError") || message?.includes("aborted")) return;
      console.error("[UnhandledRejection]", reason);
      toast.error("Request failed", {
        description: message?.slice(0, 140) || "Please try again in a moment.",
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
