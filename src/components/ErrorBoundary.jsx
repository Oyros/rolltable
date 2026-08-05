import { Component } from 'react';

// A render error anywhere below here used to blank the whole page — mid-session
// that's the worst possible failure. This catches it and offers a way out
// without losing the room.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null, copied: false };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // Keep the real stack in the console for anyone with devtools open.
    console.error('RollTable hata:', error, info);
  }

  details() {
    const { error, info } = this.state;
    return [
      error?.message || String(error),
      error?.stack || '',
      info?.componentStack || '',
      `URL: ${window.location.href}`,
      `Tarayıcı: ${navigator.userAgent}`,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="error-screen">
        <div className="panel error-card">
          <h1 className="title-font">⚠️ Bir şeyler ters gitti</h1>
          <p className="muted">
            Beklenmedik bir hata oldu ve bu bölüm çizilemedi. Odandaki veriler yerinde — sayfayı
            yenilemek çoğu zaman yeterli olur.
          </p>
          <div className="error-actions">
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              🔄 Sayfayı Yenile
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(this.details())
                  .then(() => this.setState({ copied: true }))
                  .catch(() => {});
              }}
            >
              {this.state.copied ? '✓ Kopyalandı' : '📋 Hata Detayını Kopyala'}
            </button>
          </div>
          <details className="error-details">
            <summary>Teknik detay</summary>
            <pre>{this.details()}</pre>
          </details>
        </div>
      </div>
    );
  }
}
