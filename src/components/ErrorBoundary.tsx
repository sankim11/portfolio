import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Shown in place of the children if they throw. Defaults to nothing. */
  fallback?: ReactNode;
  /** Names the boundary in the console so the failing part is easy to find. */
  name: string;
};

/**
 * Contains a failure in an optional part of the page (the chat, the sculpture)
 * so the rest of the site keeps working.
 */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.name}] crashed`, error, info.componentStack);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
