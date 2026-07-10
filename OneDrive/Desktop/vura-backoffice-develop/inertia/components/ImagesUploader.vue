<script setup lang="ts">
import { useToast } from 'primevue';
import { computed, ref, useTemplateRef } from 'vue'
import { showToastWarn } from '~/helpers/toast_helper';

const props = defineProps<{
    label: string
    maxImage: number
    oldImages?: { name: string, url: string }[]
}>()

const images = defineModel<File[]>({ required: true })
const input = useTemplateRef('file-input')
const accept = "image/png, image/jpeg, image/jpg"
const ispreviewLoading = ref(false)
const page = ref(0)
const toast = useToast()
const imageUrls = ref<string[]>(props.oldImages?.map(img => img.url) || [])
const emit = defineEmits<{
    imageRemoved: [removedImageUrls: string]
}>()

const imagePreviews = computed(() => {
    ispreviewLoading.value = false
    const urls: { src: string, index: number }[] = imageUrls.value.map((url, index) => ({ src: url, index })) || []

    images.value.forEach((image, index) => {

        const src = URL.createObjectURL(image as any)
        urls.push({ src, index })
    })

    ispreviewLoading.value = true
    return urls
})

function loadFile(event: any) {
    // Set the source of the <img> element to a temporary URL of the selected file
    const files = event.target.files
    let filesToAdd = []

    const maxImageExpect = props.maxImage - images.value.length
    if (files.length > maxImageExpect) {
        for (let index = 0; index < maxImageExpect; index++) {
            filesToAdd.push(files[index])
        }

        const detail = `selected more image than expected only ${maxImageExpect} added and ${files.length - maxImageExpect} rejected.`
        showToastWarn({ toast, detail })
    } else {
        filesToAdd = files
    }

    for (const file of filesToAdd) {
        images.value.push(file)
    }

    resetInput()
}

function removeImage(index: number, type: 'edit' | 'new') {
    if (type === 'edit' && props.oldImages && props.oldImages.length >= 1) {
        const imageToRemove = imageUrls.value[index]
        if (!imageToRemove) return

        // here you can emit an event to remove the image from the server or handle it as needed
        imageUrls.value = imageUrls.value.filter((_, i) => i !== index)
        emit('imageRemoved', props.oldImages[index].name)
        resetInput()
        page.value = index > 0 ? index - 1 : 0
        return
    }

    const imageToRemove = imagePreviews.value[index]

    if (!imageToRemove) return

    URL.revokeObjectURL(imageToRemove.src || '')

    images.value = images.value.filter((_, index) => index !== imageToRemove.index)
    resetInput()
    page.value = imageToRemove.index > 0 ? imageToRemove.index - 1 : 0
}

function removeAll() {
    if (props.oldImages && props.oldImages.length >= 1) {
        imageUrls.value = []
    }

    for (const { src } of imagePreviews.value) {
        URL.revokeObjectURL(src || '')
    }

    images.value = []

    resetInput()
}

function resetInput() {
    if (input.value) {
        input.value.value = ''
    }
}

</script>
<template>
    <div class="flex flex-col gap-1">
        <input multiple ref="file-input" hidden :accept type="file" @change="loadFile" />
        <label for="phone" class="text-lg font-bold">{{ label }}</label>
        <Carousel v-if="imagePreviews.length >= 1" v-model:page="page" :value="imagePreviews" :numVisible="1">
            <template #item="slotProps">
                <div class="border border-surface-200 dark:border-surface-700 rounded m-2 p-4 relative">
                    <Image :src="slotProps.data.src" width="300" height="100" preview alt="Image" />
                    <Button severity="danger" size="small" class="absolute! top-0! right-0!" icon="pi pi-times"
                        @click="removeImage(slotProps.data.index, imageUrls && imageUrls.length >= 1 ? 'edit' : 'new')"></Button>
                </div>
            </template>
        </Carousel>
        <div class="flex gap-2 w-full justify-center">
            <Button :disabled="imagePreviews.length >= maxImage"
                :label="imagePreviews.length >= 1 ? `add (${imagePreviews.length + '/' + maxImage})` : 'choose'"
                size="small" severity="contrast" @click="input?.click()"></Button>
            <Button v-if="imagePreviews.length >= 1" severity="danger" size="small" label="remove all"
                @click="removeAll()"></Button>
        </div>
    </div>
</template>