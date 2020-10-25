export interface RawUser {
  id: number
  firstName: string
  lastName: string
}

export interface RawTicket {
  id: number
  details: string
  authorId: number
}

export interface RawTicketVote {
  id: number
  voterId: number
  ticketId: number
}
