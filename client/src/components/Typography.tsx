import { styled } from '../stitches.config'

export const Typography = {
  H2: styled('h2', {
    fontSize: 15,
    fontWeight: '$normal',
    lineHeight: '15px',
  }),
  Label: styled('span', {
    fontSize: 10,
    fontWeight: '$normal',
    lineHeight: '12px',
    textTransform: 'uppercase',
  }),
}
