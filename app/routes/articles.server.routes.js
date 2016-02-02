var users = require('../../app/controllers/users.server.controller.js');
var articles = require('../../app/controllers/articles.server.controller.js');

module.exports = function( app ) {
  app.route( '/api/articles' )
    .get( articles.list )
    .post( users.requireLogin, articles.create );

  app.route( '/api/articles/:articleId' )
    .get( articles.read )
    .put( users.requireLogin, articles.hasAuthorization, articles.update )
    .delete( users.requireLogin, articles.hasAuthorization, articles.delete );

  app.param( 'articleId', articles.articleByID );
};
