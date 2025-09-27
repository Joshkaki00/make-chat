module.exports = (io, socket) => {
  // Listen for "new user" events from clients
  socket.on('new user', (username) => {
    console.log(`✋ ${username} has joined the chat! ✋`);
    // Broadcast to ALL clients that someone joined
    io.emit("new user", username);
  });
};