// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['vuetify-nuxt-module', '@pinia/nuxt'],

  app: {
    head: {
      meta: [
        // Esto es lo más importante para móvil
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        // Color de la barra del navegador en móvil (Android Chrome)
        { name: 'theme-color', content: '#000000' },
        // Para iOS: que se pueda instalar como app
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'MovieTime!' },
      ],
      link: [
        // Icono para iOS (pon un icon-192.png en /public)
        { rel: 'apple-touch-icon', href: '/icon-192.png' }
      ]
    }
  },

  // Permite que Pinia funcione correctamente en SSR/SSG
  pinia: {
    storesDirs: ['./store/**']
  },

  // Vuetify: activa el soporte de safe-area para notch de iPhone
  vuetify: {
    vuetifyOptions: {
      defaults: {
        VApp: {
          style: 'padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'
        }
      }
    }
  }
})
