<script setup lang="ts">
import NoImageSvg from '~/components/svg/NoImageSvg.vue'

defineProps<{ image?: string, initial?: string }>()
</script>

<template>
    <div>
        <Image v-if="image" :src="image" class="*:rounded-full! *:object-cover! w-12! h-12!" alt="Image" preview />
        <Avatar v-else-if="initial" :label="initial" size="large" shape="circle">
        </Avatar>
        <NoImageSvg v-else></NoImageSvg>
    </div>
</template>