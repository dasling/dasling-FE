
var config = {};

// setup the DB connection
config.database = {
      host: 'my_cool_server.my_green_farm.com',
      db: 'dasling',
      user: 'dasling',
      password: '@PASSWORD@',
    };

config.twitter = {
  // surf to dev.twitter.com, make an app, and add your keys here
  consumerKey : 'DJVSVKSDNZEE543N232K32' ,
  consumerSecret : '34534HIFI344F4I34H4I34R3I4FJ3I4IF3I4NF3'
}

exports.getConfiguration = function() {return config;}
