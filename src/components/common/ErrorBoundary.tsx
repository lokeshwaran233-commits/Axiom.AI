import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  name: string;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
  showDetails: boolean;
}

function logErrorToService(name: string, error: Error, errorInfo: React.ErrorInfo) {
  const payload = {
    timestamp: new Date().toISOString(),
    boundary: name,
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  if (import.meta.env.VITE_SUPABASE_URL) {
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/rpc_log_error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently fail - don't crash the error boundary itself
    });
  }
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logErrorToService(this.props.name, error, errorInfo);
    this.setState((prev) => ({
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  handleRetry = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
  };

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isRecurring = this.state.errorCount >= 3;

      return (
        <div className="flex items-center justify-center min-h-[200px] p-6">
          <div className="max-w-md w-full glass-panel rounded-xl p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-axiom-red/10 border border-axiom-red/20 mx-auto mb-4">
              <AlertTriangle className="w-5 h-5 text-axiom-red" />
            </div>

            <h3 className="text-sm font-semibold text-white mb-1">
              {isRecurring ? 'Persistent Error' : 'Component Error'}
            </h3>
            <p className="text-xs text-axiom-border-secondary mb-1">
              {this.props.name} encountered an error
            </p>
            <p className="text-[10px] text-axiom-border-secondary font-mono mb-4">
              {this.state.error?.message || 'Unknown error'}
            </p>

            {isRecurring && (
              <p className="text-[10px] text-axiom-amber mb-4">
                This error has occurred {this.state.errorCount} times. Consider reloading the page.
              </p>
            )}

            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-axiom-cyan/10 text-axiom-cyan border border-axiom-cyan/20 hover:bg-axiom-cyan/20 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
              {isRecurring && (
                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-axiom-bg-tertiary text-axiom-border-secondary border border-axiom-border hover:text-white transition-all"
                >
                  Reload Page
                </button>
              )}
            </div>

            <button
              onClick={this.toggleDetails}
              className="flex items-center justify-center gap-1 text-[10px] text-axiom-border-secondary hover:text-white transition-colors mx-auto"
            >
              {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {this.state.showDetails ? 'Hide' : 'Show'} Details
            </button>

            {this.state.showDetails && this.state.errorInfo && (
              <div className="mt-3 p-3 rounded-lg bg-axiom-bg-tertiary text-left animate-slide-in">
                <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-1.5">
                  Component Stack
                </div>
                <pre className="text-[10px] text-axiom-border-secondary font-mono leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
                {this.state.error?.stack && (
                  <>
                    <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-1.5 mt-2">
                      Error Stack
                    </div>
                    <pre className="text-[10px] text-axiom-border-secondary font-mono leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {this.state.error.stack}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  name: string,
  onReset?: () => void,
) {
  return function ErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary name={name} onReset={onReset}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
