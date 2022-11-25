export interface User {
  uuid: string
  email: string
  username: string
  firstName: string
  lastName: string
  currency: string | null
  isActive: boolean
  isStaff: boolean
  dateJoined: string
}
