import { useToast } from '@shared/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@shared/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // An achievement is a banner that leaves on its own; it has no
        // close button.
        const isBanner = props.variant === 'achievement';
        return (
          <Toast key={id} {...props}>
            <div
              className={isBanner ? 'grid gap-0.5 text-center' : 'grid gap-1'}
            >
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            {isBanner ? null : <ToastClose />}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
