$(document).ready(() => {
  const socket = io.connect();
  let currentUser;
  socket.emit('get online users');
  // Join General channel by default
  socket.emit('user changed channel', "General");

  // Click handler for switching channels
  $(document).on('click', '.channel', (e) => {
    let newChannel = e.target.textContent;
    socket.emit('user changed channel', newChannel);
  });

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
    for(let username in onlineUsers) {
      $('.users-online').append(`<div class="user-online">${username}</div>`);
    }
  });

  // Refresh online user list when someone leaves
  socket.on('user has left', (onlineUsers) => {
    $('.users-online').empty(); // Clear current list
    // Rebuild list with remaining users
    for(let username in onlineUsers) {
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
    let channel = $('.channel-current').text(); // Get current channel
    let message = $('#chat-input').val();
    if(message.length > 0) {
      socket.emit('new message', {
        sender: currentUser,
        message: message,
        channel: channel // Include channel info
      });
      $('#chat-input').val("");
    }
  });

  // Handle new message (all clients see this)
  socket.on('new message', (data) => {
    // Only show message if user is in that channel
    let currentChannel = $('.channel-current').text();
    if(currentChannel == data.channel) {
      $('.message-container').append(`
        <div class="message">
          <p class="message-user">${data.sender}: </p>
          <p class="message-text">${data.message}</p>
        </div>
      `);
    }
  });

  // Handle new channel button
  $('#new-channel-btn').click(() => {
    let newChannel = $('#new-channel-input').val();
    if(newChannel.length > 0) {
      socket.emit('new channel', newChannel);
      $('#new-channel-input').val("");
    }
  });

  // Add new channel to sidebar (all clients see this)
  socket.on('new channel', (newChannel) => {
    $('.channels').append(`<div class="channel">${newChannel}</div>`);
  });

  // Switch to new channel (only creator sees this initially)
  socket.on('user changed channel', (data) => {
    // Update current channel styling
    $('.channel-current').addClass('channel');
    $('.channel-current').removeClass('channel-current');
    $(`.channel:contains('${data.channel}')`).addClass('channel-current');
    $('.channel-current').removeClass('channel');
    
    // Clear messages and load channel messages
    $('.message').remove();
    data.messages.forEach((message) => {
      $('.message-container').append(`
        <div class="message">
          <p class="message-user">${message.sender}: </p>
          <p class="message-text">${message.message}</p>
        </div>
      `);
    });
  });

  // Initially hide main container
  $('.main-container').hide();
});