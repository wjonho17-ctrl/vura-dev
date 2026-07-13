<template>
  <div class="login-page">
    <Card class="login-card">
      <div class="login-card__brand">
        <BrandMark />
        <div>
          <div class="brand-name" style="font-size: 20px">VSDC Manager</div>
          <div class="brand-sub">EBM 2.1 — RRA Compliant</div>
        </div>
      </div>

      <div class="login-tabs">
        <button
          type="button"
          class="login-tab"
          :class="{ 'is-active': isAdmin }"
          @click="switchMode(true)"
        >
          Administrator
        </button>
        <button
          type="button"
          class="login-tab"
          :class="{ 'is-active': !isAdmin }"
          @click="switchMode(false)"
        >
          Device Operator
        </button>
      </div>

      <div v-if="error" class="login-error">
        <i class="pi pi-exclamation-circle" />
        {{ error }}
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label" for="email">Email address</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            :placeholder="placeholder"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <Password
            id="password"
            v-model="password"
            class="form-input"
            placeholder="••••••••"
            feedback="false"
            required
          />
        </div>

        <Button label="Sign in"
          type="submit"
          class="p-button-rounded p-button-lg p-button-primary"
          :loading="loading"
          :disabled="loading"
        />
      </form>

      <div class="login-card__footer">
        VSDC Manager v1.0 · RRA EBM 2.1
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../stores/appStore'
import BrandMark from '../components/ui/BrandMark.vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const isAdmin = ref(true)
const loading = ref(false)
const error = ref(null)

const placeholder = computed(() => (isAdmin.value ? 'admin@test.com' : 'operator@company.rw'))

function switchMode(admin) {
  isAdmin.value = admin
  error.value = null
  email.value = ''
  password.value = ''
}

async function handleSubmit() {
  error.value = null
  loading.value = true

  try {
    await login(email.value, password.value, isAdmin.value)
    router.push(isAdmin.value ? '/admin/dashboard' : '/dashboard')
  } catch (err) {
    error.value = err?.message || 'Invalid credentials. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
