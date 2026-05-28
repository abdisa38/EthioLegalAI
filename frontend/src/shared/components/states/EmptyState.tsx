import { Button } from "../../../app/components/ui/button";

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-h-[50vh] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        {icon ? <div className="mb-3 text-muted-foreground">{icon}</div> : null}
        <div className="text-base font-semibold">{title}</div>
        {description ? (
          <div className="mt-1 text-sm text-muted-foreground">
            {description}
          </div>
        ) : null}
        {actionLabel && onAction ? (
          <div className="mt-5">
            <Button onClick={onAction}>{actionLabel}</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

