export type RsvpStatus = 'hadir' | 'tidak_hadir' | 'pending' | string

export interface ClientGuest {
  id: string
  invitation_id: string
  name: string
  phone?: string | null
  pax: number
  qr_token: string
  rsvp_status: RsvpStatus
  actual_attendance: boolean
  attendance_time?: string | null
  created_at: string
  updated_at: string
}

export interface GuestSummary {
  total_guests: number
  total_hadir: number
  total_tidak_hadir: number
  total_pending: number
}

export interface ClientGuestListData {
  guests: ClientGuest[]
  total_guests: number
  total_hadir: number
  total_tidak_hadir: number
  total_pending: number
  summary?: GuestSummary
}

export interface BulkAddGuestsPayload {
  names: string[]
}

export interface UpdateGuestPayload {
  name?: string
  guest_name?: string
  phone?: string | null
  pax?: number
  rsvp_status?: RsvpStatus
}
