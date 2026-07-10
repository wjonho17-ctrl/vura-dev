<script setup lang="ts">
import { computed } from 'vue';
import { Location, LocationType } from '~/types/location_type';

const props = defineProps<{
    locationType: LocationType,
    locations: Location[]
    label: string
}>()

const selectedLocationId = defineModel<number | null>({ required: true })

const emit = defineEmits<{
    changed: [LocationType],
    add: [LocationType],
    copy: [LocationType]
}>()

const currentLongAndLat = computed(() => {
    const location = props.locations.find(l => l.id === selectedLocationId.value)
    return location && `${location.latitude},${location.longitude}`
})

</script>

<template>
    <div class="px-3! py-2! rounded-lg shadow-sm border-2"
        :class="{ 'border-green-300': locationType === 'province', 'border-yellow-300': locationType === 'district', 'border-red-300': locationType === 'sector', 'border-blue-300': locationType === 'cell', 'border-purple-300': locationType === 'village' }">
        <label class="block text-sm font-semibold mb-1! text-gray-400">{{ label }}</label>
        <div class="flex gap-4 justify-between">
            <Select filter fluid v-model="selectedLocationId" :options="locations" option-label="name" option-value="id"
                placeholder="Select a location" @value-change="$emit('changed', locationType)"></Select>
            <Button fluid class="flex-none" icon="pi pi-plus" rounded
                :severity="locationType === 'province' ? 'success' : locationType === 'district' ? 'warn' : locationType === 'sector' ? 'danger' : locationType === 'cell' ? 'info' : locationType === 'village' ? 'help' : 'secondary'"
                @click="$emit('add', locationType)" :title="`Add ${locationType}`"></Button>
        </div>
        <div v-if="currentLongAndLat" class="flex items-center pt-1! px-2! ">
            <span class="text-xs text-gray-600">{{ currentLongAndLat }}</span>
            <Button size="small" icon="pi pi-copy" rounded text severity="secondary" class="mt-2 p-1"
                @click="$emit('copy', locationType)" title="Copy coordinates"></Button>
        </div>
    </div>
</template>
