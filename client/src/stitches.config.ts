import { createStyled } from '@stitches/react'

export const space = {
  $0: '0rem',
  $1: '0.25rem',
  $2: '0.5rem',
  $3: '0.75rem',
  $4: '1rem',
} as const
type SpaceKey = keyof typeof space
type Space = SpaceKey | (string & {}) | (number & {})

// @ts-expect-error Object.keys
export const spaceKeys: Array<SpaceKey> = Object.keys(space)

/** Helper to create variants */
export const mapSpace = <T>(iter: (s: SpaceKey) => T): Record<SpaceKey, T> => {
  return spaceKeys.reduce<Record<SpaceKey, T>>(
    (acc, spaceKey) => ({
      ...acc,
      [spaceKey]: iter(spaceKey),
    }),
    {} as Record<SpaceKey, T>
  )
}

export const { styled, css } = createStyled({
  prefix: '',
  showFriendlyClassnames: false,
  tokens: {
    space,
    colors: {
      $red: '#CD006D',
      $redContrastColor: '#FFFFFF',

      $ticketAuthorTitle: 'hsl(10, 5%, 55%)',
      $ticketTitle: 'hsl(10, 12%, 16%)',
      $ticketBackground: '#EEE',
    },
    sizes: {
      $ticketWidth: '17rem',
      $ticketMinHeight: '7rem',
    },
    fonts: {
      $sansSerif: 'sans-serif',
    },
    radii: {
      $1: '0.25rem',
    },
  },

  breakpoints: {},

  utils: {
    // --- PADDING ---
    p: () => (value: Space) => ({
      paddingTop: value,
      paddingBottom: value,
      paddingLeft: value,
      paddingRight: value,
    }),
    pt: () => (v: Space) => ({ paddingTop: v }),
    pr: () => (v: Space) => ({ paddingRight: v }),
    pb: () => (v: Space) => ({ paddingBottom: v }),
    pl: () => (v: Space) => ({ paddingLeft: v }),
    px: () => (v: Space) => ({ paddingLeft: v, paddingRight: v }),
    py: () => (v: Space) => ({ paddingTop: v, paddingBottom: v }),

    // --- MARGIN ---
    m: () => (v: Space) => ({
      marginTop: v,
      marginBottom: v,
      marginLeft: v,
      marginRight: v,
    }),
    mt: () => (v: Space) => ({ marginTop: v }),
    mr: () => (v: Space) => ({ marginRight: v }),
    mb: () => (v: Space) => ({ marginBottom: v }),
    ml: () => (v: Space) => ({ marginLeft: v }),
    mx: () => (v: Space) => ({ marginLeft: v, marginRight: v }),
    my: () => (v: Space) => ({ marginTop: v, marginBottom: v }),
  },
})
