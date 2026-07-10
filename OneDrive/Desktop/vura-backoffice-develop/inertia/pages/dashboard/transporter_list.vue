<script setup lang="ts">
import type { MedbookTransporter } from '#types/api/medbook/transporter_type';
import { useForm } from '@inertiajs/vue3';
import debounce from 'lodash.debounce';
import { useDialog } from 'primevue';
import { defineAsyncComponent } from 'vue';

const NewTransporterDialog = defineAsyncComponent(() => import('~/components/partials/dashboard/transporters/NewTransporterDialog.vue'))

defineProps<{
  transporters: MedbookTransporter
}>()

const dialog = useDialog()

const searchQs = new URLSearchParams(window.location.search)
const filterForm = useForm({
  searchQuery: searchQs.get('searchQuery') || '',
})


function openDialog(transporter?: MedbookTransporter['data'][0]) {
  dialog.open(NewTransporterDialog, {
    props: {
      header: transporter ? `Edit ${transporter.profile.firstname} informations` : 'New Transporter',
      modal: true,
      style: { 'min-width': '350px' }
    },
    data: { transporter }
  })
}

const handleSearch = debounce(() => {
  filterForm.get('', { preserveState: true })
}, 500)


</script>

<template>
  <Toast></Toast>
  <DynamicDialog></DynamicDialog>

  <div class="card">
    <Toolbar class="mb-6">
      <template #start>
        <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openDialog()" />
        <!-- <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected"
            :disabled="!selectedtransporters || !selectedtransporters.length" /> -->
      </template>

    </Toolbar>

    <DataTable ref="dt" :value="transporters.data" dataKey="id" :paginator="true" :rows="transporters.meta?.perPage">
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <h4 class="m-0">Manage Transporters</h4>
          <div class="flex gap-4 items-center">
            <IconField>
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText :maxlength="100" @input="handleSearch" v-model="filterForm.searchQuery"
                placeholder="Search..." />
            </IconField>
          </div>
        </div>
      </template>

      <!-- <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column> -->

      <Column header="Status" class="min-w-52!">
        <template #body="{ data }">
          <Tag v-if="!data.transporterProfile.isActive" severity="danger" value="Inactive">
          </Tag>
          <Tag v-else :severity="data.transporterProfile.isWorking ? 'success' : 'warn'">
            {{ data.transporterProfile.isWorking ? 'Working' : 'Not Working' }}</Tag>
        </template>
      </Column>

      <Column field="profile.fullname" header="Name" sortable style="min-width: 16rem">
        <template #body="{ data }">
          <div class="flex flex-col gap-1">
            <span>{{ data.profile.fullname }}</span>
            <Badge :value="data.transporterProfile.type" class="w-fit" severity="secondary"></Badge>
          </div>
        </template>
      </Column>
      <Column header="Contact">
        <template #body="{ data }">
          <div class="flex flex-col gap-1">
            <span>{{ data.phoneNumber }}</span>
            <span class="text-sm">{{ data.email }}</span>
          </div>
        </template>
      </Column>

      <Column :exportable="false" style="min-width: 12rem">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" outlined severity="info" rounded class="mr-2" @click="openDialog(data)" />
        </template>
      </Column>
    </DataTable>
  </div>

</template>