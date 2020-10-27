import { spaceKeys, mapSpace, styled } from '../stitches.config'

const allItemsExceptFirst = '& > *:not(:first-child)'

/** Stacks a series of items
 *
 * Usage:
 * ```tsx
 * <Stack d="h">
 *     <div className=""></div>
 *     <div className=""></div>
 *     <div className=""></div>
 * </Stack>
 * ```
 */
const Stack = styled('div', {
  display: 'flex',

  // Useful reset if the stack is being used as a "ul" element
  p: 0,
  m: 0,
  listStyle: 'none',

  variants: {
    d: {
      h: { flexDirection: 'row' },
      v: { flexDirection: 'column' },
    },
    dist: mapSpace((s) => ({})),
  },
})

// Add margin to items depending on the direction
// for each "space" keys
spaceKeys.forEach((spaceKey) => {
  Stack.compoundVariant(
    { d: 'h', dist: spaceKey },
    { [allItemsExceptFirst]: { ml: spaceKey } }
  )
  Stack.compoundVariant(
    { d: 'v', dist: spaceKey },
    { [allItemsExceptFirst]: { mt: spaceKey } }
  )
})

Stack.defaultProps = { d: 'h', dist: '$2' }

export default Stack
