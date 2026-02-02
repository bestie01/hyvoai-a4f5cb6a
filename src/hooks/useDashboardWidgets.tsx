import { useState, useCallback, useEffect } from "react";

export interface DashboardWidget {
  id: string;
  title: string;
  type: "stats" | "ai-features" | "analytics" | "schedule" | "custom";
  visible: boolean;
  order: number;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "stats", title: "Quick Stats", type: "stats", visible: true, order: 0 },
  { id: "ai-features", title: "AI Features", type: "ai-features", visible: true, order: 1 },
  { id: "analytics", title: "Pro Analytics", type: "analytics", visible: true, order: 2 },
  { id: "schedule", title: "Stream Schedule", type: "schedule", visible: true, order: 3 },
];

const STORAGE_KEY = "dashboard-widgets-config";

export function useDashboardWidgets() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    if (typeof window === "undefined") return DEFAULT_WIDGETS;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new widgets
        return DEFAULT_WIDGETS.map(defaultWidget => {
          const storedWidget = parsed.find((w: DashboardWidget) => w.id === defaultWidget.id);
          return storedWidget ? { ...defaultWidget, ...storedWidget } : defaultWidget;
        });
      }
    } catch (e) {
      console.error("Failed to load widget config:", e);
    }
    return DEFAULT_WIDGETS;
  });

  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    } catch (e) {
      console.error("Failed to save widget config:", e);
    }
  }, [widgets]);

  const reorderWidgets = useCallback((fromId: string, toId: string) => {
    setWidgets(prev => {
      const newWidgets = [...prev];
      const fromIndex = newWidgets.findIndex(w => w.id === fromId);
      const toIndex = newWidgets.findIndex(w => w.id === toId);
      
      if (fromIndex === -1 || toIndex === -1) return prev;
      
      const [removed] = newWidgets.splice(fromIndex, 1);
      newWidgets.splice(toIndex, 0, removed);
      
      // Update order values
      return newWidgets.map((widget, index) => ({
        ...widget,
        order: index,
      }));
    });
  }, []);

  const toggleVisibility = useCallback((widgetId: string) => {
    setWidgets(prev =>
      prev.map(widget =>
        widget.id === widgetId
          ? { ...widget, visible: !widget.visible }
          : widget
      )
    );
  }, []);

  const resetToDefaults = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleDragStart = useCallback((widgetId: string) => {
    setDraggedWidget(widgetId);
  }, []);

  const handleDragOver = useCallback((widgetId: string) => {
    if (draggedWidget && draggedWidget !== widgetId) {
      setDragOverWidget(widgetId);
    }
  }, [draggedWidget]);

  const handleDragEnd = useCallback(() => {
    if (draggedWidget && dragOverWidget) {
      reorderWidgets(draggedWidget, dragOverWidget);
    }
    setDraggedWidget(null);
    setDragOverWidget(null);
  }, [draggedWidget, dragOverWidget, reorderWidgets]);

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  return {
    widgets: sortedWidgets,
    draggedWidget,
    dragOverWidget,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    toggleVisibility,
    resetToDefaults,
    reorderWidgets,
  };
}
