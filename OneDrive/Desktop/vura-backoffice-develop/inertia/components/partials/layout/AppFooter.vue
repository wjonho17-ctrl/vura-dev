<script setup lang="ts">
import { router, usePage } from '@inertiajs/vue3';
import { onMounted, ref } from 'vue';


const urls = {
    medbook: {
        url: import.meta.env.VITE_MEDBOOK_DOMAIN,
        name: 'PMS',
        color: '--p-green-500'
    },
    ePrescription: {
        url: import.meta.env.VITE_E_PRESCRIPTION_DOMAIN,
        name: 'ePrescription',
        color: '--p-blue-500'
    },
    transporterApp: {
        url: import.meta.env.VITE_TRANSPORTER_APP_DOMAIN,
        name: 'Fleet',
        color: '--p-orange-500'
    }
}

const urlKey = ref<keyof typeof urls | null>(null)

router.on('navigate', () => {
    urlKey.value = getCurrentUrl()
})

function getCurrentUrl() {
    const currentURL = usePage().url

    const isMedbookLinks = ['pharmacists', 'pharmacies'].some(url => currentURL.split('/').includes(url))
    const isEprescriptionLinks = ['staffs', 'facilities'].some(url => currentURL.split('/').includes(url))
    const isTransporterAppLinks = ['transporters'].some(url => currentURL.split('/').includes(url))

    if (isMedbookLinks) return 'medbook'
    else if (isEprescriptionLinks) return 'ePrescription'
    else if (isTransporterAppLinks) return 'transporterApp'
    else return null
}


</script>

<template>
    <div class="layout-footer" v-if="urlKey">
        <a :href="urls[urlKey].url" target="_blank" rel="noopener noreferrer"
            :style="{ color: `var(${urls[urlKey].color})` }" class="font-bold hover:underline">{{
                urls[urlKey].name }}</a>
    </div>
</template>
