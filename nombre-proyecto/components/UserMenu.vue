<template>
  <!-- Menú de usuario para insertar en el hero / navbar de CatalogoView -->
  <div class="d-flex align-center ga-2">

    <!-- Badge admin -->
    <v-chip
      v-if="authStore.esAdmin"
      size="x-small"
      color="red-darken-3"
      variant="tonal"
      prepend-icon="mdi-shield-crown"
      class="d-none d-sm-flex"
    >
      Admin
    </v-chip>

    <!-- Menú -->
    <v-menu location="bottom end" offset="8">
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text" class="user-btn pa-1" size="small">
          <v-avatar color="red-darken-4" size="32">
            <span class="text-caption font-weight-bold text-white">
              {{ authStore.avatarInicial }}
            </span>
          </v-avatar>
          <span class="ml-2 text-caption text-white d-none d-md-inline text-no-wrap" style="max-width:120px; overflow:hidden; text-overflow:ellipsis;">
            {{ authStore.nombreUsuario }}
          </span>
          <v-icon icon="mdi-chevron-down" size="16" class="ml-1 text-grey" />
        </v-btn>
      </template>

      <v-card class="user-menu-card rounded-xl" elevation="8" min-width="220">

        <!-- Info usuario -->
        <div class="px-4 pt-4 pb-2">
          <div class="d-flex align-center ga-3">
            <v-avatar color="red-darken-4" size="42">
              <span class="text-body-1 font-weight-bold text-white">
                {{ authStore.avatarInicial }}
              </span>
            </v-avatar>
            <div class="overflow-hidden">
              <div class="text-subtitle-2 font-weight-bold text-white text-truncate">
                {{ authStore.nombreUsuario }}
              </div>
              <div class="text-caption text-grey text-truncate">
                {{ authStore.usuario?.email }}
              </div>
            </div>
          </div>
          <v-chip
            :color="authStore.esAdmin ? 'red-darken-3' : 'grey-darken-2'"
            size="x-small"
            class="mt-2"
            :prepend-icon="authStore.esAdmin ? 'mdi-shield-crown' : 'mdi-account'"
            variant="tonal"
          >
            {{ authStore.esAdmin ? 'Administrador' : 'Usuario' }}
          </v-chip>
        </div>

        <v-divider color="rgba(255,255,255,0.07)" class="mx-3 my-1" />

        <v-list density="compact" bg-color="transparent" class="px-1 pb-1">
          <!-- Panel admin (solo para admins) -->
          <v-list-item
            v-if="authStore.esAdmin"
            prepend-icon="mdi-shield-crown"
            title="Panel de administración"
            base-color="red-lighten-2"
            rounded="lg"
            @click="$emit('abrir-admin')"
          />

          <v-divider
            v-if="authStore.esAdmin"
            color="rgba(255,255,255,0.07)"
            class="my-1 mx-2"
          />

          <!-- Cerrar sesión -->
          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar sesión"
            base-color="grey-lighten-1"
            rounded="lg"
            @click="logout"
          />
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

defineEmits(['abrir-admin'])

const authStore = useAuthStore()
const router    = useRouter()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.user-btn { border-radius: 24px; }
.user-menu-card {
  background: #1c1c1c !important;
  border: 1px solid rgba(255,255,255,0.09);
}
</style>
