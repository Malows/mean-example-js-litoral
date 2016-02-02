var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    index: true,
    match: [ /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/igm, 'Fill me with a valid E-Mail adress plizchu!' ]
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    validate: {
      validator: function (password) {
        return password.length >= 6;
      },
      message: 'Password should be longer'
    }
  },
  salt: String,
  provider: {
    type: String,
    required: 'Provider is a Required field.'
  },
  providerId: String,
  providerData: {},
  created: {
    type: Date,
    default: Date.now
  },

/* custom setter modifier, I'll use this modifier to deal with the incoming data to create a document in the DB
  websiteSetrer: {
    type: String,
    set: function( url ) {
      if ( !url ) {
        return url;
      } else {
        if ( url.indexOf( 'http://' ) !== 0 && url.indexOf( 'https://' ) !== 0 ) {
          url = 'http://' + url;
        }
        return url;
      }
    }
  },

 custom getter modifier, I'll use this modifier to modify the existent data in the DB
  websiteGetter: {
    type: String,
    get: function( url ){
      if ( !url ) {
        return url;
      } else {
        if ( url.indexOf( 'http://' ) !== 0 && url.indexOf( 'https://' ) !== 0) {
          url = 'http://' + url;
        }
        return url;
      }
    }
  }
*/
});

UserSchema.virtual( 'fullName' )
  .get( function () {
    return this.firstName + ' ' + this.lastName;
  })
  .set( function ( fullName ) {
    var splited = fullName.split(' ');
    this.firstName = splited[0] || '';
    this.lastName = splited[1] || '';
  });


UserSchema.methods.hashPassword = function( password ) {
  return crypto.pbkdf2Sync( password, this.salt, 10000, 64 ).toString( 'base64' );
};

UserSchema.methods.validatePassword = function ( pass ) {
  return this.password === this.hashPassword( pass );
};

UserSchema.statics.findUniqueUsername = function ( username, suffix, callback ) {
  var self = this;
  var possibleName = username + ( suffix || '' );

  self.findOne({ username: possibleName }, function ( err, user ) {
    if ( err ) {
      return callback( null );
    } else {
      if ( !user ) {
        callback( possibleName );
      } else {
        return self.findUniqueUsername( username, ( suffix || 0 ) + 1, callback );
      }
    }
  });
};

UserSchema.statics.findOneByUsername = function ( username, callback ) {
  this.findOne( { username: new RegExp ( username, 'i' ) }, callback );
};

UserSchema.pre( 'save', function ( next ) {
  if ( this.password ) {
    this.salt = new Buffer( crypto.randomBytes(16).toString( 'base64' ), 'base64' );
    this.password = this.hashPassword( this.password );
  }
  next();
});

UserSchema.post( 'save', function( next ) {
  if( this.isNew ) {
    console.log( 'A new user was created.' );
  } else {
    console.log( 'A user updated is details.' );
  }
});

UserSchema.set( 'toJSON', { getters: true, virtual: true } );

mongoose.model( 'User', UserSchema );
