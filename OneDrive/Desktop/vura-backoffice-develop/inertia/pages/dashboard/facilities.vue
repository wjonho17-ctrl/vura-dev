<script setup lang="ts">
import type HealthFacility from '#models/health_facility';
import { Link } from '@inertiajs/vue3';
import { useUrlSearchParams } from '@vueuse/core';
import { useDialog } from 'primevue';
import { defineAsyncComponent, onMounted } from 'vue';
import tuyau from '~/app/tuyau';


const props = defineProps<{
    facilities: { meta: any, data: HealthFacility[] }
}>()

const dialog = useDialog()

const qs = useUrlSearchParams<{currentFacilityId?: string}>('history')

const ViewComponent = defineAsyncComponent(() => import('~/components/partials/dashboard/facility/ViewFacilityDialog.vue'));

const handleView = (facility: HealthFacility) => {
    dialog.open(ViewComponent, {
        props: {
            header: `${facility.name}`,
            modal: true,
            maximizable: true
        },
        data: { facility },
        onClose() {
            qs.currentFacilityId = undefined
        },
    });

    qs.currentFacilityId = facility.id
}

onMounted(() => {
    if (qs?.currentFacilityId) {
        const facility = props.facilities.data.find(f => f.id == qs.currentFacilityId)
        if (facility) handleView(facility)
    }
})

</script>

<template>
    <Toast></Toast>
    <DynamicDialog></DynamicDialog>

    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Link :href="tuyau.$route('dashboard.facilities.new').path">
                        <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2"></Button>
                    </Link>
                    <!-- <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected"
                        :disabled="!selectedClients || !selectedClients.length" /> -->
                </template>

                <template #end>
                    <!-- <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" /> -->
                </template>
            </Toolbar>

            <DataTable ref="dt" :value="facilities.data" dataKey="id" :paginator="true" :rows="facilities.meta.perPage">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Facilities</h4>
                        <div class="flex gap-4 items-center">
                            <!-- <Select @valueChange="handleSearch" optionLabel="label" v-model="filterForm.roleId"
                                optionValue="value"
                                :options="[{ label: 'ALL', value: -1 }, ...CLIENT_ROLES_OPTIONS]"></Select>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText :maxlength="100" @input="handleSearch" v-model="filterForm.searchQuery"
                                    placeholder="Search..." />
                            </IconField> -->
                        </div>
                    </div>
                </template>


                <Column header="Name">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span>{{ data.name }}</span>
                        </div>
                    </template>
                </Column>

                <Column header="Admin">
                    <template #body="{ data }">
                        <div v-if="data.admin" class="flex flex-col">
                            <span>{{ data.admin.fullname }}</span>
                            <span class="text-sm">{{ data.admin.email }}</span>
                            <span class="text-sm">{{ data.admin.phoneNumber }}</span>
                        </div>
                        <Tag v-else severity="warn" value="No Admin"></Tag>
                    </template>
                </Column>


                <Column header="Contact">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span>{{ data.email }}</span>
                            <span class="text-sm">{{ data.phoneNumber }}</span>
                        </div>
                    </template>
                </Column>
                <Column header="Addrees">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span class="">{{ data.topAddress }}</span>
                            <span class="text-sm">{{ data.bottomAddress }}</span>
                        </div>
                    </template>
                </Column>

                <!-- <Column header="Contact">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span>{{ data.email }}</span>
                            <span class="text-sm">{{ data.phoneNumber }}</span>
                        </div>
                    </template>
                </Column> -->

                <Column>
                    <template #body="{ data }">
                        <div class="flex gap-2 items-center">
                            <Button icon="pi pi-eye" severity="secondary" @click="handleView(data)" rounded
                                variant="outlined"></Button>
                            <Link :href="tuyau.$url('dashboard.facilities.edit', { params: { id: data.id } })">
                                <Button icon="pi pi-pencil" severity="info" rounded variant="outlined"></Button>
                            </Link>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>