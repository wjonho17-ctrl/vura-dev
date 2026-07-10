<script setup lang="ts">
import { LocationType, Location } from '~/types/location_type';


const props = defineProps<{
    type: LocationType
    isLoading: boolean
    options: Location[]
}>()

const emit = defineEmits<{
    change: [type: LocationType]
}>()

const selectedId = defineModel<number | null>({required: true})

function onChange() {
    emit('change', props.type)
}

</script>
<template>
    <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700">{{ type[0].toUpperCase() + type.slice(1, type.length)
            }}</label>
        <Select filter :disabled="isLoading" :loading="isLoading" v-model="selectedId" :options="options"
            option-label="name" option-value="id" :placeholder="`Select a ${type}`" @change="onChange" />
    </div>
</template>
