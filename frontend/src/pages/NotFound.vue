<template>
  <div class="notfound-page">
    <Card class="notfound-card">
      <div class="notfound-content">
        <div class="notfound-icon">
          <i class="pi pi-times-circle" />
        </div>
        <h1 class="notfound-code">404</h1>
        <h2 class="notfound-title">Page Not Found</h2>
        <p class="notfound-message">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div class="notfound-actions">
          <Button
            label="Back to home"
            icon="pi pi-home"
            class="p-button-rounded p-button-primary p-button-lg"
            @click="goHome"
          />
          <Button
            label="Back to previous"
            icon="pi pi-arrow-left"
            class="p-button-rounded p-button-secondary p-button-lg"
            @click="goBack"
          />
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.notfound-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-400) 100%);
  padding: 2rem;
}

.notfound-card {
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.notfound-content {
  text-align: center;
  padding: 3rem 2rem;
}

.notfound-icon {
  font-size: 5rem;
  color: var(--red-500);
  margin-bottom: 1rem;
}

.notfound-code {
  font-size: 4rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.notfound-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.notfound-message {
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.notfound-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .notfound-content {
    padding: 2rem 1rem;
  }

  .notfound-code {
    font-size: 3rem;
  }

  .notfound-title {
    font-size: 1.25rem;
  }

  .notfound-actions {
    flex-direction: column;
  }

  .notfound-actions :deep(button) {
    width: 100%;
  }
}
</style>
