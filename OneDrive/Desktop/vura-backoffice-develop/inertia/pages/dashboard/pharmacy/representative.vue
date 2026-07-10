<script setup lang="ts">
import type Pharmacy from '#models/pharmacy';
import PageTitle from '~/components/PageTitle.vue';
import PharmacyRepresentative from '~/components/partials/dashboard/pharamcy/PharmacyRepresentative.vue';

defineProps<{
    pharmacy: Pharmacy
    fdaLicenseLink: string,
    pharmacistLicenseLink: string
}>()
</script>
<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card">
            <PageTitle :title="`Representative of ${pharmacy.name} pharmacy`" size="large"></PageTitle>
            <PharmacyRepresentative :pharmacy></PharmacyRepresentative>
        </div>
        <div class="card">
            <PageTitle title="Documents" size="large" description="Pharmacist and fda license"></PageTitle>
            <a :href="fdaLicenseLink" target="_blank">
            <Button variant="link" label="Fda License"></Button>
            </a>
            <a :href="pharmacistLicenseLink" target="_blank">
            <Button variant="link" label="Pharmacist License"></Button>
            </a>
        </div>
    </div>
</template>