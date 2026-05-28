import { lazy, Suspense } from "react";
import FullPageLoader from "../../shared/components/FullPageLoader";

export function lazyPage<T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
) {
  const Component = lazy(loader);

  return function LazyPage(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<FullPageLoader />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

