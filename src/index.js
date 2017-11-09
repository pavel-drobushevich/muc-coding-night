import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import './styles/index.css'
import {ApolloProvider} from 'react-apollo'
import {ApolloClient, InMemoryCache, HttpLink} from 'apollo-client-preset'
import {split} from 'apollo-link'
import {WebSocketLink} from 'apollo-link-ws'
import {getMainDefinition} from 'apollo-utilities'

const httpLink = new HttpLink({uri: 'https://api.graph.cool/simple/v1/cj9su0efi8pcy0182qclvo0qr'})
const wsLink = new WebSocketLink({
  uri: 'wss://subscriptions.graph.cool/v1/cj9su0efi8pcy0182qclvo0qr',
  options: {
    reconnect: true
  }
})

const isSubscribtion = (gqlOperation) => {
  const {kind, operation} = getMainDefinition(gqlOperation.query)
  return kind === 'OperationDefinition' && operation === 'subscription'
}

const link = split(
  isSubscribtion,
  wsLink,
  httpLink
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
)
