import { ui } from '../ui'

export function Footer() {
  return (
    <footer
      className={`${ui.container} mb-10 mt-6 grid gap-6 rounded-[1.6rem] border border-ink/8 bg-surface p-6 shadow-soft backdrop-blur-xl md:grid-cols-2`}
    >
      <div>
        <strong className="font-display text-base">Nossa Air</strong>
        <p className="mt-3 text-muted leading-[1.65]">
          Companhia aerea brasileira dedicada a rotas regionais, conexoes eficientes e
          viagens com atendimento proximo.
        </p>
      </div>

      <div>
        <strong className="font-display text-base">Atendimento</strong>
        <p className="mt-3 text-muted leading-[1.65]">
          Reservas, check-in, stopover, cargas e pacotes em um unico portal para
          clientes Nossa Air.
        </p>
      </div>
    </footer>
  )
}
