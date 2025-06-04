import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@/styles/main.css";
import { ToastProvider } from "@/components/ui/Toast"; // ADICIONADO

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Productivity Hub Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-red-400 mb-2">
              Oops! Algo deu errado
            </h1>
            <p className="text-gray-400 text-sm mb-4">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Recarregar Página
            </button>
            {this.state.error && (
              <details className="mt-4 text-left bg-gray-800 p-3 rounded text-xs">
                <summary className="cursor-pointer text-gray-400 mb-2">
                  Detalhes técnicos
                </summary>
                <pre className="text-red-300 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize app
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        {" "}
        {/* ADICIONADO */}
        <App />
      </ToastProvider>{" "}
      {/* ADICIONADO */}
    </ErrorBoundary>
  </React.StrictMode>
);
