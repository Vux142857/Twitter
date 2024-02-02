import { createServer } from 'http'
import { Server } from "socket.io";
import app from './server'
import 'dotenv/config'

const port = process.env.PORT || 3000
const server = createServer(app)
const io = new Server(server, { cors: { origin: '*' } })
io.on('connection', (socket) => {
  socket.emit('message', 'Hello from server')
  console.log('a user connected ' + socket.id)
  socket.on('disconnect', () => {
    console.log('user disconnected ' + socket.id)
  })
})
server.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
