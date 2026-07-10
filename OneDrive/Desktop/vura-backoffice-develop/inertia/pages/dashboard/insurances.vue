<script setup lang="ts">
import { InsuranceResponse } from '#types/api/medbook/insurance_type';
import InsuranceTabs from '~/components/partials/dashboard/insurance/InsuranceTabs.vue';
import { FilterMatchMode } from '@primevue/core/api';
import { ref } from 'vue';

defineProps<{
    insurances: InsuranceResponse[]
}>()

const filters = ref({
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    tin: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
</script>

<template>
    <Toast></Toast>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <InsuranceTabs></InsuranceTabs>
                </template>
            </Toolbar>


            <DataTable ref="dt"  v-model:filters="filters"  filter-display="row" dataKey="name" :value="insurances">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Insurance List</h4>
                    </div>
                </template>

                <Column header="Logo">
                    <template #body="{ data }">
                        <Image image-class="rounded-full! object-contain!" v-if="data.logoUrl" :src="data.logoUrl"
                            width="52"></Image>
                    </template>
                </Column>

                <Column header="Name" filter-field="name">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span>{{ data.name }}</span>
                            <small>{{ data.fullname }}</small>
                        </div>

                    </template>
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
                            placeholder="Search by name" />
                    </template>
                </Column>
                
                <Column header="TIN" field="tin" filter-field="tin">
                    <template #filter="{ filterModel, filterCallback }">
                        <InputText v-model="filterModel.value" type="text" @input="filterCallback()"
                            placeholder="Search by name" />
                    </template>
                </Column>
                <Column header="Pharmacies">
                    <template #body="{ data }">
                        {{ data.pharmacies.length }}
                    </template>
                </Column>
                <Column header="Contact">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span>{{ data.email }}</span>
                            <small>{{ data.phoneNumber.replace('+25', '') }}</small>
                            <small v-if="data.phoneNumberTwo">{{ data.phoneNumberTwo.replace('+25', '') }}</small>
                        </div>
                    </template>
                </Column>
                <Column header="Address">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span>{{ data.address }}</span>
                            <small v-if="data.postalBox">{{ data.postalBox }}</small>
                        </div>
                    </template>
                </Column>

            </DataTable>
        </div>
    </div>
</template>