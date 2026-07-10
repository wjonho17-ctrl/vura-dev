import { router } from "@inertiajs/vue3"
import { useUrlSearchParams } from "@vueuse/core"
import debounce from "lodash.debounce"
import { DateTime } from "luxon"
import type { PageState } from "primevue"
import { onBeforeMount, onMounted, ref } from "vue"

type FilteringType<T> = T & { page?: number }

export function useFiltering<T>() {
    const qs = useUrlSearchParams<FilteringType<T>>('history')
    const isFiltering = ref(false)

    onBeforeMount(() => {
        for (const key in qs) {
            if (!Object.hasOwn(qs, key)) continue;

            const value = qs[key as keyof FilteringType<T>]

            const numberValue = Number(value)

            if (!isNaN(numberValue)) {
                //@ts-ignore
                qs[key] = numberValue
                continue
            }

            const date = DateTime.fromJSDate(new Date(value as Date))
            if (date.isValid) {
                //@ts-ignore
                qs[key] = date.toJSDate()
                continue
            }

        }
    })

    const applyFilter = debounce((callbacks?: {
        before?: () => void
        onSuccess?: () => void, onError?: () => void,
        onFinish?: () => void
    } & any) => {
        if (callbacks?.before) callbacks.before()

        isFiltering.value = true
        qs.page = 1
        router.get('', undefined, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: callbacks?.onSuccess,
            onError: callbacks?.onError,
            onFinish() {
                isFiltering.value = false

                if (callbacks?.onFinish) callbacks.onFinish()
            }
        })
    }, 400)

    function handlePageChange(state: PageState, key?: keyof FilteringType<T>) {
        if (key) {
            qs[key as 'page'] = state.page + 1
        } else {
            qs.page = state.page + 1
        }
        applyFilter()
    }


    const clear = debounce((callbacks?: {
        onSuccess?: () => void, onError?: () => void,
        onFinish?: () => void
    } & any) => {
        isFiltering.value = true
        router.get(window.location.pathname, undefined, {
            onSuccess: callbacks?.onSuccess, onError: callbacks?.onError, onFinish() {
                isFiltering.value = false
                callbacks?.onFinish && callbacks.onFinish()
            }
        })
    }, 400)

    return {
        applyFilter,
        qs,
        isFiltering,
        handlePageChange,
        clear
    }
}