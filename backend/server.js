'use strict';

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressListEndpoints = require('express-list-endpoints');

const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');
const topicRoutes = require('./routes/topicRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH'],
  },
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.on('finish', function () {
    const statusCode = this.statusCode;
    console.log(req.method, req.originalUrl, statusCode);
  });

  next();
});

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/auth', authRoutes);
app.get('/api', (req, res) => {
  const endpoints = expressListEndpoints(app);
  const endpointsWithoutMiddlewares = endpoints.map((endpoint) => {
    return { path: endpoint.path, methods: endpoint.methods };
  });
  endpointsWithoutMiddlewares.pop();

  res.status(200).json(endpointsWithoutMiddlewares);
});

io.on('connection', (socket) => {
  socket.on('join room', (roomId) => socket.join(roomId));
  socket.on('leave room', (roomId) => socket.leave(roomId));

  socket.on('send msg', (msg) => {
    io.to(msg.room._id).emit('receive msg', msg);
  });
  socket.on('delete msg', (msg) => {
    io.to(msg.room._id).emit('remove msg', msg);
  });
});

const PORT = process.env.PORT;
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log('Connected to database');
    server.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });
