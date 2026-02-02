import { ReactNode } from "react";
import { motion } from "framer-motion";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DraggableWidgetProps {
  id: string;
  title: string;
  children: ReactNode;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  visible: boolean;
  onToggleVisibility: () => void;
  showControls?: boolean;
}

export function DraggableWidget({
  id,
  title,
  children,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragEnd,
  visible,
  onToggleVisibility,
  showControls = false,
}: DraggableWidgetProps) {
  if (!visible && !showControls) return null;

  return (
    <motion.div
      layout
      layoutId={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: visible ? 1 : 0.5, 
        y: 0,
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging 
          ? "0 20px 40px rgba(0,0,0,0.3)" 
          : "0 0 0 rgba(0,0,0,0)",
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        layout: { duration: 0.3 }
      }}
      draggable
      onDragStart={(e) => {
        e.preventDefault();
        onDragStart();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => {
        e.preventDefault();
        onDragEnd();
      }}
      className={cn(
        "relative group cursor-grab active:cursor-grabbing",
        isDragOver && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isDragging && "z-50",
        !visible && "opacity-50 grayscale"
      )}
    >
      {/* Drag Handle & Controls */}
      <div className={cn(
        "absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10",
        showControls && "opacity-100"
      )}>
        <div 
          className="p-1.5 bg-muted/80 backdrop-blur-sm rounded-lg cursor-grab active:cursor-grabbing hover:bg-muted transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-muted/80 backdrop-blur-sm hover:bg-muted"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
        >
          {visible ? (
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Drop Indicator */}
      {isDragOver && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute inset-x-0 -top-1 h-1 bg-primary rounded-full origin-left"
        />
      )}

      {/* Widget Content */}
      <div className={cn(
        "transition-all duration-200",
        isDragging && "pointer-events-none"
      )}>
        {children}
      </div>
    </motion.div>
  );
}
