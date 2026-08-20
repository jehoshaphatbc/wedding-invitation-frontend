interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  function show(type: Toast['type'], message: string, duration = 4000) {
    const id = nextId++
    toasts.value.push({ id, type, message, duration })

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function success(message: string) {
    show('success', message)
  }

  function error(message: string) {
    show('error', message)
  }

  function warning(message: string) {
    show('warning', message)
  }

  function info(message: string) {
    show('info', message)
  }

  return {
    toasts: readonly(toasts),
    show,
    dismiss,
    success,
    error,
    warning,
    info,
  }
}
