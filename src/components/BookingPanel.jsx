import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckInFlow } from './CheckInFlow'
import { useAuth } from '../contexts/AuthContext'
import {
  airportOptions,
  destinationProfiles,
  hotelCities,
  stopoverCities,
} from '../data'
import {
  createCargoQuote,
  createDestinationLead,
  createHotelRequest,
  createReservation,
  createStopoverRequest,
  estimateMiles,
  getReservationByLocator,
  searchFlightOffers,
} from '../services/nossaAirService'
import { cx, ui } from '../ui'
import {
  formatCpf,
  formatCurrency,
  formatDate,
  formatMiles,
  getAirportLabel,
  normalizeComparable,
  normalizeCpf,
  normalizeLocator,
  splitFullName,
} from '../utils/formatters'

const tabs = [
  { id: 'passagens', label: 'Comprar passagem' },
  { id: 'minhas-reservas', label: 'Minha reserva' },
  { id: 'checkin', label: 'Check-in' },
  { id: 'stopover', label: 'Stopover' },
  { id: 'hoteis', label: 'Hoteis' },
  { id: 'milhas', label: 'Viaje com Milhas' },
  { id: 'carga', label: 'Nossa Carga' },
  { id: 'destinos', label: 'Nossa Destinos' },
]

const PENDING_PURCHASE_KEY = 'nossa-air-pending-purchase'

function getBlankPassenger(profile, index) {
  if (index === 0 && profile) {
    const nameParts = splitFullName(profile.name)

    return {
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      cpf: formatCpf(profile.cpf || ''),
      birthDate: '',
    }
  }

  return {
    firstName: '',
    lastName: '',
    cpf: '',
    birthDate: '',
  }
}

function credentialMatchesReservation(reservation, credential) {
  const cpf = normalizeCpf(credential)
  const comparable = normalizeComparable(credential)

  return reservation.passengers.some((passenger) => {
    const cpfMatches = cpf && normalizeCpf(passenger.cpf) === cpf
    const lastNameMatches =
      comparable && normalizeComparable(passenger.lastName).includes(comparable)

    return cpfMatches || lastNameMatches
  })
}

function renderAirportOptions() {
  return airportOptions.map((airport) => (
    <option key={airport.code} value={airport.code}>
      {airport.city} ({airport.code})
    </option>
  ))
}

