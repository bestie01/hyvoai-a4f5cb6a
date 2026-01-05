import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, LogOut, RefreshCw } from 'lucide-react';

type ActionType = 'delete' | 'logout' | 'reset' | 'dangerous';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionType?: ActionType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const actionConfig = {
  delete: {
    icon: Trash2,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    buttonVariant: 'destructive' as const,
  },
  logout: {
    icon: LogOut,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    buttonVariant: 'default' as const,
  },
  reset: {
    icon: RefreshCw,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    buttonVariant: 'default' as const,
  },
  dangerous: {
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    buttonVariant: 'destructive' as const,
  },
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  actionType = 'dangerous',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const config = actionConfig[actionType];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`p-3 rounded-full ${config.bgColor}`}
            >
              <Icon className={`w-6 h-6 ${config.color}`} />
            </motion.div>
            <div>
              <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={handleCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={actionType === 'delete' || actionType === 'dangerous' 
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : ''
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook for easy confirmation dialog usage
export function useConfirmation() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionType: ActionType;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    actionType: 'dangerous',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
  });

  const confirm = (options: {
    title: string;
    description: string;
    actionType?: ActionType;
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title,
        description: options.description,
        actionType: options.actionType || 'dangerous',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        onConfirm: () => resolve(true),
      });
    });
  };

  const dialog = (
    <ConfirmationDialog
      open={state.open}
      onOpenChange={(open) => setState(prev => ({ ...prev, open }))}
      title={state.title}
      description={state.description}
      actionType={state.actionType}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
      onConfirm={state.onConfirm}
    />
  );

  return { confirm, dialog };
}
