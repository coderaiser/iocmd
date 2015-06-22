var cloudcmd    = require('../cloudcmd'),
    http        = require('http'),
    express     = require('express'),
    io          = require('socket.io'),
    app         = express(),
    
    PORT        = 8000,
    
    socket,
    server;

server = http.createServer(app);
socket = io.listen(server);

app.use(cloudcmd({
    socket: socket
}));

server.listen(PORT);
