import { toast as sonnerToast } from 'sonner';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  const toast = (type: ToastType, message: string, options?: ToastOptions) => {
    const { title, description, duration = 4000, action } = options || {};

    const toastOptions = {
      description: description || message,
      duration,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
    };

    switch (type) {
      case 'success':
        return sonnerToast.success(title || 'Success', toastOptions);
      case 'error':
        return sonnerToast.error(title || 'Error', toastOptions);
      case 'info':
        return sonnerToast.info(title || 'Info', toastOptions);
      case 'warning':
        return sonnerToast.warning(title || 'Warning', toastOptions);
      case 'loading':
        return sonnerToast.loading(title || 'Loading', toastOptions);
      default:
        return sonnerToast(message, toastOptions);
    }
  };

  return {
    toast,
    success: (message: string, options?: ToastOptions) =>
      toast('success', message, options),
    error: (message: string, options?: ToastOptions) =>
      toast('error', message, options),
    info: (message: string, options?: ToastOptions) =>
      toast('info', message, options),
    warning: (message: string, options?: ToastOptions) =>
      toast('warning', message, options),
    loading: (message: string, options?: ToastOptions) =>
      toast('loading', message, options),
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  };
};
