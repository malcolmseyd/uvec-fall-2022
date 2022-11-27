import express from "express";
import ws from "ws";
const app = express();
const port = 3000;

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world! 123" );
} );

const wsServer = new ws.Server({ 
    noServer: true,
    path: "/connect" 
});
wsServer.on('connection', socket => {
    socket.on('message', message => {
        console.log(JSON.parse(message.toString()));
    })
})

// start the Express server
const server = app.listen(port);
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    })
});