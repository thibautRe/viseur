import React from 'react'

import { styled } from '../../stitches.config'
import { ResetButton } from '../Buttons'
import Stack from '../Stack'
import { Typography } from '../Typography'

const TicketCardButton = styled(ResetButton, {
  display: 'none',
})

const LikeButton = styled(TicketCardButton, {
  borderRadius: '$1',
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

const TicketWrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  maxWidth: '$ticketWidth',
  minHeight: '$ticketMinHeight',
  p: '$2',
  borderRadius: '$1',
  backgroundColor: '$ticketBackground',

  [`&:hover ${TicketCardButton}`]: {
    display: 'block',
  },
})

interface TicketItemProps {
  details: React.ReactNode
  author: {
    isSelf: boolean
    firstName: React.ReactNode
    lastName: React.ReactNode
  }
  votes: Array<{
    voter: { isSelf: boolean; firstName: React.ReactNode }
  }>
  onAddVote: () => void
  onRemoveVote: () => void
  onRemove: () => void
}
const TicketItem = ({
  details,
  author,
  votes,
  onAddVote,
  onRemoveVote,
  onRemove,
}: TicketItemProps) => {
  return (
    <TicketWrapper>
      <Stack d="v" dist="$0" css={{ mb: '$2' }}>
        <Typography.Label css={{ color: '$ticketAuthorTitle' }}>
          {author.firstName}
        </Typography.Label>
        <Typography.H2 css={{ color: '$ticketTitle' }}>{details}</Typography.H2>
      </Stack>
      {votes.length > 0 && (
        <>
          Liked by{' '}
          {votes
            .map((v) => (v.voter.isSelf ? 'you' : v.voter.firstName))
            .join(', ')}
        </>
      )}
      <Stack>
        <LikeButton
          aria-pressed={votes.some((tv) => tv.voter.isSelf)}
          onClick={() =>
            !votes.some((tv) => tv.voter.isSelf) ? onAddVote() : onRemoveVote()
          }
        >
          Like
        </LikeButton>
        {author.isSelf && (
          <DeleteButton onClick={() => onRemove()}>Delete</DeleteButton>
        )}
      </Stack>
    </TicketWrapper>
  )
}

export default TicketItem
