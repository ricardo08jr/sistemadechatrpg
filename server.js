// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const io = new Server(server);

const rooms = {}; 
// rooms[roomId] = {
//   peers: Map(socketId -> { userId }),
//   perms: Map(ownerSocketId -> Set(targetSocketId))
// }

io.on('connection', socket => {
  socket.data.userId = null;

  socket.on('join', ({ room, userId }) => {
    socket.data.userId = userId || socket.id;
    socket.join(room);
    rooms[room] = rooms[room] || { peers: new Map(), perms: new Map() };
    rooms[room].peers.set(socket.id, { userId: socket.data.userId });

    // send current participants to everyone in room so clients can build UI
    const list = Array.from(rooms[room].peers.entries()).map(([id, p]) => ({ socketId: id, userId: p.userId }));
    io.to(room).emit('participant-list', list);
  });

  // client requests to set allowed targets for a given owner (owner usually is requester)
  socket.on('update-binds', ({ room, ownerSocketId, allowedTargets /* array of socketIds */ }) => {
    if (!rooms[room]) return;
    const perms = rooms[room].perms;
    const before = perms.get(ownerSocketId) || new Set();
    const after = new Set(allowedTargets || []);
    perms.set(ownerSocketId, after);

    // compute differences => notify newly allowed and newly removed
    for (const t of after) {
      if (!before.has(t) && rooms[room].peers.has(t)) {
        // tell target that owner is available -> target should createOffer to owner
        io.to(t).emit('peer-joined', { socketId: ownerSocketId, userId: rooms[room].peers.get(ownerSocketId)?.userId || ownerSocketId });
      }
    }
    for (const t of before) {
      if (!after.has(t) && rooms[room].peers.has(t)) {
        io.to(t).emit('peer-left', { socketId: ownerSocketId });
      }
    }
  });

  // convenience: request allow all in room
  socket.on('allow-all', ({ room, ownerSocketId }) => {
    if (!rooms[room]) return;
    const all = Array.from(rooms[room].peers.keys()).filter(id => id !== ownerSocketId);
    rooms[room].perms.set(ownerSocketId, new Set(all));
    for (const t of all) {
      io.to(t).emit('peer-joined', { socketId: ownerSocketId, userId: rooms[room].peers.get(ownerSocketId)?.userId || ownerSocketId });
    }
  });

  // convenience: revoke all
  socket.on('revoke-all', ({ room, ownerSocketId }) => {
    if (!rooms[room]) return;
    const prev = rooms[room].perms.get(ownerSocketId) || new Set();
    rooms[room].perms.set(ownerSocketId, new Set());
    for (const t of prev) {
      if (rooms[room].peers.has(t)) io.to(t).emit('peer-left', { socketId: ownerSocketId });
    }
  });

  // forward signaling to specific peer (offer/answer/candidate)
  socket.on('signal', ({ room, to, data }) => {
    io.to(to).emit('signal', { from: socket.id, data });
  });

  socket.on('leave', ({ room }) => {
    leaveRoomCleanup(socket, room);
  });

  socket.on('disconnect', () => {
    // remove from all rooms
    for (const room of Object.keys(rooms)) {
      if (rooms[room].peers.has(socket.id)) leaveRoomCleanup(socket, room);
    }
  });

  function leaveRoomCleanup(socket, room) {
    if (!rooms[room]) return;
    rooms[room].peers.delete(socket.id);
    rooms[room].perms.delete(socket.id); // remove any perms owned by the leaver

    // notify everyone participant-list updated
    const list = Array.from(rooms[room].peers.entries()).map(([id, p]) => ({ socketId: id, userId: p.userId }));
    io.to(room).emit('participant-list', list);

    // tell others that this peer left (so they can close connections)
    socket.to(room).emit('peer-left', { socketId: socket.id });
  }
});

server.listen(3000, () => console.log('Signaling server running on :3000'));