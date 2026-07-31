import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="center-container" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="error-container" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="error-icon" style={{ marginBottom: '1rem' }}>
              <svg width="48" height="48" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              A rendering error occurred
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {this.state.error?.message || "An unexpected error prevented loading the interface."}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn btn-download"
                style={{ padding: '0.6rem 1.2rem' }}
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('nexthouse_admin_token');
                  window.location.href = '/admin';
                }}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1.2rem' }}
              >
                Reset Admin Session
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
