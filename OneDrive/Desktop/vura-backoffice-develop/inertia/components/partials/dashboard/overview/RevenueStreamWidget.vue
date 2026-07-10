<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useLayout } from '~/app/layout';
import Chart from 'primevue/chart';
import type { MedbookGlobalBasicStatsResponse } from '#types/api/medbook/stat_type';

const props = defineProps<{
    revenue: MedbookGlobalBasicStatsResponse['revenue']
    title: string
}>()

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const chartData = ref();
const chartOptions = ref();

function setChartData() {
    return {
        labels: props.revenue.labels,
        datasets: props.revenue.datasets.map(data => ({
            type: data.type || 'bar',
            barThickness: data.barThickness || 32,
            ...data
        }))
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const borderColor = documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: 'transparent',
                    borderColor: 'transparent'
                }
            },
            y: {
                stacked: true,
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: borderColor,
                    borderColor: 'transparent',
                    drawTicks: false
                }
            }
        }
    };
}

watch([getPrimary, getSurface, isDarkTheme], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">{{ title }}</div>
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>
