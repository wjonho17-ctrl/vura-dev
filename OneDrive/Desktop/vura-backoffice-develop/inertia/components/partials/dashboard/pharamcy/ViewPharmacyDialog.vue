<script setup lang="ts">
import type Pharmacy from '#models/pharmacy';
import { inject, Ref } from 'vue';
import tuyau from '~/app/tuyau';
import { getFacilityPosition, getFacilityStaffRole } from '~/helpers';
import PharmacyRepresentative from './PharmacyRepresentative.vue';

const dialogRef = inject('dialogRef') as Ref<{ data: { pharmacy: Pharmacy } }>;

const pharmacy = dialogRef.value.data.pharmacy

const storedBranches = pharmacy.branches.sort((a, b) => (a.isMain != b.isMain) ? 1 : (a.name > b.name ? 1 : -1))

</script>

<template>
    <Toast></Toast>
    <div>
        <Toolbar class="mb-6">
            <template #start>
                <div class="flex flex-col gap-4 mr-6!">
                    <span>Representative</span>
                    <PharmacyRepresentative :pharmacy :withLink="true"></PharmacyRepresentative>
                </div>
            </template>

            <template #center>
                <div class="flex flex-col gap-4 mr-6!">
                    <span>Pharmacy</span>
                    <div v-if="pharmacy.owner" class="flex gap-2">
                        <div class="flex flex-col gap-1">
                            <span>Email: {{ pharmacy.email }}</span>
                            <span>Phone: {{ pharmacy.humanReadablePhoneNumber }}</span>
                            <span>&nbsp;</span>
                            <span>&nbsp;</span>
                            <span>&nbsp;</span>
                        </div>
                    </div>
                </div>
            </template>

            <template #end>
                <div class="flex flex-col">
                    <Link :href="tuyau.$url('dashboard.pharmacies.edit', { params: { id: pharmacy.id } })">
                    <Button icon="pi pi-pencil" severity="secondary" label="Edit"></Button>
                    </Link>
                    <span>&nbsp;</span>
                    <span>&nbsp;</span>
                    <span>&nbsp;</span>
                    <span>&nbsp;</span>
                    <span>&nbsp;</span>
                </div>
                <!-- <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" /> -->
            </template>
        </Toolbar>

        <DataTable ref="dt" :value="storedBranches" dataKey="id">
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Manage Branches</h4>
                    <div class="flex gap-4 items-center">
                        <!-- <Link :href="tuyau.$url('dashboard.staffs.new', { query: { facilityId: pharmacy?.id } })">
                        <Button label="New" icon="pi pi-plus" severity="secondary"></Button>
                        </Link> -->
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
                        <Chip v-if="data.isMain" class="text-sm w-fit p-1! rounded-sm!" label="main"></Chip>
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
            <Column header="Address">
                <template #body="{ data }">
                    <div class="flex flex-col">
                        <span class="">{{ data.village.topAddress }}</span>
                        <span class="text-sm">{{ data.village.bottomAddress }}</span>
                        <span class="text-sm">{{ data.postalBox }}</span>
                    </div>
                </template>
            </Column>


            <!-- <Column header="Role">
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

             -->

            <Column>
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <Link :href="tuyau.$url('dashboard.branches.view', { params: { id: data.id } })">
                        <Button icon="pi pi-eye" severity="secondary" @click="" rounded variant="outlined"></Button>
                        </Link>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>

</template>