// store/auth.js
// Pinia store para autenticación con Firebase Auth
// Roles: 'admin' | 'user' — se guardan en Firestore bajo /usuarios/{uid}

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'

export const useAuthStore = defineStore('auth', () => {
  // ── Estado ────────────────────────────────────────────────────
  const usuario      = ref(null)   // objeto Firebase User
  const perfil       = ref(null)   // documento Firestore del usuario { rol, displayName, … }
  const cargando     = ref(true)   // true mientras onAuthStateChanged no ha resuelto
  const error        = ref('')

  const auth = getAuth()
  const db   = getFirestore()

  // ── Getters ───────────────────────────────────────────────────
  const estaAutenticado = computed(() => !!usuario.value)
  const esAdmin         = computed(() => perfil.value?.rol === 'admin')
  const nombreUsuario   = computed(() =>
    perfil.value?.displayName || usuario.value?.displayName || usuario.value?.email || 'Usuario'
  )
  const avatarInicial   = computed(() => nombreUsuario.value.charAt(0).toUpperCase())

  // ── Helpers privados ──────────────────────────────────────────
  const limpiarError = () => { error.value = '' }

  /** Carga (o crea) el documento /usuarios/{uid} en Firestore */
  const cargarPerfil = async (uid) => {
    const ref_ = doc(db, 'usuarios', uid)
    const snap = await getDoc(ref_)
    if (snap.exists()) {
      perfil.value = snap.data()
    }
    // Si no existe el documento no hacemos nada.
    // El documento se crea SOLO al registrarse (acción registrar), nunca automáticamente.
  }

  // ── Observador de sesión (llamar en App.vue → onMounted) ──────
  let unsubscribeAuth = null
  const iniciarObservador = () => {
    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      usuario.value = user
      if (user) {
        await cargarPerfil(user.uid)
        // Suscribir favoritos del usuario
        const { useFavoritosStore } = await import('./favoritos')
        useFavoritosStore().suscribir(user.uid)
      } else {
        perfil.value = null
        // Limpiar favoritos al cerrar sesión
        const { useFavoritosStore } = await import('./favoritos')
        useFavoritosStore().desuscribir()
      }
      cargando.value = false
    })
  }

  const detenerObservador = () => {
    if (unsubscribeAuth) unsubscribeAuth()
  }

  // ── Registro ──────────────────────────────────────────────────
  const registrar = async ({ email, password, nombre }) => {
    limpiarError()
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: nombre })
      usuario.value = cred.user

      // Crear el documento en Firestore explícitamente al registrarse
      const nuevoPerfil = {
        rol:         'user',
        displayName: nombre,
        email:       email,
        creadoEn:    serverTimestamp(),
      }
      await setDoc(doc(db, 'usuarios', cred.user.uid), nuevoPerfil)
      perfil.value = nuevoPerfil

      return { ok: true }
    } catch (e) {
      error.value = traducirError(e.code)
      return { ok: false, error: error.value }
    }
  }

  // ── Login ─────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    limpiarError()
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      usuario.value = cred.user
      await cargarPerfil(cred.user.uid)
      return { ok: true }
    } catch (e) {
      error.value = traducirError(e.code)
      return { ok: false, error: error.value }
    }
  }

  // ── Logout ────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth)
    usuario.value = null
    perfil.value  = null
  }

  // ── Recuperar contraseña ──────────────────────────────────────
  const recuperarPassword = async (email) => {
    limpiarError()
    try {
      await sendPasswordResetEmail(auth, email)
      return { ok: true }
    } catch (e) {
      error.value = traducirError(e.code)
      return { ok: false, error: error.value }
    }
  }

  // ── Cambiar rol (solo admin) ──────────────────────────────────
  /**
   * @param {string} uid   — uid del usuario a modificar
   * @param {'admin'|'user'} nuevoRol
   */
  const cambiarRol = async (uid, nuevoRol) => {
    if (!esAdmin.value) return { ok: false, error: 'Sin permisos' }
    await updateDoc(doc(db, 'usuarios', uid), { rol: nuevoRol })
    return { ok: true }
  }

  // ── Traducción de errores Firebase ───────────────────────────
  const traducirError = (code) => ({
    'auth/email-already-in-use':   'Este email ya está registrado.',
    'auth/invalid-email':          'Email no válido.',
    'auth/weak-password':          'La contraseña debe tener al menos 6 caracteres.',
    'auth/user-not-found':         'No existe ninguna cuenta con ese email.',
    'auth/wrong-password':         'Contraseña incorrecta.',
    'auth/too-many-requests':      'Demasiados intentos. Espera un momento.',
    'auth/network-request-failed': 'Error de red. Comprueba tu conexión.',
  }[code] || 'Ha ocurrido un error. Inténtalo de nuevo.')

  return {
    // estado
    usuario, perfil, cargando, error,
    // getters
    estaAutenticado, esAdmin, nombreUsuario, avatarInicial,
    // acciones
    iniciarObservador, detenerObservador,
    registrar, login, logout, recuperarPassword, cambiarRol,
    limpiarError,
  }
})
