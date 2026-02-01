"use client";

import * as React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error boundary caught:", error);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full w-full items-center justify-center bg-[var(--background)]">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-5 text-center">
              <p className="text-sm text-[var(--muted-foreground)]">
                The Cosmos failed to load. Try again.
              </p>
              <button
                type="button"
                onClick={this.handleRetry}
                className="mt-3 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-[var(--background)]"
              >
                Reload view
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
