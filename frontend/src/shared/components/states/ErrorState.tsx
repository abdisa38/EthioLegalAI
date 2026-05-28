import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "../../../app/components/ui/button";
import { getErrorMessage } from "../../api/errors";

export default function ErrorState({
  error,
  title = "Something went wrong",
  onRetry,
}: {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
}) {
  const message = error ? getErrorMessage(error) : "Please try again.";

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-destructive/10 p-2 text-destructive">
            <TriangleAlert className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold">{title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{message}</div>
          </div>
        </div>
        {onRetry && (
          <div className="mt-5 flex justify-end">
            <Button onClick={onRetry} className="gap-2">
              <RotateCcw className="size-4" />
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

