export interface RawUser {
  id: number
  firstName: string
  lastName: string
}

export interface RawTicket {
  id: number
  details: string
  authorId: number
  projectId: number
  categoriesId: number[]
}

export interface RawTicketVote {
  id: number
  voterId: number
  ticketId: number
}

export interface RawTicketCategory {
  id: number
  name: string
}

export interface RawProject {
  id: number
  name: string
  createdAt: Date
  createdById: number
}
