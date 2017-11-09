import React, { Component } from 'react'
import '../styles/Chat.css'
import ChatInput from './ChatInput'
import ChatMessages from './ChatMessages'
import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'

const NEW_MESSAGE_SUBSCRIBTION = gql`
subscription NewMessageSubscription {
  Message (filter:{
    mutation_in: [CREATED]
  }) {
    node {
      id
      text
      createdAt
      sentBy {
        id
        name
      }
    }
  }
}
`

class Chat extends Component {

  state = {
    message: ''
  }

  componentDidMount() {
    this.createMessageSubscription = this.props.allMessagesQuery.subscribeToMore({
      document: NEW_MESSAGE_SUBSCRIBTION,
      updateQuery: (previousState, {subscriptionData}) => {
        console.log(`Recieved message ${subscriptionData.Message.node.text}`)
        const newMessage = subscriptionData.Message.node
        const messages = previousState.allMessages.concat([newMessage])
        return {
          allMessages: messages
        }
      }
    })
  }

  render() {
    return (
      <div className='Chat'>
        <ChatMessages
          messages={this.props.allMessagesQuery.allMessages || []}
          endRef={this._endRef}
        />
        <ChatInput
          message={this.state.message}
          onTextInput={(message) => this.setState({message})}
          onResetText={this._resetText}
          onSend={this._onSend}
        />
      </div>
    )
  }

  _onSend = () => {
    console.log(`Send: ${this.state.message}`)
    this.props.createMessageMutation({
      variables: {
        text: this.state.message,
        sentById: this.props.userId
      }
    })
  }

  _resetText = () => {
    this.setState({message: ''})
  }


  /*
   * AUTO SCROLLING
   */

  _endRef = (element) => {
    this.endRef = element
  }

  componentDidUpdate(prevProps) {
    // scroll down with every new message
    if (this.endRef) {
      this.endRef.scrollIntoView()
    }
  }

}

const ALL_MESSAGES_QUERY = gql`
query AllMessages {
  allMessages (last: 100) {
    id
    text
    createdAt
    sentBy {
      id
      name
    }
  }
}`

const CREATE_MESSAGE_MUTATION = gql`
mutation CreateMessageMutation($text: String!, $sentById: ID!) {
  createMessage(
    text:$text,
    sentById: $sentById) {
    id,
    text,
    sentBy {
      id,
      name
    }
  }
}
`

export default compose(
  graphql(ALL_MESSAGES_QUERY, {name: 'allMessagesQuery'}),
  graphql(CREATE_MESSAGE_MUTATION, {name: 'createMessageMutation'})
) (Chat)
