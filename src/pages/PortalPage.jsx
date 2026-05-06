import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BackendNotice } from '../components/BackendNotice'
import { Footer } from '../components/Footer'
import { PageShell } from '../components/PageShell'
import { SiteHeader } from '../components/SiteHeader'
import { useAuth } from '../contexts/AuthContext'
import { getReservationByLocator, getUserReservations } from '../services/nossaAirService'
import { cx, ui } from '../ui'
import {
  formatCurrency,
  formatDate,
  formatMiles,
  normalizeLocator,
} from '../utils/formatters'

export function PortalPage() {
  const { currentUser, profile, logout, backendIssue, backendMode } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loadingReservations, setLoadingReservations] = useState(true)
  const [lookup, setLookup] = useState('')
  const [lookupStatus, setLookupStatus] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadReservations() {
      setLoadingReservations(true)
      const items = await getUserReservations(currentUser?.uid || profile?.uid, profile?.email)

      if (!cancelled) {
        setReservations(items)
        setLoadingReservations(false)
      }
    }

    loadReservations()

    return () => {
      cancelled = true
    }
  }, [currentUser?.uid, profile?.uid, profile?.email])

  async function handleLookup(event) {
    event.preventDefault()
    setLookupStatus('')

    const reservation = await getReservationByLocator(lookup)

    if (!reservation) {
      setLookupStatus('Nao encontramos uma reserva com este localizador.')
      return
    }

    window.location.hash = `/reserva/${reservation.locator}`
  }

  const milesBalance =
    Number(profile?.milesBalance || 0) +
    reservations.reduce((total, reservation) => total + Number(reservation.milesEarned || 0), 0)

  return (
    <PageShell>
      <SiteHeader />

      <main className={`${ui.pageMain} pt-4`}>
        <BackendNotice compact />

        <section
          className={`${ui.container} ${ui.roundedPanel} mt-5 flex flex-col gap-5 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between`}
        >
          <div>
            <span className={ui.eyebrow}>Area do cliente</span>
            <h1 className={`${ui.pageTitle} mt-4`}>
              Bem-vindo, {profile?.name || 'cliente Nossa Air'}.
            </h1>
            <p className={`${ui.bodyText} mt-4 max-w-[42rem]`}>
              Consulte suas viagens, acompanhe bilhetes emitidos e acesse os servicos
              da sua jornada em um unico painel.
            </p>
          </div>

          <button className={ui.ghostButton} type="button" onClick={logout}>
            Sair da conta
          </button>
        </section>

        <section className={`${ui.container} mt-5 grid gap-4 lg:grid-cols-3`}>
          <article className={ui.metricCard}>
            <span className={ui.cardKicker}>Backend</span>
            <strong className="mt-3 block font-display text-[1.7rem]">
              {backendMode === 'firebase'
                ? 'Firebase ativo'
                : backendMode === 'local-fallback'
                  ? 'Modo local de contingencia'
                  : 'Modo local'}
            </strong>
            <p className={`${ui.bodyText} mt-3`}>
              {backendMode === 'firebase'
                ? 'Auth e Firestore conectados.'
                : backendIssue || 'Dados salvos neste navegador.'}
            </p>
          </article>

          <article className={ui.metricCard}>
            <span className={ui.cardKicker}>Milhas Nossa+</span>
            <strong className="mt-3 block font-display text-[1.7rem]">
              {formatMiles(milesBalance)}
            </strong>
            <p className={`${ui.bodyText} mt-3`}>
              Saldo estimado a partir das reservas emitidas no portal.
            </p>
          </article>

          <article className={ui.metricCard}>
            <span className={ui.cardKicker}>Reservas</span>
            <strong className="mt-3 block font-display text-[1.7rem]">{reservations.length}</strong>
            <p className={`${ui.bodyText} mt-3`}>
              Bilhetes vinculados ao seu perfil de passageiro.
            </p>
          </article>
        </section>

        <section className={`${ui.container} mt-5 grid gap-5 xl:grid-cols-[1.12fr_0.88fr]`}>
          <article className={ui.bookingCard}>
            <div className={ui.cardHeader}>
              <div>
                <span className={ui.cardKicker}>Minhas reservas</span>
                <h3 className="mt-2 font-display text-[1.45rem]">Viagens emitidas</h3>
              </div>
              <Link className={ui.ghostButton} to="/">
                Comprar nova passagem
              </Link>
            </div>

            {loadingReservations ? (
              <p className={ui.statusBanner}>Carregando suas reservas...</p>
            ) : reservations.length === 0 ? (
              <p className={ui.statusBanner}>
                Voce ainda nao tem reservas emitidas. Busque uma passagem na home para
                gerar seu primeiro localizador.
              </p>
            ) : (
              <div className="grid gap-4">
                {reservations.map((reservation) => (
                  <Link
                    key={reservation.id || reservation.locator}
                    className={ui.reservationCard}
                    to={`/reserva/${reservation.locator}`}
                  >
                    <div>
                      <span className={ui.cardKicker}>{reservation.locator}</span>
                      <strong className="mt-2 block text-[1.08rem]">
                        {reservation.offer.outbound.origin}
                        {' -> '}
                        {reservation.offer.outbound.destination}
                      </strong>
                      <p className={`${ui.bodyText} mt-2`}>
                        {formatDate(reservation.offer.outbound.date)} ·{' '}
                        {reservation.offer.outbound.flightNumber}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <strong className="block text-[1.08rem]">
                        {formatCurrency(reservation.offer.totalPrice)}
                      </strong>
                      <p className={`${ui.bodyText} mt-2`}>
                        Status: {reservation.status}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>

          <article className={ui.bookingCard}>
            <div className={ui.cardHeader}>
              <div>
                <span className={ui.cardKicker}>Consulta rapida</span>
                <h3 className="mt-2 font-display text-[1.45rem]">
                  Encontre uma reserva por localizador.
                </h3>
              </div>
            </div>

            <form className={ui.formGrid} onSubmit={handleLookup}>
              <label className={cx(ui.field, ui.fieldSpan2)}>
                <span className={ui.labelText}>Localizador</span>
                <input
                  className={ui.input}
                  value={lookup}
                  maxLength="6"
                  placeholder="ABC123"
                  onChange={(event) => setLookup(normalizeLocator(event.target.value))}
                />
              </label>

              <div className={cx(ui.formActions, ui.fieldSpan2)}>
                <button className={ui.primaryButton} type="submit">
                  Consultar reserva
                </button>
              </div>
            </form>

            {lookupStatus && <p className={ui.statusBanner}>{lookupStatus}</p>}
          </article>
        </section>
      </main>

      <Footer />
    </PageShell>
  )
}
