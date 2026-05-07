<template>
  <v-container fluid class="fill-height login-bg pa-0">
    <!-- Fondo animado -->
    <div class="login-backdrop" />

    <v-row justify="center" align="center" class="fill-height ma-0">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">

        <!-- Logo -->
        <div class="d-flex align-center justify-center mb-8">
          <v-icon icon="mdi-play-circle" color="red-darken-3" size="44" class="mr-2" />
          <span class="logo-text">MovieTime<span class="logo-excl">!</span></span>
        </div>

        <!-- Card -->
        <v-card class="login-card pa-6 rounded-xl" elevation="0">

          <!-- Tabs Login / Registro -->
          <v-tabs
            v-model="modo"
            color="red-darken-3"
            class="mb-6"
            density="compact"
            grow
          >
            <v-tab value="login">Iniciar sesión</v-tab>
            <v-tab value="registro">Crear cuenta</v-tab>
          </v-tabs>

          <!-- Alerta de error -->
          <v-alert
            v-if="authStore.error"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
            closable
            @click:close="authStore.limpiarError()"
          >
            {{ authStore.error }}
          </v-alert>

          <!-- Alerta de éxito (recuperar pass) -->
          <v-alert
            v-if="mensajeExito"
            type="success"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            {{ mensajeExito }}
          </v-alert>

          <!-- ── FORMULARIO LOGIN ───────────────────────────── -->
          <div v-if="modo === 'login'">
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email-outline"
              color="red-darken-3"
              class="mb-3"
              hide-details="auto"
              :rules="[rules.requerido, rules.email]"
              autocomplete="email"
            />

            <v-text-field
              v-model="form.password"
              label="Contraseña"
              :type="mostrarPass ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="mostrarPass ? 'mdi-eye-off' : 'mdi-eye'"
              color="red-darken-3"
              class="mb-1"
              hide-details="auto"
              :rules="[rules.requerido]"
              autocomplete="current-password"
              @click:append-inner="mostrarPass = !mostrarPass"
              @keyup.enter="handleLogin"
            />

            <div class="text-right mb-5">
              <v-btn
                variant="text"
                size="x-small"
                color="grey"
                @click="modoRecuperar = true"
              >
                ¿Olvidaste tu contraseña?
              </v-btn>
            </div>

            <v-btn
              block
              color="red-darken-3"
              size="large"
              :loading="cargando"
              @click="handleLogin"
            >
              Entrar
            </v-btn>
          </div>

          <!-- ── FORMULARIO REGISTRO ────────────────────────── -->
          <div v-else-if="modo === 'registro'">
            <v-text-field
              v-model="form.nombre"
              label="Nombre"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-outline"
              color="red-darken-3"
              class="mb-3"
              hide-details="auto"
              :rules="[rules.requerido]"
              autocomplete="name"
            />

            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email-outline"
              color="red-darken-3"
              class="mb-3"
              hide-details="auto"
              :rules="[rules.requerido, rules.email]"
              autocomplete="email"
            />

            <v-text-field
              v-model="form.password"
              label="Contraseña"
              :type="mostrarPass ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="mostrarPass ? 'mdi-eye-off' : 'mdi-eye'"
              color="red-darken-3"
              class="mb-3"
              hide-details="auto"
              :rules="[rules.requerido, rules.minPass]"
              autocomplete="new-password"
              @click:append-inner="mostrarPass = !mostrarPass"
            />

            <v-text-field
              v-model="form.passwordConfirm"
              label="Repetir contraseña"
              :type="mostrarPass ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-check-outline"
              color="red-darken-3"
              class="mb-5"
              hide-details="auto"
              :rules="[rules.requerido, rules.coincidePass]"
              autocomplete="new-password"
              @keyup.enter="handleRegistro"
            />

            <v-btn
              block
              color="red-darken-3"
              size="large"
              :loading="cargando"
              @click="handleRegistro"
            >
              Crear cuenta
            </v-btn>
          </div>

        </v-card>

        <!-- ── DIALOG recuperar contraseña ────────────────── -->
        <v-dialog v-model="modoRecuperar" max-width="380">
          <v-card class="bg-grey-darken-4 rounded-xl pa-4">
            <v-card-title class="d-flex align-center ga-2 pb-2">
              <v-icon icon="mdi-lock-reset" color="red-darken-3" />
              Recuperar contraseña
            </v-card-title>
            <v-card-text class="text-grey-lighten-2 pb-3">
              Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
              <v-text-field
                v-model="emailRecuperar"
                label="Email"
                type="email"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-email-outline"
                color="red-darken-3"
                class="mt-4"
                hide-details
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" color="grey" @click="modoRecuperar = false">Cancelar</v-btn>
              <v-btn
                variant="elevated"
                color="red-darken-3"
                :loading="cargando"
                @click="handleRecuperar"
              >
                Enviar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../store/auth'

const authStore = useAuthStore()

const modo          = ref('login')
const mostrarPass   = ref(false)
const cargando      = ref(false)
const modoRecuperar = ref(false)
const emailRecuperar = ref('')
const mensajeExito  = ref('')

const form = reactive({
  nombre:          '',
  email:           '',
  password:        '',
  passwordConfirm: '',
})

const rules = {
  requerido:    v => !!v || 'Campo obligatorio',
  email:        v => /.+@.+\..+/.test(v) || 'Email no válido',
  minPass:      v => v.length >= 6 || 'Mínimo 6 caracteres',
  coincidePass: v => v === form.password || 'Las contraseñas no coinciden',
}

const handleLogin = async () => {
  if (!form.email || !form.password) return
  cargando.value = true
  const res = await authStore.login({ email: form.email, password: form.password })
  cargando.value = false
  if (res.ok) navigateTo('/')
}

const handleRegistro = async () => {
  if (!form.nombre || !form.email || !form.password || form.password !== form.passwordConfirm) return
  cargando.value = true
  const res = await authStore.registrar({
    nombre:   form.nombre,
    email:    form.email,
    password: form.password,
  })
  cargando.value = false
  if (res.ok) navigateTo('/')
}

const handleRecuperar = async () => {
  if (!emailRecuperar.value) return
  cargando.value = true
  const res = await authStore.recuperarPassword(emailRecuperar.value)
  cargando.value = false
  modoRecuperar.value = false
  if (res.ok) mensajeExito.value = 'Email enviado. Revisa tu bandeja de entrada.'
}
</script>

<style scoped>
.login-bg {
  background: #0a0a0a;
  min-height: 100vh;
}

.login-backdrop {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 50% at 20% 40%, rgba(183,28,28,0.20) 0%, transparent 65%),
    radial-gradient(ellipse 50% 70% at 80% 70%, rgba(183,28,28,0.10) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.v-container { position: relative; z-index: 1; }

.logo-text {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}
.logo-excl { color: #e53935; }

.login-card {
  background: rgba(20, 20, 20, 0.85) !important;
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(12px);
}

/* Campos outlined visibles sobre fondo oscuro */
:deep(.v-field__outline) {
  color: rgba(255,255,255,0.3) !important;
}

:deep(.v-field:hover .v-field__outline) {
  color: rgba(255,255,255,0.6) !important;
}

:deep(.v-label) {
  color: rgba(255,255,255,0.6) !important;
}

:deep(.v-field__input) {
  color: #ffffff !important;
}

:deep(.v-field__prepend-inner .v-icon),
:deep(.v-field__append-inner .v-icon) {
  color: rgba(255,255,255,0.5) !important;
}
</style>
