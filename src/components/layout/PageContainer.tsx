import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: "default" | "wide" | "narrow" | "full";
}

const widthMap = {
  narrow: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-[1600px]",
  full: "max-w-none",
} as const;

/**
 * Standardized page wrapper used across every in-app view to enforce
 * consistent gutters, vertical rhythm, and max-width.
 */
export function PageContainer({
  className,
  width = "default",
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 md:px-8 md:py-10",
        widthMap[width],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default PageContainer;
