export interface User {
  uuid: string
  email: string
  role: string
  username: string
  firstName: string
  lastName: string
  currency: string | null
  isActive: boolean
  isStaff: boolean
  dateJoined: string
}

export interface Invite {
  uuid: string
  inviteOwner: string
  inviteReciever: string
  workspace: string
  isAccepted: boolean
}
