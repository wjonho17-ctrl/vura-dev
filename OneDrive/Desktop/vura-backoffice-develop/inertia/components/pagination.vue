<script setup lang="ts">
import type { PageState } from 'primevue/paginator'

const emit = defineEmits<{
  'page-change': [pageState: PageState]
}>()

defineProps<{
  pageLinkSize?: number
  meta: { perPage: number; total: number }
  rowsPerPageOptions?: number[]
}>()
</script>
<template>
  <Paginator :pt="{ root: { class: '!p-0 !m-0' } }" :pageLinkSize="pageLinkSize || 5" :rows="meta.perPage"
    :totalRecords="meta.total" :rowsPerPageOptions="rowsPerPageOptions" @page="emit('page-change', $event)"></Paginator>
</template>
