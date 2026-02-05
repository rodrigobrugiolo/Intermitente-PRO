import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full border border-red-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Ops! Algo deu errado.
            </h1>
            <p className="text-slate-600 mb-4">
              O sistema encontrou um erro inesperado e não conseguiu carregar a
              interface.
            </p>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-lg text-xs font-mono overflow-auto mb-6">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium w-full"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
