import js from '@eslint/js'
import globals from 'globals'
import vuePlugin from 'eslint-plugin-vue'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,vue}'],
    extends: [
      js.configs.recommended,
      'plugin:vue/vue3-recommended',
    ],
    plugins: { vue: vuePlugin },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    rules: {
      'vue/html-self-closing': ['error', { html: { void: 'never', normal: 'never', component: 'always' } }],
    },
  },
])
