import React from 'react'
import TicketItem from './TicketItem'

const LoadingTicketItem = () => (
  <TicketItem
    details="--- ---- ------"
    author={{ firstName: '-----', lastName: '-' }}
  />
)

export default LoadingTicketItem
