<script setup lang="ts">
import type { MedbookProvince } from '#types/api/medbook/location_type';
import type { MedbookTransporter } from '#types/api/medbook/transporter_type';
import { useForm } from '@inertiajs/vue3';
import { useToast } from 'primevue';
import { inject, onMounted, Ref, ref } from 'vue';
import tuyau from '~/app/tuyau';
import PhoneInput from '~/components/PhoneInput.vue';
import { getGendersOptions, TRANSPORTER_TYPES_OPTIONS } from '~/helpers';
import { showToastError, showToastSuccess } from '~/helpers/toast_helper';

const dialogRef = inject('dialogRef') as Ref<{ data: { transporter?: MedbookTransporter['data'][0] }, close: Function }>

const transporter = dialogRef.value.data.transporter

const provinces = ref<MedbookProvince[]>([])
const isProvinceFetching = ref(false)

const status = [
  { label: 'Working', value: 1 },
  { label: 'Not Working', value: 2 },
  { label: 'Inactive', value: 3 },
]

const createTransporterForm = useForm({
  roleId: 7,
  transporterId: transporter?.id,
  status: transporter?.transporterProfile?.isActive ? (transporter?.transporterProfile?.isWorking ? 1 : 2) : 3,
  type: transporter?.transporterProfile.type || 'MOTO',
  phone: transporter?.phone || '',
  email: transporter?.email || '',
  provinceId: transporter?.transporterProfile?.provinceId || -1,
  profile: {
    firstname: transporter?.profile.firstname || '',
    lastname: transporter?.profile.lastname || '',
    gender: transporter?.profile?.gender
  }
})

const toast = useToast()

async function fecthLocations() {
  isProvinceFetching.value = true

  try {
    const query = {
      type: 'PROVINCE'
    }

    const data = await tuyau.dashboard.locations.list.$get({ query }).unwrap() as any

    provinces.value = data.provinces

    isProvinceFetching.value = false
  } catch (error: any) {
    console.error(error)
  }
}

onMounted(() => {
  fecthLocations().then(() => {
    createTransporterForm.provinceId = transporter?.transporterProfile?.provinceId || -1
  })
})

function handleFormSubmit() {

  const link = transporter ? tuyau.$route('dashboard.transporters.update').path : tuyau.$route('dashboard.transporters.store').path

  createTransporterForm.post(link, {
    onSuccess() {
      if (!transporter) createTransporterForm.resetAndClearErrors()

      showToastSuccess({ toast, detail: `transporter ${transporter ? 'updated' : 'added'} successfully!`, summary: `${transporter ? 'Update' : 'New'} Transporter` })

    }, onError(error) {
      const formKeys = Object.keys(createTransporterForm.data())

      if (Object.keys(error).find(k => formKeys.includes(k))) return

      showToastError({ toast, detail: error?.message || `cannot ${transporter ? 'update' : 'add'} trasnporter` })
    }
  })
}
</script>
<template>
  <div>
    <div class="space-y-2!">
      <div class="flex flex-col w-full gap-1 mb-4" v-if="transporter">
        <label for="gender" class="text-lg font-bold">Status</label>
        <SelectButton fluid v-model="createTransporterForm.status" :options="status" optionValue="value"
          optionLabel="label" />
        <Message severity="error" variant="simple" size="small" v-if="createTransporterForm.errors.status"
          class="p-error">{{
            createTransporterForm.errors.status }}</Message>
      </div>

      <div class="flex gap-4 space-y-2!">

        <div class="flex flex-col gap-1 w-full">
          <label for="roleId" class="text-lg font-bold">Type</label>
          <Select fluid v-model="createTransporterForm.type" id="type" :options="TRANSPORTER_TYPES_OPTIONS"
            optionLabel="label" optionValue="value" disabled></Select>
          <Message v-if="createTransporterForm.errors.roleId" severity="error" variant="simple" size="small">{{
            createTransporterForm.errors.roleId }}</Message>

        </div>
        <div class="flex flex-col w-full gap-1">
          <label for="province" class="text-lg font-bold">Province</label>
          <Select fluid filter :disabled="isProvinceFetching" :loading="isProvinceFetching" id="province"
            :options="provinces" optionLabel="name" optionValue="id" v-model="createTransporterForm.provinceId"
            placeholder="Select a province"></Select>
          <Message severity="error" variant="simple" size="small" v-if="createTransporterForm.errors.provinceId"
            class="p-error">{{
              createTransporterForm.errors.provinceId }}</Message>
        </div>
      </div>

      <div class="flex gap-4">
        <div class="flex flex-col w-full gap-1">
          <label for="firstname" class="text-lg font-bold">First name</label>
          <InputText id="firstname" fluid v-model="createTransporterForm.profile.firstname" />
          <Message severity="error" variant="simple" size="small"
            v-if="createTransporterForm.errors['profile.firstname']" class="p-error">{{
              createTransporterForm.errors['profile.firstname'] }}</Message>
        </div>
        <div class="flex flex-col w-full gap-1">
          <label for="lastname" class="text-lg font-bold">Last name</label>
          <InputText id="lastname" fluid v-model="createTransporterForm.profile.lastname" />
          <Message severity="error" variant="simple" size="small"
            v-if="createTransporterForm.errors['profile.lastname']" class="p-error">{{
              createTransporterForm.errors['profile.lastname'] }}</Message>
        </div>
      </div>

      <div class="flex gap-4">
        <div class="flex flex-col w-full gap-1">
          <label for="gender" class="text-lg font-bold">Gender</label>
          <Select id="gender" fluid :options="getGendersOptions()" optionLabel="label" optionValue="value"
            v-model="createTransporterForm.profile.gender" placeholder="Select gender"></Select>
          <Message severity="error" variant="simple" size="small" v-if="createTransporterForm.errors['profile.gender']"
            class="p-error">{{ createTransporterForm.errors &&
              createTransporterForm.errors['profile.gender'] }}</Message>
        </div>
        <div class="flex flex-col w-full">
        </div>
      </div>

      <div class="flex gap-4">
        <div class="flex flex-col w-full gap-1">
          <label for="phone" class="text-lg font-bold">Phone</label>
          <PhoneInput v-model="createTransporterForm.phone" :error="createTransporterForm.errors.phone"></PhoneInput>
        </div>
        <div class="flex flex-col w-full gap-1">
          <label for="email" class="text-lg font-bold">Email</label>
          <InputText type="email" fluid v-model="createTransporterForm.email" placeholder="Enter email" />
          <Message severity="error" variant="simple" size="small" v-if="createTransporterForm.errors.email"
            class="p-error"> {{ createTransporterForm.errors.email }}</Message>
        </div>
      </div>
    </div>

    <div class="mt-6! flex w-full justify-end gap-4">
      <Button :disabled="createTransporterForm.processing" label="Cancel" severity="secondary" icon="pi pi-times"
        @click="dialogRef.close()"></Button>
      <Button :disabled="createTransporterForm.processing" :loading="createTransporterForm.processing"
        :label="transporter ? `Update` : 'Save'" icon="pi pi-check" @click="handleFormSubmit"
        form="new-client"></Button>
    </div>
  </div>

</template>