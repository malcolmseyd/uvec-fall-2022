const ws = require('ws');

const client = new ws('ws://localhost:3000/connect');

client.on('open', () => {
  // Causes the server to print "Hello"
  client.send('{"message": "Hello"}');
  client.close();
});