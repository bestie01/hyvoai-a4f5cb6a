import * as React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  showBackButton?: boolean;
  backPath?: string;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      title,
      description,
      icon: Icon,
      badge,
      badgeVariant = "secondary",
      showBackButton = true,
      backPath,
      actions,
      className,
    },
    ref
  ) => {
    const navigate = useNavigate();

    const handleBack = () => {
      if (backPath) {
        navigate(backPath);
      } else {
        navigate(-1);
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "liquid-glass-panel border-b border-white/10 sticky top-0 z-50",
          className
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="rounded-full liquid-glass-button hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              <div className="flex items-center gap-3">
                {Icon && (
                  <motion.div
                    className="p-2.5 rounded-xl bg-gradient-primary shadow-glow-primary"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </motion.div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gradient-primary">
                      {title}
                    </h1>
                    {badge && (
                      <Badge variant={badgeVariant} className="animate-pulse">
                        {badge}
                      </Badge>
                    )}
                  </div>
                  {description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {actions && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {actions}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

PageHeader.displayName = "PageHeader";

export { PageHeader };
