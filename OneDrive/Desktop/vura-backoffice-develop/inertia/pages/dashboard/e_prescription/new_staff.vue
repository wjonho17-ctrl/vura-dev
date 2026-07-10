<script setup lang="ts">
import { HospitalPosition } from '#enums/prescription_user_enum'
import type HealthFacility from '#models/health_facility'
import type Staff from '#models/staff'
import { useForm } from '@inertiajs/vue3'
import debounce from 'lodash.debounce'
import { useToast } from 'primevue'
import { computed, ref } from 'vue'
import tuyau from '~/app/tuyau'
import AvatarUploader from '~/components/AvatarUploader.vue'
import InputErrorMessage from '~/components/InputErrorMessage.vue'
import PhoneInput from '~/components/PhoneInput.vue'
import { getFacilityPosition, getFacilitySpecilities, getFacilityStaffRole, getGendersOptions, positionNeedsSpecialty } from '~/helpers'
import { showToastError, showToastSuccess } from '~/helpers/toast_helper'

const props = defineProps<{
    staff?: Staff
    facility?: HealthFacility
}>()

const createStaffForm = useForm({
    isPhotoDeleted: false,
    staffId: props.staff?.id,
    image: null as File | null,
    firstname: props?.staff?.firstname || '',
    lastname: props?.staff?.lastname || '',
    email: props?.staff?.email || '',
    phone: props?.staff?.phone || '',
    regno: props?.staff?.regno || '',
    genre: props?.staff?.genre || '',
    role: props?.staff?.role || '',
    healthFacilityId: props?.staff?.healthFacilityId || props?.facility?.id || undefined,
    position: props?.staff?.position || '' as HospitalPosition,
    specialities: { data: props.staff?.specialities?.data || [] } as { data: string[] }
})

const toast = useToast()
const facilityValue = ref<{ name: string, id: string } | null>(props.facility || null)
const facilitySuggestions = ref<{ name: string, id: string }[]>([])
const isFecthingFacilities = ref(false)
const facilitySpecilities = ref(getFacilitySpecilities())

const isSpecialitiesSelectable = computed(() => positionNeedsSpecialty(createStaffForm.position))

const isSavable = computed(() => {
    return !!props.staff || createStaffForm.healthFacilityId != undefined
})

function handleFormSubmit() {
    const link = props.staff ? tuyau.$route('dashboard.staffs.update').path : tuyau.$route('dashboard.staffs.create').path

    createStaffForm.post(link, {
        onSuccess() {

            if (!props.staff) {
                createStaffForm.resetAndClearErrors()
            }

            showToastSuccess({ toast, detail: `client ${props.staff ? 'updated' : 'created'} successfully!`, })
        },
        onError(error) {
            const formKeys = Object.keys(createStaffForm.data())

            if (Object.keys(error).find(k => formKeys.includes(k))) return

            showToastError({ toast, detail: error?.message || 'cannot add doctor' })
        }
    })
}

const searchFacility = debounce(async (event: any) => {
    isFecthingFacilities.value = true
    try {
        const {facilities} = await tuyau.dashboard.facilities.list.$get({ query: { name: event.query.trim() } }).unwrap() as any
        facilitySuggestions.value = facilities.data
    } catch (error: any) {
        showToastError({ toast, detail: error?.message || 'Cannot fecth products. please contact support!' })
    }

    isFecthingFacilities.value = false
}, 400)

function handleOptionSelect() {
    createStaffForm.healthFacilityId = facilityValue.value?.id
}

