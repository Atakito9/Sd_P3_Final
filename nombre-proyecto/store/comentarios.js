import { defineStore } from 'pinia'
import { reactive } from 'vue'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { db } from '~/services/fireinit'

export const useComentariosStore = defineStore('comentarios', {

  state: () => ({
    porPelicula: {},
    _unsubs: {}
  }),

  actions: {

    suscribirPelicula(peliculaId) {
      if (this._unsubs[peliculaId]) return

      const q = query(
        collection(db, 'comentarios'),
        where('peliculaId', '==', peliculaId),
        orderBy('creadoEn', 'desc')
      )

      this._unsubs[peliculaId] = onSnapshot(q, (snapshot) => {
        this.$patch((state) => {
          state.porPelicula[peliculaId] = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          }))
        })
      }, (err) => {
        console.error('Error comentarios:', err)
      })
    },

    desuscribirPelicula(peliculaId) {
      if (this._unsubs[peliculaId]) {
        this._unsubs[peliculaId]()
        delete this._unsubs[peliculaId]
      }
    },

    async agregarComentario(peliculaId, puntuacion, texto, usuario) {
      try {
        await addDoc(collection(db, 'comentarios'), {
          peliculaId,
          puntuacion,
          texto:       texto?.trim() || '',
          creadoEn:    serverTimestamp(),
          uid:         usuario?.uid         || null,
          displayName: usuario?.displayName || usuario?.email || 'Anónimo',
        })
      } catch (err) {
        console.error('Error al añadir comentario:', err)
      }
    },

    async eliminarComentario(comentarioId) {
      try {
        await deleteDoc(doc(db, 'comentarios', comentarioId))
        // onSnapshot actualiza porPelicula automáticamente
      } catch (err) {
        console.error('Error al eliminar comentario:', err)
      }
    },

    getComentarios(peliculaId) {
      return this.porPelicula[peliculaId] || []
    }
  }
})
