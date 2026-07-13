<template>
  <MainLayout>
    <div class="admin-dashboard">
      <div class="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p class="page-description">System overview and administration panel</p>
        </div>
        <div class="header-actions">
          <Button
            label="Add User"
            icon="pi pi-plus"
            class="p-button-rounded p-button-primary"
            @click="showNewUserDialog = true"
          />
          <Button
            label="System Settings"
            icon="pi pi-cog"
            class="p-button-rounded p-button-info"
          />
        </div>
      </div>

      <div class="stats-grid">
        <Card class="stat-card">
          <template #header>
            <div class="stat-icon stat-icon--blue">
              <i class="pi pi-users" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Total Users</div>
            <div class="stat-value">24</div>
            <div class="stat-trend">
              <i class="pi pi-arrow-up" style="color: #22c55e" />
              <span>12% from last month</span>
            </div>
          </div>
        </Card>

        <Card class="stat-card">
          <template #header>
            <div class="stat-icon stat-icon--green">
              <i class="pi pi-building" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Active Branches</div>
            <div class="stat-value">8</div>
            <div class="stat-trend">
              <i class="pi pi-arrow-right" style="color: #6b7280" />
              <span>No change</span>
            </div>
          </div>
        </Card>

        <Card class="stat-card">
          <template #header>
            <div class="stat-icon stat-icon--orange">
              <i class="pi pi-exclamation-circle" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">Pending Approvals</div>
            <div class="stat-value">3</div>
            <div class="stat-trend">
              <i class="pi pi-arrow-down" style="color: #ef4444" />
              <span>1 requires action</span>
            </div>
          </div>
        </Card>

        <Card class="stat-card">
          <template #header>
            <div class="stat-icon stat-icon--red">
              <i class="pi pi-database" />
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-label">System Status</div>
            <div class="stat-value" style="color: #22c55e">Healthy</div>
            <div class="stat-trend">
              <i class="pi pi-circle-fill" style="color: #22c55e; font-size: 0.5rem" />
              <span>All systems operational</span>
            </div>
          </div>
        </Card>
      </div>

      <div class="content-grid">
        <Card class="content-card">
          <template #header>
            <div class="card-header">
              <h3>Recent Users</h3>
              <Button label="View All" text severity="secondary" />
            </div>
          </template>
          <DataTable :value="recentUsers" class="p-datatable-striped">
            <Column field="name" header="Name" />
            <Column field="email" header="Email" />
            <Column field="role" header="Role">
              <template #body="{ data }">
                <Tag :value="data.role" :severity="getRoleSeverity(data.role)" />
              </template>
            </Column>
            <Column field="status" header="Status">
              <template #body="{ data }">
                <Badge :value="data.status" :severity="getStatusSeverity(data.status)" />
              </template>
            </Column>
          </DataTable>
        </Card>

        <Card class="content-card">
          <template #header>
            <div class="card-header">
              <h3>System Logs</h3>
              <Button label="Export" icon="pi pi-download" text severity="secondary" />
            </div>
          </template>
          <div class="logs-container">
            <div v-for="log in systemLogs" :key="log.id" class="log-entry">
              <i :class="['pi', getLogIcon(log.type)]" :style="{ color: getLogColor(log.type) }" />
              <div class="log-details">
                <div class="log-message">{{ log.message }}</div>
                <div class="log-time">{{ log.time }}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog />

      <Dialog
        v-model:visible="showNewUserDialog"
        header="Add New User"
        :modal="true"
        class="p-dialog-centered"
        style="width: 90vw; max-width: 500px"
      >
        <div class="user-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <InputText id="email" v-model="newUser.email" type="email" class="w-full" />
          </div>
          <div class="form-group">
            <label for="name">Full Name</label>
            <InputText id="name" v-model="newUser.name" class="w-full" />
          </div>
          <div class="form-group">
            <label for="role">Role</label>
            <Dropdown
              id="role"
              v-model="newUser.role"
              :options="roleOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>
        </div>
        <template #footer>
          <Button label="Cancel" text @click="showNewUserDialog = false" />
          <Button label="Create User" @click="createUser" />
        </template>
      </Dialog>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'

const showNewUserDialog = ref(false)
const newUser = ref({
  email: '',
  name: '',
  role: '',
})

const roleOptions = [
  { label: 'Administrator', value: 'admin' },
  { label: 'Branch Manager', value: 'manager' },
  { label: 'Device Operator', value: 'operator' },
]

const recentUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Administrator',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Branch Manager',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'Operator',
    status: 'Inactive',
  },
]

const systemLogs = [
  {
    id: 1,
    type: 'info',
    message: 'User login: john@example.com',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'success',
    message: 'Database backup completed successfully',
    time: '4 hours ago',
  },
  {
    id: 3,
    type: 'warning',
    message: 'API response time exceeding threshold',
    time: '6 hours ago',
  },
  {
    id: 4,
    type: 'error',
    message: 'Failed login attempt detected',
    time: '8 hours ago',
  },
]

function getRoleSeverity(role) {
  if (role === 'Administrator') return 'danger'
  if (role === 'Branch Manager') return 'warning'
  return 'info'
}

function getStatusSeverity(status) {
  return status === 'Active' ? 'success' : 'danger'
}

function getLogIcon(type) {
  const icons = {
    info: 'pi-info-circle',
    success: 'pi-check-circle',
    warning: 'pi-exclamation-triangle',
    error: 'pi-times-circle',
  }
  return icons[type] || 'pi-info-circle'
}

function getLogColor(type) {
  const colors = {
    info: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  }
  return colors[type] || '#6b7280'
}

function createUser() {
  console.log('Creating user:', newUser.value)
  showNewUserDialog.value = false
  newUser.value = { email: '', name: '', role: '' }
}
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
}

.page-description {
  margin: 0;
  color: var(--text-color-secondary);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
}

.stat-card :deep(.p-card-header) {
  padding: 0;
}

.stat-icon {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
}

.stat-icon--blue {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-icon--green {
  background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
}

.stat-icon--orange {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon--red {
  background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%);
}

.stat-content {
  padding: 1.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.75rem;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.content-card {
  border-radius: 12px;
  overflow: hidden;
}

.content-card :deep(.p-card-header) {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.logs-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.log-entry {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--surface-50);
  border-radius: 8px;
}

.log-entry i {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.log-details {
  flex: 1;
}

.log-message {
  color: var(--text-color);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.log-time {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions :deep(button) {
    flex: 1;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
