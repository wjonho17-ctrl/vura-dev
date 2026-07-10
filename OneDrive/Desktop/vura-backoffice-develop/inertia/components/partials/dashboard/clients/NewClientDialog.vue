<script setup lang="ts">
import type { MedbookProvince } from '#types/api/medbook/location_type';
import { useForm } from '@inertiajs/vue3';
import { DateTime } from 'luxon';
import { useToast } from 'primevue';
import { onMounted, ref } from 'vue';
import tuyau from '~/app/tuyau';
import { CLIENT_ROLES_OPTIONS, getGendersOptions } from '~/helpers';


const isVisible = defineModel<boolean>()

const provinces = ref<MedbookProvince[]>([])
const isProvinceFetching = ref(false)

const createClientForm = useForm({
  roleId: -1,
  phone: '',
  email: '',
  message: '',
  profile: {
    firstname: '',
    lastname: '',
    gender: '',
    birthday: new Date(),
    provinceId: -1
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

    provinces.value = data.locations.data

    isProvinceFetching.value = false
  } catch (error: any) {
    console.error(error)
  }
}

onMounted(() => {
  fecthLocations()
})

function handleFormSubmit() {

  if (!createClientForm.phone.startsWith('07')) {
    createClientForm.setError('phone', 'phone number must start with 07')
    return
  }

  if (createClientForm.phone.length != 10) {
    createClientForm.setError('phone', 'phone number length must be 10')
    return
  }

  createClientForm.post(tuyau.$route('dashboard.pharamacies.store').path, {
    onSuccess() {
      toast.add({
        severity: 'success',
        detail: 'client added successfully!',
        summary: 'New Client',
        life: 4000
      })

      createClientForm.resetAndClearErrors()
    }
  })
}
</script>
<template>

  <Dialog v-model:visible="isVisible" :style="{ width: '450px' }" header="Client Details"
    :closable="!createClientForm.processing" :modal="true">
    <div class="flex flex-col gap-2 mt-2">
      <Message severity="error" icon="pi pi-info" size="large" v-if="createClientForm.errors.message">{{
        createClientForm.errors.message }}
      </Message>

      <label for="roleId" class="text-lg font-bold">Role</label>
      <Select v-model="createClientForm.roleId" id="roleId" :options="CLIENT_ROLES_OPTIONS" optionLabel="label"
        optionValue="value"></Select>
      <Message v-if="createClientForm.errors.roleId" severity="error" variant="simple" size="small">{{
        createClientForm.errors.roleId }}</Message>

      <label for="province" class="text-lg font-bold">Province</label>
      <Select :disabled="isProvinceFetching" :loading="isProvinceFetching" id="province" :options="provinces"
        optionLabel="name" optionValue="id" v-model="createClientForm.profile.provinceId"
        placeholder="Select a province"></Select>
      <Message severity="error" variant="simple" size="small" v-if="createClientForm.errors['profile.provinceId']"
        class="p-error">{{ createClientForm.errors['profile.provinceId'] }}</Message>


      <label for="phone" class="text-lg font-bold">Phone</label>
      <InputMask id="roleId" v-model="createClientForm.phone" mask="9999999999" placeholder="Enter phone" />
      <Message severity="error" variant="simple" size="small" v-if="createClientForm.errors.phone" class="p-error">{{
        createClientForm.errors.phone }}</Message>

      <label for="email" class="text-lg font-bold">Email (optional)</label>
      <InputText type="email" v-model="createClientForm.email" placeholder="Enter email" />
      <Message severity="error" variant="simple" size="small" v-if="createClientForm.errors.email" class="p-error">{{
        createClientForm.errors.email }}</Message>

      <label for="firstname" class="text-lg font-bold">First name</label>
      <InputText id="firstname" v-model="createClientForm.profile.firstname" />
      <Message severity="error" variant="simple" size="small" v-if="createClientForm.errors['profile.firstname']"
        class="p-error">{{
          createClientForm.errors['profile.firstname'] }}</Message>


      <label for="lastname" class="text-lg font-bold">Last name</label>
      <InputText id="lastname" v-model="createClientForm.profile.lastname" />
      <Message severity="error" variant="simple" size="small" v-if="createClientForm.errors['profile.lastname']"
        class="p-error">{{
          createClientForm.errors['profile.lastname'] }}</Message>


      <label for="gender" class="text-lg font-bold">Gender</label>
      <Select id="gender" :options="getGendersOptions()" optionLabel="label" optionValue="value"
        v-model="createClientForm.profile.gender" placeholder="Select gender"></Select>
      <Message severity="error" variant="simple" size="small" v-if="createClientForm.errors['profile.gender']"
        class="p-error">{{ createClientForm.errors &&
          createClientForm.errors['profile.gender'] }}</Message>

      <label for="birthday" class="text-lg font-bold">Birthday</label>
      <DatePicker fluid class="w-full! " id="birthday" v-model="createClientForm.profile.birthday" showIcon
        iconDisplay="input" :maxDate="new Date(2020)" />
      <Message severity="error" variant="simple" size="small" v-if="createClientForm.errors['profile.birthday']"
        class="p-error">{{
          createClientForm.errors['profile.birthday'] }}</Message>


      <div class="col-12 flex justify-content-end mt-3">
      </div>
    </div>

    <template #footer>
      <Button :disabled="createClientForm.processing" @click="isVisible = false" label="Cancel" severity="secondary"
        icon="pi pi-times"></Button>
      <Button :disabled="createClientForm.processing" :loading="createClientForm.processing" label="Save"
        icon="pi pi-check" @click="handleFormSubmit" form="new-client"></Button>
    </template>
  </Dialog>

</template>