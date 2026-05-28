import * as React from "react";
import ErrorState from "./states/ErrorState";

type Props = {
  children: React.ReactNode;
};

type State = {
  error: unknown | null;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return <ErrorState error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}

