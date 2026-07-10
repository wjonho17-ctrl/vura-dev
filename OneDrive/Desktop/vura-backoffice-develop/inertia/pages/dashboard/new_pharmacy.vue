<script setup lang="ts">
import type Pharmacy from '#models/pharmacy'
import { useForm } from '@inertiajs/vue3'
import debounce from 'lodash.debounce'
import { useToast } from 'primevue'
import { computed, ref, useTemplateRef } from 'vue'
import tuyau from '~/app/tuyau'
import AvatarUploader from '~/components/AvatarUploader.vue'
import CoordinateInput from '~/components/CoordinateInput.vue'
import InputErrorMessage from '~/components/InputErrorMessage.vue'
import LocationSelect from '~/components/LocationSelect.vue'
import PhoneInput from '~/components/PhoneInput.vue'
import { getGendersOptions } from '~/helpers'
import { showToastError, showToastSuccess } from '~/helpers/toast_helper'

const props = defineProps<{
  pharmacy?: Pharmacy
}>()

const fdaLicenseInput = useTemplateRef('fda-license-input-file')
const pharmacyLicenseInput = useTemplateRef('pharmacy-license-file-input')

const mainBranch = props.pharmacy?.branches?.find(b => b.isMain)
const owner = props.pharmacy?.owner

const createPharmacyForm = useForm({
  pharmacyId: props.pharmacy?.id,
  isLogoDeleted: false,
  name: props.pharmacy?.name || '',
  isWholeseller: props.pharmacy?.isWholeseller || false,
  isImporter: props.pharmacy?.isImporter || false,
  logo: null as null | File,
  tin: props.pharmacy?.tin?.toString() || null,
  postalBox: props.pharmacy?.postalBox || '',
  email: props.pharmacy?.email || '',
  phoneNumber: props.pharmacy?.phoneNumber || '',
  phoneNumberTwo: props.pharmacy?.phoneNumberTwo || '',
  branch: {
    villageId: mainBranch?.villageId || -1,
    longitude: mainBranch?.longitude || 0,
    latitude: mainBranch?.latitude || 0,
  },
  profile: {
    phone: owner?.phone || '',
    email: owner?.email || '',
    firstname: owner?.profile?.firstname || '',
    lastname: owner?.profile?.lastname || '',
    gender: owner?.profile?.gender || '',
    fdaLiscense: null,
    pharmacistLiscense: null
  }
})

const toast = useToast()

const isSavable = computed(() => {
  return createPharmacyForm.branch.villageId > 0
})

function handleFormSubmit() {
  const link = props.pharmacy ? tuyau.$route('dashboard.pharamacies.update').path : tuyau.$route('dashboard.pharamacies.store').path
  createPharmacyForm.post(link, {
    onSuccess() {
      createPharmacyForm.resetAndClearErrors()
      
      if (fdaLicenseInput.value) fdaLicenseInput.value.value = ''
      if (pharmacyLicenseInput.value) pharmacyLicenseInput.value.value = ''

      showToastSuccess({ toast, detail: `pharmacy ${props.pharmacy ? 'updated' : 'added'} successfully!`, summary: `${props.pharmacy ? 'Update' : 'New'} Client` })
    },
    onError(error) {
      console.error(error)
      const formKeys = Object.keys(createPharmacyForm.data())

      if (Object.keys(error).find(k => formKeys.includes(k))) return

      showToastError({ toast, detail: error?.message || `cannot ${props.pharmacy ? 'update' : 'add'} pharmacy!` })
    }
  })
}

const handleUpdatePharmacy = debounce(() => {
  if (!props.pharmacy) return
  handleFormSubmit()
}, 400)

