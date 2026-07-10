/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import { createApp, h } from 'vue'
import type { DefineComponent } from 'vue'
import { createInertiaApp, Form, Link } from '@inertiajs/vue3'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import AppLayout from '~/components/layouts/AppLayout.vue'
import { useLayout } from './layout'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import DialogService from 'primevue/dialogservice';
import KeyFilter from 'primevue/keyfilter';
import * as Sentry from "@sentry/vue";
import '../css/app.css'
import '~/assets/styles.scss'


const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS'

const queryClient = new QueryClient()

createInertiaApp({
  progress: {
    // The delay after which the progress bar will appear, in milliseconds...
    delay: 250,
    // The color of the progress bar...
    color: '#29d'
  },

  title: (title) => `${title} - ${appName}`,

  resolve: async (name) => {
    const page = await resolvePageComponent(
      `../pages/${name}.vue`,
      import.meta.glob<DefineComponent>('../pages/**/*.vue')
    )

    page.default.layout = page.default.layout || AppLayout

    return page
  },

  setup({ el, App, props, plugin }) {
    const app = createApp({ render: () => h(App, props) })
      .use(plugin)
      .use(PrimeVue, {
        theme: {
          preset: Aura,
          options: {
            darkModeSelector: '.app-dark',
          },
        },
      })


    if (import.meta.env.PROD) {
      Sentry.init({
        app,
        dsn: import.meta.env.VITE_SENTRY_DSN,
        
        // Filter out default `Vue` integration
        integrations: (integrations) =>
          integrations.filter((integration) => integration.name !== "Vue"),
      })
    }

    app.use(ToastService)
      .use(ConfirmationService)
      .use(VueQueryPlugin, { queryClient })
      .use(DialogService)
      .directive('keyfilter', KeyFilter)
      .component('Link', Link)
      .component('InertiaFrom', Form)
      .mount(el)
  },
}).then(() => {
  useLayout().applyTheme()
})
