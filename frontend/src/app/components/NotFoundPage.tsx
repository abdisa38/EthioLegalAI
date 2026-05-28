import { Home } from "lucide-react";
import { useNavigate } from "react-router";
import EmptyState from "../../shared/components/states/EmptyState";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <EmptyState
      title="Page not found"
      description="The page you are looking for does not exist or has been moved."
      actionLabel="Go home"
      onAction={() => navigate("/")}
      icon={<Home className="size-6" />}
    />
  );
}

