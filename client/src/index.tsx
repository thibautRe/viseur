import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'

import App from './App'
import * as serviceWorker from './serviceWorker'
import { css } from './stitches.config'

css.global({
  body: {
    fontFamily: '$sansSerif',
    fontWeight: '$normal',
    boxSizing: 'border-box',
    color: '$grey20',
  },
  '*, *::before, *::after': { boxSizing: 'inherit' },
})

const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache(),
})

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
