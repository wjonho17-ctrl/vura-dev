<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
    optional?: boolean
}>()

const corrdinates = ref('')
const latitudeModel = defineModel<number>('latitude', { required: true })
const longitudeModel = defineModel<number>('longitude', { required: true })
const regex = new RegExp(/^-?\d{1,3}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/)

const isInlinceCoordinate = ref(true)
const coordinateError = ref<string | null>(null)

function formatLatAndLong() {
    coordinateError.value = null

    if (corrdinates.value == '') return
    else if (!regex.test(corrdinates.value)) {
        coordinateError.value = 'Invalid format. Use latitude, longitude (e.g. -12.34, 56.78).'
        latitudeModel.value = 0
        longitudeModel.value = 0
        return
    }

    const [lat, long] = corrdinates.value.split(',')

    latitudeModel.value = +lat
    longitudeModel.value = +long
}

</script>
<template>
    <div class="space-y-1">
        <label class="block font-medium">Coordinates {{ optional ? '(optional)' : '' }}</label>
        <ToggleButton class="my-1" v-model="isInlinceCoordinate" onLabel="inline coordinate"
            off-label="one-by-one coordinate">
        </ToggleButton>
        <template v-if="isInlinceCoordinate">
            <InputText @input="formatLatAndLong" v-model="corrdinates" placeholder="latitude,longitude"
                class="w-full" />
            <Message severity="error" variant="simple" size="small" v-if="coordinateError" class="p-error">{{
                coordinateError
            }}</Message>
        </template>
        <div class="flex gap-3 w-full" v-else>
            <div class="space-y-1">
                <label class="block text-sm font-medium mb-2">Latitude</label>
                <InputNumber v-model="latitudeModel" placeholder="Enter latitude" class="w-full" />
            </div>
            <div class="space-y-1">
                <label class="block text-sm font-medium mb-2">Longitude</label>
                <InputNumber v-model="longitudeModel" placeholder="Enter longitude" class="w-full" />
            </div>
        </div>
    </div>
</template>