export function BookingPanel() {
  const { currentUser, profile } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('passagens')
  const [flightForm, setFlightForm] = useState({
    origin: 'THE',
    destination: 'REC',
    departureDate: '',
    roundTrip: true,
    returnDate: '',
    passengers: 1,
  })
  const [flightResults, setFlightResults] = useState([])
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [passengerDrafts, setPassengerDrafts] = useState([])
  const [contact, setContact] = useState({
    email: '',
    phone: '',
    cpf: '',
  })
  const [reservation, setReservation] = useState(null)
  const [flightNotice, setFlightNotice] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isIssuing, setIsIssuing] = useState(false)

  const [lookupForm, setLookupForm] = useState({
    locator: '',
    credential: '',
  })
  const [lookupReservation, setLookupReservation] = useState(null)
  const [lookupNotice, setLookupNotice] = useState('')

  const [hotelForm, setHotelForm] = useState({
    city: 'Jericoacoara',
    checkIn: '',
    checkOut: '',
    guests: 2,
    email: '',
  })
  const [hotelNotice, setHotelNotice] = useState('')

  const [stopoverForm, setStopoverForm] = useState({
    locator: '',
    city: stopoverCities[0].city,
    nights: 2,
    preferredDate: '',
    email: '',
  })
  const [stopoverNotice, setStopoverNotice] = useState('')

  const [milesForm, setMilesForm] = useState({
    origin: 'FOR',
    destination: 'FEN',
    cabin: 'economica',
    passengers: 1,
  })
  const [milesNotice, setMilesNotice] = useState('')

  const [cargoForm, setCargoForm] = useState({
    origin: 'THE',
    destination: 'SLS',
    date: '',
    weight: 50,
    email: '',
  })
  const [cargoNotice, setCargoNotice] = useState('')

  const [destinationForm, setDestinationForm] = useState({
    vibe: 'praia',
    month: 'julho',
    email: '',
  })
  const [destinationNotice, setDestinationNotice] = useState('')

  useEffect(() => {
    const storedTab = window.sessionStorage.getItem('nossa-air-service-tab')

    if (storedTab && tabs.some((tab) => tab.id === storedTab)) {
      setActiveTab(storedTab)
      window.sessionStorage.removeItem('nossa-air-service-tab')
    }

    function handleServiceTab(event) {
      if (tabs.some((tab) => tab.id === event.detail)) {
        setActiveTab(event.detail)
      }
    }

    window.addEventListener('nossa-air-service-tab', handleServiceTab)
    return () => window.removeEventListener('nossa-air-service-tab', handleServiceTab)
  }, [])

  useEffect(() => {
    if (!profile) {
      return
    }

    setContact((current) => ({
      ...current,
      email: profile.email || current.email,
      phone: profile.phone || current.phone,
      cpf: formatCpf(profile.cpf || current.cpf),
    }))
    setHotelForm((current) => ({ ...current, email: profile.email || current.email }))
    setCargoForm((current) => ({ ...current, email: profile.email || current.email }))
    setDestinationForm((current) => ({ ...current, email: profile.email || current.email }))
    setStopoverForm((current) => ({ ...current, email: profile.email || current.email }))
  }, [profile])

  useEffect(() => {
    if (!currentUser) {
      return
    }

    const storedPurchase = window.sessionStorage.getItem(PENDING_PURCHASE_KEY)

    if (!storedPurchase) {
      return
    }

    try {
      const pendingPurchase = JSON.parse(storedPurchase)

      if (!pendingPurchase?.offer || !pendingPurchase?.flightForm) {
        return
      }

      setActiveTab('passagens')
      setFlightForm(pendingPurchase.flightForm)
      setSelectedOffer(pendingPurchase.offer)
      setReservation(null)
      setPassengerDrafts(
        Array.from({ length: pendingPurchase.offer.passengerCount }, (_, index) =>
          getBlankPassenger(profile, index)
        )
      )
      setFlightNotice('Tarifa recuperada. Confirme os passageiros para concluir a emissao.')
    } catch {
      setFlightNotice('Nao foi possivel recuperar a tarifa selecionada anteriormente.')
    } finally {
      window.sessionStorage.removeItem(PENDING_PURCHASE_KEY)
    }
  }, [currentUser, profile])

  function handleFlightChange(event) {
    const { name, value, type, checked } = event.target
    setFlightForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleFlightSubmit(event) {
    event.preventDefault()
    setFlightNotice('')
    setReservation(null)
    setSelectedOffer(null)
    setFlightResults([])

    if (!flightForm.departureDate) {
      setFlightNotice('Escolha a data de partida para consultar disponibilidade.')
      return
    }

    if (flightForm.origin === flightForm.destination) {
      setFlightNotice('Origem e destino precisam ser diferentes.')
      return
    }

    if (flightForm.roundTrip && !flightForm.returnDate) {
      setFlightNotice('Informe a data de retorno ou desmarque ida e volta.')
      return
    }

    if (
      flightForm.roundTrip &&
      new Date(`${flightForm.returnDate}T12:00:00`) <
        new Date(`${flightForm.departureDate}T12:00:00`)
    ) {
      setFlightNotice('A data de retorno precisa ser posterior a data de partida.')
      return
    }

    setIsSearching(true)

    try {
      const offers = await searchFlightOffers(flightForm)
      setFlightResults(offers)
      setFlightNotice(
        `Disponibilidade encontrada entre ${getAirportLabel(airportOptions, flightForm.origin)} e ${getAirportLabel(airportOptions, flightForm.destination)}.`
      )
    } catch {
      setFlightNotice('Nao foi possivel consultar disponibilidade agora.')
    } finally {
      setIsSearching(false)
    }
  }

  function handleSelectOffer(offer) {
    if (!currentUser) {
      window.sessionStorage.setItem(
        PENDING_PURCHASE_KEY,
        JSON.stringify({
          flightForm,
          offer,
        })
      )
      window.sessionStorage.setItem('nossa-air-service-tab', 'passagens')
      window.sessionStorage.setItem('nossa-air-scroll-target', 'reserva')
      navigate('/login', {
        state: {
          from: '/',
          intent: 'complete-purchase',
        },
      })
      return
    }

    setSelectedOffer(offer)
    setReservation(null)
    setPassengerDrafts(
      Array.from({ length: offer.passengerCount }, (_, index) =>
        getBlankPassenger(profile, index)
      )
    )
    setFlightNotice('Tarifa selecionada. Confirme os passageiros para emitir a reserva.')
  }

  function updatePassenger(index, field, value) {
    setPassengerDrafts((current) =>
      current.map((passenger, passengerIndex) =>
        passengerIndex === index ? { ...passenger, [field]: value } : passenger
      )
    )
  }

  async function handleReservationSubmit(event) {
    event.preventDefault()
    setFlightNotice('')

    if (!currentUser) {
      setFlightNotice('Entre ou crie uma conta para emitir a reserva com localizador.')
      return
    }

    const invalidPassenger = passengerDrafts.some(
      (passenger) =>
        !passenger.firstName ||
        !passenger.lastName ||
        normalizeCpf(passenger.cpf).length !== 11
    )

    if (invalidPassenger || !contact.email) {
      setFlightNotice('Preencha nome, sobrenome, CPF dos passageiros e e-mail de contato.')
      return
    }

    setIsIssuing(true)

    try {
      const createdReservation = await createReservation({
        user: currentUser,
        profile,
        contact,
        passengers: passengerDrafts,
        offer: selectedOffer,
      })
      setReservation(createdReservation)
      setFlightNotice('Reserva emitida com sucesso. Guarde o localizador para check-in.')
    } catch {
      setFlightNotice('Nao foi possivel emitir a reserva agora.')
    } finally {
      setIsIssuing(false)
    }
  }

  async function handleLookupSubmit(event) {
    event.preventDefault()
    setLookupNotice('')
    setLookupReservation(null)

    const foundReservation = await getReservationByLocator(lookupForm.locator)

    if (!foundReservation) {
      setLookupNotice('Reserva nao encontrada para este localizador.')
      return
    }

    if (!credentialMatchesReservation(foundReservation, lookupForm.credential)) {
      setLookupNotice('CPF ou sobrenome nao corresponde a reserva.')
      return
    }

    setLookupReservation(foundReservation)
    setLookupNotice('Reserva localizada.')
  }

  async function handleHotelSubmit(event) {
    event.preventDefault()
    const request = await createHotelRequest({
      ...hotelForm,
      userId: currentUser?.uid || profile?.uid || null,
    })
    setHotelNotice(
      `Solicitacao ${request.id} registrada para ${hotelForm.city}, check-in em ${formatDate(hotelForm.checkIn)}.`
    )
  }

  async function handleStopoverSubmit(event) {
    event.preventDefault()
    const request = await createStopoverRequest({
      ...stopoverForm,
      userId: currentUser?.uid || profile?.uid || null,
    })
    setStopoverNotice(
      `Stopover ${request.id} solicitado em ${stopoverForm.city} por ${stopoverForm.nights} noite(s).`
    )
  }

  function handleMilesSubmit(event) {
    event.preventDefault()
    const estimate = estimateMiles(milesForm)

    setMilesNotice(
      `${formatMiles(estimate)} estimadas para ${getAirportLabel(airportOptions, milesForm.origin)} -> ${getAirportLabel(airportOptions, milesForm.destination)}.`
    )
  }

  async function handleCargoSubmit(event) {
    event.preventDefault()
    const request = await createCargoQuote({
      ...cargoForm,
      userId: currentUser?.uid || profile?.uid || null,
    })
    setCargoNotice(
      `Cotacao ${request.id} registrada para ${cargoForm.weight}kg entre ${getAirportLabel(airportOptions, cargoForm.origin)} e ${getAirportLabel(airportOptions, cargoForm.destination)}.`
    )
  }

  async function handleDestinationSubmit(event) {
    event.preventDefault()
    const request = await createDestinationLead({
      ...destinationForm,
      userId: currentUser?.uid || profile?.uid || null,
    })
    const suggestions = destinationProfiles[destinationForm.vibe].join(', ')
    setDestinationNotice(
      `Preferencia ${request.id} registrada. Para ${destinationForm.vibe}, sugerimos ${suggestions}.`
    )
  }

  return (
    <section id="reserva" className={ui.sectionBlock}>
      <div className={ui.sectionHeading}>
        <span className={ui.eyebrow}>Reservas e servicos</span>
        <h2 className={`${ui.sectionTitle} mt-4`}>
          Planeje, emita e acompanhe sua viagem pela Nossa Air.
        </h2>
        <p className={`${ui.bodyText} mt-4`}>
          Busque voos, confirme passageiros, consulte localizadores, realize check-in
          e registre servicos adicionais em uma jornada integrada.
        </p>
      </div>

      <div className={ui.bookingShell}>
        <div
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8"
          role="tablist"
          aria-label="Servicos da Nossa Air"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cx(ui.tabButton, activeTab === tab.id && ui.tabButtonActive)}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'passagens' && (
          <article className={`${ui.bookingCard} mt-5`}>
            <div className={ui.cardHeader}>
              <div>
                <span className={ui.cardKicker}>Reserva aerea</span>
                <h3 className="mt-2 font-display text-[1.45rem]">
                  Escolha trecho, tarifa e passageiros.
                </h3>
              </div>
              <span className={ui.pill}>Emissao com localizador</span>
            </div>

            <form className={ui.formGrid} onSubmit={handleFlightSubmit}>
              <label className={ui.field}>
                <span className={ui.labelText}>Origem</span>
                <select
                  className={ui.input}
                  name="origin"
                  value={flightForm.origin}
                  onChange={handleFlightChange}
                >
                  {renderAirportOptions()}
                </select>
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Destino</span>
                <select
                  className={ui.input}
                  name="destination"
                  value={flightForm.destination}
                  onChange={handleFlightChange}
                >
                  {renderAirportOptions()}
                </select>
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Data de partida</span>
                <input
                  className={ui.input}
                  name="departureDate"
                  type="date"
                  value={flightForm.departureDate}
                  onChange={handleFlightChange}
                />
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Passageiros</span>
                <input
                  className={ui.input}
                  name="passengers"
                  type="number"
                  min="1"
                  max="9"
                  value={flightForm.passengers}
                  onChange={handleFlightChange}
                />
              </label>

              <label className={cx(ui.checkboxField, ui.fieldSpan2)}>
                <input
                  className={ui.checkbox}
                  name="roundTrip"
                  type="checkbox"
                  checked={flightForm.roundTrip}
                  onChange={handleFlightChange}
                />
                <span>Quero ida e volta</span>
              </label>

              {flightForm.roundTrip && (
                <label className={ui.field}>
                  <span className={ui.labelText}>Data de retorno</span>
                  <input
                    className={ui.input}
                    name="returnDate"
                    type="date"
                    value={flightForm.returnDate}
                    onChange={handleFlightChange}
                  />
                </label>
              )}

              <div className={cx(ui.formActions, ui.fieldSpan2)}>
                <button className={ui.primaryButton} type="submit" disabled={isSearching}>
                  {isSearching ? 'Buscando...' : 'Buscar voos'}
                </button>
              </div>
            </form>

            {flightNotice && <p className={ui.statusBanner}>{flightNotice}</p>}

            {flightResults.length > 0 && (
              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                {flightResults.map((offer) => (
                  <article
                    key={offer.id}
                    className="grid gap-3 rounded-[1.35rem] border border-ink/8 bg-white/72 p-5 shadow-[0_16px_34px_rgba(26,42,34,0.08)]"
                  >
                    <div>
                      <strong className="block text-[1.08rem]">{offer.fare.name}</strong>
                      <p className={`${ui.bodyText} mt-2`}>{offer.fare.description}</p>
                    </div>
                    <p className={ui.bodyText}>
                      {offer.outbound.flightNumber} · {offer.outbound.departureTime} -{' '}
                      {offer.outbound.arrivalTime}
                    </p>
                    {offer.returnFlight && (
                      <p className={ui.bodyText}>
                        Volta {offer.returnFlight.flightNumber} ·{' '}
                        {offer.returnFlight.departureTime} - {offer.returnFlight.arrivalTime}
                      </p>
                    )}
                    <p className={ui.bodyText}>{offer.fare.baggage}</p>
                    <span className="text-[1.15rem] font-extrabold text-forest-dark">
                      {formatCurrency(offer.totalPrice)}
                    </span>
                    <button
                      className={ui.ghostButton}
                      type="button"
                      onClick={() => handleSelectOffer(offer)}
                    >
                      Selecionar tarifa
                    </button>
                  </article>
                ))}
              </div>
            )}

            {selectedOffer && !reservation && (
              <form
                className="mt-6 rounded-[1.55rem] border border-ink/8 bg-white/72 p-5"
                onSubmit={handleReservationSubmit}
              >
                <div className={ui.cardHeader}>
                  <div>
                    <span className={ui.cardKicker}>Passageiros</span>
                    <h3 className="mt-2 font-display text-[1.45rem]">
                      Dados para emissao da reserva
                    </h3>
                  </div>
                  <strong className="text-[1.08rem]">
                    {formatCurrency(selectedOffer.totalPrice)}
                  </strong>
                </div>

                {currentUser && (
                  <>
                    <div className="mt-5 grid gap-4">
                      {passengerDrafts.map((passenger, index) => (
                        <fieldset
                          key={index}
                          className="grid gap-4 rounded-[1.35rem] border border-ink/8 bg-[rgba(255,248,238,0.9)] p-5 md:grid-cols-2"
                        >
                          <legend className="mb-2 block font-display text-[1.1rem] text-forest-dark">
                            Passageiro {index + 1}
                          </legend>
                          <label className={ui.field}>
                            <span className={ui.labelText}>Nome</span>
                            <input
                              className={ui.input}
                              value={passenger.firstName}
                              onChange={(event) =>
                                updatePassenger(index, 'firstName', event.target.value)
                              }
                            />
                          </label>
                          <label className={ui.field}>
                            <span className={ui.labelText}>Sobrenome</span>
                            <input
                              className={ui.input}
                              value={passenger.lastName}
                              onChange={(event) =>
                                updatePassenger(index, 'lastName', event.target.value)
                              }
                            />
                          </label>
                          <label className={ui.field}>
                            <span className={ui.labelText}>CPF</span>
                            <input
                              className={ui.input}
                              inputMode="numeric"
                              value={passenger.cpf}
                              onChange={(event) =>
                                updatePassenger(index, 'cpf', formatCpf(event.target.value))
                              }
                            />
                          </label>
                          <label className={ui.field}>
                            <span className={ui.labelText}>Data de nascimento</span>
                            <input
                              className={ui.input}
                              type="date"
                              value={passenger.birthDate}
                              onChange={(event) =>
                                updatePassenger(index, 'birthDate', event.target.value)
                              }
                            />
                          </label>
                        </fieldset>
                      ))}
                    </div>

                    <div className={`${ui.formGrid} mt-5`}>
                      <label className={ui.field}>
                        <span className={ui.labelText}>E-mail de contato</span>
                        <input
                          className={ui.input}
                          type="email"
                          value={contact.email}
                          onChange={(event) =>
                            setContact((current) => ({ ...current, email: event.target.value }))
                          }
                        />
                      </label>
                      <label className={ui.field}>
                        <span className={ui.labelText}>Telefone</span>
                        <input
                          className={ui.input}
                          value={contact.phone}
                          onChange={(event) =>
                            setContact((current) => ({ ...current, phone: event.target.value }))
                          }
                        />
                      </label>
                    </div>

                    <button
                      className={`${ui.primaryButton} mt-5`}
                      type="submit"
                      disabled={isIssuing}
                    >
                      {isIssuing ? 'Emitindo...' : 'Confirmar e emitir'}
                    </button>
                  </>
                )}
              </form>
            )}

            {reservation && (
              <div className="mt-6 rounded-[1.6rem] border border-forest/18 bg-[linear-gradient(135deg,rgba(43,107,81,0.14),rgba(240,199,94,0.18)),rgba(255,255,255,0.82)] p-6 shadow-soft">
                <span className={ui.eyebrow}>Reserva emitida</span>
                <h3 className="mt-4 font-display text-[1.7rem]">
                  Localizador {reservation.locator}
                </h3>
                <p className={`${ui.bodyText} mt-4`}>
                  Bilhete confirmado para {reservation.offer.outbound.origin}
                  {' -> '}
                  {reservation.offer.outbound.destination} em{' '}
                  {formatDate(reservation.offer.outbound.date)}.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link className={ui.primaryButton} to={`/reserva/${reservation.locator}`}>
                    Ver reserva
                  </Link>
                  <Link className={ui.ghostButton} to="/check-in">
                    Fazer check-in
                  </Link>
                </div>
              </div>
            )}
          </article>
        )}

        {activeTab === 'minhas-reservas' && (
          <article className={`${ui.bookingCard} mt-5`}>
            <div className={ui.cardHeader}>
              <div>
                <span className={ui.cardKicker}>Consulta de reserva</span>
                <h3 className="mt-2 font-display text-[1.45rem]">
                  Localize uma viagem pelo codigo da reserva.
                </h3>
              </div>
              <Link className={ui.ghostButton} to="/portal">
                Abrir portal
              </Link>
            </div>

            <form className={ui.formGrid} onSubmit={handleLookupSubmit}>
              <label className={ui.field}>
                <span className={ui.labelText}>Localizador</span>
                <input
                  className={ui.input}
                  value={lookupForm.locator}
                  maxLength="6"
                  placeholder="ABC123"
                  onChange={(event) =>
                    setLookupForm((current) => ({
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
                  value={lookupForm.credential}
                  placeholder="CPF ou ultimo sobrenome"
                  onChange={(event) =>
                    setLookupForm((current) => ({ ...current, credential: event.target.value }))
                  }
                />
              </label>

              <div className={cx(ui.formActions, ui.fieldSpan2)}>
                <button className={ui.primaryButton} type="submit">
                  Consultar
                </button>
              </div>
            </form>

            {lookupNotice && <p className={ui.statusBanner}>{lookupNotice}</p>}

            {lookupReservation && (
              <div className={`${ui.staticReservationCard} mt-4`}>
                <div>
                  <span className={ui.cardKicker}>{lookupReservation.locator}</span>
                  <strong className="mt-2 block text-[1.08rem]">
                    {lookupReservation.offer.outbound.origin}
                    {' -> '}
                    {lookupReservation.offer.outbound.destination}
                  </strong>
                  <p className={`${ui.bodyText} mt-2`}>
                    {formatDate(lookupReservation.offer.outbound.date)} ·{' '}
                    {lookupReservation.offer.outbound.flightNumber}
                  </p>
                </div>
                <Link className={ui.ghostButton} to={`/reserva/${lookupReservation.locator}`}>
                  Ver detalhes
                </Link>
              </div>
            )}
          </article>
        )}

        {activeTab === 'checkin' && (
          <div className="mt-5">
            <CheckInFlow
              embedded
              title="Faca check-in com localizador e documento"
              description="Validamos a reserva antes de emitir assento, portao e grupo de embarque."
            />
          </div>
        )}

        {activeTab === 'stopover' && (
          <article className={`${ui.bookingCard} mt-5`}>
            <div className={ui.cardHeader}>
              <div>
                <span className={ui.cardKicker}>Conexao que vira viagem</span>
                <h3 className="mt-2 font-display text-[1.45rem]">
                  Solicite uma parada estrategica entre trechos.
                </h3>
              </div>
              <span className={ui.pill}>Analise em ate 24h</span>
            </div>

            <form className={ui.formGrid} onSubmit={handleStopoverSubmit}>
              <label className={ui.field}>
                <span className={ui.labelText}>Localizador</span>
                <input
                  className={ui.input}
                  value={stopoverForm.locator}
                  maxLength="6"
                  placeholder="Opcional"
                  onChange={(event) =>
                    setStopoverForm((current) => ({
                      ...current,
                      locator: normalizeLocator(event.target.value),
                    }))
                  }
                />
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Cidade stopover</span>
                <select
                  className={ui.input}
                  value={stopoverForm.city}
                  onChange={(event) =>
                    setStopoverForm((current) => ({ ...current, city: event.target.value }))
                  }
                >
                  {stopoverCities.map((city) => (
                    <option key={city.code} value={city.city}>
                      {city.city}
                    </option>
                  ))}
                </select>
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Noites</span>
                <input
                  className={ui.input}
                  type="number"
                  min="1"
                  max="5"
                  value={stopoverForm.nights}
                  onChange={(event) =>
                    setStopoverForm((current) => ({ ...current, nights: event.target.value }))
                  }
                />
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Data preferencial</span>
                <input
                  className={ui.input}
                  type="date"
                  value={stopoverForm.preferredDate}
                  onChange={(event) =>
                    setStopoverForm((current) => ({
                      ...current,
                      preferredDate: event.target.value,
                    }))
                  }
                />
              </label>

              <label className={cx(ui.field, ui.fieldSpan2)}>
                <span className={ui.labelText}>E-mail</span>
                <input
                  className={ui.input}
                  type="email"
                  value={stopoverForm.email}
                  onChange={(event) =>
                    setStopoverForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>

              <div className={cx(ui.formActions, ui.fieldSpan2)}>
                <button className={ui.primaryButton} type="submit">
                  Solicitar stopover
                </button>
              </div>
            </form>

            {stopoverNotice && <p className={ui.statusBanner}>{stopoverNotice}</p>}
          </article>
        )}

        {activeTab === 'hoteis' && (
          <article className={`${ui.bookingCard} mt-5`}>
            <div className={ui.cardHeader}>
              <div>
                <span className={ui.cardKicker}>Hospedagem</span>
                <h3 className="mt-2 font-display text-[1.45rem]">
                  Peca uma curadoria de hotel para sua viagem.
                </h3>
              </div>
              <span className={ui.pill}>Parceiros selecionados</span>
            </div>

            <form className={ui.formGrid} onSubmit={handleHotelSubmit}>
              <label className={ui.field}>
                <span className={ui.labelText}>Destino</span>
                <select
                  className={ui.input}
                  value={hotelForm.city}
                  onChange={(event) =>
                    setHotelForm((current) => ({ ...current, city: event.target.value }))
                  }
                >
                  {hotelCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Check-in</span>
                <input
                  className={ui.input}
                  type="date"
                  value={hotelForm.checkIn}
                  onChange={(event) =>
                    setHotelForm((current) => ({ ...current, checkIn: event.target.value }))
                  }
                />
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Check-out</span>
                <input
                  className={ui.input}
                  type="date"
                  value={hotelForm.checkOut}
                  onChange={(event) =>
                    setHotelForm((current) => ({ ...current, checkOut: event.target.value }))
                  }
                />
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Hospedes</span>
                <input
                  className={ui.input}
                  type="number"
                  min="1"
                  max="8"
                  value={hotelForm.guests}
                  onChange={(event) =>
                    setHotelForm((current) => ({ ...current, guests: event.target.value }))
                  }
                />
              </label>

              <label className={cx(ui.field, ui.fieldSpan2)}>
                <span className={ui.labelText}>E-mail</span>
                <input
                  className={ui.input}
                  type="email"
                  value={hotelForm.email}
                  onChange={(event) =>
                    setHotelForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>

              <div className={cx(ui.formActions, ui.fieldSpan2)}>
                <button className={ui.primaryButton} type="submit">
                  Solicitar hospedagem
                </button>
              </div>
            </form>

            {hotelNotice && <p className={ui.statusBanner}>{hotelNotice}</p>}
          </article>
        )}

        {activeTab === 'milhas' && (
          <article className={`${ui.bookingCard} mt-5`}>
            <div className={ui.cardHeader}>
              <div>
                <span className={ui.cardKicker}>Programa Nossa+</span>
                <h3 className="mt-2 font-display text-[1.45rem]">
                  Calcule milhas estimadas para sua proxima viagem.
                </h3>
              </div>
              <span className={ui.pill}>Saldo informativo</span>
            </div>

            <form className={ui.formGrid} onSubmit={handleMilesSubmit}>
              <label className={ui.field}>
                <span className={ui.labelText}>Origem</span>
                <select
                  className={ui.input}
                  value={milesForm.origin}
                  onChange={(event) =>
                    setMilesForm((current) => ({ ...current, origin: event.target.value }))
                  }
                >
                  {renderAirportOptions()}
                </select>
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Destino</span>
                <select
                  className={ui.input}
                  value={milesForm.destination}
                  onChange={(event) =>
                    setMilesForm((current) => ({ ...current, destination: event.target.value }))
                  }
                >
                  {renderAirportOptions()}
                </select>
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Cabine</span>
                <select
                  className={ui.input}
                  value={milesForm.cabin}
                  onChange={(event) =>
                    setMilesForm((current) => ({ ...current, cabin: event.target.value }))
                  }
                >
                  <option value="economica">Economica</option>
                  <option value="executiva">Executiva</option>
                  <option value="premium">Premium</option>
                </select>
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Passageiros</span>
                <input
                  className={ui.input}
                  type="number"
                  min="1"
                  max="6"
                  value={milesForm.passengers}
                  onChange={(event) =>
                    setMilesForm((current) => ({ ...current, passengers: event.target.value }))
                  }
                />
              </label>

              <div className={cx(ui.formActions, ui.fieldSpan2)}>
                <button className={ui.primaryButton} type="submit">
                  Calcular milhas
                </button>
              </div>
            </form>

            {milesNotice && <p className={ui.statusBanner}>{milesNotice}</p>}
          </article>
        )}

        {activeTab === 'carga' && (
          <article className={`${ui.bookingCard} mt-5`}>
            <div className={ui.cardHeader}>
              <div>
                <span className={ui.cardKicker}>Nossa Carga</span>
                <h3 className="mt-2 font-display text-[1.45rem]">
                  Solicite cotacao para transporte regional.
                </h3>
              </div>
              <span className={ui.pill}>Resposta por e-mail</span>
            </div>

            <form className={ui.formGrid} onSubmit={handleCargoSubmit}>
              <label className={ui.field}>
                <span className={ui.labelText}>Origem</span>
                <select
                  className={ui.input}
                  value={cargoForm.origin}
                  onChange={(event) =>
                    setCargoForm((current) => ({ ...current, origin: event.target.value }))
                  }
                >
                  {renderAirportOptions()}
                </select>
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Destino</span>
                <select
                  className={ui.input}
                  value={cargoForm.destination}
                  onChange={(event) =>
                    setCargoForm((current) => ({ ...current, destination: event.target.value }))
                  }
                >
                  {renderAirportOptions()}
                </select>
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Data desejada</span>
                <input
                  className={ui.input}
                  type="date"
                  value={cargoForm.date}
                  onChange={(event) =>
                    setCargoForm((current) => ({ ...current, date: event.target.value }))
                  }
                />
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Peso estimado (kg)</span>
                <input
                  className={ui.input}
                  type="number"
                  min="1"
                  value={cargoForm.weight}
                  onChange={(event) =>
                    setCargoForm((current) => ({ ...current, weight: event.target.value }))
                  }
                />
              </label>

              <label className={cx(ui.field, ui.fieldSpan2)}>
                <span className={ui.labelText}>E-mail de contato</span>
                <input
                  className={ui.input}
                  type="email"
                  placeholder="cargas@nossaair.com"
                  value={cargoForm.email}
                  onChange={(event) =>
                    setCargoForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>

              <div className={cx(ui.formActions, ui.fieldSpan2)}>
                <button className={ui.primaryButton} type="submit">
                  Solicitar cotacao
                </button>
              </div>
            </form>

            {cargoNotice && <p className={ui.statusBanner}>{cargoNotice}</p>}
          </article>
        )}

        {activeTab === 'destinos' && (
          <article className={`${ui.bookingCard} mt-5`}>
            <div className={ui.cardHeader}>
              <div>
                <span className={ui.cardKicker}>Descoberta de roteiros</span>
                <h3 className="mt-2 font-display text-[1.45rem]">
                  Receba ideias de destinos pelo perfil da viagem.
                </h3>
              </div>
              <span className={ui.pill}>Curadoria Nossa Air</span>
            </div>

            <form className={ui.formGrid} onSubmit={handleDestinationSubmit}>
              <label className={ui.field}>
                <span className={ui.labelText}>Estilo da viagem</span>
                <select
                  className={ui.input}
                  value={destinationForm.vibe}
                  onChange={(event) =>
                    setDestinationForm((current) => ({ ...current, vibe: event.target.value }))
                  }
                >
                  <option value="praia">Praia</option>
                  <option value="cultura">Cultura</option>
                  <option value="natureza">Natureza</option>
                  <option value="negocios">Negocios</option>
                </select>
              </label>

              <label className={ui.field}>
                <span className={ui.labelText}>Mes de interesse</span>
                <select
                  className={ui.input}
                  value={destinationForm.month}
                  onChange={(event) =>
                    setDestinationForm((current) => ({ ...current, month: event.target.value }))
                  }
                >
                  <option value="julho">Julho</option>
                  <option value="setembro">Setembro</option>
                  <option value="dezembro">Dezembro</option>
                  <option value="marco">Marco</option>
                </select>
              </label>

              <label className={cx(ui.field, ui.fieldSpan2)}>
                <span className={ui.labelText}>E-mail</span>
                <input
                  className={ui.input}
                  type="email"
                  value={destinationForm.email}
                  onChange={(event) =>
                    setDestinationForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>

              <div className={cx(ui.formActions, ui.fieldSpan2)}>
                <button className={ui.primaryButton} type="submit">
                  Descobrir destinos
                </button>
              </div>
            </form>

            {destinationNotice && <p className={ui.statusBanner}>{destinationNotice}</p>}
          </article>
        )}
      </div>
    </section>
  )
}
