import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Error Boundary must be a class component for now
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-16">
            <h1 className="text-(--color-destructive) text-2xl font-bold">
              Something went wrong
            </h1>
            <p className="text-(--color-text-secondary) mt-4">
              Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-(--color-destructive) text-(--color-destructive-foreground) mt-4 rounded-md px-4 py-2 hover:opacity-90"
            >
              Refresh Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
