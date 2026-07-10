<script setup lang="ts">
import { MedbookProductOverviewResponse } from '#types/api/medbook/stat_type';
import { PageState } from 'primevue';
import AvatarDisplay from '~/components/AvatarDisplay.vue';
import Pagination from '~/components/pagination.vue';

defineProps<{
    province?: string
    district?: string
    branches: MedbookProductOverviewResponse['wholesaler']
    isFiltering?: boolean
    title: string
}>()

defineEmits<{
    filter: [input: string]
    pageChange: [input: PageState]
}>()

const name = defineModel<string | undefined>('name', { required: true })

</script>
<template>
    <div class="card">

        <DataTable :loading="isFiltering" ref="dt" :value="branches.data" dataKey="id" :paginator="true"
            :rows="branches.meta.perPage">
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">{{ title }}</h4>
                    <div class="flex gap-4 items-center" v-if="branches.meta.lastPage > 1 || (name && name != '')">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search"></i>
                            </InputIcon>
                            <InputText :loading="isFiltering" :readonly="isFiltering" :maxlength="100"
                                @input="$emit('filter', '' + $event)" v-model="name" placeholder="Search..." />
                        </IconField>
                    </div>
                </div>
            </template>

            <Column header="Logo" class="w-1">
                <template #body="{ data }">
                    <AvatarDisplay :image="data.pharmacy.logo" :initial="data.initial"></AvatarDisplay>
                </template>
            </Column>

            <Column field="pharmacy" header="Name" style="min-width: 16rem">
                <template #body="{ data }">
                    <div class="flex flex-col gap-1">
                        <span class="">{{ data.pharmacy.name }}</span>
                        <Chip v-if="!province" class="text-sm w-fit">{{ data.address }}</Chip>
                    </div>
                </template>
            </Column>

            <Column header="Contacts">
                <template #body="{ data }">
                    <div class="flex flex-col gap-1">
                        <span>{{ data.phone }}</span>
                        <span>{{ data.phoneTwo }}</span>
                    </div>
                </template>
            </Column>

            <Column header="Qty." field="product.quantity"></Column>
            <!-- 
                <Column header="Representative">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span>{{ data.owner.profile.fullname }}</span>
                            <span>{{ data.owner.email }}</span>
                            <span>{{ data.owner.phoneNumber }}</span>
                        </div>
                    </template>
                </Column> -->

            <!-- <Column>
                    <template #body="{ data }">
                        <div class="flex gap-3">
                            <Link :href="tuyau.$url('dashboard.pharmacies.edit', { params: { id: data.id } })">
                            <Button icon="pi pi-eye" severity="secondary" rounded variant="outlined"></Button>
                            </Link>
                        </div>
                    </template>
                </Column> -->

            <template #paginatorcontainer>
                <Pagination @page-change="$emit('pageChange', $event)" :meta="branches.meta">
                </Pagination>
            </template>

        </DataTable>
    </div>
</template>