import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName: string;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    this.setState((prev) => ({ errorCount: prev.errorCount + 1 }));
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.hash = '';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isRecurring = this.state.errorCount >= 3;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="max-w-lg w-full text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-axiom-red/10 border border-axiom-red/20 mx-auto mb-5">
              <AlertTriangle className="w-7 h-7 text-axiom-red" />
            </div>

            <h2 className="text-lg font-semibold text-white mb-2">
              {this.props.routeName} - Unavailable
            </h2>
            <p className="text-sm text-axiom-border-secondary mb-2">
              This section encountered an error and could not render.
            </p>
            <p className="text-xs text-axiom-border-secondary font-mono mb-6 max-w-md mx-auto">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            {isRecurring && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-axiom-amber/10 border border-axiom-amber/20 mb-4">
                <AlertTriangle className="w-3 h-3 text-axiom-amber" />
                <span className="text-[10px] text-axiom-amber font-medium">
                  Error occurred {this.state.errorCount} times
                </span>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-axiom-cyan/10 text-axiom-cyan border border-axiom-cyan/20 hover:bg-axiom-cyan/20 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-axiom-bg-tertiary text-axiom-border-secondary border border-axiom-border hover:text-white transition-all"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
