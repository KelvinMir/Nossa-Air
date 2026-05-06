import { useAuth } from '../contexts/AuthContext'
import { ui } from '../ui'

export function BackendNotice({ compact = false }) {
  const { backendIssue, backendMode, isFirebaseConfigured, missingFirebaseKeys } = useAuth()

  if (isFirebaseConfigured && backendMode === 'firebase') {
    return null
  }

  const isFallbackMode = backendMode === 'local-fallback'

  return (
    <aside
      className={`${ui.container} ${compact ? 'mt-0' : 'mt-4'} grid gap-6 rounded-[1.6rem] border border-forest/14 bg-[rgba(255,248,238,0.88)] p-5 shadow-soft backdrop-blur-xl ${!compact && !isFallbackMode ? 'lg:grid-cols-[1fr_auto]' : ''}`}
    >
      <div>
        <span className={ui.eyebrow}>Modo local ativo</span>
        <h2 className={`${ui.sectionTitle} mt-4 text-[clamp(1.6rem,3vw,2.3rem)]`}>
          {isFallbackMode
            ? 'Firebase detectado, mas o Authentication ainda nao esta pronto.'
            : 'Configure o Firebase para operar com Auth e Firestore reais.'}
        </h2>
        <p className={`${ui.bodyText} mt-4`}>
          {isFallbackMode
            ? 'O portal entrou em contingencia local para nao interromper cadastro, login e reservas neste navegador.'
            : 'O portal continua funcionando com armazenamento local para testes, mas os dados so ficam neste navegador ate voce criar o arquivo '}
          {!isFallbackMode && <strong>.env.local</strong>}
        </p>
        {backendIssue && <p className={`${ui.bodyText} mt-3`}>{backendIssue}</p>}
      </div>

      {!compact && !isFallbackMode && (
        <ul className="grid gap-2 self-center text-[0.84rem] font-extrabold text-forest-dark">
          {missingFirebaseKeys.map((key) => (
            <li key={key} className="rounded-full bg-forest/10 px-3 py-2">
              {key}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
