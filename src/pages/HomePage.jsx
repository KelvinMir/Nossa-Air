import { useEffect } from 'react'
import { BackendNotice } from '../components/BackendNotice'
import { BookingPanel } from '../components/BookingPanel'
import { Footer } from '../components/Footer'
import { Hero } from '../components/Hero'
import { PageShell } from '../components/PageShell'
import { SiteHeader } from '../components/SiteHeader'
import { destinationCards, serviceHighlights } from '../data'
import { ui } from '../ui'

function scrollToSection(section) {
  const target = document.getElementById(section)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function HomePage() {
  useEffect(() => {
    const target = window.sessionStorage.getItem('nossa-air-scroll-target')

    if (!target) {
      return
    }

    window.sessionStorage.removeItem('nossa-air-scroll-target')

    window.requestAnimationFrame(() => {
      scrollToSection(target)
    })
  }, [])

  return (
    <PageShell>
      <SiteHeader />

      <main className={ui.pageMain}>
        <BackendNotice />

        <Hero onPrimaryAction={() => scrollToSection('reserva')} />

        <section className={ui.sectionBlock}>
          <div className={ui.sectionHeading}>
            <span className={ui.eyebrow}>Operacao Nossa Air</span>
            <h2 className={`${ui.sectionTitle} mt-4`}>
              Uma companhia feita para conectar passageiros, comunidades e destinos
              brasileiros.
            </h2>
            <p className={`${ui.bodyText} mt-4`}>
              A malha prioriza viagens regionais com compra simples, informacoes
              claras e servicos digitais que acompanham o passageiro antes do embarque.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {serviceHighlights.map((item) => (
              <article key={item.title} className={`${ui.softCard} p-5`}>
                <h3 className="font-display text-xl">{item.title}</h3>
                <p className={`${ui.bodyText} mt-3`}>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <BookingPanel />

        <section id="experiencia" className={ui.sectionBlock}>
          <div className={ui.sectionHeading}>
            <span className={ui.eyebrow}>Experiencia de viagem</span>
            <h2 className={`${ui.sectionTitle} mt-4`}>
              Da busca ao embarque, cada etapa fica centralizada no portal Nossa Air.
            </h2>
            <p className={`${ui.bodyText} mt-4`}>
              O cliente pode emitir bilhete, consultar localizador, registrar check-in,
              solicitar stopover e acompanhar servicos extras sem sair da mesma jornada.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <article className={`${ui.softCard} p-6`}>
              <h3 className="font-display text-[1.55rem] leading-tight">
                Rotas regionais com servicos de companhia aerea completa.
              </h3>
              <p className={`${ui.bodyText} mt-4`}>
                A Nossa Air combina voos diretos, conexoes por hubs do Nordeste e
                uma area do cliente para manter reservas, bilhetes e milhas estimadas
                sempre acessiveis.
              </p>
              <ul className={ui.featureList}>
                <li>Reservas com localizador e bilhete emitido.</li>
                <li>Check-in online por localizador, CPF ou sobrenome.</li>
                <li>Solicitacoes de stopover, carga, hotel e destinos.</li>
              </ul>
            </article>

            <div className={`${ui.roundedPanel} flex items-center overflow-hidden p-6`}>
              <div className="rounded-[1.5rem] border border-ink/8 bg-[linear-gradient(135deg,rgba(142,207,155,0.18),rgba(240,199,94,0.16)),rgba(255,255,255,0.82)] p-6">
                <span className={ui.eyebrow}>Interface viva</span>
                <h3 className="mt-4 font-display text-[1.55rem] leading-tight">
                  Informacao clara para decidir, reservar e embarcar.
                </h3>
                <p className={`${ui.bodyText} mt-4`}>
                  Os fluxos priorizam leitura rapida, dados de voo e chamadas de
                  acao diretas para reduzir atrito antes da viagem.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="destinos" className={ui.sectionBlock}>
          <div className={ui.sectionHeading}>
            <span className={ui.eyebrow}>Destinos em destaque</span>
            <h2 className={`${ui.sectionTitle} mt-4`}>
              Rotas que aproximam litoral, cultura, negocios e natureza.
            </h2>
            <p className={`${ui.bodyText} mt-4`}>
              Conheca alguns destinos atendidos pela malha Nossa Air e encontre
              combinacoes de voo, stopover e hospedagem para sua proxima viagem.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {destinationCards.map((destination) => (
              <article
                key={destination.city}
                className="rounded-[1.6rem] border border-ink/8 bg-[linear-gradient(180deg,rgba(255,249,241,0.96),rgba(255,255,255,0.8))] p-6 shadow-soft backdrop-blur-xl"
              >
                <span className={ui.cardKicker}>{destination.category}</span>
                <h3 className="mt-3 font-display text-[1.45rem]">{destination.city}</h3>
                <p className={`${ui.bodyText} mt-3`}>{destination.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </PageShell>
  )
}
