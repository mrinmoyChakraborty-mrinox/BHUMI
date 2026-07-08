import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
          <div className="max-w-md w-full bg-white border-2 border-stone-900 rounded-3xl p-8 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] text-center">
            <div className="w-14 h-14 bg-red-100 border-2 border-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h2 className="text-lg font-black text-stone-900 mb-2">Something went wrong</h2>
            <p className="text-xs text-stone-500 font-mono mb-6 break-all">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5 rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition cursor-pointer mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
