import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApiCallOptions {
  /** User-friendly action label, e.g. "send chat message" */
  action?: string;
  /** Suppress the auto-toast on failure */
  silent?: boolean;
}

/**
 * Thin wrapper around supabase.functions.invoke that:
 * - tracks loading state
 * - surfaces a friendly toast on failure
 * - logs the function name + error context for debugging
 */
export function useApiCall<TBody = unknown, TResp = unknown>(
  functionName: string,
  options: ApiCallOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const invoke = useCallback(
    async (body?: TBody): Promise<TResp | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke(functionName, {
          body: body as Record<string, unknown> | undefined,
        });
        if (fnError) throw fnError;
        return data as TResp;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        console.error(`[useApiCall:${functionName}]`, e);
        setError(e);
        if (!options.silent) {
          toast.error(
            options.action
              ? `Could not ${options.action}`
              : `Request to ${functionName} failed`,
            { description: e.message?.slice(0, 140) }
          );
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [functionName, options.action, options.silent]
  );

  return { invoke, loading, error };
}
