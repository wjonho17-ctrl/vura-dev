import { getDirname } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import inertia from '@adonisjs/inertia/client'
import adonisjs from '@adonisjs/vite/client'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import env from "#start/env";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    inertia({ ssr: { enabled: false } }), vue(), Components({
      resolvers: [PrimeVueResolver()],
    }),
    adonisjs({ entrypoints: ['inertia/app/app.ts'], reload: ['resources/views/**/*.edge'] }),
    tailwindcss(),
  ],

  /**
   * Define aliases for importing modules from
   * your frontend code
   */
  resolve: {
    alias: {
      '~/': `${getDirname(import.meta.url)}/inertia/`,
    },
  },
  server: {
    hmr: {
      port: 2065
    }
  },
  build: {
    sourcemap: true,
  }
})