import type {
  ClientGuest,
  ClientGuestListData,
  UpdateGuestPayload
} from '~/types/client-guest'

export function useClientGuestService() {
  const api = useApi()
  const config = useRuntimeConfig()

  const getHeaders = (token: string) => ({
    'Authorization': `Bearer ${token}`,
    'X-Client-Token': token,
    'X-Form-Token': token
  })

  // Helper for localStorage fallback
  const getLocalKey = (token: string) => `client_guests_mock_${token}`

  const getLocalGuests = (token: string): ClientGuestListData => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        guests: [],
        total_guests: 0,
        total_hadir: 0,
        total_tidak_hadir: 0,
        total_pending: 0
      }
    }
    try {
      const raw = localStorage.getItem(getLocalKey(token))
      if (raw) {
        const list: ClientGuest[] = JSON.parse(raw)
        const hadir = list.filter(g => g.rsvp_status === 'hadir').length
        const tidakHadir = list.filter(g => g.rsvp_status === 'tidak_hadir').length
        const pending = list.filter(g => g.rsvp_status === 'pending' || !g.rsvp_status).length
        return {
          guests: list,
          total_guests: list.length,
          total_hadir: hadir,
          total_tidak_hadir: tidakHadir,
          total_pending: pending,
          summary: {
            total_guests: list.length,
            total_hadir: hadir,
            total_tidak_hadir: tidakHadir,
            total_pending: pending
          }
        }
      }
    } catch {}
    return {
      guests: [],
      total_guests: 0,
      total_hadir: 0,
      total_tidak_hadir: 0,
      total_pending: 0
    }
  }

  const saveLocalGuests = (token: string, list: ClientGuest[]) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(getLocalKey(token), JSON.stringify(list))
      } catch {}
    }
  }

  return {
    async getGuests(token: string): Promise<ClientGuestListData> {
      const endpoints = [
        '/client/guests',
        '/api/client/guests',
        '/invitation/guests'
      ]

      let lastError: any = null
      for (const ep of endpoints) {
        try {
          const res = await api.get<any>(ep, undefined, { headers: getHeaders(token) })
          const data = res?.data || res

          if (data && Array.isArray(data.guests)) {
            // Update local cache
            saveLocalGuests(token, data.guests)
            return data
          }
          if (Array.isArray(data)) {
            const list = data as ClientGuest[]
            saveLocalGuests(token, list)
            const hadir = list.filter(g => g.rsvp_status === 'hadir').length
            const tidakHadir = list.filter(g => g.rsvp_status === 'tidak_hadir').length
            const pending = list.filter(g => g.rsvp_status === 'pending' || !g.rsvp_status).length
            return {
              guests: list,
              total_guests: list.length,
              total_hadir: hadir,
              total_tidak_hadir: tidakHadir,
              total_pending: pending
            }
          }
        } catch (err: any) {
          lastError = err
          if (err?.response?.status === 404) continue
          throw err
        }
      }

      // If endpoints return 404 (e.g. backend endpoint not yet deployed), gracefully return local storage mock
      if (lastError?.response?.status === 404 || !lastError) {
        return getLocalGuests(token)
      }

      throw lastError || new Error('Gagal mengambil data tamu.')
    },

    async bulkAddGuests(token: string, names: string[]): Promise<ClientGuest[]> {
      const endpoints = [
        '/client/guests/bulk',
        '/api/client/guests/bulk',
        '/invitation/guests/bulk'
      ]

      let lastError: any = null
      for (const ep of endpoints) {
        try {
          const res = await api.post<any>(ep, { names }, { headers: getHeaders(token) })
          const data = res?.data || res
          if (Array.isArray(data)) {
            // Sync with local storage
            const current = getLocalGuests(token).guests
            saveLocalGuests(token, [...data, ...current])
            return data
          }
          if (data?.guests && Array.isArray(data.guests)) {
            saveLocalGuests(token, data.guests)
            return data.guests
          }
        } catch (err: any) {
          lastError = err
          if (err?.response?.status === 404) continue
          throw err
        }
      }

      // Fallback for local simulation
      if (lastError?.response?.status === 404 || !lastError) {
        const current = getLocalGuests(token).guests
        const createdList: ClientGuest[] = names.map(name => ({
          id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          invitation_id: 'inv-active',
          name: name.trim(),
          phone: null,
          pax: 1,
          qr_token: `qr_${Math.random().toString(36).slice(2, 10)}`,
          rsvp_status: 'pending',
          actual_attendance: false,
          attendance_time: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        saveLocalGuests(token, [...createdList, ...current])
        return createdList
      }

      throw lastError || new Error('Gagal menambahkan tamu.')
    },

    async updateGuest(token: string, guestId: string, payload: UpdateGuestPayload): Promise<ClientGuest> {
      const endpoints = [
        `/client/guests/${guestId}`,
        `/api/client/guests/${guestId}`,
        `/invitation/guests/${guestId}`
      ]

      let lastError: any = null
      for (const ep of endpoints) {
        try {
          const res = await api.put<any>(ep, payload, { headers: getHeaders(token) })
          const data = res?.data || res
          if (data && data.id) {
            // Sync local storage
            const current = getLocalGuests(token).guests
            const updated = current.map(g => (g.id === guestId ? { ...g, ...data } : g))
            saveLocalGuests(token, updated)
            return data
          }
        } catch (err: any) {
          lastError = err
          if (err?.response?.status === 404) continue
          throw err
        }
      }

      // Fallback update
      if (lastError?.response?.status === 404 || !lastError) {
        const current = getLocalGuests(token).guests
        const target = current.find(g => g.id === guestId)
        if (target) {
          const updatedItem: ClientGuest = {
            ...target,
            name: payload.name || payload.guest_name || target.name,
            phone: payload.phone !== undefined ? payload.phone : target.phone,
            pax: payload.pax !== undefined ? payload.pax : target.pax,
            rsvp_status: payload.rsvp_status || target.rsvp_status,
            updated_at: new Date().toISOString()
          }
          saveLocalGuests(token, current.map(g => (g.id === guestId ? updatedItem : g)))
          return updatedItem
        }
      }

      throw lastError || new Error('Gagal memperbarui data tamu.')
    },

    async deleteGuest(token: string, guestId: string): Promise<boolean> {
      const endpoints = [
        `/client/guests/${guestId}`,
        `/api/client/guests/${guestId}`,
        `/invitation/guests/${guestId}`
      ]

      let lastError: any = null
      for (const ep of endpoints) {
        try {
          await api.delete<any>(ep, { headers: getHeaders(token) })
          // Remove from local storage
          const current = getLocalGuests(token).guests
          saveLocalGuests(token, current.filter(g => g.id !== guestId))
          return true
        } catch (err: any) {
          lastError = err
          if (err?.response?.status === 404) continue
          throw err
        }
      }

      // Fallback delete
      if (lastError?.response?.status === 404 || !lastError) {
        const current = getLocalGuests(token).guests
        saveLocalGuests(token, current.filter(g => g.id !== guestId))
        return true
      }

      throw lastError || new Error('Gagal menghapus data tamu.')
    }
  }
}
