import { computed, reactive } from 'vue'
import { getColorByName } from '~/helpers/colors'
import nProgress from 'nprogress'

const LAYOUT_STORAGE_KEY = 'layout-config'
const configInStorage = localStorage.getItem(LAYOUT_STORAGE_KEY)
const config = configInStorage
  ? JSON.parse(configInStorage)
  : {
    preset: 'Aura',
    primary: 'emerald',
    surface: null,
    darkTheme: false,
    menuMode: 'static',
  }

const layoutConfig = reactive(config)

console.log(configInStorage, config)

const layoutState = reactive({
  staticMenuDesktopInactive: false,
  overlayMenuActive: false,
  profileSidebarVisible: false,
  configSidebarVisible: false,
  staticMenuMobileActive: false,
  menuHoverActive: false,
  activeMenuItem: null,
})

export function useLayout() {
  const setActiveMenuItem = (item: any) => {
    layoutState.activeMenuItem = item.value || item
  }

  const toggleDarkMode = () => {
    if (!document.startViewTransition) {
      executeDarkModeToggle()
      return
    }

    //@ts-ignore
    document.startViewTransition(() => executeDarkModeToggle(event))
  }

  const executeDarkModeToggle = () => {
    layoutConfig.darkTheme = !layoutConfig.darkTheme
    applyTheme()
    storeConfig()
  }

  const applyTheme = () => {
    console.log(layoutConfig.darkTheme, document.documentElement.classList)
    if (layoutConfig.darkTheme) {
      document.documentElement.classList.add('app-dark')
    } else {
      document.documentElement.classList.remove('app-dark')
    }
  }

  const toggleMenu = () => {
    if (layoutConfig.menuMode === 'overlay') {
      layoutState.overlayMenuActive = !layoutState.overlayMenuActive
    }

    if (window.innerWidth > 991) {
      layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive
    } else {
      layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive
    }

    storeConfig()
  }

  const storeConfig = () => localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutConfig))

  const isSidebarActive = computed(
    () => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive
  )

  const isDarkTheme = computed(() => layoutConfig.darkTheme)

  const getPrimary = computed(() => layoutConfig.primary)

  const getSurface = computed(() => layoutConfig.surface)

  const getPrimaryHex = computed(() => {
    return getColorByName(getPrimary.value)
  })

  return {
    storeConfig,
    applyTheme,
    layoutConfig,
    layoutState,
    toggleMenu,
    isSidebarActive,
    isDarkTheme,
    getPrimary,
    getPrimaryHex,
    getSurface,
    setActiveMenuItem,
    toggleDarkMode,
  }
}
