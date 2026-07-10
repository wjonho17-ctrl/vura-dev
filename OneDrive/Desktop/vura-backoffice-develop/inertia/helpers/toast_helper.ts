import { ToastServiceMethods } from 'primevue'

interface ShowTostOption {
  toast: ToastServiceMethods
  detail: any
  life?: number
  summary?: string
  group?: string
}

export const showToastError = ({ toast, detail, life, summary, group }: ShowTostOption) => {
  toast.add({
    severity: 'error',
    detail,
    life: life || 4500,
    summary: summary || 'Error Message',
    group,
  })
}

export const showToastSuccess = ({ toast, detail, life, summary, group }: ShowTostOption) => {
  toast.add({
    severity: 'success',
    detail,
    life: life || 3800,
    summary: summary || 'Success Message',
    group,
  })
}

export const showToastInfo = ({ toast, detail, life, summary, group }: ShowTostOption) => {
  toast.add({
    severity: 'info',
    detail,
    life: life || 3800,
    summary: summary || 'Info Message',
    group,
  })
}

export const showToastWarn = ({ toast, detail, life, summary, group }: ShowTostOption) => {
  toast.add({
    severity: 'warn',
    detail,
    life: life || 3800,
    summary: summary || 'Warn Message',
    group,
  })
}


