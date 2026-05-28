import { Loader2 } from "lucide-react";

export default function FullPageLoader({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div className="min-h-svh w-full flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}

