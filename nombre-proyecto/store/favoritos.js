// store/favoritos.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, query, where
} from 'firebase/firestore'
import { db } from '~/services/fireinit'

export const useFavoritosStore = defineStore('favoritos', () => {
  const ids      = ref(new Set())   // IDs de películas favoritas del usuario actual
  let _unsub     = null

  // Suscribirse a los favoritos del usuario (llamar al hacer login)
  const suscribir = (uid) => {
    if (_unsub) _unsub()
    const q = query(collection(db, 'favoritos'), where('uid', '==', uid))
    _unsub = onSnapshot(q, (snap) => {
      ids.value = new Set(snap.docs.map(d => d.data().peliculaId))
    })
  }

  const desuscribir = () => {
    if (_unsub) { _unsub(); _unsub = null }
    ids.value = new Set()
  }

  const esFavorito = (peliculaId) => ids.value.has(peliculaId)

  const toggleFavorito = async (uid, peliculaId) => {
    // El id del doc es uid_peliculaId para evitar duplicados
    const docId  = `${uid}_${peliculaId}`
    const docRef = doc(db, 'favoritos', docId)
    if (esFavorito(peliculaId)) {
      await deleteDoc(docRef)
    } else {
      await setDoc(docRef, { uid, peliculaId })
    }
    // onSnapshot actualiza ids automáticamente
  }

  return { ids, suscribir, desuscribir, esFavorito, toggleFavorito }
})
