/**
 * usePriceMask — Composable for IDR price input masking
 * Usage:
 *   const { displayPrice, rawPrice, onInput } = usePriceMask(initialValue)
 *   <input :value="displayPrice" @input="onInput" />
 *   // rawPrice.value = actual number to submit
 */
export function usePriceMask(initial: number = 0) {
  const rawPrice = ref<number>(initial)
  const displayPrice = ref<string>(formatDisplay(initial))

  function formatDisplay(val: number): string {
    if (!val && val !== 0) return ''
    return val.toLocaleString('id-ID')
  }

  function onInput(e: Event) {
    const input = e.target as HTMLInputElement
    // Strip everything except digits
    const digits = input.value.replace(/\D/g, '')
    const num = digits ? parseInt(digits, 10) : 0
    rawPrice.value = num
    // Reformat with thousand separators
    displayPrice.value = num ? num.toLocaleString('id-ID') : ''
    // Keep cursor at end
    input.value = displayPrice.value
  }

  function setPrice(val: number) {
    rawPrice.value = val
    displayPrice.value = formatDisplay(val)
  }

  return { displayPrice, rawPrice, onInput, setPrice }
}
