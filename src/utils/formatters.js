export function normalizeCpf(value = '') {
  return value.replace(/\D/g, '').slice(0, 11)
}

export function formatCpf(value = '') {
  const digits = normalizeCpf(value)

  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function normalizeLocator(value = '') {
  return value.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase()
}

export function formatDate(date) {
  if (!date) {
    return 'Data a confirmar'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

export function formatDateTime(date, time) {
  return `${formatDate(date)} as ${time}`
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatMiles(value) {
  return `${Number(value || 0).toLocaleString('pt-BR')} milhas`
}

export function getAirportLabel(airports, code) {
  const airport = airports.find((item) => item.code === code)
  return airport ? `${airport.city} (${airport.code})` : code
}

export function splitFullName(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  }
}

export function normalizeComparable(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function generateLocator() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const random = new Uint32Array(6)
  window.crypto.getRandomValues(random)

  return Array.from(random, (number) => alphabet[number % alphabet.length]).join('')
}

export function generateTicketNumber(index = 0) {
  const timestamp = Date.now().toString().slice(-8)
  return `957-${timestamp}${String(index + 1).padStart(2, '0')}`
}
