module.exports = (io, socket, onlineUsers, channels) => {
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

  socket.on('new channel', (newChannel) => {
    // Create new channel with empty message array
    channels[newChannel] = [];
    // Have the creator join the channel room
    socket.join(newChannel);
    // Tell all clients about new channel
    io.emit('new channel', newChannel);
    // Switch the creator to the new channel
    socket.emit('user changed channel', {
      channel: newChannel,
      messages: channels[newChannel]
    });
  });

  // Listen for "new message" events from clients
  socket.on('new message', (data) => {
    // Ensure channel exists, create if it doesn't
    if (!channels[data.channel]) {
      channels[data.channel] = [];
    }
    // Save message to the specific channel
    channels[data.channel].push({
      sender: data.sender, 
      message: data.message
    });
    // Send only to users in that channel room
    io.to(data.channel).emit('new message', data);
  });

  // Listen for "user changed channel" events from clients
  socket.on('user changed channel', (newChannel) => {
    // Ensure channel exists, create if it doesn't
    if (!channels[newChannel]) {
      channels[newChannel] = [];
    }
    // Join the room for that channel
    socket.join(newChannel);
    // Send channel data back to client
    socket.emit('user changed channel', {
      channel: newChannel,
      messages: channels[newChannel]
    });
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