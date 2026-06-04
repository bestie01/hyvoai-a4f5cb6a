import * as React from "react";
import { cn } from "@/lib/utils";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  aspectRatio?: string; // e.g. "16/9"
  rounded?: boolean;
}

/**
 * Drop-in <img> replacement with:
 *  - Lazy loading + async decode
 *  - Skeleton shimmer until loaded
 *  - Graceful fallback to a branded placeholder on error
 *  - Stable aspect-ratio box to prevent CLS
 */
export const SmartImage = React.forwardRef<HTMLImageElement, SmartImageProps>(
  (
    {
      src,
      alt = "",
      fallbackSrc = "/placeholder.svg",
      aspectRatio,
      rounded = true,
      className,
      onLoad,
      onError,
      ...props
    },
    ref,
  ) => {
    const [loaded, setLoaded] = React.useState(false);
    const [errored, setErrored] = React.useState(false);

    return (
      <div
        className={cn(
          "relative overflow-hidden bg-white/[0.04]",
          rounded && "rounded-xl",
        )}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03]" />
        )}
        <img
          ref={ref}
          src={errored ? fallbackSrc : src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            className,
          )}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
          onError={(e) => {
            setErrored(true);
            setLoaded(true);
            onError?.(e);
          }}
          {...props}
        />
      </div>
    );
  },
);
SmartImage.displayName = "SmartImage";
