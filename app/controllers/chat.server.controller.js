module.exports = function ( io, socket ) {
  io.emit( 'chatMessage', {
    type: 'status',
    text: 'connected',
    created: Date.now(),
    username: socket.request.user.username
  });

  socket.on( 'chatMessage', function ( message ) {
    message.type = 'message';
    message.created = Date.now();
    message.username = socket.request.user.username;

    io.emit( 'chatMessage', message );
  });

  socket.on( 'disconnect', function () {
    io.emit( 'disconnect', {
      type: 'status',
      text: 'disconnect',
      created: Date.now(),
      username : socket.request.user.username
    });
  });

};
