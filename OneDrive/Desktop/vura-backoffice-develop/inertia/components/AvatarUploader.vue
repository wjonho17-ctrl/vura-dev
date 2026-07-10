<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';
import VuePictureCropper, { cropper } from 'vue-picture-cropper';
import NoImageSvg from '~/components/svg/NoImageSvg.vue'

const props = defineProps<{
    label: string
    oldImage?: string
    width?: number
    height?: number
    square?: boolean
}>()

const emit = defineEmits(['delete', 'reset'])

const image = defineModel<File | null>({ required: true })
const imagePreview = ref<string | null>(null)
const input = useTemplateRef('file-input')
const accept = "image/png, image/jpeg, image/jpg"
const picture = ref('')

function loadFile(file: File) {
    image.value = file
    imagePreview.value = URL.createObjectURL(file)
}

function removeImage() {
    if (input.value) {
        input.value.value = ''
    }

    URL.revokeObjectURL(imagePreview.value || '')
    imagePreview.value = image.value = null
    emit('delete')
}

function loadPrictute(ev: any) {
    const [file] = ev.target.files

    if (file) picture.value = URL.createObjectURL(file)
}

async function cropPricture() {
    const file = await cropper?.getFile()

    if (file) loadFile(file)
    picture.value = ''
}

function loadOldImagePreview() {
    if (props.oldImage) {
        imagePreview.value = props.oldImage
    }
}

onMounted(() => {
    loadOldImagePreview()
})

</script>
<template>

    <div class="absolute inset-0 z-50 flex flex-col justify-center items-center bg-slate-500/50" v-if="picture != ''">
        <div style="width: 50%" class="bg-black p-4 flex justify-between gap-3 items-center">
            <div class="flex items-center gap-3">
                <Button label="cancel" severity="secondary" outlined @click="picture = ''; image || removeImage()"></Button>
                <Button label="change" severity="contrast" @click="input?.click()"></Button>
            </div>

            <Button label="crop" @click="cropPricture"></Button>
        </div>
        <VuePictureCropper :boxStyle="{
            width: '50%',
            height: '50%',
            backgroundColor: '#f8f8f8',
            'z-index': 100
        }" :img="picture" :options="{
            viewMode: 1,
            dragMode: 'move',
            aspectRatio: 1,
            cropBoxResizable: false,
        }" :presetMode="{
            mode: square ? 'fixedSize' : 'round',
            width: width || 250,
            height: height || 250,
        }" />

    </div>

    <div class="flex flex-col gap-1 items-center">
        <input ref="file-input" hidden :accept type="file" @change="loadPrictute" />
        <label for="phone" class="text-lg font-bold">{{ label }}</label>
        <Image v-if="(image || oldImage) && imagePreview" :src="imagePreview"
            :class="[square ? '*:rounded-sm!' : '*:rounded-full!', '*:object-cover!']" width="250" height="250"
            alt="Image" />
        <div v-else style="width: 250px; height: 250px;"
            :class="[square ? 'rounded-sm' : 'rounded-full', 'border-2 bg-white']">
            <NoImageSvg></NoImageSvg>
        </div>
        <div class="flex items-center gap-2 py-3">
            <Button :label="image ? 'change' : 'choose'" size="small" severity="contrast"
                @click="input?.click()"></Button>
            <Button v-if="image || oldImage" label="remove" severity="danger" size="small"
                @click="removeImage"></Button>
            <Button label="reset" v-if="oldImage" severity="secondary"
                @click="loadOldImagePreview(); $emit('reset')"></Button>
        </div>
    </div>
</template>