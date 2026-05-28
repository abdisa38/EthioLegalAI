import { Network } from 'lucide-react';
import { Button } from '../../../app/components/ui/button';

export function OfflineState({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-[50vh] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm text-center space-y-4">
        <Network className="size-12 mx-auto text-muted-foreground" />
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">You're Offline</h3>
          <p className="text-sm text-muted-foreground">
            Check your internet connection and try again.
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} className="w-full">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
