<script setup lang="ts">
import { computed, ref } from 'vue'
import { Location, LocationType } from '~/types/location_type'
import { router, useForm } from '@inertiajs/vue3'
import { useToast } from 'primevue';
import { showToastError, showToastInfo, showToastSuccess } from '~/helpers/toast_helper';
import tuyau from '~/app/tuyau';
import LocationBox from '~/components/partials/dashboard/location/LocationBox.vue';


const props = defineProps<{
    provinces: Location[]
    districts: Location[]
    sectors: Location[]
    cells: Location[]
    villages: Location[]
}>()

const selectedProvince = ref<number | null>(null)
const selectedDistrict = ref<number | null>(null)
const selectedSector = ref<number | null>(null)
const selectedCell = ref<number | null>(null)
const selectedVillage = ref<number | null>(null)



const showDialog = ref(false)
const isInlinceCoordinate = ref(true)
const currentLocationType = ref<LocationType | ''>('')
const dialogTitle = ref('')
const newLocationForm = useForm({
    name: '',
    coordinates: undefined,
    type: 'province' as LocationType,
    provinceId: -1,
    districtId: -1,
    sectorId: -1,
    cellId: -1,
    longitude: 0, latitude: 0
})

const toast = useToast()

const locationBreadcrumbItems = computed(() => {
    const items: { label: string }[] = []
    let label = ''
    if (selectedProvince.value) {
        label = props.provinces.find(p => p.id === selectedProvince.value)?.name || ''
        items.push({ label })
    }

    if (selectedDistrict.value && currentLocationType.value != 'district') {
        label = props.districts.find(p => p.id === selectedDistrict.value)?.name || ''
        items.push({ label })
    }

    if (selectedSector.value && !['district', 'sector'].includes(currentLocationType.value)) {
        label = props.sectors.find(p => p.id === selectedSector.value)?.name || ''
        items.push({ label })
    }

    if (selectedCell.value && !['district', 'sector', 'cell'].includes(currentLocationType.value)) {
        label = props.cells.find(p => p.id === selectedCell.value)?.name || ''
        items.push({ label })
    }

    return items
})


const openDialog = (type: LocationType): void => {
    currentLocationType.value = type
    dialogTitle.value = type.charAt(0).toUpperCase() + type.slice(1)
    newLocationForm.resetAndClearErrors()
    showDialog.value = true
}

const addLocation = (): void => {
    if (!newLocationForm.name) return

    if (currentLocationType.value == 'district') {
        newLocationForm.provinceId = selectedProvince.value || -1
    } else if (currentLocationType.value === 'sector') {
        newLocationForm.districtId = selectedDistrict.value || -1
    } else if (currentLocationType.value == 'cell') {
        newLocationForm.sectorId = selectedSector.value || -1
    } else if (currentLocationType.value === 'village') {
        newLocationForm.cellId = selectedCell.value || -1
    }

    newLocationForm.type = currentLocationType.value as LocationType

    newLocationForm.post(tuyau.$route('dashboard.locations.add').path, {
        preserveState: true,
        preserveScroll: true,
        onSuccess() {
            if (currentLocationType.value != '') resetLocationInput(currentLocationType.value)
            showToastSuccess({ toast, detail: `${currentLocationType.value} added successfully!` })
            newLocationForm.resetAndClearErrors()
            if (currentLocationType.value == 'province') showDialog.value = false
        },
        onError(error) {
            showToastError({ toast, detail: error?.message || `Cannot add ${currentLocationType.value}` })
        }
    })
}

const onProvinceChange = (): void => {
    resetLocationInput('province')
    fecthLocation({ provinceId: selectedProvince.value })

}

function resetLocationInput(type: LocationType) {

    const isDistrictRestable = (['province'] as LocationType[]).includes(type)
    const isSectorRestable = (['province', 'district'] as LocationType[]).includes(type)
    const isCellRestable = (['province', 'district', 'sector'] as LocationType[]).includes(type)
    const isVillageRestable = (['province', 'district', 'sector', 'cell', 'village'] as LocationType[] & 'all').includes(type)

    if (isDistrictRestable) selectedDistrict.value = null
    if (isSectorRestable) selectedSector.value = null
    if (isCellRestable) selectedCell.value = null
    if (isVillageRestable) selectedVillage.value = null
}

const onDistrictChange = (): void => {
    resetLocationInput('district')

    fecthLocation({ districtId: selectedDistrict.value })
}


const onSectorChange = (): void => {
    resetLocationInput('sector')

    fecthLocation({ sectorId: selectedSector.value })

}

