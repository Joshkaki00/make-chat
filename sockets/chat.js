module.exports = (io, socket, onlineUsers) => {
  socket.on('get online users', () => {
    // Send current online users to the requesting client
    socket.emit('get online users', onlineUsers);
  });

  // Listen for "new user" events from clients
  socket.on('new user', (data) => {
    console.log(`✋ ${data.username} has joined the chat! ✋`);
    
    // Store username in socket for later use
    socket.username = data.username;
    
    // Add user to online users tracking
    onlineUsers[data.username] = socket.id;
    
    // Send current online users list to the new user
    socket.emit('online users', { users: Object.keys(onlineUsers) });
    
    // Broadcast to ALL clients that someone joined
    io.emit("new user", { username: data.username });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.username) {
      console.log(`👋 ${socket.username} has left the chat! 👋`);
      
      // Remove user from online users tracking
      delete onlineUsers[socket.username];
      
      // Broadcast to all clients that someone left
      io.emit("user left", { username: socket.username });
    }
  });
};