import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, firebaseConfigStatus } from '../lib/firebase'
import { normalizeCpf } from '../utils/formatters'

const AuthContext = createContext(null)
const LOCAL_USERS_KEY = 'nossa-air-local-users'
const LOCAL_SESSION_KEY = 'nossa-air-local-session'
const FIREBASE_FALLBACK_CODES = new Set([
  'auth/app-not-authorized',
  'auth/configuration-not-found',
  'auth/network-request-failed',
  'auth/operation-not-allowed',
  'auth/unauthorized-domain',
])

function readLocalJson(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function writeLocalJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function getLocalUsers() {
  return readLocalJson(LOCAL_USERS_KEY, [])
}

function shouldUseLocalAuthFallback(error) {
  return FIREBASE_FALLBACK_CODES.has(error?.code)
}

function getBackendIssueMessage(error) {
  const messages = {
    'auth/app-not-authorized':
      'O app web ainda nao foi autorizado no Firebase Authentication para este projeto.',
    'auth/configuration-not-found':
      'O Firebase Authentication ainda nao foi configurado neste projeto. Ative Authentication no console.',
    'auth/network-request-failed':
      'Nao foi possivel falar com o Firebase Authentication. O portal entrou em modo local de contingencia.',
    'auth/operation-not-allowed':
      'O provedor Email/Senha ainda nao esta ativado no Firebase Authentication.',
    'auth/unauthorized-domain':
      'O dominio atual ainda nao esta autorizado no Firebase Authentication.',
  }

  return messages[error?.code] || 'Firebase Authentication indisponivel. O portal entrou em modo local.'
}

function buildProfile({ uid, name, email, cpf, phone }) {
  return {
    uid,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    cpf: normalizeCpf(cpf),
    phone: phone?.trim() || '',
    role: 'customer',
    milesBalance: 0,
  }
}

async function loadFirebaseProfile(user) {
  if (!user) {
    return null
  }

  const profile = buildProfile({
    uid: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Cliente Nossa Air',
    email: user.email || '',
    cpf: '',
    phone: '',
  })

  if (!db) {
    return profile
  }

  try {
    const snapshot = await getDoc(doc(db, 'users', user.uid))

    if (snapshot.exists()) {
      return snapshot.data()
    }

    await setDoc(doc(db, 'users', user.uid), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.warn('Nossa Air: perfil Firestore indisponivel, usando fallback.', error)
  }

  return profile
}

function createLocalAccount(profileDraft, password, setCurrentUser, setProfile) {
  const users = getLocalUsers()
  const emailExists = users.some((user) => user.email === profileDraft.email)

  if (emailExists) {
    throw new Error('Ja existe uma conta local com este e-mail.')
  }

  const localProfile = {
    ...profileDraft,
    uid: `local-${Date.now()}`,
    localPassword: password,
  }

  writeLocalJson(LOCAL_USERS_KEY, [...users, localProfile])
  writeLocalJson(LOCAL_SESSION_KEY, localProfile)
  setCurrentUser(localProfile)
  setProfile(localProfile)
  return localProfile
}

function signInLocally(email, password, setCurrentUser, setProfile) {
  const user = getLocalUsers().find(
    (item) => item.email === email && item.localPassword === password
  )

  if (!user) {
    throw new Error('Conta local nao encontrada. Crie uma conta para usar o portal sem Firebase.')
  }

  writeLocalJson(LOCAL_SESSION_KEY, user)
  setCurrentUser(user)
  setProfile(user)
  return user
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendMode, setBackendMode] = useState(
    firebaseConfigStatus.isConfigured ? 'firebase' : 'local'
  )
  const [backendIssue, setBackendIssue] = useState(null)

  useEffect(() => {
    function restoreLocalSession() {
      const localProfile = readLocalJson(LOCAL_SESSION_KEY, null)
      setCurrentUser(localProfile)
      setProfile(localProfile)
      setLoading(false)
    }

    if (!auth || backendMode !== 'firebase') {
      restoreLocalSession()
      return undefined
    }

    return onAuthStateChanged(
      auth,
      async (user) => {
        setLoading(true)
        setCurrentUser(user)

        if (!user) {
          setProfile(null)
          setLoading(false)
          return
        }

        try {
          const firebaseProfile = await loadFirebaseProfile(user)
          setProfile(firebaseProfile)
          setBackendIssue(null)
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.warn('Nossa Air: Firebase Auth indisponivel, trocando para modo local.', error)
        setBackendMode('local-fallback')
        setBackendIssue(getBackendIssueMessage(error))
        restoreLocalSession()
      }
    )
  }, [backendMode])

  async function register({ name, email, password, cpf, phone }) {
    const profileDraft = buildProfile({
      uid: '',
      name,
      email,
      cpf,
      phone,
    })

    if (profileDraft.cpf.length !== 11) {
      throw new Error('Informe um CPF com 11 digitos para criar sua conta.')
    }

    if (auth && backendMode === 'firebase') {
      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          profileDraft.email,
          password
        )

        await updateProfile(credential.user, { displayName: profileDraft.name })

        const firebaseProfile = {
          ...profileDraft,
          uid: credential.user.uid,
        }

        try {
          await setDoc(doc(db, 'users', credential.user.uid), {
            ...firebaseProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        } catch (error) {
          console.warn('Nossa Air: conta criada no Auth, mas perfil Firestore falhou.', error)
        }

        setCurrentUser(credential.user)
        setProfile(firebaseProfile)
        setBackendIssue(null)
        return firebaseProfile
      } catch (error) {
        if (!shouldUseLocalAuthFallback(error)) {
          throw error
        }

        console.warn(
          'Nossa Air: cadastro caiu para modo local por indisponibilidade do Firebase Auth.',
          error
        )
        setBackendMode('local-fallback')
        setBackendIssue(getBackendIssueMessage(error))
      }
    }

    return createLocalAccount(profileDraft, password, setCurrentUser, setProfile)
  }

  async function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase()

    if (auth && backendMode === 'firebase') {
      try {
        const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password)
        const firebaseProfile = await loadFirebaseProfile(credential.user)
        setCurrentUser(credential.user)
        setProfile(firebaseProfile)
        setBackendIssue(null)
        return firebaseProfile
      } catch (error) {
        if (!shouldUseLocalAuthFallback(error)) {
          throw error
        }

        console.warn(
          'Nossa Air: login caiu para modo local por indisponibilidade do Firebase Auth.',
          error
        )
        setBackendMode('local-fallback')
        setBackendIssue(getBackendIssueMessage(error))
      }
    }

    return signInLocally(normalizedEmail, password, setCurrentUser, setProfile)
  }

  async function loginWithGoogle() {
    if (!auth || backendMode !== 'firebase') {
      const error = new Error(
        'O login com Google requer Firebase Auth configurado, provedor Google ativo e dominio autorizado.'
      )
      error.code = auth ? 'auth/operation-not-allowed' : 'auth/configuration-not-found'
      throw error
    }

    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    const credential = await signInWithPopup(auth, provider)
    const firebaseProfile = await loadFirebaseProfile(credential.user)
    setCurrentUser(credential.user)
    setProfile(firebaseProfile)
    setBackendIssue(null)
    return firebaseProfile
  }

  async function logout() {
    if (auth && backendMode === 'firebase') {
      await signOut(auth)
    }

    window.localStorage.removeItem(LOCAL_SESSION_KEY)
    setCurrentUser(null)
    setProfile(null)
  }

  const value = useMemo(
    () => ({
      currentUser,
      profile,
      loading,
      login,
      loginWithGoogle,
      logout,
      register,
      isFirebaseConfigured: firebaseConfigStatus.isConfigured,
      missingFirebaseKeys: firebaseConfigStatus.missingKeys,
      backendMode,
      backendIssue,
    }),
    [currentUser, profile, loading, backendIssue, backendMode]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.')
  }

  return context
}
