import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { PageShell } from '../components/PageShell'
import { SiteHeader } from '../components/SiteHeader'
import { getReservationByLocator } from '../services/nossaAirService'
import { ui } from '../ui'
import { formatCurrency, formatDate } from '../utils/formatters'

export function ReservationPage() {
  const { locator } = useParams()
  const [reservation, setReservation] = useState(null)
  const [status, setStatus] = useState('Carregando reserva...')

  useEffect(() => {
    let cancelled = false

    async function loadReservation() {
      const item = await getReservationByLocator(locator)

      if (cancelled) {
        return
      }

      if (!item) {
        setStatus('Nao encontramos esta reserva.')
        return
      }

      setReservation(item)
      setStatus('')
    }

    loadReservation()

    return () => {
      cancelled = true
    }
  }, [locator])

  return (
    <PageShell>
      <SiteHeader />

      <main className={`${ui.pageMain} pt-5`}>
        {!reservation ? (
          <section className={`${ui.container} ${ui.bookingCard}`}>
            <span className={ui.eyebrow}>Reserva</span>
            <h1 className={`${ui.pageTitle} mt-4 text-[clamp(1.8rem,3vw,2.7rem)]`}>{status}</h1>
            <Link className={`${ui.ghostButton} mt-5`} to="/portal">
              Voltar ao portal
            </Link>
          </section>
        ) : (
          <>
            <section
              className={`${ui.container} ${ui.roundedPanel} flex flex-col gap-5 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between`}
            >
              <div>
                <span className={ui.eyebrow}>Localizador {reservation.locator}</span>
                <h1 className={`${ui.pageTitle} mt-4`}>
                  {reservation.offer.outbound.origin}
                  {' -> '}
                  {reservation.offer.outbound.destination}
                </h1>
                <p className={`${ui.bodyText} mt-4`}>
                  Reserva {reservation.status} · {reservation.passengers.length} passageiro(s) ·{' '}
                  {reservation.offer.fare.name}
                </p>
              </div>

              <Link className={ui.primaryButton} to="/check-in">
                Fazer check-in
              </Link>
            </section>

            <section className={`${ui.container} mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]`}>
              <article className={ui.bookingCard}>
                <div className={ui.cardHeader}>
                  <div>
                    <span className={ui.cardKicker}>Itinerario</span>
                    <h3 className="mt-2 font-display text-[1.45rem]">Voos da reserva</h3>
                  </div>
                  <strong className="text-[1.08rem]">
                    {formatCurrency(reservation.offer.totalPrice)}
                  </strong>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.25rem] border border-ink/8 bg-white/72 p-5">
                    <span className={ui.cardKicker}>{reservation.offer.outbound.flightNumber}</span>
                    <strong className="mt-2 block text-[1.08rem]">
                      {reservation.offer.outbound.origin}
                      {' -> '}
                      {reservation.offer.outbound.destination}
                    </strong>
                    <p className={`${ui.bodyText} mt-2`}>
                      {formatDate(reservation.offer.outbound.date)} ·{' '}
                      {reservation.offer.outbound.departureTime} -{' '}
                      {reservation.offer.outbound.arrivalTime}
                    </p>
                    <p className={`${ui.bodyText} mt-2`}>{reservation.offer.outbound.aircraft}</p>
                  </div>

                  {reservation.offer.returnFlight && (
                    <div className="rounded-[1.25rem] border border-ink/8 bg-white/72 p-5">
                      <span className={ui.cardKicker}>
                        {reservation.offer.returnFlight.flightNumber}
                      </span>
                      <strong className="mt-2 block text-[1.08rem]">
                        {reservation.offer.returnFlight.origin}
                        {' -> '}
                        {reservation.offer.returnFlight.destination}
                      </strong>
                      <p className={`${ui.bodyText} mt-2`}>
                        {formatDate(reservation.offer.returnFlight.date)} ·{' '}
                        {reservation.offer.returnFlight.departureTime} -{' '}
                        {reservation.offer.returnFlight.arrivalTime}
                      </p>
                      <p className={`${ui.bodyText} mt-2`}>
                        {reservation.offer.returnFlight.aircraft}
                      </p>
                    </div>
                  )}
                </div>
              </article>

              <article className={ui.bookingCard}>
                <div className={ui.cardHeader}>
                  <div>
                    <span className={ui.cardKicker}>Bilhetes</span>
                    <h3 className="mt-2 font-display text-[1.45rem]">Passageiros</h3>
                  </div>
                </div>

                <div className="grid gap-4">
                  {reservation.passengers.map((passenger) => (
                    <div
                      key={passenger.ticketNumber}
                      className="rounded-[1.25rem] border border-ink/8 bg-white/72 p-5"
                    >
                      <strong className="block text-[1.08rem]">
                        {passenger.firstName} {passenger.lastName}
                      </strong>
                      <span className={`${ui.bodyText} mt-2 block`}>
                        Bilhete {passenger.ticketNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}
      </main>

      <Footer />
    </PageShell>
  )
}
