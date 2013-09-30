
var config = {};

// setup the DB connection
config.database = {
      host: 'CIB-flukso.mech.kuleuven.be',
      db: 'perp_v1',
      user: 'perpetual_pave',
      password: '@PASSWORD@',
    };

exports.getConfiguration = function() {return config;}