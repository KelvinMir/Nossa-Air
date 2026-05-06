import { ui } from '../ui'

export function PageShell({ children }) {
  return (
    <div className={ui.pageShell}>
      <div aria-hidden="true" className={ui.pageBackdrop} />
      <div aria-hidden="true" className={ui.pageTexture} />
      <div className={ui.pageContent}>{children}</div>
    </div>
  )
}
