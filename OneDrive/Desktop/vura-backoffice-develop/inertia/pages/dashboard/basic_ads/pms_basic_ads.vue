<script setup lang="ts">
import type BasicAd from '#models/basic_ad';
import { BasicAdTarget } from '#types/api/medbook/basic_ads_type';
import { useForm } from '@inertiajs/vue3';
import { DateTime } from 'luxon';
import { useToast } from 'primevue';
import { ref } from 'vue';
import tuyau from '~/app/tuyau';
import InputErrorMessage from '~/components/InputErrorMessage.vue';
import BasicAdTabs from '~/components/partials/dashboard/basic_ads/BasicAdTabs.vue';
import PhoneInput from '~/components/PhoneInput.vue';
import { useFiltering } from '~/composables/filtering';
import { showToastError, showToastSuccess } from '~/helpers/toast_helper';


const props = defineProps<{
    ads: { data: BasicAd[], meta: any }
}>()

const { qs, isFiltering, applyFilter, clear } = useFiltering<{
    target: BasicAdTarget
    startAt?: Date
    endAt?: Date
    orgarnizationName?: string
}>()

const date = DateTime.now().plus({ day: 1 })

const basickAdForm = useForm({
    cover: null,
    description: '',
    target: BasicAdTarget.BOTH,
    startAt: date.toJSDate(),
    endAt: date.plus({ day: 1 }).toJSDate(),
    link: '',
    organizationName: '',
    organizationEmail: '',
    organizationPhone: '',
    customerName: '',
    customerPhone: '',
    customerEmail: ''
})

const isDeletingAd = ref(0)

const toast = useToast()

const formPanel = ref('1')

const targetOptions = Object.values(BasicAdTarget).map((value) => ({ label: BasicAdTarget[+value], value })).filter(v => !!v.label)
qs.target = BasicAdTarget.BOTH

function handleCreateAd() {
    basickAdForm.post(tuyau.$route('dashboard.ads.basic.store').path, {
        onSuccess() {
            basickAdForm.resetAndClearErrors()
            formPanel.value = '1'
            showToastSuccess({ toast, detail: 'Ad created!' })
        },
        onError(error) {
            showToastError({ toast, detail: 'cannot create ad! please contact support' })
            console.log(error)
        }
    })
}

function handleDeleteAd(id: number) {
    isDeletingAd.value = id
    basickAdForm.post(tuyau.$url('dashboard.ads.basic.delete', { params: { id } }), {
        onSuccess() {
            showToastSuccess({ toast, detail: 'Ad deleted!' })
        },
        onError(error) {
            showToastError({ toast, detail: 'cannot delete ad! please contact support' })
            console.log(error)
        },
        onFinish() {
            isDeletingAd.value = 0
        }
    })
}

function handleEditeAd(id: number) {
}

function handleCheckClientInfos() {
    basickAdForm.post(tuyau.$route('dashboard.ads.basic.check.client').path, {
        preserveScroll: true,
        onSuccess() {
            formPanel.value = '2'
        },
        onError() {
            showToastError({ toast, detail: 'cannot configure ad! please contact support' })
        }
    })
}

</script>

