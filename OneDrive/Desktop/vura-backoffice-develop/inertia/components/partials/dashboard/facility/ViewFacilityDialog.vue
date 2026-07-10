<script setup lang="ts">
import type HealthFacility from '#models/health_facility';
import { inject, onMounted, Ref, ref } from 'vue';
import tuyau from '~/app/tuyau';
import { getFacilityPosition, getFacilityStaffRole } from '~/helpers';

const dialogRef = inject('dialogRef') as Ref<{ data: { facility: HealthFacility } }>;

const facility = dialogRef.value.data.facility

</script>

<template>
    <Toast></Toast>
    <div>
        <Toolbar class="mb-6">
            <template #start>
                <div class="flex flex-col">
                    <span class="text-lg">{{ facility.email }}</span>
                    <span>{{ facility.phoneNumber }}</span>
                </div>
                <!-- <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected"
                :disabled="!selectedClients || !selectedClients.length" /> -->
            </template>
            
            <template #end>
                <Link :href="tuyau.$url('dashboard.facilities.edit', { params: { id: facility.id } })">
                <Button icon="pi pi-pencil" severity="secondary" label="Edit"></Button>
                </Link>
                <!-- <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" /> -->
            </template>
        </Toolbar>

        <DataTable ref="dt" :value="facility.users" dataKey="id">
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Manage Staffs</h4>
                    <div class="flex gap-4 items-center">
                        <Link :href="tuyau.$url('dashboard.staffs.new', { query: { facilityId: facility?.id } })">
                        <Button label="New" icon="pi pi-plus" severity="secondary"></Button>
                        </Link>
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


            <Column header="Photo">
                <template #body="{ data }">
                    <Image v-if="data.photo?.url" :src="data.photo?.url"
                        class="*:rounded-full! *:object-cover! w-12! h-12!" alt="Image" preview />
                    <Avatar v-else :label="data.initial" size="large" shape="circle">
                    </Avatar>

                </template>
            </Column>
            <Column header="Name">
                <template #body="{ data }">
                    <div class="flex flex-col">
                        <span>{{ data.lastname }}</span>
                        <span class="text-sm">{{ data.firstname }}</span>
                    </div>
                </template>
            </Column>
            <Column header="Role">
                <template #body="{ data }">
                    <Chip class="w-fit text-sm" :label="getFacilityStaffRole().find(r => r.value == data.role)?.label">
                    </Chip>
                </template>
            </Column>
            <Column header="Position" field="regno" class="w-1">
                <template #body="{ data }">
                    <div class="flex flex-col">
                        <span>{{getFacilityPosition().find(p => p.value == data.position)?.label}}</span>
                    </div>
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

            <Column>
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <Link :href="tuyau.$url('dashboard.staffs.edit', { params: { id: data.id } })">
                        <Button icon="pi pi-pencil" severity="info" rounded variant="outlined"></Button>
                        </Link>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>

</template>