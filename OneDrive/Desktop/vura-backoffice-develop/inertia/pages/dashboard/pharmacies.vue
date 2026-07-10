<script setup lang="ts">
import District from '#models/district';
import type Pharmacy from '#models/pharmacy';
import Province from '#models/province';
import { router } from '@inertiajs/vue3';
import { useDialog } from 'primevue';
import { defineAsyncComponent, nextTick, onMounted } from 'vue';
import tuyau from '~/app/tuyau';
import AvatarDisplay from '~/components/AvatarDisplay.vue';
import PageTitle from '~/components/PageTitle.vue';
import Pagination from '~/components/pagination.vue';
import { useFiltering } from '~/composables/filtering';

const props = defineProps<{
    pharmacies: { meta: any, data: any[] }
    provinces: Province[],
    districts: District[]
}>()

const ViewComponent = defineAsyncComponent(() => import('~/components/partials/dashboard/pharamcy/ViewPharmacyDialog.vue'));
const dialog = useDialog()

const { qs, applyFilter, isFiltering, handlePageChange, clear } = useFiltering<{
    currentPharmacyId?: string, searchQuery?: string, type?: number,
    provinceId?: number, districtId?: number
}>()

onMounted(() => {
    if (qs?.currentPharmacyId) {
        const facility = props.pharmacies.data.find(f => f.id == qs.currentPharmacyId)
        if (facility) handleView(facility)
    }
})

const handleView = (pharmacy: Pharmacy) => {
    dialog.open(ViewComponent, {
        props: {
            header: `${pharmacy.name}`,
            modal: true,
            maximizable: true
        },
        data: { pharmacy },
        onClose() {
            qs.currentPharmacyId = undefined
        },
    })

    qs.currentPharmacyId = pharmacy.id
}

function openNew() {
    router.get(tuyau.$route('dashboard.pharmacies.new.view').path)
}

</script>
<template>
    <Toast></Toast>
    <DynamicDialog></DynamicDialog>

    <div class="card">
        <PageTitle title="Pharmacies" size="large" description="Manage all pharmacies"></PageTitle>

        <DataTable ref="dt" :value="pharmacies.data" dataKey="id" :paginator="true" :rows="pharmacies.meta.perPage">
            <template #header>
                <!-- <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Manage Pharmacies</h4>
                    
                </div> -->
                <Toolbar class="mb-6">
                    <template #end>
                        <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                        <!-- <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected"
            :disabled="!selectedClients || !selectedClients.length" /> -->
                    </template>

                    <template #start>
                        <div class="flex gap-4 items-center">
                            <Select @value-change="applyFilter" v-model="qs.type" optionLabel="label"
                                optionValue="value" :loading="isFiltering" showClear placeholder="select type"
                                :options="[{ label: 'Wholesaler', value: 1 }, { label: 'Retailer', value: 2 }]"></Select>
                            <Select :loading="isFiltering" @value-change="applyFilter" v-model="qs.provinceId"
                                optionLabel="name" optionValue="id" :options="provinces" placeholder="Select a province"
                                @valueChange="qs.districtId = undefined" showClear></Select>
                            <Select :loading="isFiltering" @value-change="applyFilter"
                                v-model="qs.districtId" optionLabel="name" optionValue="id" :options="districts"
                                placeholder="Select a district" showClear></Select>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search"></i>
                                </InputIcon>
                                <InputText :maxlength="100" @input="applyFilter" v-model="qs.searchQuery"
                                    placeholder="Search..." />
                            </IconField>
                            <Button :loading="isFiltering" :disabled="isFiltering" @click="clear"
                                icon="pi pi-filter-slash" severity="secondary"></Button>
                        </div>
                        <!-- <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" /> -->
                    </template>
                </Toolbar>
            </template>

            <Column header="Logo" class="w-1">
                <template #body="{ data }">
                    <AvatarDisplay :image="data.logo" :initial="data.initial"></AvatarDisplay>
                </template>
            </Column>

            <Column field="pharmacy" header="Name" style="min-width: 16rem">
                <template #body="{ data }">
                    <div class="flex flex-col gap-1">
                        <span class="">{{ data.name }}</span>
                        <Chip v-if="data.isWholeseller" class="text-sm w-fit">Wholeseller</Chip>
                    </div>
                </template>
            </Column>

            <Column header="Contacts">
                <template #body="{ data }">
                    <div class="flex flex-col gap-1">
                        <span>{{ data.email }}</span>
                        <span>{{ data.phoneNumber }}</span>
                    </div>
                </template>
            </Column>

            <Column header="Representative">
                <template #body="{ data }">
                    <div class="flex flex-col">
                        <span>{{ data.owner.profile.fullname }}</span>
                        <span>{{ data.owner.email }}</span>
                        <span>{{ data.owner.phoneNumber }}</span>
                    </div>
                </template>
            </Column>

            <Column>
                <template #body="{ data }">
                    <div class="flex gap-3">
                        <Button icon="pi pi-eye" severity="secondary" @click="handleView(data)" rounded
                            variant="outlined"></Button>
                        <Link :href="tuyau.$url('dashboard.pharmacies.edit', { params: { id: data.id } })">
                        <Button icon="pi pi-pencil" severity="info" rounded variant="outlined"></Button>
                        </Link>
                    </div>
                </template>
            </Column>

            <template #paginatorcontainer>
                <Pagination @page-change="handlePageChange" :meta="pharmacies.meta"></Pagination>
            </template>

        </DataTable>
    </div>


    <!-- <Dialog v-model:visible="deleteClientDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">

      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteClientDialog = false" />
        <Button label="Yes" icon="pi pi-check" @click="deleteClient" />
      </template>
    </Dialog> -->

    <!-- <Dialog v-model:visible="deleteClientsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle text-3xl!" />
        <span v-if="product">Are you sure you want to delete the selected products?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteClientsDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedClients" />
      </template>
    </Dialog> -->
</template>