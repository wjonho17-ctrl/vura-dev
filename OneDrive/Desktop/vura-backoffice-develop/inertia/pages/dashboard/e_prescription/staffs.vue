<script setup lang="ts">
import tuyau from '~/app/tuyau';
import { getFacilityPosition, getFacilityStaffRole } from '~/helpers';


defineProps<{
    doctors: { meta: any, data: any[] }
}>()

</script>

<template>
    <Toast></Toast>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Link :href="tuyau.$route('dashboard.staffs.new').path">
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2"></Button>
                    </Link>
                    <!-- <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected"
                        :disabled="!selectedClients || !selectedClients.length" /> -->
                </template>

                <template #end>
                    <!-- <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" /> -->
                </template>
            </Toolbar>

            <DataTable ref="dt" :value="doctors.data" dataKey="id" :paginator="true" :rows="doctors.meta.perPage">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Doctors</h4>
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
                        <Chip class="w-fit text-sm"
                            :label="getFacilityStaffRole().find(r => r.value == data.role)?.label">
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

                <Column header="Facilities">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span>{{ data.healthFacilities.length }}</span>
                        </div>
                    </template>
                </Column>

                <Column>
                    <template #body="{ data }">
                        <Link :href="tuyau.$url('dashboard.staffs.edit', { params: { id: data.id } })">
                        <Button icon="pi pi-pencil" severity="info" rounded variant="outlined"></Button>
                        </Link>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>