<template>
  <div class="main-layout">
    <Menubar :model="menuItems" class="main-menubar">
      <template #start>
        <div class="menu-brand">
          <BrandMark />
          <span class="brand-name">VSDC Manager</span>
        </div>
      </template>
      <template #end>
        <div class="menu-end">
          <span v-if="userProfile" class="user-info">{{ userProfile.name }}</span>
          <Avatar
            v-if="userProfile"
            :label="userProfile.initials"
            class="p-mr-2"
            shape="circle"
            style="cursor: pointer"
            @click="toggleUserMenu"
          />
          <Dropdown
            ref="userMenu"
            :model="userMenuItems"
            class="user-dropdown"
            @click="toggleUserMenu"
          />
        </div>
      </template>
    </Menubar>
    <div class="layout-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { state, logout } from '../../stores/appStore'
import BrandMark from '../ui/BrandMark.vue'

const router = useRouter()
const userMenu = ref(null)

const userProfile = computed(() => state.user)
const isAdmin = computed(() => state.isAdmin)

const menuItems = computed(() => {
  const items = [
    {
      label: 'Dashboard',
      icon: 'pi pi-fw pi-home',
      command: () => router.push(isAdmin.value ? '/admin/dashboard' : '/dashboard'),
    },
  ]

  if (!isAdmin.value) {
    items.push(
      { separator: true },
      {
        label: 'Billing',
        icon: 'pi pi-fw pi-file-pdf',
        items: [
          { label: 'Invoices', command: () => {} },
          { label: 'Receipts', command: () => {} },
        ],
      },
      {
        label: 'Stock',
        icon: 'pi pi-fw pi-shopping-cart',
        items: [
          { label: 'Inventory', command: () => {} },
          { label: 'Stock Transfers', command: () => {} },
        ],
      }
    )
  }

  if (isAdmin.value) {
    items.push(
      { separator: true },
      {
        label: 'Administration',
        icon: 'pi pi-fw pi-cog',
        items: [
          { label: 'Users', command: () => {} },
          { label: 'Branches', command: () => {} },
          { label: 'Settings', command: () => {} },
        ],
      }
    )
  }

  return items
})

const userMenuItems = computed(() => [
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: handleLogout,
  },
])

function toggleUserMenu() {
  userMenu.value?.toggle()
}

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--surface-ground);
}

.main-menubar {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.menu-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.brand-name {
  font-size: 1rem;
  font-weight: 600;
}

.menu-end {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  font-size: 0.875rem;
  color: var(--text-color);
}

.user-dropdown {
  width: 150px;
}

.layout-content {
  flex: 1;
  padding: 2rem;
}

@media (max-width: 640px) {
  .layout-content {
    padding: 1rem;
  }
}
</style>
