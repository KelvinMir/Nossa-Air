import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cx, ui } from '../ui'

const navItems = [
  { label: 'Minha Reserva', section: 'reserva', tab: 'minhas-reservas' },
  { label: 'Comprar', section: 'reserva', tab: 'passagens' },
  { label: 'Check-in', route: '/check-in' },
  { label: 'Destinos', section: 'destinos' },
]

const logoImage = `${import.meta.env.BASE_URL}imagens/logo-nossa.jpeg`

function scrollToSection(section) {
  const target = document.getElementById(section)

  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const isHome = location.pathname === '/'

  function handleNavigation(item) {
    setMenuOpen(false)

    if (item.route) {
      navigate(item.route)
      return
    }

    if (item.tab) {
      window.sessionStorage.setItem('nossa-air-service-tab', item.tab)
      window.dispatchEvent(
        new CustomEvent('nossa-air-service-tab', { detail: item.tab })
      )
    }

    if (isHome) {
      scrollToSection(item.section)
      return
    }

    window.sessionStorage.setItem('nossa-air-scroll-target', item.section)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink/8 bg-[rgba(248,239,228,0.84)] backdrop-blur-[18px]">
      <div className="mx-auto flex w-full max-w-[1260px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-9">
        <Link
          className="inline-flex min-w-0 items-center gap-4"
          to="/"
          onClick={() => setMenuOpen(false)}
        >
          <img
            className="h-14 w-14 rounded-2xl object-cover shadow-soft"
            src={logoImage}
            alt="Logo da Nossa Air"
          />
          <span className="grid min-w-0 gap-1">
            <strong className="font-display text-base">Nossa Air</strong>
            <small className="hidden text-[0.85rem] text-muted sm:block">
              Linhas aereas brasileiras
            </small>
          </span>
        </Link>

        <button
          className="inline-flex h-12 w-12 flex-col items-center justify-center rounded-2xl border border-ink/12 bg-white/72 p-[0.65rem] md:hidden"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span className="my-[0.18rem] block h-[2px] w-full bg-ink" />
          <span className="my-[0.18rem] block h-[2px] w-full bg-ink" />
          <span className="my-[0.18rem] block h-[2px] w-full bg-ink" />
        </button>

        <nav
          className={cx(
            'absolute left-4 right-4 top-[calc(100%+0.8rem)] hidden flex-col items-stretch gap-3 rounded-[1.5rem] border border-ink/8 bg-[rgba(255,249,241,0.98)] p-4 shadow-soft md:static md:flex md:flex-row md:items-center md:gap-3 md:border-0 md:bg-transparent md:p-0 md:shadow-none',
            menuOpen && 'flex'
          )}
          aria-label="Principal"
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cx(ui.navButton, 'w-full md:w-auto')}
              type="button"
              onClick={() => handleNavigation(item)}
            >
              {item.label}
            </button>
          ))}

          <Link
            className={cx(ui.primaryButton, 'w-full md:w-auto')}
            to={currentUser ? '/portal' : '/login'}
            onClick={() => setMenuOpen(false)}
          >
            {currentUser ? 'Minha conta' : 'Entrar'}
          </Link>
        </nav>
      </div>
    </header>
  )
}
