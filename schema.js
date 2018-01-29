import { makeExecutableSchema, addMockFunctionsToSchema } from "graphql-tools"
// import mocks from "./mocks"
import resolvers from "./resolvers"

const typeDefs = `

scalar JSON

type FriendRequest {
  id: ID!
  fromUser: User!
  toUser: User!
  message: String
  createdAt: String
}

type ReadPosition {
  id: ID!
  userId: ID!
  chatId: ID!
  messageId: ID!
}

type User {
  id: ID!
  token: String
  name: String
  username: String
  description: String
  iconUrl: String
  color: String
  friends: [User]
  groups: [Group]
  friendRequests: [FriendRequest]
  allMessages: [Message]
}

type Chat {
  id: ID!
  name: String!
  messages: [Message]
}

type Message {
  id: ID!
  chatId: ID!
  userId: ID!
  content: Content
}

type Content {
  type: String!
  data: JSON!
}

type Group {
  id: ID!
  iconUrl: String
  name: String
  description: String
  chats: [Chat]
  members: [User]
}

type Subscription {
  newFriendRequest(toUserId: ID): FriendRequest
  newMessage(forUserId: ID!): Message
}

type Query {
  User(id: ID!): User
  users(
    phrase: String!
  ): [User]
  relevantUsers: [User]

  Group(id: ID!): Group

  Chat(id: ID!): Chat
}

type Mutation {
  createUser(
    email: String,
    phone_number: String
    username: String,
    password: String,
    name: String,
    description: String,
    color: String,
  ): User

  loginUserWithEmail(
    email: String!,
    password: String!
  ): User

  loginUserWithPhone(
    phone_number: String!,
    password: String!
  ): User

  createGroup(
    name: String,
    username: String
  ): String

  createFriendRequest(
    message: String,
    fromUserId: ID!,
    toUserId: ID!,
  ): String

  acceptFriendRequest(
    friendRequestId: ID!,
  ): String

  createGroupRequest(
    message: String!,
    fromUserId: ID!,
    toUserId: ID!,
  ): String

  createGroupInvitation(
    message: String!,
    fromUserId: ID!,
    toUserId: ID!,
    forGroupId: ID!
  ): String

  # Create a message with original content and send
  # in a specific chat

  createMessage(
    type: String!
    data: JSON!
    chatId: ID!
  ): Message

  # Create a message under your authorship in toChatId that sends
  # content of an arbitrary authorship (either yours or another users).
  # The concept of sending a different user's content is used for
  # quoting/replying/forwarding

  createMessageWithExistingContent(
    contentId: ID!
    toChatId: ID!
  ): Message

  # TODO: Expose API for bulk sending
  # Pass content ID or custom NEW content for each message in array

  # Updating read position

  updateReadPosition(
    forMessageId: ID!
  ): ReadPosition
}
`

const schema = makeExecutableSchema({ typeDefs, resolvers })

// addMockFunctionsToSchema({ schema, mocks })

export default schema
