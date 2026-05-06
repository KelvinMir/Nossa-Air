import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import {
  airportOptions,
  destinationProfiles,
  fareFamilies,
  flightSchedule,
} from '../data'
import { db } from '../lib/firebase'
import {
  generateLocator,
  generateTicketNumber,
  normalizeComparable,
  normalizeCpf,
  normalizeLocator,
} from '../utils/formatters'

const LOCAL_KEYS = {
  reservations: 'nossa-air-reservations',
  checkIns: 'nossa-air-check-ins',
  cargoQuotes: 'nossa-air-cargo-quotes',
  stopoverRequests: 'nossa-air-stopover-requests',
  hotelRequests: 'nossa-air-hotel-requests',
  destinationLeads: 'nossa-air-destination-leads',
}

function readLocalJson(key, fallback = []) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function writeLocalJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function now() {
  return new Date().toISOString()
}

async function listFirestoreCollection(collectionName) {
  if (!db) {
    return []
  }

  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((item) => ({
    id: item.id,
    storageMode: 'firebase',
    ...item.data(),
  }))
}

async function saveDocument(collectionName, localKey, data) {
  if (db) {
    try {
      const reference = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return {
        ...data,
        id: reference.id,
        storageMode: 'firebase',
      }
    } catch (error) {
      console.warn(`Nossa Air: salvando ${collectionName} em modo local.`, error)
    }
  }

  const records = readLocalJson(localKey)
  const localRecord = {
    ...data,
    id: `${collectionName}-${Date.now()}`,
    storageMode: db ? 'local-fallback' : 'local',
    createdAt: now(),
    updatedAt: now(),
  }

  writeLocalJson(localKey, [localRecord, ...records])
  return localRecord
}

async function updateReservationRecord(reservation, changes) {
  const updated = {
    ...reservation,
    ...changes,
    updatedAt: now(),
  }

  if (reservation.storageMode === 'firebase' && db && reservation.id) {
    await updateDoc(doc(db, 'reservations', reservation.id), {
      ...changes,
      updatedAt: serverTimestamp(),
    })
    return updated
  }

  const reservations = readLocalJson(LOCAL_KEYS.reservations)
  writeLocalJson(
    LOCAL_KEYS.reservations,
    reservations.map((item) => (item.id === reservation.id ? updated : item))
  )

  return updated
}

function withCatalogDefaults(collectionName, fallback) {
  return listFirestoreCollection(collectionName)
    .then((items) => (items.length > 0 ? items : fallback))
    .catch(() => fallback)
}

export async function getCatalogData() {
  const [airports, flights, fares] = await Promise.all([
    withCatalogDefaults('airports', airportOptions),
    withCatalogDefaults('flights', flightSchedule),
    withCatalogDefaults('fares', fareFamilies),
  ])

  return {
    airports,
    flights,
    fares,
    usingSeedCatalog:
      airports === airportOptions || flights === flightSchedule || fares === fareFamilies,
  }
}

function getRouteFactor(origin, destination) {
  const originIndex = airportOptions.findIndex((airport) => airport.code === origin)
  const destinationIndex = airportOptions.findIndex((airport) => airport.code === destination)
  return Math.abs(originIndex - destinationIndex) + 1
}

function buildSyntheticFlight(origin, destination, index = 0) {
  const departureTimes = ['06:10', '12:35', '19:05']
  const arrivalTimes = ['08:00', '14:25', '20:55']
  const routeFactor = getRouteFactor(origin, destination)

  return {
    id: `NA-${origin}-${destination}-${index}`,
    flightNumber: `NA ${3100 + routeFactor * 10 + index}`,
    origin,
    destination,
    departureTime: departureTimes[index],
    arrivalTime: arrivalTimes[index],
    duration: routeFactor > 5 ? '2h20' : '1h35',
    aircraft: routeFactor > 5 ? 'Airbus A220-300' : 'Embraer E190-E2',
    basePrice: 245 + routeFactor * 38 + index * 34,
  }
}

function buildFlightCandidates(flights, origin, destination) {
  const directFlights = flights.filter(
    (flight) => flight.origin === origin && flight.destination === destination
  )

  if (directFlights.length >= 3) {
    return directFlights.slice(0, 3)
  }

  return [
    ...directFlights,
    ...Array.from({ length: 3 - directFlights.length }, (_, index) =>
      buildSyntheticFlight(origin, destination, index + directFlights.length)
    ),
  ]
}

