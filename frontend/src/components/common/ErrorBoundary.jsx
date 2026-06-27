import React, { Component } from 'react';
import Button from '../ui/Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorLog: "" };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorLog: error.toString() };
  }

  componentDidCatch(error, errorInfo) {
    // In production, you would stream this telemetry down to automated error logging tools like Sentry
    console.error("[CRITICAL UI CRASH DETECTED]:", error, errorInfo);
  }

  handleRecoveryReset = () => {
    this.setState({ hasError: false });
    window.location.href = "/"; // Send them back to safe storefront landing root
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">
            &#9881;
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Something Went Wrong</h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md leading-relaxed">
            An unexpected client-side runtime exception broke this view execution layer. The problem has been logged for engineering review.
          </p>
          
          <div className="mt-6 w-full max-w-sm">
            <Button variant="primary" className="w-full py-2.5 font-bold shadow-md" onClick={this.handleRecoveryReset}>
              Reset Application State
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

