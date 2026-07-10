<script lang="ts" setup>
import type Pharmacist from '#models/pharmacist';

defineProps<{
    user: Pharmacist
}>()

</script>
<template>
    <div class="flex gap-2 w-full">
        <Avatar :image="user?.profile.avatar?.url || undefined" size="xlarge" shape="circle"
            :label="user.profile.avatar?.url ? undefined : user.profile.initial"></Avatar>
        <div class="flex flex-col gap-1">
            <span>Name: {{ user.profile.fullname }}</span>
            <span>Email: {{ user.email }}</span>
            <span>Phone: {{ user?.phoneNumber }}</span>
        </div>
    </div>
</template>