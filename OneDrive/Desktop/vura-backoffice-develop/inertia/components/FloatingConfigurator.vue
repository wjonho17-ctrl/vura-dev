<script setup lang="ts">
import { useTemplateRef } from 'vue';
import AppConfigurator from '../components/partials/layout/AppConfigurator.vue';
import { useLayout } from '~/app/layout';

const { toggleDarkMode, isDarkTheme } = useLayout();

const op = useTemplateRef('op')
const toggle = (event: any) => {
  //@ts-ignore
  op.value.toggle(event);
}
</script>

<template>
  <div class="fixed flex gap-4 top-8 right-8">
    <Button type="button" @click="toggleDarkMode" rounded :icon="isDarkTheme ? 'pi pi-moon' : 'pi pi-sun'"
      severity="secondary"></Button>
    <div class="relative">
      <Button icon="pi pi-palette" type="button" rounded @click="toggle"></Button>
    </div>
  </div>
  <Popover ref="op" class="-translate-x-5">
    <AppConfigurator />
  </Popover>
</template>