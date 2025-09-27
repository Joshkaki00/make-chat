$(document).ready(() => {
  const socket = io.connect();

  // Listen for "new user" events from server
  socket.on('new user', (username) => {
    console.log(`✋ ${username} has joined the chat! ✋`);
  });

  $('#create-user-btn').click((e) => {
    e.preventDefault();
    let username = $('#username-input').val();
    if(username.length > 0) {
      // Emit custom "new user" event to server
      socket.emit('new user', username);
      $('.username-form').remove(); // Hide form after joining
    }
  });
});