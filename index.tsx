
import React, { ReactNode, ErrorInfo } from 'react';
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

// Fix: Using React.Component explicitly with generic parameters and property initializer for state
// to ensure TypeScript correctly recognizes inherited 'state' and 'props' properties.
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly declare state using a property initializer to resolve state access errors.
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    // Fix: Accessing 'this.state' correctly as a member of React.Component.
    if (this.state.hasError) {
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
    // Fix: Accessing 'this.props' correctly as a member of React.Component.
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
