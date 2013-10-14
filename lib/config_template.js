
var config = {};

// setup the DB connection
config.database = {
      host: 'daling_db_server.com', // or 'localhost' for instance
      db: 'dasling',
      user: 'dasling',
      password: 'dasling',
    };

config.twitter = {
  // surf to dev.twitter.com, make an app, and add your keys here
  consumerKey : 'DJVSVKSDNZEE543N232K32' ,
  consumerSecret : '34534HIFI344F4I34H4I34R3I4FJ3I4IF3I4NF3'
}

exports.getConfiguration = function() {return config;}
