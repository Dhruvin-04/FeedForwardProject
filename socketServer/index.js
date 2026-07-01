import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('socket connected: ', socket.id);

    socket.on('identity', async ({userId, location})=>{
      console.log(userId, location)
      try {
        const resp = await fetch(`${process.env.NEXT_BASE_URL || 'http://localhost:3000'}/api/internal/store-socket`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-internal-secret': process.env.INTERNAL_SECRET
          },
          body: JSON.stringify({ userId, socketId: socket.id, location })
        })
        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          console.error('Failed to store socket:', resp.status, text);
        }
      } catch (err) {
        console.error('Error posting to Next API:', err);
      }
    })

    socket.on('disconnect', () => {
        console.log('socket disconnected: ', socket.id);
    })
})

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});