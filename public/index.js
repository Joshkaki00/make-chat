$(document).ready(() => {
  const socket = io.connect();
  let currentUser;
  // Request online users when connecting
  socket.emit('get online users');

  // Listen for "new user" events from server
  socket.on('new user', (data) => {
    console.log(`✋ ${data.username} has joined the chat! ✋`);
    
    // Add user to online users list (only if not current user)
    if (data.username !== currentUser) {
      addUserToOnlineList(data.username);
    }
  });

  // Listen for "user left" events from server
  socket.on('user left', (data) => {
    console.log(`👋 ${data.username} has left the chat! 👋`);
    
    // Remove user from online users list
    removeUserFromOnlineList(data.username);
  });

  // Listen for complete online users list from server
  socket.on('online users', (data) => {
    // Clear current users list and populate with all online users
    $('.users-online').empty();
    data.users.forEach(username => {
      if (username !== currentUser) {
        addUserToOnlineList(username);
      }
    });
  });

  socket.on('get online users', (onlineUsers) => {
    // Loop through all usernames in the object
    for(username in onlineUsers) {
      $('.users-online').append(`<div class="user-online">${username}</div>`);
    }
  });

  // Function to add user to online users list
  function addUserToOnlineList(username) {
    const userElement = `
      <div class="user-item" data-username="${username}">
        <div class="user-status"></div>
        ${username}
      </div>
    `;
    $('.users-online').append(userElement);
  }

  // Function to remove user from online users list
  function removeUserFromOnlineList(username) {
    $(`.user-item[data-username="${username}"]`).remove();
  }

  // Handle join chat button
  $('#create-user-btn').click((e) => {
    e.preventDefault();
    let username = $('#username-input').val().trim();
    if(username.length > 0) {
      currentUser = username;
      // Emit custom "new user" event to server
      socket.emit('new user', { username: username });
      
      // Hide form and show main chat interface
      $('.username-form').hide();
      $('.main-container').show();
      
      // Add current user to online list
      addUserToOnlineList(username);
    }
  });

  // Handle Enter key in username input
  $('#username-input').keypress((e) => {
    if(e.which === 13) { // Enter key
      $('#create-user-btn').click();
    }
  });

  // Handle Enter key in chat input
  $('#chat-input').keypress((e) => {
    if(e.which === 13 && !e.shiftKey) { // Enter key without shift
      e.preventDefault();
      $('#send-chat-btn').click();
    }
  });

  // Handle send message button
  $('#send-chat-btn').click((e) => {
    e.preventDefault();
    let message = $('#chat-input').val().trim();
    if(message.length > 0) {
      // For now, just add message locally (will implement socket later)
      addMessageToChat(currentUser, message);
      $('#chat-input').val(''); // Clear input
    }
  });

  // Function to add message to chat
  function addMessageToChat(username, message) {
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const messageElement = `
      <div class="message">
        <span class="username">${username}</span>
        <span class="timestamp">${timestamp}</span>
        <div class="text">${message}</div>
      </div>
    `;
    $('.message-container').append(messageElement);
    
    // Scroll to bottom
    $('.message-container').scrollTop($('.message-container')[0].scrollHeight);
  }

  // Initially hide main container
  $('.main-container').hide();
});