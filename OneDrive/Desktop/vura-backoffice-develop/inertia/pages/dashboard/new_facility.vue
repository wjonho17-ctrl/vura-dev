<script setup lang="ts">
import type HealthFacility from '#models/health_facility'
import type Staff from '#models/staff'
import type Village from '#models/village'
import { useForm } from '@inertiajs/vue3'
import { useToast } from 'primevue'
import { computed, ref } from 'vue'
import tuyau from '~/app/tuyau'
import CoordinateInput from '~/components/CoordinateInput.vue'
import InputErrorMessage from '~/components/InputErrorMessage.vue'
import LocationSelect from '~/components/LocationSelect.vue'
import PhoneInput from '~/components/PhoneInput.vue'
import { getFacilityStaffRole } from '~/helpers'
import { showToastError, showToastSuccess } from '~/helpers/toast_helper'

const props = defineProps<{
    facility?: HealthFacility,
    village?: Village
}>()

const createFacilityForm = useForm({
    facilityId: props.facility?.id,
    adminId: props.facility?.adminId,
    name: props.facility?.name || '',
    postalBox: props.facility?.postalBox || '',
    phone: props.facility?.phone || '',
    phoneTwo: props.facility?.phoneTwo || '',
    email: props.facility?.email || '',
    villageId: props.facility?.villageId || -1,
    longitude: props.facility?.longitude || 0,
    latitude: props.facility?.latitude || 0,
    coordinates: props.facility ? `${props.facility.latitude},${props.facility.longitude}` : null
})

const toast = useToast()
const facilityAdmin = ref<Staff | null>(props.facility?.admin || null)

const isSavable = computed(() => {
    return createFacilityForm.villageId > 0
})

function handleFormSubmit() {

    const link = props.facility
        ? tuyau.$route('dashboard.facilities.update').path
        : tuyau.$route('dashboard.facilities.create').path

    createFacilityForm.adminId = facilityAdmin.value?.id

    createFacilityForm.post(link, {
        onSuccess() {

            if (!props.facility) {
                createFacilityForm.resetAndClearErrors()

                createFacilityForm.villageId = -1
            }

            showToastSuccess({
                toast,
                detail: props.facility ? 'Health Facility updated successfully!' : 'Health Facility added successfully!'
            })
        },
        onError(error) {
            const formKeys = Object.keys(createFacilityForm.data())

            if (Object.keys(error).find(k => formKeys.includes(k))) return

            showToastError({ toast, detail: error?.message || 'cannot add health facility' })
        }
    })
}

