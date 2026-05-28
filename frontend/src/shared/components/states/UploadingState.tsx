import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && <span className="text-sm font-medium">{label}</span>}
        <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function UploadingState({
  fileName,
  progress = 0,
  message = 'Uploading your file...',
}: {
  fileName?: string;
  progress?: number;
  message?: string;
}) {
  return (
    <div className="min-h-[50vh] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium">{message}</p>
            {fileName && (
              <p className="text-xs text-muted-foreground truncate">{fileName}</p>
            )}
          </div>
        </div>
        <ProgressBar value={progress} label="Upload Progress" />
      </div>
    </div>
  );
}
