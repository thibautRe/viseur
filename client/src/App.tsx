import React from 'react'
import { styled } from './stitches.config'
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
} from './__generated__/models'

const ResetButton = styled('button', {
  border: 'none',
  borderRadius: '$1',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
})

const Stack = styled('div', {
  display: 'flex',

  variants: {
    d: {
      h: {
        flexDirection: 'row',
        '& > *:not(:first-child)': {
          marginLeft: '$2',
        },
      },
      v: {
        flexDirection: 'column',
        '& > *:not(:first-child)': {
          marginTop: '$2',
        },
      },
    },
  },
})

const TicketCardButton = styled(ResetButton, {
  display: 'none',
})

const LikeButton = styled(TicketCardButton, {
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '$red',

  "&[aria-pressed='true']": {
    backgroundColor: '$red',
    color: '$redContrastColor',
  },
})
const DeleteButton = styled(TicketCardButton, {
  color: '$red',
})
const List = styled('ul', {
  padding: 0,
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

  [`&:hover ${TicketCardButton}`]: {
    display: 'block',
  },
})
const TicketHeader = styled('div', {
  marginBottom: '$2',
})
const TicketFooter = styled(Stack, {})
const TicketTitle = styled('strong', {
  color: '$red',
})
const TicketAuthor = styled('em', {})
const Textarea = styled('textarea', {
  width: '$ticketWidth',
  maxWidth: '100%',
  minHeight: '$ticketMinHeight',
  color: '$red',
  backgroundColor: '$ticketBackground',
  border: 'none',
  borderRadius: '$1',
  padding: '$2',
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

function App() {
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
            <TicketFooter d="h">
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
              {ticket.author.isSelf && (
                <DeleteButton
                  onClick={() =>
                    removeTicket({ variables: { ticketId: ticket.id } })
                  }
                >
                  Delete
                </DeleteButton>
              )}
            </TicketFooter>
          </TicketItem>
        ))}
      </List>
      <Textarea
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

export default App
