const express = require('express');
const app = express();
const server = require('http').Server(app); // Important: Socket.io needs HTTP server

// Handlebars template engine
const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
  res.render('index.handlebars');
});

server.listen('3000', () => {
  console.log('Server listening on Port 3000');
});