export const useClientPortal = () => {
  const config = useRuntimeConfig()
  const rawBase = (config.public.apiBase as string || 'https://wedding-invitation-backend-alpha.vercel.app/api/v1').replace(/\/$/, '')
  const apiBase = rawBase.includes('/api/v1') ? rawBase : `${rawBase}/api/v1`

  // 1. Verifikasi Token Magic Link
  const verifyToken = async (token: string) => {
    return await $fetch<{
      success: boolean
      message?: string
      data: {
        valid: boolean
        token: string
        client: { id: string; name: string; email: string; whatsapp: string }
        order: { id: string; invoice_number: string; status: string }
        package: { id: string; name: string; features_config: Record<string, any> }
        invitation: any | null
      }
    }>(`${apiBase}/client/auth-verify`, {
      method: 'GET',
      params: { token },
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Client-Token': token,
        'X-Form-Token': token
      }
    })
  }

  // 2. Simpan / Update Setup Undangan
  const saveInvitation = async (token: string, payload: Record<string, any>) => {
    return await $fetch<{
      success: boolean
      message: string
      data: any
    }>(`${apiBase}/client/invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Client-Token': token,
        'X-Form-Token': token
      },
      body: payload
    })
  }

  return {
    verifyToken,
    saveInvitation
  }
}
