
import React, { ReactNode, ErrorInfo, Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Fix: Changed inheritance to use Component directly from named imports to ensure generic type application and fix state/props access errors
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Fix: Explicitly initialize state on the instance
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    // Fix: Correctly access state from the Component instance
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full border-l-4 border-red-500">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Errore Critico</h1>
            <p className="text-slate-600 mb-4">L'app ha riscontrato un errore imprevisto durante il caricamento.</p>
            <pre className="bg-slate-100 p-4 rounded text-xs font-mono text-red-800 overflow-auto max-h-48 border border-slate-200">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="mt-6 w-full bg-slate-900 text-white py-2 px-4 rounded hover:bg-slate-800 transition-colors"
            >
              Reset Cache e Ricarica
            </button>
          </div>
        </div>
      );
    }
    // Fix: Correctly access props from the Component instance
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
