import React from 'react'
import { Box } from '../components/Box'
import Stack from '../components/Stack'
import TicketItem from '../components/TicketCard/TicketItem'
import { styled } from '../stitches.config'

import {
  useHomePageQuery,
  useAddTicketMutation,
  useRemoveTicketMutation,
  useAddVoteMutation,
  useRemoveVoteMutation,
  SimpleTicketFragmentDoc,
  SimpleTicketVoteFragmentDoc,
  Ticket,
  TicketVote,
} from '../__generated__/models'

const List = styled(Stack, {
  p: 0,
  listStyle: 'none',
})

const NewTicketTextarea = styled('textarea', {
  width: '$ticketWidth',
  maxWidth: '100%',
  minHeight: '$ticketMinHeight',
  p: '$2',
  mt: '$2',
  color: '$red',
  backgroundColor: '$ticketBackground',
  border: 'none',
  borderRadius: '$1',
  fontWeight: 'bold',
  fontFamily: 'inherit',
  resize: 'vertical',

  '::placeholder': {
    color: 'inherit',
    opacity: 0.3,
  },
  '::-moz-placeholder': {
    color: 'inherit',
    opacity: 0.3,
  },
  '::-webkit-input-placeholder': {
    color: 'inherit',
    opacity: 0.3,
  },
})

const Home = () => {
  const q = useHomePageQuery()

  const me = q.data?.me

  const [addVote] = useAddVoteMutation({
    optimisticResponse: ({ ticketId }) => {
      if (!me) throw new Error('Cannot find self user')
      return {
        __typename: 'Mutation',
        addVote: {
          __typename: 'TicketVote',
          ticket: { id: ticketId },
          id: Math.floor(Math.random() * 1000),
          voter: me,
        },
      }
    },
    update: (cache, { data }) => {
      if (!data) throw new Error('No return data')
      const ticketId = data.addVote.ticket.id
      const id = cache.identify({ __typename: 'Ticket', id: ticketId })
      if (!id) throw new Error('Cannot find ticket')
      cache.modify({
        id,
        fields: {
          votes: (votes) => {
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
    optimisticResponse: ({ ticketId }) => {
      const vote = q.data?.tickets
        .find((t) => t.id === ticketId)
        ?.votes.find((tv) => tv.voter.isSelf)
      if (!vote) throw new Error('Cannot find vote')

      return {
        __typename: 'Mutation',
        removeVote: {
          __typename: 'TicketVote',
          ticket: { __typename: 'Ticket', id: ticketId },
          id: vote.id,
        },
      }
    },
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
          votes: (votes, { readField }) =>
            votes.filter(
              (v: TicketVote) => readField('id', v) !== data.removeVote.id
            ),
        },
      })
    },
  })

  const [addTicket] = useAddTicketMutation({
    optimisticResponse: ({ details }) => {
      if (!me) throw new Error('Cannot find self user')
      return {
        __typename: 'Mutation',
        addTicket: {
          __typename: 'Ticket',
          id: Math.random(),
          details,
          author: me,
          votes: [],
        },
      }
    },
    update: (cache, { data }) => {
      cache.modify({
        fields: {
          tickets: (tickets) => {
            const newTicket = cache.writeFragment({
              data: data?.addTicket,
              fragment: SimpleTicketFragmentDoc,
              fragmentName: 'SimpleTicket',
            })
            return [...tickets, newTicket]
          },
        },
      })
    },
  })

  const [removeTicket] = useRemoveTicketMutation({
    optimisticResponse: ({ ticketId }) => ({
      __typename: 'Mutation',
      removeTicket: { __typename: 'Ticket', id: ticketId },
    }),
    update: (cache, { data }) => {
      if (!data) throw new Error('No data returned')
      cache.modify({
        fields: {
          tickets: (tickets, { readField }) => {
            return tickets.filter(
              (t: Ticket) => readField('id', t) !== data.removeTicket.id
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
      <List as="ul" d="v" css={{ mb: 0 }}>
        {q.data.tickets.map((ticket) => (
          <Box as="li" key={ticket.id}>
            <TicketItem
              details={ticket.details}
              votes={ticket.votes}
              author={ticket.author}
              onAddVote={() => addVote({ variables: { ticketId: ticket.id } })}
              onRemoveVote={() =>
                removeVote({ variables: { ticketId: ticket.id } })
              }
              onRemove={() =>
                removeTicket({ variables: { ticketId: ticket.id } })
              }
            />
          </Box>
        ))}
      </List>
      <NewTicketTextarea
        placeholder="New ticket..."
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTicket({ variables: { details: e.currentTarget.value } })
            e.currentTarget.value = ''
          }
        }}
      />
    </>
  )
}
export default Home