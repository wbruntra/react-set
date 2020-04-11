import socketIOClient from 'socket.io-client'

const socketURL =
  process.env.NODE_ENV === 'production' ? 'http://localhost:5000' : 'http://localhost:3000'

const socket = socketIOClient(socketURL)

export default socket