</script>
<template>
  <Toast></Toast>

  <h2>New Pharmacy</h2>
  <div class="md:flex gap-8">
    <div>
      <AvatarUploader v-model="createPharmacyForm.logo" label="Logo"></AvatarUploader>
      <InputErrorMessage :error="createPharmacyForm.errors.logo"></InputErrorMessage>
    </div>

    <div class="space-y-4!">
      <h4>General Infos</h4>
      <div class="flex gap-10">
        <div class="flex items-center gap-2">
          <label for="is_whaleseller" class="font-bold">Is Wholesaler</label>
          <ToggleSwitch :readonly="!!pharmacy" v-model="createPharmacyForm.isWholeseller" />
        </div>
        <div v-if="createPharmacyForm.isWholeseller" class="flex items-center gap-2">
          <label for="is_importer" class="font-bold">Is Importer</label>
          <ToggleSwitch @value-change="handleUpdatePharmacy" v-model="createPharmacyForm.isImporter" />
        </div>
      </div>

      <div class="flex gap-3 w-full">
        <div class="space-y-2 w-full">
          <label for="name" class="font-bold">Name</label>
          <InputText fluid id="name" placeholder="Enter name" v-model="createPharmacyForm.name" />
          <InputErrorMessage :error="createPharmacyForm.errors.name"></InputErrorMessage>
        </div>

        <div class="space-y-2 w-full">
          <label for="tin" class="font-bold">TIN</label>
          <InputText :minlength="9" :maxlength="9" mode="decimal" fluid v-model="createPharmacyForm.tin"
            placeholder="Enter TIN" />
          <InputErrorMessage :error="createPharmacyForm.errors.tin"></InputErrorMessage>
        </div>
      </div>

      <div class="flex gap-3 w-full">
        <div class="space-y-2 w-full">
          <label for="email" class="font-bold">Email</label>
          <InputText type="email" fluid v-model="createPharmacyForm.email" placeholder="Enter email" />
          <InputErrorMessage :error="createPharmacyForm.errors.email"></InputErrorMessage>
        </div>
        <div class="space-y-2 w-full">
          <label for="pobox" class="font-bold">Postal Box (optional)</label>
          <InputText id="pobox" fluid v-model="createPharmacyForm.postalBox" placeholder="ex: P.O 1234" />
          <InputErrorMessage :error="createPharmacyForm.errors.postalBox"></InputErrorMessage>
        </div>
      </div>

      <div class="flex gap-3">
        <div class="space-y-2 w-full">
          <label for="phone" class="font-bold">Phone</label>
          <PhoneInput v-model="createPharmacyForm.phoneNumber" :error="createPharmacyForm.errors.phoneNumber">
          </PhoneInput>
        </div>
        <div class="space-y-2 w-full">
          <template v-if="createPharmacyForm.phoneNumber.length === 13">
            <label for="phone2" class="font-bold">2<sup>nd</sup> Phone (optional)</label>
            <PhoneInput v-model="createPharmacyForm.phoneNumberTwo" :error="createPharmacyForm.errors.phoneNumberTwo">
            </PhoneInput>
          </template>
        </div>
      </div>

      <LocationSelect v-model:villageId="createPharmacyForm.branch.villageId"
        :oldProvinceId="mainBranch?.village.cell?.sector?.district?.provinceId"
        :oldDistrictId="mainBranch?.village?.cell?.sector?.districtId"
        :oldSectorId="mainBranch?.village?.cell?.sectorId" :oldCellId="mainBranch?.village?.cellId"
        :oldVillageId="mainBranch?.village?.id"></LocationSelect>
      <div class="w-1/2">
        <CoordinateInput optional v-model:latitude="createPharmacyForm.branch.latitude"
          v-model:longitude="createPharmacyForm.branch.longitude"></CoordinateInput>
      </div>

    </div>
    <Divider class="md:hidden!"></Divider>
    <div class="space-y-4!">
      <h4>Representative Infos</h4>
      <div class="flex flex-col gap-2">
        <label for="firstname" class="font-bold">Firstname</label>
        <InputText :disabled="!!pharmacy" id="firstname" v-model="createPharmacyForm.profile.firstname" />
        <InputErrorMessage :error="createPharmacyForm.errors['profile.firstname']"></InputErrorMessage>
      </div>

      <div class="flex flex-col gap-2">
        <label for="lastname" class="font-bold">Lastname</label>
        <InputText :disabled="!!pharmacy" id="lastname" v-model="createPharmacyForm.profile.lastname" />
        <InputErrorMessage :error="createPharmacyForm.errors['profile.lastname']"></InputErrorMessage>
      </div>

      <div class="flex flex-col gap-2 w-fit">
        <label for="gender" class="font-bold">Gender</label>
        <Select :disabled="!!pharmacy" id="gender" :options="getGendersOptions()" optionLabel="label"
          optionValue="value" v-model="createPharmacyForm.profile.gender" placeholder="Select gender"></Select>
        <InputErrorMessage :error="createPharmacyForm.errors['profile.gender']"></InputErrorMessage>
      </div>

      <div class="flex flex-col gap-2">
        <label for="email" class="font-bold">Email</label>
        <InputText :disabled="!!pharmacy" type="email" v-model="createPharmacyForm.profile.email"
          placeholder="Enter email" />
        <InputErrorMessage :error="createPharmacyForm.errors['profile.email']"></InputErrorMessage>

      </div>
      <div class="flex flex-col gap-2">
        <label for="phone" class="font-bold">Phone</label>
        <PhoneInput :disabled="!!pharmacy" v-model="createPharmacyForm.profile.phone"
          :error="createPharmacyForm.errors['profile.phone']">
        </PhoneInput>
      </div>

      <div class="flex flex-col gap-2" v-if="!pharmacy">
        <label for="gender" class="font-bold">Fda Liscence</label>
        <input ref="fda-license-input-file" type="file"
          @input="createPharmacyForm.profile.fdaLiscense = ($event.target as any).files[0]"></input>
        <InputErrorMessage :error="createPharmacyForm.errors['profile.fdaLiscense']"></InputErrorMessage>
      </div>
      <div class="flex flex-col gap-2" v-if="!pharmacy">
        <label for="gender" class="font-bold">Pharmacist Liscence</label>
        <input ref="pharmacy-license-file-input" type="file"
          @input="createPharmacyForm.profile.pharmacistLiscense = ($event.target as any).files[0]"></input>
        <InputErrorMessage :error="createPharmacyForm.errors['profile.pharmacistLiscense']"></InputErrorMessage>

      </div>

      <div v-if="!pharmacy" class="w-full flex justify-end" :class="{ 'mt-8!': pharmacy }">
        <Button :disabled="createPharmacyForm.processing || !isSavable" :loading="createPharmacyForm.processing"
          :label="pharmacy ? 'Update' : 'Save'" icon="pi pi-check" @click="handleFormSubmit" form="new-client"></Button>
      </div>
    </div>
  </div>




</template>