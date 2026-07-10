<script setup lang="ts">
import { ref, watch } from 'vue';
import RwandaFlagSvg from './svg/RwandaFlagSvg.vue';

defineProps<{
  error?: string
  disabled?: boolean
}>()

const value = defineModel<string>()
const inputValue = ref(value.value?.replace('+250', '') || '')

watch(value, (newVal) => {
  if (newVal == '') {
    inputValue.value = ''
  }
})

</script>
<template>
  <InputGroup>
    <InputGroupAddon>
      <div class="flex items-center w-6 mr-1">
        <RwandaFlagSvg></RwandaFlagSvg>
      </div>
      +250
    </InputGroupAddon>
    <InputText :disabled="disabled" v-keyfilter.int :maxLength="9" @input="value = '+250' + inputValue" :minLength="9" v-model="inputValue"
      type="text" placeholder="phone" />
  </InputGroup>
  <Message v-if="error" severity="error" size="small" variant="simple">{{
    error }}</Message>
</template>