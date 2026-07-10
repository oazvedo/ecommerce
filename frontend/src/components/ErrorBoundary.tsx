import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-center max-w-md">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="font-semibold text-lg">Algo deu errado</p>
            <p className="text-sm text-muted-foreground font-mono bg-zinc-100 rounded p-2 w-full text-left break-all">
              {this.state.error.message}
            </p>
            <button
              className="text-sm text-orange-500 hover:underline mt-2"
              onClick={() => this.setState({ error: null })}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
