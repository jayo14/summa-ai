"use client"

import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { error: null }

  public static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  private reset = () => {
    this.setState({ error: null })
  }

  public render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 p-4">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <pre className="max-w-md overflow-auto rounded-md bg-muted p-4 text-xs">
            {this.state.error.message}
          </pre>
          <button
            onClick={this.reset}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
