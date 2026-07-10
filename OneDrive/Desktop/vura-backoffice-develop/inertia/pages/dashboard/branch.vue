<script setup lang="ts">
import type PharmacyBranch from '#models/pharmacy_branch';
import PharmacistProfile from '~/components/partials/dashboard/pharamcy/PharmacistProfile.vue';
import PharmacyProfile from '~/components/partials/dashboard/pharamcy/PharmacyProfile.vue';

const props = defineProps<{
    branch: PharmacyBranch
}>()


const employeesTable = [
    {
        title: 'Branch',
        data: props.branch.pharmacy.employeeProfiles.filter(item => item.currentBranchId === props.branch.id)
    },
    {
        title: 'ALL',
        data: props.branch.pharmacy.employeeProfiles.filter(item => item.currentBranchId !== props.branch.id)
    }
]


</script>
<template>

    <h3 class="flex items-center gap-1">Branch: {{ branch.name }} <Chip label="Main" class="text-sm" severity="success"
            v-if="branch.isMain"></Chip>
    </h3>

    <div>
        <div class="flex w-full justify-between flex-col gap-4 sm:flex-row">
            <div>
                <h5>Pharmacy Infos</h5>
                <PharmacyProfile :pharmacy="branch.pharmacy"></PharmacyProfile>
            </div>

            <div>
                <h5>Representative</h5>
                <PharmacistProfile :user="branch.pharmacy.owner"></PharmacistProfile>
            </div>
        </div>

        <div class="lg:flex pt-12!">
            <template v-for="(employees, index) in employeesTable">
                <DataTable class="w-full" ref="dt" :value="employees.data" dataKey="id">
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">{{ employees.title }} Employees </h4>
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
                                <span>{{ data.user.profile.lastname }}</span>
                                <span class="text-sm">{{ data.user.profile.firstname }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column header="Branch">
                        <template #body="{ data }">
                            <div class="flex flex-col">
                                <span>{{ data.branch.name }}</span>
                                <span class="text-sm">{{ data.user.profile.gender === 'M' ? 'MALE' : 'FEMALE' }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column header="Contact">
                        <template #body="{ data }">
                            <div class="flex flex-col">
                                <span>{{ data.user.email }}</span>
                                <span class="text-sm">{{ data.user.phoneNumber }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column header="Position">
                        <template #body="{ data }">
                            <div class="flex flex-col">
                                <span>{{ data.position }}</span>
                                <span class="text-sm">{{ data.user.profile.gender === 'M' ? 'MALE' : 'FEMALE' }}</span>
                            </div>
                        </template>
                    </Column>
                </DataTable>
                <Divider class="hidden! lg:block!" layout="vertical" v-if="index == 0"></Divider>
                <Divider class="md:hidden!" layout="horizontal" v-if="index == 0"></Divider>
            </template>
        </div>
    </div>
</template>