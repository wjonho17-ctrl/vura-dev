<script setup lang="ts">
import type PmsAppSetting from '#models/pms_app_setting';
import { useForm } from '@inertiajs/vue3';
import { DateTime } from 'luxon';
import { ref } from 'vue';
import * as Sentry from '@sentry/vue'
import SystemTabs from '~/components/partials/dashboard/SystemTabs.vue';
import tuyau from '~/app/tuyau';


const props = defineProps<{
    settings: PmsAppSetting[]
}>()

const isFiltering = ref(false)
const currentActiveSetting = props.settings.find(d => d.isActive)
const selectedVersionToUpdate = ref(-1)
const isDialogOpen = ref(false)

const settingForm = useForm({
    tab: 'pms',
    id: -1,
    pharmacyAdsPrice: -1,
    importerAdsPrice: -1,
    transporterWalletCollectHourStart: -1,
    transporterWalletCollectHourEnd: -1,
    transporterComissionRate: -1,
    transporterComissionMaxAmount: -1,
    pushNotificationLogoUrl: '',
    pushNotificationOrderDeliveryImageUrl: '',
    pushNotificationOrderImageUrl: '',
    pushNotificationShoppingImageUrl: '',
    deliveryMaxPrice: -1,
    deliveryPriceKmInterval: -1,
    deliveryPricePerKm: -1,
})

const activeSettingForm = useForm({
    tab: 'pms',
    id: -1
})

function openSelectedVersion(id: number) {
    selectedVersionToUpdate.value = id

    if (id <= -1) {
        settingForm.resetAndClearErrors()
        return
    }

    const setting = props.settings.find((v: any) => v.id === id)

    if (!setting) {
        const error = new Error(`Cannot find setting to update [id:${id}]`)
        Sentry.captureException(error)
        return
    }

    isDialogOpen.value = true

    for (const key in setting) {
        //@ts-ignore using current seeting in form
        settingForm[key] = setting[key]
    }
}

function handleActiveSetting(id: number) {
    activeSettingForm.id = id

    activeSettingForm.post(tuyau.$route('dashboard.settings.active').path, {
        preserveState: false,
        onSuccess() {
        },
        onError() {

        },
        onFinish() {
            activeSettingForm.resetAndClearErrors()
        }
    })
}

</script>

<template>

    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <h4 class="m-0">Pharmacy Management System</h4>
            <Skeleton v-if="isFiltering" width="20rem" height="2rem"></Skeleton>
            <SystemTabs :locks="{ lms: true, hms: true }" v-else></SystemTabs>
        </div>
    </div>

    <!-- pms list -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card" v-for="item in settings">
            <Message :severity="item.isActive ? 'success' : 'secondary'">
                <template #icon>
                    <div class="w-full flex items-center justify-between">
                        <div class="flex flex-col">
                            <span class="text-lg">Version {{ item.version }}</span>
                            <span class="text-xs font-light">{{
                                DateTime.fromISO(item.createdAt.toString()).toRelativeCalendar() }}</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <Button v-if="!item.isActive" @click="handleActiveSetting(item.id)"
                                :loading="activeSettingForm.processing" :disabled="activeSettingForm.processing"
                                icon="pi pi-check" size="small"></Button>
                            <Button @click="openSelectedVersion(item.id)" severity="contrast" icon="pi pi-pencil"
                                size="small"></Button>
                        </div>
                    </div>
                </template>
            </Message>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Fieldset legend="Transporter Commission">

                    <div class="space-y-1 w-full mt-2!">
                        <FloatLabel variant="in">
                            <InputNumber :disabled="true" fluid :default-value="item.transporterComissionMaxAmount"
                                placeholder="name" />
                            <label for="">Max Amount</label>
                        </FloatLabel>
                    </div>
                    <div class="space-y-1 w-full mt-2!">
                        <FloatLabel variant="in">
                            <InputNumber :disabled="true" fluid :default-value="item.transporterComissionRate"
                                suffix="%" />
                            <label for="">Rate</label>
                        </FloatLabel>
                    </div>
                </Fieldset>

                <Fieldset legend="Transporter Wallet Collect">

                    <div class="space-y-1 w-full mt-2!">
                        <FloatLabel variant="in">
                            <InputNumber :disabled="true" fluid :default-value="item.transporterWalletCollectHourStart"
                                suffix="H" />
                            <label for="">Start</label>
                        </FloatLabel>
                    </div>
                    <div class="space-y-1 w-full mt-2!">
                        <FloatLabel variant="in">
                            <InputNumber :disabled="true" fluid :default-value="item.transporterWalletCollectHourEnd"
                                suffix="H" />
                            <label for="">End</label>
                        </FloatLabel>
                    </div>

                </Fieldset>

                <Fieldset legend="Delivery">

                    <div class="space-y-1 w-full mt-2!">
                        <FloatLabel variant="in">
                            <InputNumber :disabled="true" fluid :default-value="item.deliveryPricePerKm"
                                placeholder="name" suffix=" KM" />
                            <label for="">Price/KM</label>
                        </FloatLabel>
                    </div>

                    <div class="space-y-1 w-full mt-2!">
                        <FloatLabel variant="in">
                            <InputNumber :disabled="true" fluid :default-value="item.deliveryPriceKmInterval"
                                prefix="RWF " />
                            <label for="">Price Interval/KM</label>
                        </FloatLabel>
                    </div>

                    <div class="space-y-1 w-full mt-2!">
                        <FloatLabel variant="in">
                            <InputNumber :disabled="true" fluid :default-value="item.deliveryMaxPrice" prefix="RWF " />
                            <label for="">Max Price</label>
                        </FloatLabel>
                    </div>
                </Fieldset>

                <Fieldset legend="Ads">

                    <div class="space-y-1 w-full mt-2!">
                        <FloatLabel variant="in">
                            <InputNumber :disabled="true" fluid :default-value="item.pharmacyAdsPrice" prefix="RWF " />
                            <label for="">Pharmacy</label>
                        </FloatLabel>
                    </div>
                    <div class="space-y-1 w-full mt-2!">
                        <FloatLabel variant="in">
                            <InputNumber :disabled="true" fluid :default-value="item.importerAdsPrice" prefix="RWF " />
                            <label for="">Importer</label>
                        </FloatLabel>
                    </div>
                </Fieldset>
            </div>
        </div>
    </div>

    <!-- new app setting modal -->
    <Dialog :header="`From version ${selectedVersionToUpdate}`" modal v-model:visible="isDialogOpen"
        @close="openSelectedVersion(-1)">

        <template #footer>
            <div class="flex w-full justify-between">
                <Button @click="openSelectedVersion(selectedVersionToUpdate)" severity="contrast"
                    label="Update"></Button>
            </div>
        </template>
    </Dialog>
</template>
