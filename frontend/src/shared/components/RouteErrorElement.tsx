import { useRouteError } from "react-router";
import ErrorState from "./states/ErrorState";

export default function RouteErrorElement() {
  const error = useRouteError();
  return <ErrorState error={error} />;
}

