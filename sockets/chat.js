module.exports = (io, socket) => {
  // Listen for "new user" events from clients
  socket.on('new user', (data) => {
    console.log(`✋ ${data.username} has joined the chat! ✋`);
    // Store username in socket for later use
    socket.username = data.username;
    // Broadcast to ALL clients that someone joined
    io.emit("new user", { username: data.username });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.username) {
      console.log(`👋 ${socket.username} has left the chat! 👋`);
      // Broadcast to all clients that someone left
      io.emit("user left", { username: socket.username });
    }
  });
};