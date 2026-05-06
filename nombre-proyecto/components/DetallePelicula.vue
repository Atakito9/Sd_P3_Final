<template>
  <v-dialog
    v-model="visible"
    fullscreen
    transition="dialog-bottom-transition"
    scrollable
  >
    <v-card class="detalle-card bg-black" v-if="pelicula">

      <div class="backdrop">
        <img v-if="pelicula.urlImagen" :src="pelicula.urlImagen" class="backdrop-img" />
        <div class="backdrop-overlay" />
      </div>

      <v-btn icon="mdi-arrow-left" variant="tonal" class="btn-cerrar"
        @click="$emit('update:modelValue', false)" />

      <v-btn icon="mdi-pencil" variant="tonal" color="amber" class="btn-editar"
        @click="abrirEdicion" />

      <v-card-text class="detalle-body pa-0">
        <v-container class="py-10 px-6" style="max-width: 960px;">
          <v-row>

            <v-col cols="12" sm="4" md="3">
              <v-img :src="pelicula.urlImagen || fallback" class="portada-img rounded-xl" cover />
            </v-col>

            <v-col cols="12" sm="8" md="9" class="pl-sm-6">

              <div class="d-flex align-center ga-2 mb-3 flex-wrap">
                <v-chip size="small" color="red-darken-3" variant="elevated" label>{{ etiquetaCategoria }}</v-chip>
                <v-chip size="small" color="grey-darken-2" variant="tonal" label>{{ Array.isArray(pelicula.genero) ? pelicula.genero.join(', ') : pelicula.genero }}</v-chip>
                <v-chip v-if="pelicula.enCine" size="small" color="green-darken-2" variant="tonal" label>
                  <v-icon start icon="mdi-filmstrip" size="12" /> En cines
                </v-chip>
              </div>

              <h1 class="titulo-detalle">
                {{ pelicula.nombre }}
                <span class="titulo-anio">({{ pelicula.estreno }})</span>
              </h1>

              <div class="score-wrap mt-4 mb-2">
                <div class="score-circle" :style="{ border: '3px solid ' + scoreColor, boxShadow: '0 0 16px ' + scoreColor + '88' }">
                  <span class="score-num" :style="{ color: scoreColor }">{{ scoreDisplay }}</span>
                </div>
                <div class="ml-4">
                  <div class="text-caption text-grey-lighten-1 text-uppercase" style="letter-spacing:.1em">Puntuación media</div>
                  <v-rating :model-value="pelicula.puntuacionMedia" color="amber" half-increments readonly density="compact" size="small" />
                  <div class="text-caption text-grey mt-1">
                    {{ pelicula.numVotos || 0 }} {{ pelicula.numVotos === 1 ? 'valoración' : 'valoraciones' }}
                  </div>
                </div>
              </div>

              <!-- Sinopsis -->
              <div v-if="pelicula.descripcion" class="mt-5 text-body-1 text-grey-lighten-2" style="line-height: 1.6;">
                <div class="text-subtitle-2 text-uppercase text-grey mb-1" style="letter-spacing: 0.1em;">Sinopsis</div>
                {{ pelicula.descripcion }}
              </div>

              <!-- Tráiler -->
              <div v-if="pelicula.tieneTrailer && pelicula.urlTrailer" class="mt-5">
                <v-btn
                  :href="pelicula.urlTrailer"
                  target="_blank"
                  color="red-darken-4"
                  variant="elevated"
                  prepend-icon="mdi-youtube"
                  class="text-none font-weight-bold"
                >
                  Ver Tráiler
                </v-btn>
              </div>

              <v-divider class="my-6 border-opacity-10" />

              <!-- Valorar -->
              <div class="valorar-section">
                <div class="text-subtitle-1 font-weight-bold text-white mb-3">
                  <v-icon icon="mdi-star-plus-outline" color="amber" class="mr-1" />
                  Tu valoración
                </div>
                <v-rating v-model="miVoto" color="amber" empty-icon="mdi-star-outline"
                  full-icon="mdi-star" half-icon="mdi-star-half-full" half-increments hover size="36" class="mb-3" />
                <v-textarea v-model="miComentario" label="Comentario opcional" variant="filled"
                  rows="2" auto-grow hide-details class="mb-4" color="amber" />
                <v-btn color="amber-darken-2" variant="elevated" :disabled="!miVoto"
                  prepend-icon="mdi-send" @click="enviarVoto">
                  Enviar valoración
                </v-btn>
                <v-alert v-if="votoEnviado" type="success" variant="tonal" density="compact"
                  class="mt-3" icon="mdi-check-circle">
                  ¡Valoración enviada! Media actualizada.
                </v-alert>
              </div>
            </v-col>
          </v-row>

          <!-- Historial de comentarios -->
          <div v-if="comentarios.length > 0" class="mt-8">
            <v-divider class="mb-6 border-opacity-10" />
            <div class="text-subtitle-1 font-weight-bold text-white mb-4">
              <v-icon icon="mdi-comment-multiple-outline" class="mr-2" color="grey-lighten-1" />
              Valoraciones de usuarios
            </div>
            <v-row>
              <v-col v-for="c in comentarios" :key="c.id" cols="12" md="6">
                <v-card class="bg-grey-darken-4 rounded-xl pa-4" elevation="0">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <v-rating :model-value="c.puntuacion" color="amber" readonly
                      half-increments density="compact" size="small" />
                    <div class="d-flex align-center ga-2">
                      <span class="text-caption text-grey">
                        {{ c.creadoEn?.toDate ? c.creadoEn.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '...' }}
                      </span>
                      <!-- Botón eliminar valoración -->
                      <v-btn
                        icon="mdi-trash-can-outline"
                        size="x-small"
                        variant="text"
                        color="red-darken-3"
                        @click="pedirEliminarComentario(c)"
                      />
                    </div>
                  </div>
                  <p v-if="c.texto" class="text-body-2 text-grey-lighten-2 ma-0">"{{ c.texto }}"</p>
                  <p v-else class="text-caption text-grey font-italic ma-0">Sin comentario</p>
                </v-card>
              </v-col>
            </v-row>
          </div>

        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Diálogo confirmar borrado de comentario -->
  <v-dialog v-model="dialogoBorrarComentario.visible" max-width="360">
    <v-card class="bg-grey-darken-4 rounded-xl pa-2">
      <v-card-title class="d-flex align-center ga-2">
        <v-icon icon="mdi-alert-circle-outline" color="red-darken-3" />
        Eliminar valoración
      </v-card-title>
      <v-card-text class="text-grey-lighten-2">
        ¿Seguro que quieres eliminar esta valoración? La puntuación media se recalculará automáticamente.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" color="grey" @click="dialogoBorrarComentario.visible = false">Cancelar</v-btn>
        <v-btn variant="elevated" color="red-darken-4" @click="confirmarEliminarComentario">Eliminar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Diálogo edición -->
  <v-dialog v-model="dialogoEdicion" max-width="600" persistent scrollable>
    <v-card class="bg-grey-darken-4 rounded-xl" v-if="edicion">
      <v-card-title class="d-flex align-center ga-2 pa-4 bg-grey-darken-4" style="position: sticky; top: 0; z-index: 10;">
        <v-icon icon="mdi-pencil" color="amber" />
        Editar {{ etiquetaCategoria }}
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="refFormEdicion" v-model="edicionValida">
          <v-text-field
            v-model="edicion.nombre"
            label="Título"
            variant="filled"
            :rules="[v => !!v || 'Obligatorio']"
            class="mb-2"
          />

          <v-select
            v-model="edicion.genero"
            :items="listaGeneros"
            label="Géneros"
            variant="filled"
            multiple
            chips
            closable-chips
            class="mb-2"
          />

          <v-text-field
            v-model="edicion.estreno"
            label="Año de estreno"
            variant="filled"
            type="number"
            :rules="[v => (v >= 1888 && v <= anioActual) || 'Año inválido']"
            class="mb-2"
          />

          <v-textarea
            v-model="edicion.descripcion"
            label="Sinopsis / Descripción"
            variant="filled"
            rows="3"
            auto-grow
            class="mb-2"
          />

          <div class="d-flex align-center flex-wrap mb-4">
            <v-checkbox
              v-model="edicion.enCine"
              :label="checkboxEnCineLabel"
              color="amber"
              hide-details
              class="mr-4"
            />
            <v-checkbox
              v-model="edicion.tieneTrailer"
              label="Añadir tráiler"
              color="red-darken-4"
              hide-details
            />
          </div>

          <v-expand-transition>
            <v-text-field
              v-if="edicion.tieneTrailer"
              v-model="edicion.urlTrailer"
              label="URL del tráiler (YouTube)"
              variant="filled"
              prepend-inner-icon="mdi-youtube"
              class="mb-4"
            />
          </v-expand-transition>

          <div class="text-subtitle-2 mb-2 text-grey-lighten-1">Portada</div>
          <v-img v-if="edicion.urlImagen" :src="edicion.urlImagen" height="150" cover class="rounded-lg mb-3">
            <div class="d-flex justify-end pa-1">
              <v-btn icon="mdi-close" size="x-small" color="grey-darken-3" @click="edicion.urlImagen = ''" />
            </div>
          </v-img>
          <BuscarPortada :categoria="pelicula?.categoria" @imagen-seleccionada="url => edicion.urlImagen = url" />
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 bg-grey-darken-4">
        <v-btn variant="text" color="grey" @click="dialogoEdicion = false">Cancelar</v-btn>
        <v-spacer />
        <v-btn color="amber-darken-2" variant="elevated" :disabled="!edicionValida" @click="guardarEdicion">
          Guardar cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useComentariosStore } from '../store/comentarios'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  pelicula:   { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'votar', 'editar', 'recalcular-media'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const fallback = 'https://placehold.co/300x450/1a1a1a/555555?text=Sin+portada'
const anioActual = new Date().getFullYear()

const listaGeneros = [
  'Acción', 'Animación', 'Aventura', 'Ciencia ficción',
  'Comedia', 'Drama', 'Fantástico', 'Horror',
  'Misterio', 'Romance', 'Thriller', 'Documental',
  'Musical', 'Historica', 'Familiar', 'Deportes', 'Belico'
]

// ── Store de comentarios ────────────────────────────────────────
const comentariosStore = useComentariosStore()

const comentarios = computed(() =>
  comentariosStore.porPelicula[props.pelicula?.id] || []
)

watch(
  () => [props.modelValue, props.pelicula?.id],
  ([abierto, nuevoId], [, anteriorId]) => {
    if (anteriorId && anteriorId !== nuevoId) comentariosStore.desuscribirPelicula(anteriorId)
    if (abierto && nuevoId) comentariosStore.suscribirPelicula(nuevoId)
    miVoto.value       = 0
    miComentario.value = ''
    votoEnviado.value  = false
  },
  { immediate: true }
)

// ── Categoría ───────────────────────────────────────────────────
const etiquetaCategoria = computed(() => ({
  pelicula:   'Película',
  serie:      'Serie',
  documental: 'Documental',
  anime:      'Anime'
}[props.pelicula?.categoria] || 'Película'))

const checkboxEnCineLabel = computed(() => ({
  pelicula:   'Actualmente en cines',
  serie:      'Actualmente en emisión',
  documental: 'Disponible en streaming',
  anime:      'Actualmente en emisión'
}[props.pelicula?.categoria] || 'Disponible ahora'))

// ── Score ───────────────────────────────────────────────────────
const scoreDisplay = computed(() => {
  const p = props.pelicula?.puntuacionMedia || 0
  return p > 0 ? p.toFixed(1) : '—'
})

const scoreColor = computed(() => {
  const p = props.pelicula?.puntuacionMedia || 0
  if (p >= 4)   return '#4caf50'
  if (p >= 2.5) return '#ffc107'
  return '#f44336'
})

// ── Valoración ──────────────────────────────────────────────────
const miVoto       = ref(0)
const miComentario = ref('')
const votoEnviado  = ref(false)

const enviarVoto = async () => {
  if (!miVoto.value || !props.pelicula) return
  await comentariosStore.agregarComentario(props.pelicula.id, miVoto.value, miComentario.value)
  emit('votar', { id: props.pelicula.id, puntuacion: miVoto.value })
  miVoto.value       = 0
  miComentario.value = ''
  votoEnviado.value  = true
  setTimeout(() => { votoEnviado.value = false }, 3000)
}

// ── Eliminar comentario ─────────────────────────────────────────
const dialogoBorrarComentario = reactive({ visible: false, comentario: null })

const pedirEliminarComentario = (c) => {
  dialogoBorrarComentario.comentario = c
  dialogoBorrarComentario.visible    = true
}

const confirmarEliminarComentario = async () => {
  const c = dialogoBorrarComentario.comentario
  if (!c || !props.pelicula) return

  await comentariosStore.eliminarComentario(c.id)

  // Esperamos a que onSnapshot actualice los comentarios
  await new Promise(r => setTimeout(r, 400))

  const restantes  = comentariosStore.porPelicula[props.pelicula.id] || []
  const nuevaMedia = restantes.length > 0
    ? restantes.reduce((acc, r) => acc + r.puntuacion, 0) / restantes.length
    : 0

  emit('recalcular-media', {
    id:              props.pelicula.id,
    puntuacionMedia: Math.round(nuevaMedia * 10) / 10,
    numVotos:        restantes.length
  })

  dialogoBorrarComentario.visible    = false
  dialogoBorrarComentario.comentario = null
}

// ── Edición ─────────────────────────────────────────────────────
const dialogoEdicion  = ref(false)
const edicionValida   = ref(false)
const refFormEdicion  = ref(null)
const edicion         = ref(null)

const abrirEdicion = () => {
  edicion.value = {
    nombre:       props.pelicula.nombre,
    genero:       Array.isArray(props.pelicula.genero) ? [...props.pelicula.genero] : [props.pelicula.genero],
    estreno:      props.pelicula.estreno,
    enCine:       props.pelicula.enCine       ?? false,
    urlImagen:    props.pelicula.urlImagen    ?? '',
    descripcion:  props.pelicula.descripcion  ?? '',
    tieneTrailer: props.pelicula.tieneTrailer ?? false,
    urlTrailer:   props.pelicula.urlTrailer   ?? ''
  }
  dialogoEdicion.value = true
}

const guardarEdicion = () => {
  if (!edicionValida.value) return
  emit('editar', { id: props.pelicula.id, ...edicion.value })
  dialogoEdicion.value = false
}
</script>

<style scoped>
.detalle-card {
  position: relative;
  overflow-y: auto;
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.backdrop-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(28px) brightness(0.25) saturate(1.4);
  transform: scale(1.08);
}

.backdrop-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.92) 60%);
}

.btn-cerrar {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 100;
}

.btn-editar {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
}

.detalle-body {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

.portada-img {
  width: 100%;
  aspect-ratio: 2/3;
  box-shadow: 0 20px 60px rgba(0,0,0,0.8);
}

.titulo-detalle {
  font-family: 'Georgia', serif;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.titulo-anio {
  font-weight: 300;
  color: rgba(255,255,255,0.5);
  font-size: 0.75em;
}

.score-wrap {
  display: flex;
  align-items: center;
}

.score-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(0,0,0,0.5);
}

.score-num {
  font-size: 1.2rem;
  font-weight: 700;
}

.valorar-section {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 20px;
}
</style>