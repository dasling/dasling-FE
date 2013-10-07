
var config = {};

// setup the DB connection
config.database = {
      host: 'my_cool_server.my_green_farm.com',
      db: 'dasling',
      user: 'dasling',
      password: '@PASSWORD@',
    };

exports.getConfiguration = function() {return config;}
