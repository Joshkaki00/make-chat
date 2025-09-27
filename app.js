const express = require('express');
const app = express();
const server = require('http').Server(app);

// Socket.io integration
const io = require('socket.io')(server);
let onlineUsers = {};
// Store channels as object: channelName -> array of messages
let channels = {"General": []};

io.on("connection", (socket) => {
  // Pass channels to chat handler
  require('./sockets/chat.js')(io, socket, onlineUsers, channels);
});

const { engine } = require('express-handlebars');
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
// Serve static files from public folder
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
  res.render('index.handlebars');
});

server.listen('3000', () => {
  console.log('Server listening on Port 3000');
});