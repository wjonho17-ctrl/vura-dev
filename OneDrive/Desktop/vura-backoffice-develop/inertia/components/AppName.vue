<script setup lang="ts">
import VuraFullLogo from './svg/logos/VuraFullLogo.vue';
import VuraLogo from './svg/logos/VuraLogo.vue';


defineProps<{
  size?: 'small' | 'large'
  fullLogo?: boolean
}>()

</script>
<template>
  <!-- <i class="pi pi-wave-pulse text-[#28887a]" style="font-size: 1.5rem;"></i> -->
  <!-- <div class="w-full! h-fit! flex justify-center"> -->
    <!-- <div class="w-lg!" style="width: 100%; height: 100%;"> -->
      <VuraFullLogo></VuraFullLogo>
    <!-- </div> -->
    <!-- <div v-else class="w-full"> -->
      <!-- <VuraLogo></VuraLogo> -->
    <!-- </div> -->
    <!-- <Image v-if="fullLogo" width="32" height="32" :src="'/public/images/vura_logo.png'"></Image> -->
    <!-- <Image v-else width="40" height="40" :src="'/public/images/vura_logo.png'"></Image> -->
  <!-- </div> -->
</template>