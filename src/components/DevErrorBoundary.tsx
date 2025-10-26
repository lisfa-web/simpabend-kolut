import React from "react";

interface State { hasError: boolean; error?: any }

export class DevErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Log ke console untuk debugging Lovable
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    // Coba reload halaman untuk recover dari error
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-background text-foreground p-6">
          <div className="max-w-xl w-full rounded-lg border bg-card shadow-sm p-6 space-y-4">
            <h1 className="text-xl font-bold">Terjadi kesalahan saat memuat halaman</h1>
            <p className="text-sm text-muted-foreground">Kami mendeteksi error runtime yang mencegah tampilan halaman. Silakan muat ulang halaman. Jika berlanjut, hubungi admin.</p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="text-xs overflow-auto rounded bg-muted p-3 border max-h-48 whitespace-pre-wrap">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
            <div className="flex gap-3">
              <button onClick={this.handleReset} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:bg-primary/90">
                Muat Ulang
              </button>
              <a href="/" className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium">Ke Beranda</a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default DevErrorBoundary;