<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <h4 class="m-0">Pharmacy Management System</h4>
            <Skeleton v-if="isFiltering" width="20rem" height="2rem"></Skeleton>
            <BasicAdTabs v-else></BasicAdTabs>
        </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]! gap-4">
        <div>
            <!-- ads filter -->
            <Toolbar class="mb-4!">
                <template #start>
                    <div class="flex gap-4 flex-wrap md:flex-nowrap">
                        <InputText placeholder="organization" v-model="qs.orgarnizationName"></InputText>
                        <Select :loading="isFiltering" @value-change="applyFilter" v-model="qs.target"
                            optionLabel="label" optionValue="value" :options="targetOptions"
                            placeholder="Select a province"></Select>

                        <DatePicker :loading="isFiltering" @value-change="applyFilter" v-model="qs.startAt"
                            placeholder="Start at"></DatePicker>
                        <DatePicker :loading="isFiltering" @value-change="applyFilter" v-model="qs.endAt"
                            placeholder="End at"></DatePicker>

                        <Button :loading="isFiltering" :disabled="isFiltering" @click="clear" icon="pi pi-filter-slash"
                            severity="secondary"></Button>
                    </div>
                </template>
            </Toolbar>

            <!-- ads list -->
            <DataView :value="ads.data">
                <template #empty>
                    <Message>No Ads</Message>
                </template>
                <template #list="slotProps">
                    <div class="card grid grid-cols-2 gap-6">
                        <!-- ad card -->
                        <div class="shadow-lg rounded gap-2  grid grid-rows-[100px_1fr]"
                            v-for="(item, index) in (slotProps.items as BasicAd[])" :key="index">
                            <Image :src="item.image.url" image-style="width: 1000px" preview
                                image-class="object-cover rounded rounded-b-none">
                            </Image>
                            <div class="flex justify-between px-2!">
                                <div class="flex flex-col">
                                    <span class="font-extralight text-xs">Organization</span>
                                    <span class="font-bold">{{ item.organizationName }}</span>
                                    <span class="font text-sm">{{ item.organizationEmail }}</span>
                                    <span class="font text-sm">{{ item.organizationPhone }}</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-ligth text-xs">Customer</span>
                                    <span class="font-bold">{{ item.customerName }}</span>
                                    <span class="font-extralight text-xs">{{ item.customerEmail }}</span>
                                    <span class="font-extralight text-xs">{{ item.customerPhone }}</span>
                                </div>

                                <div class="flex flex-col">
                                    <span class="font-ligth text-xs">Created By</span>
                                    <span class="font-bold">{{ item.adminName }}</span>
                                    <span class="font-extralight text-xs">{{ item.adminEmail
                                    }}</span>
                                    <span class="font-extralight text-xs">{{ item.adminPhone
                                    }}</span>
                                </div>

                            </div>
                            <!-- actions and infos -->
                            <div class="flex justify-between px-1! pb-2!">
                                <div>
                                    <Chip :label="BasicAdTarget[item.target]"></Chip>
                                    <Button icon="pi pi-eye" :label="item.views.toString()" rounded variant="text"
                                        severity="secondary"></Button>
                                    <Button icon="pi pi-globe" :label="item.visits.toString()" rounded variant="text"
                                        severity="secondary"></Button>
                                    <Button icon="pi pi-send" :label="item.shares.toString()" rounded variant="text"
                                        severity="secondary"></Button>
                                </div>

                                <div>
                                    <a v-if="item.link" :href="item.link" target="_blank">
                                        <Button size="small" text icon="pi pi-globe" variant="text"></Button>
                                    </a>
                                    <!-- FIXME: finilize editing ads -->
                                    <Button size="small" text :disabled="isDeletingAd > 0"
                                        :loading="isDeletingAd == item.id" severity="info" icon="pi pi-pencil"
                                        @click="handleEditeAd(item.id)"></Button>
                                    <Button size="small" text :disabled="isDeletingAd > 0"
                                        :loading="isDeletingAd == item.id" severity="danger" icon="pi pi-trash"
                                        @click="handleDeleteAd(item.id)"></Button>
                                </div>

                            </div>
                        </div>
                    </div>
                </template>
            </DataView>
        </div>

        <!-- Basic Ads Form -->
        <div class="card">
            <h3 class="m-0">New Ad</h3>

            <Stepper :value="formPanel" linear>
                <StepItem value="1">
                    <Step>Customer Infos</Step>
                    <StepPanel value="1">

                        <Fieldset legend="Organization">
                            <div class="space-y-1 w-full">
                                <InputText type="email" fluid v-model="basickAdForm.organizationName"
                                    placeholder="name" />
                                <InputErrorMessage :error="basickAdForm.errors.organizationName">
                                </InputErrorMessage>
                            </div>
                            <div class="space-y-1 w-full mt-2!">
                                <PhoneInput v-model="basickAdForm.organizationPhone"
                                    :error="basickAdForm.errors.organizationPhone"></PhoneInput>
                            </div>
                            <div class="space-y-1 w-full mt-2!">
                                <InputText type="email" fluid v-model="basickAdForm.organizationEmail"
                                    placeholder="email" />
                                <InputErrorMessage :error="basickAdForm.errors.organizationEmail">
                                </InputErrorMessage>
                            </div>
                        </Fieldset>

                        <Fieldset legend="Customer">
                            <div class="space-y-1 w-full mt-2!">
                                <InputText type="email" fluid v-model="basickAdForm.customerName" placeholder="name" />
                                <InputErrorMessage :error="basickAdForm.errors.customerName">
                                </InputErrorMessage>
                            </div>
                            <div class="space-y-1 w-full mt-2!">
                                <PhoneInput v-model="basickAdForm.customerPhone"
                                    :error="basickAdForm.errors.customerPhone">
                                </PhoneInput>
                            </div>
                            <div class="space-y-1 w-full mt-2!">
                                <InputText type="email" fluid v-model="basickAdForm.customerEmail"
                                    placeholder="email (optional)" />
                                <InputErrorMessage :error="basickAdForm.errors.customerEmail">
                                </InputErrorMessage>
                            </div>
                        </Fieldset>

                        <div class="flex justify-end mt-4!">
                            <Button label="configure" :loading="basickAdForm.processing"
                                :disabled="basickAdForm.processing" icon="pi pi-user"
                                @click="handleCheckClientInfos"></Button>
                        </div>
                    </StepPanel>
                </StepItem>
                <StepItem value="2">
                    <Step>Configuration</Step>
                    <StepPanel value="2">
                        <div class="space-y-1 w-full">
                            <InputErrorMessage :error="basickAdForm.errors.cover">
                            </InputErrorMessage>
                            <input type="file" @change="(ev) => basickAdForm.cover = (ev.target as any).files[0]">
                            <!-- <AvatarUploader :width="300" :height="1920" :square="true" label="Cover"
                                v-model="basickAdForm.cover"></AvatarUploader> -->
                        </div>
                        <div class="flex gap-3 w-full mt-4!">
                            <div class="space-y-1 w-full">
                                <label for="">Start At</label>
                                <DatePicker :minDate="date.toJSDate()" :maxDate="date.plus({ week: 2 }).toJSDate()"
                                    id="pobox" fluid v-model="basickAdForm.startAt" placeholder="phone" />
                                <InputErrorMessage :error="basickAdForm.errors.startAt">
                                </InputErrorMessage>
                            </div>
                            <div class="space-y-1 w-full">
                                <label for="">End At</label>
                                <DatePicker
                                    :minDate="DateTime.fromJSDate(basickAdForm.startAt).plus({ day: 1 }).toJSDate()"
                                    :maxDate="DateTime.fromJSDate(basickAdForm.startAt).plus({ month: 1 }).toJSDate()"
                                    id="pobox" fluid v-model="basickAdForm.startAt" placeholder="phone" />
                                <InputErrorMessage :error="basickAdForm.errors.startAt">
                                </InputErrorMessage>
                            </div>
                        </div>
                        <div class="grid grid-cols-[1fr_2fr] gap-3 w-full mt-4!">
                            <div class="space-y-1 w-full">
                                <Select v-model="basickAdForm.target" optionLabel="label" optionValue="value"
                                    :options="targetOptions" placeholder="select target"></Select>
                            </div>
                            <div class="space-y-1 w-full">
                                <InputText fluid v-model="basickAdForm.link" placeholder="link (optional)" />
                                <InputErrorMessage :error="basickAdForm.errors.link">
                                </InputErrorMessage>
                            </div>
                        </div>
                        <div class="flex gap-3 w-full mt-4!">
                            <Textarea :rows="5" v-model="basickAdForm.description" placeholder="description (optional)"
                                fluid></Textarea>
                        </div>
                        <div class="flex justify-end mt-4! gap-4">
                            <Button severity="secondary" label="Back" icon="pi pi-arrow-left" @click="formPanel = '1'"
                                :disabled="basickAdForm.processing"></Button>
                            <Button label="Create" :loading="basickAdForm.processing"
                                :disabled="basickAdForm.processing" icon="pi pi-arrow-right"
                                @click="handleCreateAd"></Button>
                        </div>
                    </StepPanel>
                </StepItem>
            </Stepper>
        </div>
    </div>
</template>