const onCellChange = (): void => {
    resetLocationInput('village')

    fecthLocation({ cellId: selectedCell.value })
}

function fecthLocation(data: any) {
    router.get('', data, {
        preserveState: true,
        preserveScroll: true
    })
}

const copyCoordinates = (type: LocationType): void => {
    let location
    if (type === 'province') {
        location = props.provinces.find(p => p.id === selectedProvince.value)
    }
    else if (type === 'district') {
        location = props.districts.find(d => d.id === selectedDistrict.value)
    }
    else if (type === 'sector') {
        location = props.sectors.find(d => d.id === selectedSector.value)
    }
    else if (type === 'cell') {
        location = props.cells.find(d => d.id === selectedCell.value)
    }
    else if (type === 'village') {
        location = props.villages.find(d => d.id === selectedVillage.value)
    }

    navigator.clipboard.writeText(`${location?.latitude},${location?.longitude}`)
    showToastInfo({ toast, detail: type + ' copied!' })
}

function editLocation(type: string, value: number | null) {
}

function handleLocationChange(location: LocationType) {
    if (location == 'province') onProvinceChange()
    else if (location == 'district') onDistrictChange()
    else if (location == 'sector') onSectorChange()
    else if (location == 'cell') onCellChange()
}

function handleLocationAdded(location: LocationType) {
    openDialog(location)
}


</script>

<template>
    <!-- Create Location Dialog -->
    <Dialog v-model:visible="showDialog" :header="`Add New ${dialogTitle}`" :closable="!newLocationForm.processing"
        :modal="true" style="min-width: 25rem;">
        <div class="space-y-4">
            <Breadcrumb v-if="selectedProvince && currentLocationType != 'province'" :model="locationBreadcrumbItems" />

            <div>
                <label class="block text-sm font-medium mb-2">Name</label>
                <InputText v-model="newLocationForm.name" placeholder="Enter name" class="w-full" />
            </div>
            <div>
                <ToggleButton v-model="isInlinceCoordinate" onLabel="inline coordinate"
                    off-label="one-by-one coordinate"></ToggleButton>
            </div>
            <div v-if="isInlinceCoordinate">
                <label class="block text-sm font-medium mb-2">Coordinates</label>
                <InputText v-model="newLocationForm.coordinates" placeholder="latitude,longitude" class="w-full" />
            </div>
            <template v-else>
                <div>
                    <label class="block text-sm font-medium mb-2">Latitude</label>
                    <InputNumber v-model="newLocationForm.latitude" placeholder="Enter latitude" class="w-full" />
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Longitude</label>
                    <InputNumber v-model="newLocationForm.longitude" placeholder="Enter longitude" class="w-full" />
                </div>
            </template>
        </div>
        <template #footer>
            <Button label="Cancel" :disabled="newLocationForm.processing" severity="secondary"
                @click="showDialog = false" />
            <Button label="Add" :disabled="newLocationForm.processing" :loading="newLocationForm.processing"
                severity="success" @click="addLocation" />
        </template>
    </Dialog>

    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <h4 class="m-0">Location Management</h4>
        </div>
        <div
            class="flex flex-col md:grid grid-cols-2 lg:grid-cols-3  3xl:grid-cols-5 gap-6 space-y-4! items-stretch  lg:items-start">
            <!-- Province Selection -->
            <LocationBox v-model="selectedProvince" label="Province" :locations="provinces" locationType="province"
                @add="handleLocationAdded" @changed="handleLocationChange" @copy="copyCoordinates" />

            <!-- District Selection -->
            <LocationBox v-if="selectedProvince" v-model="selectedDistrict" label="District" :locations="districts"
                locationType="district" @add="handleLocationAdded" @changed="handleLocationChange"
                @copy="copyCoordinates" />

            <!-- Sector Selection -->
            <LocationBox v-if="selectedDistrict" v-model="selectedSector" label="Sector" :locations="sectors"
                locationType="sector" @add="handleLocationAdded" @changed="handleLocationChange"
                @copy="copyCoordinates" />

            <!-- Cell Selection -->
            <LocationBox v-if="selectedSector" v-model="selectedCell" label="Cell" :locations="cells"
                locationType="cell" @add="handleLocationAdded" @changed="handleLocationChange"
                @copy="copyCoordinates" />

            <!-- Village Selection -->
            <LocationBox v-if="selectedCell" v-model="selectedVillage" label="Village" :locations="villages"
                locationType="village" @add="handleLocationAdded" @changed="handleLocationChange"
                @copy="copyCoordinates" />
        </div>
    </div>

</template>
