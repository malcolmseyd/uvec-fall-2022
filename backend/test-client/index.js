const ws = require('ws');

const client = new ws('ws://localhost:3000/connect');

client.on('open', () => {
  // Causes the server to print "Hello"
  let msg = {
    type: "testRandom",
  }
  client.send(JSON.stringify(msg));
  client.close();
});