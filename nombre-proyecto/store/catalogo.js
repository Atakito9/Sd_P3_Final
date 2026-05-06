import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
  increment
} from 'firebase/firestore'
import { db } from '~/services/fireinit'
 
export const useCatalogoStore = defineStore('catalogo', {
 
  state: () => ({
    items:        [],
    cargando:     false,
    error:        null,
    _unsubscribe: null
  }),
 
  actions: {
 
    // ── Suscripción en tiempo real ──────────────────────────────
    suscribirCatalogo() {
      if (this._unsubscribe) return
 
      this.cargando = true
      this.error    = null
 
      const q = query(
        collection(db, 'catalogo'),
        orderBy('creadoEn', 'desc')
      )
 
      this._unsubscribe = onSnapshot(q, (snapshot) => {
        this.items    = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        this.cargando = false
      }, (err) => {
        console.error('Error en la suscripción:', err)
        this.error    = 'No se pudo conectar con la base de datos.'
        this.cargando = false
      })
    },
 
    desuscribir() {
      if (this._unsubscribe) {
        this._unsubscribe()
        this._unsubscribe = null
      }
    },
 
    // ── Añadir item ─────────────────────────────────────────────
    async agregarItem(item) {
      try {
        await addDoc(collection(db, 'catalogo'), {
          nombre:          item.nombre,
          genero:          item.genero,
          estreno:         item.estreno,
          enCine:          item.enCine         ?? false,
          urlImagen:       item.urlImagen       ?? '',
          categoria:       item.categoria,
          descripcion:     item.descripcion     ?? '',
          tieneTrailer:    item.tieneTrailer    ?? false,
          urlTrailer:      item.urlTrailer      ?? '',
          puntuacionMedia: 0,
          numVotos:        0,
          creadoEn:        serverTimestamp()
        })
      } catch (err) {
        console.error('Error al añadir:', err)
        this.error = 'No se pudo añadir el elemento.'
      }
    },
 
    // ── Editar item ─────────────────────────────────────────────
    async editarItem(id, cambios) {
      try {
        const payload = {
          nombre:       cambios.nombre,
          genero:       cambios.genero,
          estreno:      cambios.estreno,
          enCine:       cambios.enCine,
          urlImagen:    cambios.urlImagen,
          descripcion:  cambios.descripcion  ?? '',
          tieneTrailer: cambios.tieneTrailer ?? false,
          urlTrailer:   cambios.urlTrailer   ?? '',
        }
        // Solo actualizamos media y votos si vienen explícitamente
        // (cuando se llama desde recalcularMedia tras borrar un comentario)
        if (cambios.puntuacionMedia !== undefined) payload.puntuacionMedia = cambios.puntuacionMedia
        if (cambios.numVotos        !== undefined) payload.numVotos        = cambios.numVotos
 
        await updateDoc(doc(db, 'catalogo', id), payload)
      } catch (err) {
        console.error('Error al editar:', err)
        this.error = 'No se pudo editar el elemento.'
      }
    },
 
    // ── Eliminar item ───────────────────────────────────────────
    async eliminarItem(id) {
      try {
        await deleteDoc(doc(db, 'catalogo', id))
      } catch (err) {
        console.error('Error al eliminar:', err)
        this.error = 'No se pudo eliminar el elemento.'
      }
    },
 
    // ── Votar ───────────────────────────────────────────────────
    async votar(id, puntuacion) {
      try {
        const item = this.items.find(p => p.id === id)
        if (!item) return
 
        const totalVotos = (item.numVotos || 0) + 1
        const nuevaMedia = ((item.puntuacionMedia || 0) * (totalVotos - 1) + puntuacion) / totalVotos
 
        await updateDoc(doc(db, 'catalogo', id), {
          numVotos:        increment(1),
          puntuacionMedia: Math.round(nuevaMedia * 10) / 10
        })
      } catch (err) {
        console.error('Error al votar:', err)
        this.error = 'No se pudo registrar la valoración.'
      }
    }
  }
})

