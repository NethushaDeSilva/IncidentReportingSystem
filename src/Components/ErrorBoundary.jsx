import { Component, lazy, Suspense } from "react";

const CalmErrorScreen = lazy(() => import("./CalmErrorScreen"));

function isRecoverableFirestoreWatchError(error) {
  const message = String(error?.message || error || "");
  return message.includes("FIRESTORE") && message.includes("INTERNAL ASSERTION FAILED");
}

export default class ErrorBoundary extends Component {
  state = {
    error: null,
  };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Application error boundary caught an error:", error, info);
  }

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  handleWindowError = (event) => {
    if (isRecoverableFirestoreWatchError(event.error || event.message)) {
      event.preventDefault();
      console.warn("Ignored recoverable Firestore watch error:", event.error || event.message);
      return;
    }

    this.setState({ error: event.error || new Error(event.message) });
  };

  handleUnhandledRejection = (event) => {
    const reason = typeof event.reason === "string" ? new Error(event.reason) : event.reason;
    if (isRecoverableFirestoreWatchError(reason)) {
      event.preventDefault();
      console.warn("Ignored recoverable Firestore watch rejection:", reason);
      return;
    }

    this.setState({ error: reason });
  };

  render() {
    if (this.state.error) {
      return (
        <Suspense fallback={null}>
          <CalmErrorScreen
            code="500"
            error={this.state.error}
            title="The system needs a quick check"
          />
        </Suspense>
      );
    }

    return this.props.children;
  }
}
