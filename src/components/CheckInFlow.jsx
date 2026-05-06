import { useState } from 'react'
import { performCheckIn } from '../services/nossaAirService'
import { formatDate, normalizeLocator } from '../utils/formatters'
import { ui } from '../ui'

export function CheckInFlow({ title = 'Realize seu check-in', description, embedded = false }) {
  const [form, setForm] = useState({
    locator: '',
    credential: '',
  })
  const [status, setStatus] = useState('')
  const [boardingPasses, setBoardingPasses] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('')
    setBoardingPasses([])
    setIsSubmitting(true)

    try {
      const response = await performCheckIn(form)
      setBoardingPasses(response.boardingPasses)
      setStatus(
        response.alreadyCheckedIn
          ? 'Check-in ja estava concluido. Cartoes de embarque reemitidos abaixo.'
          : 'Check-in concluido. Seus cartoes de embarque foram emitidos.'
      )
    } catch (error) {
      setStatus(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <article className={embedded ? ui.bookingCard : `${ui.bookingCard} ${ui.container}`}>
      <div className={ui.cardHeader}>
        <div>
          <span className={ui.eyebrow}>Check-in online</span>
          <h3 className="mt-4 font-display text-xl">{title}</h3>
          {description && <p className={`${ui.bodyText} mt-3`}>{description}</p>}
        </div>
        <span className={ui.pill}>Aberto 48h antes</span>
      </div>

      <form className={ui.formGrid} onSubmit={handleSubmit}>
        <label className={ui.field}>
          <span className={ui.labelText}>Localizador</span>
          <input
            className={ui.input}
            value={form.locator}
            maxLength="6"
            placeholder="ABC123"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                locator: normalizeLocator(event.target.value),
              }))
            }
          />
        </label>

        <label className={ui.field}>
          <span className={ui.labelText}>CPF ou sobrenome</span>
          <input
            className={ui.input}
            value={form.credential}
            placeholder="CPF ou ultimo sobrenome"
            onChange={(event) =>
              setForm((current) => ({ ...current, credential: event.target.value }))
            }
          />
        </label>

        <div className={`${ui.formActions} ${ui.fieldSpan2}`}>
          <button className={ui.primaryButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Emitindo...' : 'Fazer check-in'}
          </button>
        </div>
      </form>

      {status && <p className={ui.statusBanner}>{status}</p>}

      {boardingPasses.length > 0 && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {boardingPasses.map((boardingPass) => (
            <article key={boardingPass.ticketNumber} className={ui.boardingPass}>
              <span className="font-extrabold text-forest-dark">{boardingPass.flightNumber}</span>
              <strong className="text-[1.15rem]">
                {boardingPass.passengerName}
              </strong>
              <p className={ui.bodyText}>
                {boardingPass.origin}
                {' -> '}
                {boardingPass.destination}
              </p>
              <p className={ui.bodyText}>
                {formatDate(boardingPass.departureDate)} as {boardingPass.departureTime}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/74 px-3 py-2 text-[0.85rem] text-forest-dark">
                  Assento {boardingPass.seat}
                </span>
                <span className="rounded-full bg-white/74 px-3 py-2 text-[0.85rem] text-forest-dark">
                  Portao {boardingPass.gate}
                </span>
                <span className="rounded-full bg-white/74 px-3 py-2 text-[0.85rem] text-forest-dark">
                  {boardingPass.group}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </article>
  )
}
