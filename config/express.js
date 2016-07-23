var config = require('./config');
// For WebSockets
var http = require('http');
var socketio = require('socket.io');
// Express
var express = require('express');
// Middleware
var morgan = require('morgan');
var compress = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
// Sessions
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// Login
var flash = require('connect-flash');
var passport = require('passport');

module.exports = function( db ) {
  var app = express();
  var server = http.createServer( app );
  var io = socketio.listen( server );

  if ( process.env.NODE_ENV === 'development' ) {
    app.use( morgan( 'dev' ) );
  } else if ( process.env.NODE_ENV === 'production' ) {
    app.use( compress() );
  }

  // Modules use
  app.use( bodyParser.urlencoded( { extended: true } ) );
  app.use( bodyParser.json() );
  app.use( methodOverride() );

  var mongoStore = new MongoStore( {mongooseConnection: db.connection } ); // me da error de conexion

  app.use( session( {
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret,
    store: mongoStore,
  }));

  app.use( flash() );
  app.use( passport.initialize() );
  app.use( passport.session() );

  // Sets de Express
  app.set( 'views', './app/views' );
  app.set( 'view engine', 'jade' );

  //Require a las rutas
  require( '../app/routes/index.server.routes.js' )( app );
  require( '../app/routes/user.server.routes.js' )( app );
  require( '../app/routes/articles.server.routes.js' )( app );

  //Express api
  app.use( express.static( './public' ) );
  require('./socketio')( server, io, mongoStore );

  return server;
};
