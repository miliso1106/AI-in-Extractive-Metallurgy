import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
          <div className="card max-w-lg w-full">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-400" size={24} />
                <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              <p className="text-slate-300">
                An unexpected error occurred in the application. This could be due to a network issue or a temporary problem.
              </p>
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-sm text-red-300 font-mono break-all">
                  {this.state.error?.message || 'Unknown error'}
                </p>
              </div>
              <button
                onClick={this.handleReset}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
