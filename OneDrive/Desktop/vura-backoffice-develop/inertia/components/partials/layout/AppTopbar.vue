<script setup lang="ts">
import { useLayout } from '~/app/layout';
import AppConfigurator from '../../partials/layout/AppConfigurator.vue';
import { Link, router } from '@inertiajs/vue3';
import { useTemplateRef } from 'vue';
import tuyau from '~/app/tuyau';
import PageTitle from '~/components/PageTitle.vue';
import AppName from '~/components/AppName.vue';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

const op = useTemplateRef('op')

const appMenu = useTemplateRef('app-menu')

const items: any = [
    {
        separator: true
    },
    {
        items: [
            {
                label: 'New',
                icon: 'pi pi-plus',
                shortcut: '⌘+N'
            },
            {
                label: 'Search',
                icon: 'pi pi-search',
                shortcut: '⌘+S'
            }
        ]
    },
    {
        separator: true,
    },
    {
        items: [
            {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command() {
                    router.post(tuyau.$route('auth.logout').path)
                }
            }
        ]
    }
]

const toggle = (event: any) => {
    //@ts-ignore
    op.value.toggle(event);
}

const toggleAppMenu = (event: any) => {
    //@ts-ignore
    appMenu.value.toggle(event);
};
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <Link href="/" class="flex h-32 w-32">
                <AppName></AppName>
            </Link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <Button icon="pi pi-palette" type="button" rounded @click="toggle"></Button>
                    <Popover ref="op">
                        <AppConfigurator />
                    </Popover>
                </div>
            </div>

            <Button severity="secondary" @click="toggleAppMenu" icon="pi pi-ellipsis-v" variant="text"></Button>
            <div></div>

            <Menu ref="app-menu" :model="items" class="w-full md:w-60" :popup="true">
                <template #start>
                    <button v-ripple
                        class="relative overflow-hidden w-full border-0 bg-transparent flex items-start p-2 pl-4 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-none cursor-pointer transition-colors duration-200">
                        <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" class="mr-2"
                            shape="circle" />
                        <span class="inline-flex flex-col items-start">
                            <span class="font-bold">Amy Elsner</span>
                            <span class="text-sm">Admin</span>
                        </span>
                    </button>
                </template>

                <template #item="{ item, props }">
                    <a v-ripple class="flex items-center" v-bind="props.action">
                        <span :class="item.icon" />
                        <span>{{ item.label }}</span>
                        <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
                        <span v-if="item.shortcut"
                            class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{
                                item.shortcut }}</span>
                    </a>
                </template>

            </Menu>

        </div>
    </div>
</template>
