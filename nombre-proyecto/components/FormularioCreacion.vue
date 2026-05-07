<template>
  <v-card class="pa-6 bg-grey-darken-4 rounded-xl" elevation="4">
    <v-card-title class="text-h5 font-weight-bold d-flex align-center mb-2">
      <v-icon icon="mdi-plus-circle" class="mr-2" color="red" />
      Añadir {{ etiquetaCategoria }}
    </v-card-title>

    <v-card-text>
      <v-form ref="refForm" v-model="esValido">
        <v-row>
          <!-- Columna izquierda -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="item.nombre"
              label="Título"
              :rules="[reglas.requerido, reglas.sinDuplicado]"
              variant="filled"
              prepend-inner-icon="mdi-format-title"
            />

            <v-select
              v-model="item.genero"
              :items="listaGeneros"
              label="Géneros"
              :rules="[reglas.requeridoMultiple]"
              variant="filled"
              prepend-inner-icon="mdi-tag-multiple"
              multiple
              chips
              closable-chips
            />

            <v-text-field
              v-model="item.estreno"
              label="Año de estreno"
              :rules="[reglas.requerido, reglas.anio]"
              variant="filled"
              prepend-inner-icon="mdi-calendar-range"
              type="number"
              :min="ANIO_INICIAL_CINE"
              :max="anioActual"
            />

            <v-checkbox
              v-model="item.enCine"
              :label="checkboxLabel"
              color="red-darken-3"
              hide-details
              class="mb-2"
            />

            <!-- Duración: solo películas y documentales -->
            <v-text-field
              v-if="props.categoria === 'pelicula' || props.categoria === 'documental'"
              v-model="item.duracion"
              label="Duración (minutos)"
              variant="filled"
              prepend-inner-icon="mdi-clock-outline"
              type="number"
              min="1"
              hide-details
              class="mb-3"
              placeholder="ej: 120"
            />

            <!-- Temporadas: solo series y anime -->
            <v-text-field
              v-if="props.categoria === 'serie' || props.categoria === 'anime'"
              v-model="item.temporadas"
              label="Número de temporadas"
              variant="filled"
              prepend-inner-icon="mdi-television-play"
              type="number"
              min="1"
              hide-details
              class="mb-3"
              placeholder="ej: 3"
            />

            <!-- Descripción (opcional) -->
            <v-textarea
              v-model="item.descripcion"
              label="Descripción (opcional)"
              variant="filled"
              prepend-inner-icon="mdi-text"
              rows="3"
              auto-grow
              hide-details
              class="mt-3"
              placeholder="De qué va la película, argumento, contexto..."
            />

            <!-- Trailer (opcional) -->
            <div class="mt-3">
              <v-checkbox
                v-model="item.tieneTrailer"
                label="Añadir enlace al tráiler"
                color="red-darken-3"
                hide-details
                class="mb-2"
              />
              <v-expand-transition>
                <v-text-field
                  v-if="item.tieneTrailer"
                  v-model="item.urlTrailer"
                  label="URL del tráiler (YouTube)"
                  variant="filled"
                  prepend-inner-icon="mdi-youtube"
                  :rules="item.tieneTrailer ? [reglas.urlValida] : []"
                  placeholder="https://www.youtube.com/watch?v=..."
                  hint="Pega la URL de YouTube del tráiler oficial"
                  persistent-hint
                />
              </v-expand-transition>
            </div>
          </v-col>

          <!-- Columna derecha: portada -->
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-2 text-grey-lighten-1">Portada</div>

            <v-img
              v-if="item.urlImagen"
              :src="item.urlImagen"
              height="200"
              cover
              class="rounded-lg mb-3"
            >
              <template #placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="red" />
                </v-row>
              </template>
              <div class="d-flex justify-end pa-1">
                <v-btn icon="mdi-close" size="x-small" color="grey-darken-3" @click="item.urlImagen = ''" />
              </div>
            </v-img>

            <BuscarPortada :categoria="props.categoria" @imagen-seleccionada="url => item.urlImagen = url" />

            <div v-if="!item.urlImagen" class="text-caption text-grey mt-2">
              Busca el título para seleccionar su portada.
            </div>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-divider class="border-opacity-25" />

    <v-card-actions class="pa-4">
      <v-btn variant="text" color="grey-lighten-1" @click="limpiar">Limpiar</v-btn>
      <v-spacer />
      <v-btn
        color="red-darken-4"
        size="large"
        variant="elevated"
        :disabled="!esValido"
        @click="enviar"
      >
        Añadir
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCatalogoStore } from '../store/catalogo'

const catalogoStore = useCatalogoStore()

const ANIO_INICIAL_CINE = 1888
const VALOR_INICIAL = 0
const MINIMO_SELECCION = 1

const props = defineProps({
  categoria: { type: String, default: 'pelicula' }
})

const emit = defineEmits(['nueva-pelicula'])

const etiquetaCategoria = computed(() => ({
  pelicula:   'Película',
  serie:      'Serie',
  documental: 'Documental',
  anime:      'Anime'
}[props.categoria] || 'Elemento'))

const checkboxLabel = computed(() => ({
  pelicula:   'Actualmente en cines',
  serie:      'Actualmente en emisión',
  documental: 'Disponible en streaming',
  anime:      'Actualmente en emisión'
}[props.categoria] || 'Disponible ahora'))

const listaGeneros = [
  'Acción', 'Animación', 'Aventura', 'Ciencia ficción',
  'Comedia', 'Crimen', 'Deportes', 'Drama',
  'Fantástico', 'Historia', 'Terror', 'Misterio',
  'Musical', 'Familiar', 'Película negra', 'Política',
  'Psicológico', 'Romance', 'Sobrenatural', 'Superhéroes',
  'Thriller', 'Distopía', 'Bélico', 'Western',
  'Catástrofe', 'Espionaje', 'Terror psicologico', 'Comedia romántica',
  'Slice of life', 'Isekai'
]

const anioActual = new Date().getFullYear()

const reglas = {
  requerido:         v => !!v || 'Este campo es obligatorio',
  requeridoMultiple: v => (Array.isArray(v) && v.length >= MINIMO_SELECCION) || 'Selecciona al menos un género',
  anio:              v => (v >= ANIO_INICIAL_CINE && v <= anioActual) || `El año debe estar entre ${ANIO_INICIAL_CINE} y ${anioActual}`,
  urlValida:         v => (!v || v.includes('youtube.com') || v.includes('youtu.be')) || 'Introduce una URL de YouTube válida',
  sinDuplicado:      v => {
    if (!v) return true
    const existe = catalogoStore.items.some(
      i => i.nombre.trim().toLowerCase() === v.trim().toLowerCase()
    )
    return !existe || 'Ya existe una entrada con este título'
  }
}

const refForm = ref(null)
const esValido = ref(false)

const itemVacio = () => ({
  nombre:          '',
  genero:          [],
  estreno:         '',
  enCine:          false,
  duracion:        '',
  temporadas:      '',
  descripcion:     '',
  tieneTrailer:    false,
  urlTrailer:      '',
  puntuacionMedia: VALOR_INICIAL,
  numVotos:        VALOR_INICIAL,
  urlImagen:       ''
})

const item = ref(itemVacio())

const enviar = () => {
  if (!esValido.value) return
  emit('nueva-pelicula', { ...item.value })
  limpiar()
}

const limpiar = () => {
  item.value = itemVacio()
  refForm.value?.resetValidation()
}
</script>
