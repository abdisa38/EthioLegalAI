import { RotateCcw } from 'lucide-react';
import { Button } from '../../../app/components/ui/button';

export function RetryState({
  title = 'Something went wrong',
  message = 'Please try again.',
  onRetry,
  isLoading = false,
}: {
  title?: string;
  message?: string;
  onRetry: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className="min-h-[50vh] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm text-center space-y-4">
        <RotateCcw className="size-12 mx-auto text-muted-foreground" />
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Button onClick={onRetry} disabled={isLoading} className="w-full">
          {isLoading && <span className="mr-2 h-4 w-4 animate-spin">⟳</span>}
          Try Again
        </Button>
      </div>
    </div>
  );
}
