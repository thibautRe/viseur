import React from 'react'

import { styled } from '../../stitches.config'
import { Box } from '../Box'
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
  color: '$red',

  "&[aria-pressed='true']": {
    display: 'block',
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
  details?: React.ReactNode
  firstName?: React.ReactNode
  isSelf?: boolean
  votes?: Array<{
    voter: { isSelf: boolean; firstName: React.ReactNode }
  }>
  onAddVote?: () => void
  onRemoveVote?: () => void
  onRemove?: () => void
}
const TicketItem = ({
  details,
  firstName,
  isSelf,
  votes = [],
  onAddVote = () => {},
  onRemoveVote = () => {},
  onRemove = () => {},
}: TicketItemProps) => {
  return (
    <TicketWrapper>
      <Stack d="v" dist="$0" css={{ mb: '$2' }}>
        <Stack dist="$1" css={{ alignItems: 'center' }}>
          <Box
            css={{
              width: 6,
              height: 6,
              borderRadius: 6,
              backgroundColor: '$grey30',
            }}
          />
          <Typography.Label css={{ color: '$ticketAuthorTitle' }}>
            {firstName}
          </Typography.Label>
        </Stack>
        <Typography.H2 css={{ color: '$ticketTitle' }}>{details}</Typography.H2>
      </Stack>
      <Stack>
        <LikeButton
          aria-pressed={votes.some((tv) => tv.voter.isSelf)}
          onClick={() =>
            !votes.some((tv) => tv.voter.isSelf) ? onAddVote() : onRemoveVote()
          }
        >
          Like
        </LikeButton>
        {isSelf && (
          <DeleteButton onClick={() => onRemove()}>Delete</DeleteButton>
        )}
      </Stack>
    </TicketWrapper>
  )
}

export default TicketItem
