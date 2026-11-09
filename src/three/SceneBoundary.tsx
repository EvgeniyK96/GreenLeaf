import { Component, type ReactNode } from 'react'

/** Если WebGL/сцена упала — остаётся постер, страница работает дальше. */
export class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) console.warn('3D отключено, показан постер:', error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
