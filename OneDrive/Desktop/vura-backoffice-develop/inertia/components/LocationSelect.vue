<script setup lang="ts">
import { useToast } from 'primevue';
import { onMounted, ref, watch } from 'vue';
import tuyau from '~/app/tuyau';
import { showToastError } from '~/helpers/toast_helper';
import { Location, LocationType } from '~/types/location_type';
import LocationSelectCard from './LocationSelectCard.vue';


const props = defineProps<{
    oldProvinceId?: number,
    oldDistrictId?: number,
    oldSectorId?: number,
    oldCellId?: number
    oldVillageId?: number
}>()

console.log(props.oldProvinceId)

const villageId = defineModel<number>('villageId', { required: true })

const provinces = ref<Location[]>([])
const districts = ref<Location[]>([])
const sectors = ref<Location[]>([])
const cells = ref<Location[]>([])
const villages = ref<Location[]>([])

const selectedProvince = ref<number | null>(null)
const selectedDistrict = ref<number | null>(null)
const selectedSector = ref<number | null>(null)
const selectedCell = ref<number | null>(null)
const selectedVillage = ref<number | null>(null)

const isLoading = ref(false)

const toast = useToast()

watch(villageId, (newVal, oldValue) => {
    if (newVal === -1) {
        selectedProvince.value = null
        selectedDistrict.value = null
        selectedSector.value = null
        selectedCell.value = null
        selectedVillage.value = null
    }
})


onMounted(() => {
    fetchAllLocations()
})

async function fetchAllLocations() {
    if (props.oldDistrictId) selectedDistrict.value = props.oldDistrictId
    if (props.oldSectorId) selectedSector.value = props.oldSectorId
    if (props.oldCellId) selectedCell.value = props.oldCellId
    if (props.oldVillageId) selectedVillage.value = props.oldVillageId

    await fecthLocation('province')

    if (props.oldProvinceId) selectedProvince.value = props.oldProvinceId

    if (props.oldDistrictId) {
        await fecthLocation('district')
        selectedDistrict.value = props.oldDistrictId
    }

    if (props.oldSectorId) {
        await fecthLocation('sector')
        selectedSector.value = props.oldSectorId
    }

    if (props.oldCellId) {
        await fecthLocation('cell')
        selectedCell.value = props.oldCellId
    }

    if (props.oldVillageId) {
        await fecthLocation('village')
        selectedVillage.value = props.oldVillageId
        villageId.value = props.oldVillageId
    }
}

const onProvinceChange = (): void => {
    fecthLocation('district')
}

const onDistrictChange = (): void => {
    fecthLocation('sector')
}

const onSectorChange = (): void => {
    fecthLocation('cell')
}

const onCellChange = (): void => {
    fecthLocation('village')
}

function resetLocationInput(type: LocationType) {

    const isDistrictResetable = (['province'] as LocationType[]).includes(type)
    const isSectorResetable = (['province', 'district'] as LocationType[]).includes(type)
    const isCellResetable = (['province', 'district', 'sector'] as LocationType[]).includes(type)
    const isVillageResetable = (['province', 'district', 'sector', 'cell'] as LocationType[]).includes(type)

    if (isDistrictResetable) selectedDistrict.value = null
    if (isSectorResetable) selectedSector.value = null
    if (isCellResetable) selectedCell.value = null
    if (isVillageResetable) selectedVillage.value = null

    villageId.value = -2
}

async function fecthLocation(type: LocationType) {
    resetLocationInput(type)

    isLoading.value = true

    const query = {
        provinceId: selectedProvince.value,
        districtId: selectedDistrict.value,
        sectorId: selectedSector.value,
        cellId: selectedCell.value
    }

    try {
        const data = await tuyau.dashboard.locations.list.$get({ query }).unwrap() as any

        provinces.value = data.provinces
        districts.value = data.districts
        sectors.value = data.sectors
        cells.value = data.cells
        villages.value = data.villages

    } catch (error: any) {
        showToastError({ toast, detail: 'cannot fecth ' + type })
    }

    isLoading.value = false

    return Promise.resolve()
}

</script>


<template>
    <Toast></Toast>
    <div class="flex flex-wrap gap-3">
        <!-- Province Selection -->
        <LocationSelectCard v-model="selectedProvince" :options="provinces" type="province" :is-loading="isLoading"
            @change="onProvinceChange"></LocationSelectCard>

        <!-- District Selection -->
        <LocationSelectCard v-if="selectedProvince" v-model="selectedDistrict" :options="districts" type="district"
            :is-loading="isLoading" @change="onDistrictChange"></LocationSelectCard>

        <!-- Sector Selection -->
        <LocationSelectCard v-if="selectedDistrict" v-model="selectedSector" :options="sectors" type="sector"
            :is-loading="isLoading" @change="onSectorChange"></LocationSelectCard>

        <!-- Cell Selection -->
        <LocationSelectCard v-if="selectedSector" v-model="selectedCell" :options="cells" type="cell"
            :is-loading="isLoading" @change="onCellChange"></LocationSelectCard>

        <!-- Village Selection -->
        <LocationSelectCard v-if="selectedCell" v-model="selectedVillage" @change="villageId = selectedVillage || -1"
            :options="villages" type="village" :is-loading="isLoading">
        </LocationSelectCard>
    </div>
</template>