function getDateDemandFactor(date) {
  if (!date) {
    return 1
  }

  const travelDate = new Date(`${date}T12:00:00`)
  const month = travelDate.getMonth()
  const day = travelDate.getDay()
  const highSeason = [0, 6, 11].includes(month)
  const weekend = day === 0 || day === 5 || day === 6

  return (highSeason ? 1.18 : 1) * (weekend ? 1.08 : 1)
}

function buildOffer({ outbound, returnFlight, fare, form, index }) {
  const passengerCount = Number(form.passengers || 1)
  const outboundPrice = outbound.basePrice * getDateDemandFactor(form.departureDate)
  const returnPrice = returnFlight
    ? returnFlight.basePrice * getDateDemandFactor(form.returnDate)
    : 0
  const subtotal = (outboundPrice + returnPrice) * fare.multiplier * passengerCount
  const taxes = Math.round((64 + passengerCount * 22) * (returnFlight ? 1.6 : 1))
  const totalPrice = Math.round(subtotal + taxes)

  return {
    id: `${outbound.id}-${returnFlight?.id || 'oneway'}-${fare.id}`,
    fare,
    outbound: {
      ...outbound,
      date: form.departureDate,
    },
    returnFlight: returnFlight
      ? {
          ...returnFlight,
          date: form.returnDate,
        }
      : null,
    passengerCount,
    totalPrice,
    taxes,
    milesEarned: Math.round(totalPrice * (fare.id === 'conforto' ? 1.4 : fare.id === 'flex' ? 1.15 : 1)),
    paymentLabel: 'Emissao simulada aprovada na confirmacao',
    sortOrder: index,
  }
}

export async function searchFlightOffers(form) {
  const catalog = await getCatalogData()
  const outboundFlights = buildFlightCandidates(catalog.flights, form.origin, form.destination)
  const returnFlights = form.roundTrip
    ? buildFlightCandidates(catalog.flights, form.destination, form.origin)
    : []

  return catalog.fares.map((fare, index) =>
    buildOffer({
      outbound: outboundFlights[index % outboundFlights.length],
      returnFlight: form.roundTrip ? returnFlights[index % returnFlights.length] : null,
      fare,
      form,
      index,
    })
  )
}

export async function createReservation({ user, profile, contact, passengers, offer }) {
  const passengerRecords = passengers.map((passenger, index) => ({
    ...passenger,
    cpf: normalizeCpf(passenger.cpf),
    ticketNumber: generateTicketNumber(index),
  }))

  const reservation = {
    locator: generateLocator(),
    userId: user?.uid || profile?.uid || null,
    userEmail: user?.email || profile?.email || contact.email,
    contact: {
      ...contact,
      cpf: normalizeCpf(contact.cpf),
    },
    passengers: passengerRecords,
    offer,
    status: 'confirmed',
    payment: {
      method: 'emissao-simulada',
      status: 'approved',
      capturedAmount: offer.totalPrice,
    },
    milesEarned: offer.milesEarned,
  }

  return saveDocument('reservations', LOCAL_KEYS.reservations, reservation)
}

export async function getReservationByLocator(locator) {
  const normalizedLocator = normalizeLocator(locator)

  if (!normalizedLocator) {
    return null
  }

  if (db) {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'reservations'), where('locator', '==', normalizedLocator))
      )

      if (!snapshot.empty) {
        const document = snapshot.docs[0]
        return {
          id: document.id,
          storageMode: 'firebase',
          ...document.data(),
        }
      }
    } catch (error) {
      console.warn('Nossa Air: consulta por localizador caiu para modo local.', error)
    }
  }

  return (
    readLocalJson(LOCAL_KEYS.reservations).find(
      (reservation) => reservation.locator === normalizedLocator
    ) || null
  )
}

export async function getUserReservations(userId, email) {
  if (!userId && !email) {
    return []
  }

  if (db && userId) {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'reservations'), where('userId', '==', userId))
      )

      return snapshot.docs.map((document) => ({
        id: document.id,
        storageMode: 'firebase',
        ...document.data(),
      }))
    } catch (error) {
      console.warn('Nossa Air: listagem de reservas caiu para modo local.', error)
    }
  }

  return readLocalJson(LOCAL_KEYS.reservations).filter(
    (reservation) => reservation.userId === userId || reservation.userEmail === email
  )
}

