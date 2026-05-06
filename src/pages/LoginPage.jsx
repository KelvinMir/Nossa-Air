import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { BackendNotice } from '../components/BackendNotice'
import { PageShell } from '../components/PageShell'
import { SiteHeader } from '../components/SiteHeader'
import { useAuth } from '../contexts/AuthContext'
import { cx, ui } from '../ui'
import { formatCpf, normalizeCpf } from '../utils/formatters'

function getAuthMessage(error) {
  if (!error?.code) {
    return error.message || 'Nao foi possivel concluir o acesso.'
  }

  const messages = {
    'auth/app-not-authorized': 'Este app web ainda nao esta autorizado no Firebase Authentication.',
    'auth/configuration-not-found':
      'O Firebase Authentication ainda nao foi configurado neste projeto. Ative Authentication no console ou siga em modo local.',
    'auth/email-already-in-use': 'Ja existe uma conta com este e-mail.',
    'auth/invalid-email': 'Informe um e-mail valido.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Permita pop-ups e tente novamente.',
    'auth/popup-closed-by-user': 'A janela do Google foi fechada antes da confirmacao.',
    'auth/cancelled-popup-request': 'O fluxo do Google foi cancelado antes de concluir.',
    'auth/network-request-failed':
      'Nao foi possivel acessar o Firebase agora. Tente novamente ou use o modo local.',
    'auth/account-exists-with-different-credential':
      'Este e-mail ja existe com outro metodo de login. Entre com a forma original de acesso.',
    'auth/operation-not-allowed':
      'Ative o provedor Email/Senha no Firebase Authentication para usar cadastro real.',
    'auth/unauthorized-domain':
      'O dominio atual ainda nao esta autorizado no Firebase Authentication.',
    'auth/weak-password': 'Use uma senha com pelo menos 6 caracteres.',
  }

  return messages[error.code] || error.message
}

