import { ApolloError, ApolloServer } from 'apollo-server'
import { GraphQLDate, GraphQLDateTime } from 'graphql-scalars'
import {
  RawUser,
  RawTicket,
  RawTicketVote,
  RawTicketCategory,
  RawProject,
} from './resolverTypes'
import { Resolvers } from './__generated__/resolvers'
import typeDefs from './__generated__/typedefs'

let users: RawUser[] = [
  { id: 1, firstName: 'Jake', lastName: 'H.' },
  { id: 2, firstName: 'Bird', lastName: 'C.' },
  { id: 3, firstName: 'Cookie', lastName: 'Remy' },
]

let projects: RawProject[] = [
  { id: 1, name: 'Project 1', createdAt: new Date(), createdById: 1 },
  { id: 2, name: 'Project 2', createdAt: new Date(), createdById: 3 },
]

let tickets: RawTicket[] = [
  {
    id: 1,
    authorId: 1,
    details: 'Better planning',
    categoriesId: [1],
    projectId: 1,
  },
  {
    id: 2,
    authorId: 1,
    details: 'Improved roadmap',
    categoriesId: [2],
    projectId: 1,
  },
  {
    id: 3,
    authorId: 2,
    details: 'New blood',
    categoriesId: [3],
    projectId: 2,
  },
]

let ticketVotes: RawTicketVote[] = [
  { id: 1, ticketId: 2, voterId: 1 },
  { id: 2, ticketId: 3, voterId: 2 },
  { id: 3, ticketId: 1, voterId: 2 },
  { id: 4, ticketId: 3, voterId: 3 },
]

let ticketsCategories: RawTicketCategory[] = [
  { id: 1, name: 'Loved' },
  { id: 2, name: 'Loathed' },
  { id: 3, name: 'Learned' },
  { id: 4, name: 'Longed for' },
]

// Hack due to non present authentication
const me = users[0]

const resolvers: Resolvers = {
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  User: {
    tickets: (a) => tickets.filter((t) => t.authorId === a.id),
    votes: (a) => ticketVotes.filter((tv) => tv.voterId === a.id),
    isSelf: (a) => me.id === a.id,
  },
  TicketVote: {
    ticket: (tv) => {
      const ticket = tickets.find((ti) => ti.id === tv.ticketId)
      if (!ticket) throw new ApolloError(`Cannot find ticket for vote ${tv.id}`)
      return ticket
    },
    voter: (tv) => {
      const user = users.find(({ id }) => id === tv.voterId)
      if (!user) throw new ApolloError(`Cannot find voter for vote ${tv.id}`)
      return user
    },
  },
  Ticket: {
    author: (t) => {
      const author = users.find(({ id }) => id === t.authorId)
      if (!author)
        throw new ApolloError(`Cannot find author for ticket ${t.id}`)
      return author
    },
    votes: (t) => ticketVotes.filter((tv) => tv.ticketId === t.id),
    project: (t) => {
      const project = projects.find((p) => p.id === t.projectId)
      if (!project) throw new ApolloError(`Cannot find project ${t.projectId}`)
      return project
    },
    categories: (t) =>
      ticketsCategories.filter((tc) => t.categoriesId.includes(tc.id)),
  },
  Project: {
    createdBy: (p) => {
      const user = users.find(({ id }) => id === p.createdById)
      if (!user) throw new ApolloError(`Cannot find user ${p.createdById}`)
      return user
    },
    tickets: (p) => tickets.filter((t) => t.projectId === p.id),
  },
  Query: {
    tickets: () => tickets,
    categories: () => ticketsCategories,
    projects: () => projects,
    users: () => users,
    me: () => me,
  },
  Mutation: {
    addTicket: (_, { details }) => {
      const newTicket: RawTicket = {
        id: Math.floor(Math.random() * 1000000),
        authorId: me.id,
        details,
        projectId: 1,
        categoriesId: [],
      }
      tickets = [...tickets, newTicket]
      return newTicket
    },
    removeTicket: (_, { ticketId }) => {
      const ticket = tickets.find((t) => t.id === ticketId)
      if (!ticket) throw new ApolloError(`Cannot find ticket ${ticketId}`)

      if (ticket.authorId !== me.id) throw new ApolloError('Wrong permission')
      tickets = tickets.filter((t) => t.id !== ticketId)

      // cascade delete on ticketVotes
      ticketVotes = ticketVotes.filter((tv) => tv.ticketId !== ticketId)
      return ticket
    },
    addVote: (_, { ticketId }) => {
      // Make sure there is not already a vote
      const hasAlreadyVoted = ticketVotes.some(
        (tv) => tv.ticketId === ticketId && tv.voterId === me.id
      )
      if (hasAlreadyVoted) {
        throw new ApolloError('User has already voted')
      }

      const newTicketVote: RawTicketVote = {
        id: Math.floor(Math.random() * 100000),
        ticketId,
        voterId: me.id,
      }
      ticketVotes = [...ticketVotes, newTicketVote]
      return newTicketVote
    },
    removeVote: (_, { ticketId }) => {
      const ticketVote = ticketVotes.find(
        (tv) => tv.ticketId === ticketId && tv.voterId === me.id
      )
      if (!ticketVote) throw new ApolloError('User has not voted')

      ticketVotes = ticketVotes.filter((tv) => ticketVote.id !== tv.id)
      return ticketVote
    },
  },
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
