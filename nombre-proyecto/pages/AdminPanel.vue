<template>
  <v-container fluid class="bg-black pa-0">

    <!-- Header -->
    <div class="admin-header px-6 py-5">
      <div class="d-flex align-center ga-3 mb-1">
        <v-icon icon="mdi-shield-crown" color="red-darken-3" size="28" />
        <span class="text-h5 font-weight-bold text-white">Panel de Administración</span>
      </div>
      <p class="text-caption text-grey ml-10">
        Gestión de usuarios y roles · MovieTime!
      </p>
    </div>

    <div class="px-6 pb-10">

      <!-- Stats rápidas -->
      <v-row class="mb-6" dense>
        <v-col v-for="stat in stats" :key="stat.label" cols="6" sm="3">
          <v-card class="stat-card pa-4 rounded-xl" elevation="0">
            <div class="d-flex align-center ga-2 mb-1">
              <v-icon :icon="stat.icon" :color="stat.color" size="18" />
              <span class="text-caption text-grey">{{ stat.label }}</span>
            </div>
            <div class="text-h4 font-weight-black text-white">{{ stat.value }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Tabla de usuarios -->
      <v-card class="users-card rounded-xl" elevation="0">
        <v-card-title class="d-flex align-center justify-space-between pa-4 pb-2">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-account-group" color="red-darken-3" size="20" />
            <span class="text-subtitle-1 font-weight-bold">Usuarios registrados</span>
          </div>
          <v-text-field
            v-model="busquedaUsuarios"
            placeholder="Buscar usuario..."
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            density="compact"
            hide-details
            clearable
            color="red-darken-3"
            style="max-width: 240px"
          />
        </v-card-title>

        <v-divider color="rgba(255,255,255,0.06)" />

        <!-- Cargando -->
        <div v-if="cargando" class="d-flex justify-center align-center pa-10">
          <v-progress-circular indeterminate color="red-darken-3" />
        </div>

        <!-- Lista -->
        <v-list v-else bg-color="transparent" class="pa-2">
          <template v-for="u in usuariosFiltrados" :key="u.id">
            <v-list-item
              class="user-item rounded-lg mb-1 px-3"
              :class="{ 'user-item--me': u.id === authStore.usuario?.uid }"
            >
              <!-- Avatar -->
              <template #prepend>
                <v-avatar
                  :color="u.rol === 'admin' ? 'red-darken-4' : 'grey-darken-3'"
                  size="38"
                  class="mr-3"
                >
                  <span class="text-caption font-weight-bold text-white">
                    {{ (u.displayName || u.email || '?').charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
              </template>

              <!-- Info -->
              <v-list-item-title class="text-white font-weight-medium">
                {{ u.displayName || '—' }}
                <v-chip
                  v-if="u.id === authStore.usuario?.uid"
                  size="x-small"
                  color="grey-darken-1"
                  class="ml-1"
                >Tú</v-chip>
              </v-list-item-title>
              <v-list-item-subtitle class="text-grey text-caption">
                {{ u.email }}
                <span class="ml-2 text-grey-darken-1">
                  · Registro: {{ formatearFecha(u.creadoEn) }}
                </span>
              </v-list-item-subtitle>

              <!-- Badge rol actual -->
              <template #append>
                <div class="d-flex align-center ga-2">
                  <v-chip
                    :color="u.rol === 'admin' ? 'red-darken-3' : 'grey-darken-2'"
                    size="small"
                    variant="tonal"
                    :prepend-icon="u.rol === 'admin' ? 'mdi-shield-crown' : 'mdi-account'"
                  >
                    {{ u.rol === 'admin' ? 'Admin' : 'Usuario' }}
                  </v-chip>

                  <!-- Menú cambiar rol (no se puede cambiar el propio) -->
                  <v-menu v-if="u.id !== authStore.usuario?.uid">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-dots-vertical"
                        variant="text"
                        size="small"
                        color="grey"
                      />
                    </template>
                    <v-list bg-color="grey-darken-4" density="compact" class="rounded-lg">
                      <v-list-item
                        v-if="u.rol !== 'admin'"
                        prepend-icon="mdi-shield-crown"
                        title="Hacer administrador"
                        @click="cambiarRol(u.id, 'admin')"
                      />
                      <v-list-item
                        v-if="u.rol !== 'user'"
                        prepend-icon="mdi-account"
                        title="Quitar administrador"
                        @click="cambiarRol(u.id, 'user')"
                      />
                    </v-list>
                  </v-menu>
                  <v-btn
                    v-else
                    icon="mdi-lock"
                    variant="text"
                    size="small"
                    color="grey-darken-2"
                    disabled
                  />
                </div>
              </template>
            </v-list-item>
          </template>

          <div v-if="usuariosFiltrados.length === 0" class="text-center py-8 text-grey">
            <v-icon icon="mdi-account-search-outline" size="40" class="mb-2" />
            <div class="text-caption">Sin resultados</div>
          </div>
        </v-list>
      </v-card>

      <!-- Snackbar feedback -->
      <v-snackbar
        v-model="snack.visible"
        :color="snack.color"
        :timeout="2500"
        location="bottom right"
        rounded="lg"
      >
        <v-icon :icon="snack.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'" class="mr-2" />
        {{ snack.texto }}
      </v-snackbar>

    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useAuthStore } from '../store/auth'

const authStore = useAuthStore()
const db = getFirestore()

// ── Estado ────────────────────────────────────────────────────────
const usuarios          = ref([])
const cargando          = ref(true)
const busquedaUsuarios  = ref('')

const snack = reactive({ visible: false, texto: '', color: 'success' })

const mostrarSnack = (texto, color = 'success') => {
  snack.texto   = texto
  snack.color   = color
  snack.visible = true
}

// ── Cargar usuarios desde Firestore ──────────────────────────────
const cargarUsuarios = async () => {
  cargando.value = true
  try {
    const q    = query(collection(db, 'usuarios'), orderBy('creadoEn', 'desc'))
    const snap = await getDocs(q)
    usuarios.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    mostrarSnack('Error al cargar usuarios', 'error')
  } finally {
    cargando.value = false
  }
}

onMounted(cargarUsuarios)

// ── Filtrado ──────────────────────────────────────────────────────
const usuariosFiltrados = computed(() => {
  const t = busquedaUsuarios.value.toLowerCase()
  if (!t) return usuarios.value
  return usuarios.value.filter(u =>
    u.displayName?.toLowerCase().includes(t) ||
    u.email?.toLowerCase().includes(t) ||
    u.rol?.includes(t)
  )
})

// ── Stats ─────────────────────────────────────────────────────────
const stats = computed(() => [
  {
    label: 'Usuarios totales',
    value: usuarios.value.length,
    icon:  'mdi-account-group',
    color: 'blue-lighten-2',
  },
  {
    label: 'Administradores',
    value: usuarios.value.filter(u => u.rol === 'admin').length,
    icon:  'mdi-shield-crown',
    color: 'red-darken-3',
  },
  {
    label: 'Usuarios regulares',
    value: usuarios.value.filter(u => u.rol === 'user').length,
    icon:  'mdi-account',
    color: 'grey-lighten-1',
  },
  {
    label: 'Nuevos (30 días)',
    value: usuarios.value.filter(u => {
      if (!u.creadoEn?.seconds) return false
      const hace30 = Date.now() / 1000 - 30 * 86400
      return u.creadoEn.seconds > hace30
    }).length,
    icon:  'mdi-account-plus',
    color: 'green-lighten-2',
  },
])

// ── Cambiar rol ───────────────────────────────────────────────────
const cambiarRol = async (uid, nuevoRol) => {
  const res = await authStore.cambiarRol(uid, nuevoRol)
  if (res.ok) {
    const u = usuarios.value.find(x => x.id === uid)
    if (u) u.rol = nuevoRol
    mostrarSnack(`Rol actualizado a "${nuevoRol === 'admin' ? 'Administrador' : 'Usuario'}"`)
  } else {
    mostrarSnack(res.error || 'Error al cambiar rol', 'error')
  }
}

// ── Formatear fecha ───────────────────────────────────────────────
const formatearFecha = (ts) => {
  if (!ts?.seconds) return '—'
  return new Date(ts.seconds * 1000).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}
</script>

<style scoped>
.admin-header {
  background: #0a0a0a;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.stat-card {
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.07);
}

.users-card {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.07);
}

.user-item {
  transition: background 0.15s;
}
.user-item:hover {
  background: rgba(255,255,255,0.05) !important;
}
.user-item--me {
  border-left: 2px solid rgba(183,28,28,0.5);
}
</style>
