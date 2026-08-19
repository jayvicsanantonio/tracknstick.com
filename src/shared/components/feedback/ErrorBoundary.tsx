import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from '@shared/components/feedback/ErrorFallback';

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
      return this.props.fallback ?? <ErrorFallback />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
