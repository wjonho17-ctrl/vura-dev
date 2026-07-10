<script setup lang="ts">
import { inject, ref } from 'vue';


const dialogRef = inject('dialogRef') as any

const responsiveOptions = ref([
    {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
]);

</script>
<template>
    <Carousel :value="dialogRef.data.urls" :numVisible="2" :numScroll="2"  :responsiveOptions="responsiveOptions">
        <template #item="{ data }">
            <div class="border border-surface-200 dark:border-surface-700 rounded m-2 php-4">
                <Image :src="data" width="500" preview></Image>
            </div>
        </template>
    </Carousel>
</template>