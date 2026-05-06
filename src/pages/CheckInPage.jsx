import { BackendNotice } from '../components/BackendNotice'
import { CheckInFlow } from '../components/CheckInFlow'
import { Footer } from '../components/Footer'
import { PageShell } from '../components/PageShell'
import { SiteHeader } from '../components/SiteHeader'
import { ui } from '../ui'

export function CheckInPage() {
  return (
    <PageShell>
      <SiteHeader />

      <main className={`${ui.pageMain} pt-4`}>
        <BackendNotice compact />

        <section className={`${ui.container} mt-5`}>
          <div className={`${ui.sectionHeading} max-w-[48rem]`}>
            <span className={ui.eyebrow}>Check-in Nossa Air</span>
            <h1 className={`${ui.pageTitle} mt-4`}>Emita seu cartao de embarque online.</h1>
            <p className={`${ui.bodyText} mt-4`}>
              Informe o localizador e o CPF ou sobrenome de um passageiro para
              confirmar presenca no voo.
            </p>
          </div>
        </section>

        <section className="mt-5">
          <CheckInFlow
            title="Confirme sua presenca no voo"
            description="Depois da validacao, o portal gera assento, portao e grupo de embarque."
          />
        </section>
      </main>

      <Footer />
    </PageShell>
  )
}