</script>
<template>
    <Toast></Toast>
    <div class="md:flex gap-10">
        <div class="space-y-4! md:w-1/2">
            <h2>{{ facility ? 'Edit' : 'Add New' }} Health Facility</h2>
            <div class="flex gap-1">
                <div class="flex flex-col gap-2 w-full">
                    <label for="firstname" class="font-bold">Name</label>
                    <InputText fluid id="firstname" v-model="createFacilityForm.name" />
                    <Message severity="error" variant="simple" size="small" v-if="createFacilityForm.errors.name"
                        class="p-error">{{
                            createFacilityForm.errors['name'] }}</Message>
                </div>
            </div>

            <div class="flex gap-4 ">
                <div class="flex flex-col gap-1 w-full">
                    <label for="lastname" class="text-lg font-bold">Phone</label>
                    <PhoneInput v-model="createFacilityForm.phone" :error="createFacilityForm.errors.phone">
                    </PhoneInput>
                </div>

                <div class="flex flex-col gap-1 w-full">
                    <label for="phone" class="text-lg font-bold">Phone Two (optional)</label>
                    <PhoneInput v-model="createFacilityForm.phoneTwo" :error="createFacilityForm.errors.phoneTwo">
                    </PhoneInput>
                </div>
            </div>


            <div class="flex gap-4 ">
                <div class="flex flex-col gap-1 w-full">
                    <label for="email" class="text-lg font-bold">Email</label>
                    <InputText type="email" fluid v-model="createFacilityForm.email" placeholder="Enter email" />
                    <Message severity="error" variant="simple" size="small" v-if="createFacilityForm.errors['email']"
                        class="p-error">{{
                            createFacilityForm.errors['email'] }}</Message>
                </div>
                <div class="flex flex-col gap-1 w-full">
                    <label for="email" class="text-lg font-bold">Postal Box</label>
                    <InputText type="email" fluid v-model="createFacilityForm.postalBox" placeholder="Enter P.O" />
                    <Message severity="error" variant="simple" size="small"
                        v-if="createFacilityForm.errors['postalBox']" class="p-error">{{
                            createFacilityForm.errors['postalBox'] }}</Message>
                </div>
            </div>

            <div class="">
                <LocationSelect v-model:villageId="createFacilityForm.villageId"
                    :oldProvinceId="village?.cell?.sector?.district?.provinceId"
                    :oldDistrictId="village?.cell?.sector?.districtId" :oldSectorId="village?.cell?.sectorId"
                    :oldCellId="village?.cellId" :oldVillageId="village?.id"></LocationSelect>
            </div>
            <div class="" v-if="createFacilityForm.villageId > 0">
                <CoordinateInput optional v-model:latitude="createFacilityForm.latitude"
                    v-model:longitude="createFacilityForm.longitude"></CoordinateInput>
            </div>
        </div>
        <Divider class="md:hidden!" v-if="facility"></Divider>
        <div class="space-y-4!" v-if="facility">
            <h2>Administrator</h2>
            <p class="text-sm text-gray-500">An admin is required to manage this facility. You can add an admin
                after creating the facility.</p>
            <!-- add input to select admin and button to add new staff -->
            <Link :href="tuyau.$url('dashboard.staffs.new', { query: { facilityId: facility?.id } })">
            <Button label="Add Admin" icon="pi pi-user-plus" severity="secondary"></Button>
            </Link>
            <Select v-model="facilityAdmin" fluid v-if="facility?.staffs && facility?.staffs.length >= 1" filter
                :options="facility?.staffs" showClear placeholder="Select Admin">
                <template #value="{ value }">
                    <div v-if="value" class="flex items-center gap-2">
                        <Avatar size="large" :label="value.photo?.url ? undefined : value.initial" :image="value.photo?.url" alt="avatar"
                            class="w-8 h-8 rounded-full object-cover" />
                        <div class="flex flex-col gap-1">
                            <span>{{ value.fullname }}</span>
                            <div class="flex items-center gap-1">
                            <Chip class="text-xs!"
                                :label="getFacilityStaffRole().find(r => r.value == value.role)?.label"></Chip>
                            <Chip class="text-xs!" :label="value.position"></Chip>
                            </div>
                        </div>
                    </div>
                </template>
                <template #option="{ option }">
                    <div class="flex items-center gap-2">
                        <Avatar :label="option.photo?.url ? undefined : option.initial" :image="option.photo?.url" alt="avatar"
                            class="w-8 h-8 rounded-full object-cover" />
                        <div class="flex flex-col gap-1">
                            <span>{{ option.fullname }}</span>
                            <div class="flex items-center gap-1">
                                <Chip class="text-xs!"
                                    :label="getFacilityStaffRole().find(r => r.value == option.role)?.label"></Chip>
                                <Chip class="text-xs!" :label="option.position"></Chip>
                            </div>
                        </div>

                    </div>
                </template>
            </Select>
            <InputErrorMessage :error="createFacilityForm.errors.adminId"></InputErrorMessage>
        </div>
    </div>
    <div class="flex justify-end gap-3 py-4 md:w-1/2">
        <Link :href="tuyau.$url('dashboard.facilities.list')">
        <Button v-if="facility" :disabled="createFacilityForm.processing || !isSavable"
            :loading="createFacilityForm.processing" label="Cancel" icon="pi pi-times" severity="contrast" outlined
            form="new-client"></Button>
        </Link>

        <Button :disabled="createFacilityForm.processing || !isSavable" :loading="createFacilityForm.processing"
            :label="facility ? 'Update' : 'Save'" icon="pi pi-check" @click="handleFormSubmit"
            form="new-client"></Button>
    </div>

</template>