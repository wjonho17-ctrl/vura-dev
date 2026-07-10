<script setup lang="ts">

const props = defineProps<{
    label: string
    color?: string,
    icon?: string
    total: string | number
    description?: {
        top?: string
        bottom?: string
    },
    loading?: boolean
}>()


const iconClass = getClass(props.color)

function getClass (color?: string) {
    
    if(color == 'red') {
        return {
            background: 'bg-red-100 dark:bg-red-400/10',
            text: 'text-red-500',
        }
    }
    else if(color == 'yellow') {
        return {
            background: 'bg-yellow-100 dark:bg-yellow-400/10',
            text: 'text-yellow-500',
        }
    }
    else if(color == 'green') {
        return {
            background: 'bg-green-100 dark:bg-green-400/10',
            text: 'text-green-500',
        }
    }
    else if(color == 'gray' || color == 'grey') {
        return {
            background: 'bg-gray-100 dark:bg-gray-400/10',
            text: 'text-gray-500',
        }
    }

    return {background: 'bg-blue-100 dark:bg-blue-400/10', text: 'text-blue-500' }
}

</script>

<template>
    <div class="card h-fit!">
        <div class="flex justify-between mb-2!">
            <div>
                <span class="block text-muted-color font-medium mb-1!">{{ label }}</span>
                <div class="font-medium text-xl">{{ total }}</div>
            </div>
            <div class="flex items-center justify-center rounded-border" v-if="icon"
                :class="[iconClass.background]"
                style="width: 2.5rem; height: 2.5rem">
                <i class="text-xl!" :class="[iconClass.text, icon]"></i>
            </div>
        </div>
        <span v-if="description?.top" class="text-primary font-medium">{{ description?.top }}</span>
        <span v-if="description?.bottom" class="text-muted-color">{{ description?.bottom }}</span>
    </div>
</template>
