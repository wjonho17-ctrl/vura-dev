<script setup lang="ts">
import type Pharmacy from '#models/pharmacy';
import tuyau from '~/app/tuyau';

defineProps<{
    pharmacy: Pharmacy
    withLink?: boolean
}>()
</script>

<template>
    <div v-if="pharmacy.owner" class="flex gap-2">
        <Avatar size="large" :label="pharmacy.owner.profile?.avatar?.url ? undefined : pharmacy.owner.profile.initial"
            :image="pharmacy.owner.profile?.avatar?.url" alt="avatar" class="w-8 h-8 rounded-full object-cover" />
        <div class="flex flex-col gap-1">
            <span>{{ pharmacy.owner.profile.fullname }}</span>
            <span>{{ pharmacy.owner.email }}</span>
            <span>{{ pharmacy.owner.phoneNumber }}</span>
            <div class="flex items-center w-fit gap-1" v-if="withLink">
                <Chip class="text-xs! w-fit" :label="pharmacy.owner.role.name"></Chip>
                <Link :href="tuyau.$url('dashboard.pharamacies.representative.view', { params: { id: pharmacy.id } })">
                <Button rounded size="small" icon="pi pi-eye" severity="secondary"></Button>
                </Link>
            </div>
        </div>
    </div>
</template>