</script>
<template>
    <Toast></Toast>

    <h2>{{ staff ? 'Edit' : 'New' }} Facility Staff {{ facility ? `For: ${facility.name}` : '' }}</h2>
    <div class="md:flex gap-10">

        <div class="md:flex w-full md:w-fit justify-center items-center">
            <AvatarUploader @delete="createStaffForm.isPhotoDeleted = true"
                @reset="createStaffForm.isPhotoDeleted = false" :oldImage="props?.staff?.photo?.url"
                v-model="createStaffForm.image" label="Photo"></AvatarUploader>
            <InputErrorMessage :error="createStaffForm.errors.image"></InputErrorMessage>
        </div>
        <div class="space-y-4!">
            <div class="flex gap-3 w-full">
                <div class="space-y-2 w-full" v-if="!staff">
                    <label for="email" class="block font-bold">Helth Facility</label>
                    <AutoComplete :disabled="!!facility" v-model="facilityValue" fluid
                        :suggestions="facilitySuggestions" option-label="name" @item-select="handleOptionSelect"
                        @complete="searchFacility">
                    </AutoComplete>
                    <InputErrorMessage :error="createStaffForm.errors.healthFacilityId"></InputErrorMessage>
                </div>
                <div class="space-y-2 w-full">
                    <label for="role" class="block font-bold">Role</label>
                    <Select fluid v-model="createStaffForm.role" option-label="label" option-value="value"
                        :options="getFacilityStaffRole().filter(r => r.value != '1')"></Select>
                    <InputErrorMessage :error="createStaffForm.errors.role"></InputErrorMessage>
                </div>
            </div>

            <div class="flex gap-3 w-full">
                <div class="space-y-2 w-full">
                    <label for="lastname" class="font-bold">Lastname</label>
                    <InputText fluid id="lastname" placeholder="Enter lastname" v-model="createStaffForm.lastname" />
                    <InputErrorMessage :error="createStaffForm.errors.lastname"></InputErrorMessage>
                </div>
                <div class="space-y-2 w-full">
                    <label for="name" class="font-bold">Name</label>
                    <InputText fluid id="name" placeholder="Enter name" v-model="createStaffForm.firstname" />
                    <InputErrorMessage :error="createStaffForm.errors.firstname"></InputErrorMessage>
                </div>
            </div>
            <div class="space-y-2 w-1/2">
                <label for="role" class="block font-bold">Gender</label>
                <Select fluid v-model="createStaffForm.genre" option-label="label" option-value="value"
                    :options="getGendersOptions()"></Select>
                <InputErrorMessage :error="createStaffForm.errors.genre"></InputErrorMessage>
            </div>

            <div class="flex gap-3 w-full">
                <div class="space-y-2 w-full">
                    <label for="email" class="font-bold">Email</label>
                    <InputText fluid id="email" placeholder="Enter email" v-model="createStaffForm.email" />
                    <InputErrorMessage :error="createStaffForm.errors.email"></InputErrorMessage>
                </div>
                <div class="space-y-2 w-full">
                    <label for="phone" class="font-bold">Phone</label>
                    <PhoneInput v-model="createStaffForm.phone" :error="createStaffForm.errors.phone"></PhoneInput>
                </div>
            </div>


            <div class="flex gap-3 w-full">
                <div class="space-y-2 w-full">
                    <label for="email" class="font-bold">Reg N<sup>o</sup> (optional)</label>
                    <InputText fluid id="email" placeholder="Enter email" v-model="createStaffForm.regno" />
                    <InputErrorMessage :error="createStaffForm.errors.regno"></InputErrorMessage>
                </div>
                <div class="space-y-2 w-full">
                    <label for="role" class="block font-bold">Position</label>
                    <Select filter fluid v-model="createStaffForm.position" option-label="label" option-value="value"
                        :options="getFacilityPosition()"></Select>
                    <InputErrorMessage :error="createStaffForm.errors.position"></InputErrorMessage>
                </div>

            </div>

            <div class="w-full flex justify-end">
                <Button :disabled="createStaffForm.processing || !isSavable" :loading="createStaffForm.processing"
                    :label="staff ? 'Update' : 'Save'" icon="pi pi-check" @click="handleFormSubmit"
                    form="new-client"></Button>
            </div>
        </div>

        <div class="space-y-1 hidden md:block" v-if="isSpecialitiesSelectable">
            <div class="space-y-2">
                <label for="role" class="block font-bold">Specialities</label>
                <MultiSelect fluid :maxSelectedLabels="2" filter v-model="createStaffForm.specialities.data"
                    option-label="label" option-value="value" :options="facilitySpecilities">
                </MultiSelect>
                <InputErrorMessage :error="createStaffForm.errors.specialities"></InputErrorMessage>
            </div>
            <Listbox fluid filter
                :options="facilitySpecilities.filter(s => createStaffForm.specialities.data.includes(s.value))"
                option-label="label">
            </Listbox>
        </div>
    </div>



</template>