export async function performCheckIn({ locator, credential }) {
  const reservation = await getReservationByLocator(locator)

  if (!reservation) {
    throw new Error('Reserva nao encontrada. Confira o localizador informado.')
  }

  const normalizedCredential = normalizeCpf(credential)
  const comparableCredential = normalizeComparable(credential)
  const passengerMatches = reservation.passengers.some((passenger) => {
    const cpfMatches = normalizedCredential && normalizeCpf(passenger.cpf) === normalizedCredential
    const lastNameMatches =
      comparableCredential &&
      normalizeComparable(passenger.lastName).includes(comparableCredential)

    return cpfMatches || lastNameMatches
  })

  if (!passengerMatches) {
    throw new Error('CPF ou sobrenome nao corresponde aos passageiros da reserva.')
  }

  if (reservation.status === 'checked_in') {
    return {
      reservation,
      boardingPasses: buildBoardingPasses(reservation),
      alreadyCheckedIn: true,
    }
  }

  const checkedInAt = now()
  const boardingPasses = buildBoardingPasses(reservation)
  const updatedReservation = await updateReservationRecord(reservation, {
    status: 'checked_in',
    checkedInAt,
    boardingPasses,
  })

  await saveDocument('checkIns', LOCAL_KEYS.checkIns, {
    locator: reservation.locator,
    reservationId: reservation.id,
    userId: reservation.userId,
    checkedInAt,
    boardingPasses,
  })

  return {
    reservation: updatedReservation,
    boardingPasses,
    alreadyCheckedIn: false,
  }
}

function buildBoardingPasses(reservation) {
  const seats = ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C']

  return reservation.passengers.map((passenger, index) => ({
    passengerName: `${passenger.firstName} ${passenger.lastName}`,
    ticketNumber: passenger.ticketNumber,
    seat: seats[index % seats.length],
    gate: `B${2 + index}`,
    group: index < 2 ? 'Grupo 1' : 'Grupo 2',
    flightNumber: reservation.offer.outbound.flightNumber,
    origin: reservation.offer.outbound.origin,
    destination: reservation.offer.outbound.destination,
    departureDate: reservation.offer.outbound.date,
    departureTime: reservation.offer.outbound.departureTime,
  }))
}

export async function createStopoverRequest(data) {
  return saveDocument('stopoverRequests', LOCAL_KEYS.stopoverRequests, {
    ...data,
    locator: normalizeLocator(data.locator),
    status: 'received',
  })
}

export async function createCargoQuote(data) {
  return saveDocument('cargoQuotes', LOCAL_KEYS.cargoQuotes, {
    ...data,
    status: 'received',
  })
}

export async function createHotelRequest(data) {
  return saveDocument('hotelRequests', LOCAL_KEYS.hotelRequests, {
    ...data,
    status: 'received',
  })
}

export async function createDestinationLead(data) {
  const suggestions = destinationProfiles[data.vibe] || []

  return saveDocument('destinationLeads', LOCAL_KEYS.destinationLeads, {
    ...data,
    suggestions,
    status: 'received',
  })
}

export function estimateMiles({ origin, destination, cabin, passengers }) {
  const routeFactor = getRouteFactor(origin, destination)
  const cabinFactor = cabin === 'premium' ? 2.2 : cabin === 'executiva' ? 1.65 : 1

  return Math.round((7200 + routeFactor * 860 + Number(passengers || 1) * 1300) * cabinFactor)
}

export async function seedCatalogToFirestore() {
  if (!db) {
    throw new Error('Configure o Firebase antes de sincronizar o catalogo.')
  }

  await Promise.all([
    ...airportOptions.map((airport) => setDoc(doc(db, 'airports', airport.code), airport)),
    ...fareFamilies.map((fare) => setDoc(doc(db, 'fares', fare.id), fare)),
    ...flightSchedule.map((flight) => setDoc(doc(db, 'flights', flight.id), flight)),
  ])

  return {
    airports: airportOptions.length,
    fares: fareFamilies.length,
    flights: flightSchedule.length,
  }
}
