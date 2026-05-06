import { ui } from '../ui'

const textureImage = `${import.meta.env.BASE_URL}imagens/fundo-nossa.png`

export function PageShell({ children }) {
  return (
    <div className={ui.pageShell}>
      <div aria-hidden="true" className={ui.pageBackdrop} />
      <div
        aria-hidden="true"
        className={ui.pageTexture}
        style={{ backgroundImage: `url(${textureImage})` }}
      />
      <div className={ui.pageContent}>{children}</div>
    </div>
  )
}
