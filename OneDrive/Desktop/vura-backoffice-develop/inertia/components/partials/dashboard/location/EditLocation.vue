<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'

interface Location {
    id: number
    name: string
    longitude: string
    latitude: string
}

interface Props {
    visible: boolean
    location: Location | null
}

interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'save', location: Location): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const editedLocation = ref<Location>({ id: 0, name: '', longitude: '', latitude: '' })

const handleSave = () => {
    if (!editedLocation.value.name) return
    emit('save', editedLocation.value)
}

const handleClose = () => {
    emit('update:visible', false)
}

const updateEditedLocation = (newLocation: Location | null) => {
    if (newLocation) {
        editedLocation.value = { ...newLocation }
    }
}

defineExpose({ updateEditedLocation })
</script>

<template>
    <Dialog :visible="visible" header="Edit Location" :modal="true" :style="{ width: '400px' }" @update:visible="handleClose">
        <div class="space-y-4!">
            <div>
                <label class="block text-sm font-medium mb-2">Name</label>
                <InputText v-model="editedLocation.name" placeholder="Enter location name" class="w-full" />
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Latitude</label>
                <InputText v-model="editedLocation.latitude" placeholder="Enter latitude" class="w-full" />
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Longitude</label>
                <InputText v-model="editedLocation.longitude" placeholder="Enter longitude" class="w-full" />
            </div>
        </div>
        <template #footer>
            <Button label="Cancel" severity="secondary" @click="handleClose" />
            <Button label="Save" severity="success" @click="handleSave" />
        </template>
    </Dialog>
</template>