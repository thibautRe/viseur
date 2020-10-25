import React from 'react'
import { styled } from './stitches.config'
import {
  useAllTicketsQuery,
  useAddVoteMutation,
  useRemoveVoteMutation,
  SimpleTicketVoteFragmentDoc,
} from './__generated__/models'

const LikeButton = styled('button', {
  display: 'none',
  border: 'none',
  borderRadius: '$1',
  color: '$red',
  background: 'none',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '$red',
  cursor: 'pointer',

  "&[aria-pressed='true']": {
    backgroundColor: '$red',
    color: '$redContrastColor',
  },
})
const List = styled('ul', {
  listStyle: 'none',
})
const TicketItem = styled('li', {
  display: 'block',
  maxWidth: '$ticketWidth',
  minHeight: '$ticketMinHeight',
  padding: '$2',
  marginBottom: '$4',
  borderRadius: '$1',
  backgroundColor: '$ticketBackground',

  [`&:hover ${LikeButton}`]: {
    display: 'block',
  },
})
const TicketHeader = styled('div', {
  marginBottom: '$2',
})
const TicketFooter = styled('div', {})
const TicketTitle = styled('strong', {
  color: '$red',
})
const TicketAuthor = styled('em', {})

function App() {
  const q = useAllTicketsQuery()
  const [addVote] = useAddVoteMutation({
    optimisticResponse: ({ ticketId }) => ({
      __typename: 'Mutation',
      addVote: {
        __typename: 'TicketVote',
        ticket: { id: ticketId },
        id: Math.floor(Math.random() * 1000),
        voter: {
          __typename: 'User',
          isSelf: true,
          firstName: '',
        },
      },
    }),
    update: (cache, { data }) => {
      if (!data) throw new Error('No return data')
      const ticketId = data.addVote.ticket.id
      const id = cache.identify({ __typename: 'Ticket', id: ticketId })
      if (!id) throw new Error('Cannot find ticket')
      cache.modify({
        id,
        fields: {
          votes: (votes, details) => {
            return [
              ...votes,
              cache.writeFragment({
                data: data.addVote,
                fragment: SimpleTicketVoteFragmentDoc,
              }),
            ]
          },
        },
      })
    },
  })
  const [removeVote] = useRemoveVoteMutation({
    optimisticResponse: ({ ticketId }) => ({
      __typename: 'Mutation',
      removeVote: {
        __typename: 'TicketVote',
        ticket: { __typename: 'Ticket', id: ticketId },
        id:
          q.data?.tickets
            .find((t) => t.id === ticketId)
            ?.votes.find((tv) => tv.voter.isSelf)?.id || 0,
      },
    }),
    update: (cache, { data }) => {
      if (!data) throw new Error('No return data')
      const ticketId = data.removeVote.ticket.id
      const ticketCacheId = cache.identify({
        __typename: 'Ticket',
        id: ticketId,
      })
      if (!ticketCacheId) throw new Error('Cannot find ticket')

      cache.modify({
        id: ticketCacheId,
        fields: {
          votes: (votes, { readField }) => {
            return votes.filter(
              // @ts-expect-error too deep in typings here
              (v) => readField('id', v) !== data.removeVote.id
            )
          },
        },
      })
    },
  })

  if (q.loading) return <h1>Loading...</h1>

  if (q.error) return <h1>Error!</h1>

  if (!q.data) return <h1>No data</h1>

  return (
    <>
      <h1>Tickets</h1>
      <List>
        {q.data.tickets.map((ticket) => (
          <TicketItem key={ticket.id}>
            <TicketHeader>
              <TicketTitle>{ticket.details}</TicketTitle>
              {' by '}
              <TicketAuthor>{ticket.author?.firstName}</TicketAuthor>
            </TicketHeader>
            {ticket.votes.length > 0 && (
              <>
                Liked by{' '}
                {ticket.votes
                  .map((v) => (v.voter?.isSelf ? 'you' : v.voter?.firstName))
                  .join(', ')}
              </>
            )}
            <TicketFooter>
              <LikeButton
                aria-pressed={ticket.votes.some((tv) => tv.voter?.isSelf)}
                onClick={() =>
                  !ticket.votes.some((tv) => tv.voter?.isSelf)
                    ? addVote({ variables: { ticketId: ticket.id } })
                    : removeVote({ variables: { ticketId: ticket.id } })
                }
              >
                Like
              </LikeButton>
            </TicketFooter>
          </TicketItem>
        ))}
      </List>
    </>
  )
}

export default App
