import { Loader2 } from 'lucide-react';

export function AILoadingState({
  message = 'AI is thinking...',
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{message}</p>
        <div className="flex gap-1">
          <div className="h-1 w-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-1 w-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-1 w-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