export function LoginPage() {
  const {
    currentUser,
    login,
    loginWithGoogle,
    register,
    loading,
    backendMode,
    isFirebaseConfigured,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnPath = location.state?.from || '/portal'
  const isCheckoutRedirect = location.state?.intent === 'complete-purchase'
  const googleLoginAvailable = isFirebaseConfigured && backendMode === 'firebase'
  const [mode, setMode] = useState('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
  })

  if (!loading && currentUser) {
    return <Navigate to={returnPath} replace />
  }

  async function handleLogin(event) {
    event.preventDefault()
    setFeedback('')
    setIsSubmitting(true)

    try {
      await login(loginForm)
      navigate(returnPath, { replace: true })
    } catch (error) {
      setFeedback(getAuthMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSignup(event) {
    event.preventDefault()
    setFeedback('')

    if (normalizeCpf(signupForm.cpf).length !== 11) {
      setFeedback('Informe um CPF valido para criar seu perfil de passageiro.')
      return
    }

    setIsSubmitting(true)

    try {
      await register(signupForm)
      navigate(returnPath, { replace: true })
    } catch (error) {
      setFeedback(getAuthMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleLogin() {
    if (!googleLoginAvailable) {
      setFeedback(
        'O login com Google exige Firebase Auth configurado, provedor Google ativo e dominio autorizado.'
      )
      return
    }

    setFeedback('')
    setIsSubmitting(true)

    try {
      await loginWithGoogle()
      navigate(returnPath, { replace: true })
    } catch (error) {
      setFeedback(getAuthMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell>
      <SiteHeader />

      <main className={`${ui.pageMain} pt-4`}>
        <BackendNotice compact />

        <section className={`${ui.container} mt-5 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]`}>
          <article className={`${ui.roundedPanel} p-6 md:p-8`}>
            <span className={ui.eyebrow}>Area do cliente</span>
            <h1 className={`${ui.pageTitle} mt-4`}>Acesse sua jornada na Nossa Air.</h1>
            <p className={`${ui.bodyText} mt-4 max-w-[44rem]`}>
              {isCheckoutRedirect
                ? 'Entre para continuar com a tarifa selecionada e emitir sua reserva.'
                : 'Entre para emitir reservas, consultar bilhetes, acompanhar milhas estimadas e gerenciar seus dados de passageiro.'}
            </p>

            <div className="mt-6">
              <button
                className={ui.socialButton}
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting || !googleLoginAvailable}
              >
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4285f4,#34a853)] text-sm font-black text-white"
                  aria-hidden="true"
                >
                  G
                </span>
                <span>{mode === 'signup' ? 'Continuar com Google' : 'Entrar com Google'}</span>
              </button>

              {!googleLoginAvailable && (
                <p className="mt-3 text-sm leading-[1.6] text-muted">
                  Ative o provedor Google no Firebase Authentication e autorize o
                  dominio local para usar este acesso.
                </p>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2" role="tablist" aria-label="Acesso ou cadastro">
              <button
                className={cx(ui.tabButton, mode === 'login' && ui.tabButtonActive)}
                type="button"
                onClick={() => {
                  setMode('login')
                  setFeedback('')
                }}
              >
                Entrar
              </button>
              <button
                className={cx(ui.tabButton, mode === 'signup' && ui.tabButtonActive)}
                type="button"
                onClick={() => {
                  setMode('signup')
                  setFeedback('')
                }}
              >
                Criar conta
              </button>
            </div>

            <div className={ui.divider} aria-hidden="true">
              <span>ou use e-mail</span>
            </div>

            {mode === 'login' ? (
              <form className="grid gap-4" onSubmit={handleLogin}>
                <label className={ui.field}>
                  <span className={ui.labelText}>E-mail</span>
                  <input
                    className={ui.input}
                    type="email"
                    placeholder="voce@email.com"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </label>

                <label className={ui.field}>
                  <span className={ui.labelText}>Senha</span>
                  <input
                    className={ui.input}
                    type="password"
                    placeholder="Sua senha"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, password: event.target.value }))
                    }
                  />
                </label>

                <button className={ui.primaryButton} type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            ) : (
              <form className={ui.formGrid} onSubmit={handleSignup}>
                <label className={ui.field}>
                  <span className={ui.labelText}>Nome completo</span>
                  <input
                    className={ui.input}
                    value={signupForm.name}
                    placeholder="Nome e sobrenome"
                    onChange={(event) =>
                      setSignupForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </label>

                <label className={ui.field}>
                  <span className={ui.labelText}>E-mail</span>
                  <input
                    className={ui.input}
                    type="email"
                    value={signupForm.email}
                    placeholder="voce@email.com"
                    onChange={(event) =>
                      setSignupForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </label>

                <label className={ui.field}>
                  <span className={ui.labelText}>CPF</span>
                  <input
                    className={ui.input}
                    inputMode="numeric"
                    value={signupForm.cpf}
                    placeholder="000.000.000-00"
                    onChange={(event) =>
                      setSignupForm((current) => ({
                        ...current,
                        cpf: formatCpf(event.target.value),
                      }))
                    }
                  />
                </label>

                <label className={ui.field}>
                  <span className={ui.labelText}>Telefone</span>
                  <input
                    className={ui.input}
                    value={signupForm.phone}
                    placeholder="(00) 00000-0000"
                    onChange={(event) =>
                      setSignupForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </label>

                <label className={cx(ui.field, ui.fieldSpan2)}>
                  <span className={ui.labelText}>Senha</span>
                  <input
                    className={ui.input}
                    type="password"
                    value={signupForm.password}
                    placeholder="Minimo 6 caracteres"
                    onChange={(event) =>
                      setSignupForm((current) => ({ ...current, password: event.target.value }))
                    }
                  />
                </label>

                <button
                  className={cx(ui.primaryButton, ui.fieldSpan2)}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                </button>
              </form>
            )}

            {feedback && <p className={ui.statusBanner}>{feedback}</p>}

            <p className="mt-5 text-sm leading-[1.6] text-muted">
              Prefere pesquisar antes?{' '}
              <Link className="font-bold text-coral transition hover:text-coral-dark" to="/">
                Voltar para reservas
              </Link>
            </p>
          </article>

          <aside className="lg:pt-8">
            <div className={`${ui.softCard} p-6 md:p-8 lg:sticky lg:top-28`}>
              <span className={ui.eyebrow}>Portal Nossa Air</span>
              <h2 className={`${ui.sectionTitle} mt-4 text-[clamp(1.7rem,3vw,2.5rem)]`}>
                Seu perfil conecta reservas, bilhetes e check-in.
              </h2>
              <p className={`${ui.bodyText} mt-4`}>
                O cadastro usa e-mail e senha para autenticar, e CPF para validar
                passageiro em reservas e embarque.
              </p>
              <ul className={ui.featureList}>
                <li>Conta protegida por Firebase Auth quando configurado.</li>
                <li>Perfil de passageiro com CPF obrigatorio.</li>
                <li>Modo local disponivel para testes sem tela quebrada.</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </PageShell>
  )
}
