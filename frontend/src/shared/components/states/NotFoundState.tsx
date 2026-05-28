import { AlertCircle } from 'lucide-react';
import { Button } from '../../../app/components/ui/button';

export function NotFoundState({
  title = '404 - Page Not Found',
  message = 'The page you are looking for does not exist.',
  actionLabel = 'Go Back',
  onAction,
}: {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm text-center space-y-4">
        <AlertCircle className="size-12 mx-auto text-muted-foreground" />
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {onAction && (
          <Button onClick={onAction} className="w-full">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
