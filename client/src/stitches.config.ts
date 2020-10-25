import { createStyled } from '@stitches/react'

export const { styled, css } = createStyled({
  prefix: '',
  tokens: {
    colors: {
      $red: '#CD006D',
      $redContrastColor: '#FFFFFF',

      $ticketBackground: "#EEE",
    },
    space: {
      $1: '0.25rem',
      $2: '0.5rem',
      $3: '0.75rem',
      $4: '1rem',
    },
    sizes: {
      $ticketWidth: "15rem",
      $ticketMinHeight: "5rem",
    },
    fonts: {
      $sansSerif: 'sans-serif',
    },
    radii: {
      $1: '0.25rem',
    },
  },
  breakpoints: {},
  utils: {},
})
