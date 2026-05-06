import { Link } from 'react-router-dom'
import { ui } from '../ui'

export function Hero({ onPrimaryAction }) {
  return (
    <section className={`${ui.container} grid gap-6 pt-8 lg:grid-cols-[1.08fr_0.92fr]`}>
      <div className={`${ui.roundedPanel} p-[clamp(1.5rem,4vw,3rem)]`}>
        <span className={ui.eyebrow}>Companhia aerea brasileira</span>
        <h1 className={`${ui.heroTitle} mt-4`}>
          Voos regionais, conexoes inteligentes e atendimento com sotaque de casa.
        </h1>
        <p className={`${ui.bodyText} mt-4`}>
          A Nossa Air conecta capitais, litoral e destinos de natureza no Nordeste com
          uma jornada digital simples: escolha o voo, emita sua reserva e faca check-in
          pelo portal.
        </p>

        <div className="my-8 flex flex-wrap gap-4">
          <button className={ui.primaryButton} type="button" onClick={onPrimaryAction}>
            Buscar passagens
          </button>
          <Link className={ui.ghostButton} to="/login">
            Area do cliente
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.4rem] border border-ink/6 bg-white/72 p-4">
            <strong className="mb-1 block text-base">6 frentes</strong>
            <span className="text-[0.92rem] leading-[1.55] text-muted">
              passagens, hoteis, milhas, carga, stopover e destinos
            </span>
          </article>
          <article className="rounded-[1.4rem] border border-ink/6 bg-white/72 p-4">
            <strong className="mb-1 block text-base">48h antes</strong>
            <span className="text-[0.92rem] leading-[1.55] text-muted">
              check-in online com cartao de embarque digital
            </span>
          </article>
          <article className="rounded-[1.4rem] border border-ink/6 bg-white/72 p-4">
            <strong className="mb-1 block text-base">Nossa+</strong>
            <span className="text-[0.92rem] leading-[1.55] text-muted">
              milhas estimadas para clientes cadastrados
            </span>
          </article>
        </div>
      </div>

      <div className={`${ui.roundedPanel} relative overflow-hidden p-4`}>
        <img
          className="h-full min-h-[320px] w-full rounded-[1.5rem] object-cover saturate-110 lg:min-h-[430px]"
          src="/imagens/aviao-nossa.jpeg"
          alt="Aviao em voo representando a Nossa Air"
        />
        <div className="absolute bottom-5 left-5 right-5 rounded-[1.3rem] border border-ink/8 bg-[rgba(255,248,238,0.92)] p-4 md:left-auto md:right-8 md:max-w-[21rem]">
          <p className="font-semibold text-forest-dark">
            Reserve com localizador, acompanhe seus bilhetes e adicione servicos extras
            antes de embarcar.
          </p>
        </div>
      </div>
    </section>
  )
}
