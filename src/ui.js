export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const ui = {
  pageShell:
    'relative min-h-screen overflow-x-clip bg-background font-sans text-ink antialiased',
  pageBackdrop:
    'pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(142,207,155,0.42),transparent_32%),radial-gradient(circle_at_top_right,rgba(240,199,94,0.32),transparent_22%),linear-gradient(180deg,#f9f2e8_0%,#f3ebdf_100%)]',
  pageTexture:
    'pointer-events-none fixed inset-0 -z-10 bg-[url("/imagens/fundo-nossa.png")] bg-cover bg-center opacity-[0.06]',
  pageContent: 'relative z-10 min-h-screen',
  pageMain: 'px-4 pb-8 sm:px-6 lg:px-9',
  container: 'mx-auto w-full max-w-[1180px]',
  sectionBlock: 'mx-auto mt-5 w-full max-w-[1180px]',
  sectionHeading: 'mb-6 max-w-[52rem]',
  eyebrow:
    'inline-flex w-fit items-center rounded-full bg-forest/10 px-3 py-[0.45rem] text-[0.75rem] font-extrabold uppercase tracking-[0.08em] text-forest-dark',
  pill:
    'inline-flex w-fit items-center rounded-full bg-sun/24 px-[0.85rem] py-[0.55rem] text-[0.74rem] font-extrabold uppercase tracking-[0.08em] text-[#7a5906]',
  bodyText: 'text-muted leading-[1.65]',
  heroTitle:
    'font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.02] tracking-[-0.05em]',
  sectionTitle:
    'font-display text-[clamp(1.9rem,4vw,3rem)] leading-[1.04] tracking-[-0.04em]',
  pageTitle:
    'font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.03] tracking-[-0.04em]',
  cardKicker:
    'text-[0.76rem] font-extrabold uppercase tracking-[0.12em] text-forest-dark/72',
  surfacePanel:
    'border border-ink/8 bg-surface shadow-soft backdrop-blur-xl',
  roundedPanel:
    'rounded-[2rem] border border-ink/8 bg-surface shadow-soft backdrop-blur-xl',
  bookingShell:
    'rounded-[2rem] border border-ink/8 bg-surface p-[1.2rem] shadow-soft backdrop-blur-xl',
  bookingCard:
    'rounded-[1.5rem] border border-ink/8 bg-surface-strong p-6',
  softCard:
    'rounded-[1.6rem] border border-ink/8 bg-card p-[1.45rem] shadow-soft backdrop-blur-xl',
  footerCard:
    'rounded-[1.6rem] border border-ink/8 bg-surface p-6 shadow-soft backdrop-blur-xl',
  primaryButton:
    'inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-coral),var(--color-coral-dark))] px-[1.4rem] py-[0.95rem] font-bold text-white shadow-[0_18px_32px_rgba(200,77,62,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(200,77,62,0.28)] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0 disabled:hover:shadow-[0_18px_32px_rgba(200,77,62,0.22)]',
  ghostButton:
    'inline-flex items-center justify-center rounded-full bg-forest-dark/8 px-[1.35rem] py-[0.95rem] font-bold text-forest-dark transition duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-65',
  navButton:
    'rounded-full px-4 py-[0.8rem] font-semibold text-ink transition duration-200 hover:-translate-y-px',
  tabButton:
    'rounded-2xl bg-forest-dark/6 px-[1.1rem] py-[0.9rem] font-bold text-forest-dark transition duration-200 hover:-translate-y-px',
  tabButtonActive:
    'bg-[linear-gradient(135deg,var(--color-forest),var(--color-forest-dark))] text-white',
  formGrid: 'grid gap-4 md:grid-cols-2',
  field: 'grid gap-2',
  labelText: 'font-bold text-ink',
  input:
    'w-full rounded-2xl border border-ink/12 bg-white/90 px-4 py-[0.95rem] text-ink outline-none transition focus:border-forest/35 focus:ring-2 focus:ring-forest/20',
  checkboxField: 'grid grid-cols-[auto_1fr] items-center gap-3',
  checkbox: 'h-[1.05rem] w-[1.05rem] accent-forest',
  fieldSpan2: 'md:col-span-2',
  formActions: 'flex justify-start pt-1.5',
  statusBanner:
    'mt-4 rounded-2xl border border-forest/14 bg-forest/8 px-4 py-[0.95rem] text-muted leading-[1.65]',
  cardHeader:
    'mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
  featureList: 'mt-4 list-disc pl-5 text-muted leading-[1.8]',
  socialButton:
    'inline-flex w-full items-center justify-center gap-3 rounded-full border border-ink/12 bg-white/88 px-5 py-[0.95rem] font-extrabold text-ink shadow-[0_14px_28px_rgba(26,42,34,0.08)] transition duration-200 hover:-translate-y-px hover:border-[#4285f4]/35 hover:shadow-[0_18px_32px_rgba(26,42,34,0.12)] disabled:cursor-not-allowed disabled:opacity-68 disabled:hover:translate-y-0 disabled:hover:shadow-[0_10px_22px_rgba(26,42,34,0.06)]',
  divider:
    'my-4 flex items-center gap-3 text-[0.76rem] font-extrabold uppercase tracking-[0.12em] text-muted before:h-px before:flex-1 before:bg-ink/12 after:h-px after:flex-1 after:bg-ink/12',
  metricCard:
    'rounded-[1.6rem] border border-forest/14 bg-[rgba(255,248,238,0.88)] p-5 shadow-soft backdrop-blur-xl',
  reservationCard:
    'flex flex-col gap-4 rounded-[1.2rem] border border-ink/8 bg-white/72 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-forest/28 sm:flex-row sm:items-center sm:justify-between',
  staticReservationCard:
    'flex flex-col gap-4 rounded-[1.2rem] border border-ink/8 bg-white/72 p-4 sm:flex-row sm:items-center sm:justify-between',
  boardingPass:
    'flex flex-col gap-3 rounded-[1.2rem] border border-ink/8 bg-[linear-gradient(135deg,rgba(43,107,81,0.12),rgba(240,199,94,0.16)),rgba(255,255,255,0.8)] p-4',
}
