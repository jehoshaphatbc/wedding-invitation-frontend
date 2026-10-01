import type { CheckoutPayload, CheckoutResponse } from '~/types/order'

export function useCheckoutService() {
  const api = useApi()

  return {
    async submitCheckout(data: CheckoutPayload): Promise<CheckoutResponse> {
      // Try /checkout first, then /api/checkout, then /admin/checkout
      const endpoints = ['/checkout', '/api/checkout', '/admin/checkout', '/orders/checkout']
      let lastError: any = null

      for (const ep of endpoints) {
        try {
          const res = await api.post<any>(ep, data)
          const paymentUrl = res?.payment_url || res?.data?.payment_url || res?.redirect_url || res?.url
          return {
            payment_url: paymentUrl,
            order: res?.order || res?.data?.order || res?.data,
            invoice_number: res?.invoice_number || res?.data?.invoice_number,
            order_id: res?.order_id || res?.data?.order_id || res?.id
          }
        } catch (err: any) {
          lastError = err
          if (err?.response?.status === 404) continue
          throw err
        }
      }
      throw lastError
    }
  }
}
