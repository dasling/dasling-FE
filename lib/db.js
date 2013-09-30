var Mariasqlclient = require('mariasql'), 	// https://github.com/mscdex/node-mariasql
    config = require('./config.js');
    
var util = require('util');

// Store the DB connection for reuse
var dbclients = {};
dbclients.Client = {};
dbclients.Client._connections = {};

dbclients.Client.getConnection = function(function_to_exec, config) {
    if (!this._connections[config.host]) {
    //console.log('In db.client.getconnection ; Creating new DB connection');
    var onedbclient = new Mariasqlclient();
    //console.log('In db.client.getconnection ; connection details:');
    //console.log(onedbclient);
//     console.log('In db.client.getconnection ; Setting up the events (on/error/close).');
    // log the events on the DB connection
    onedbclient.on('connect', function() {
      console.log('DB Client connected');
//       return this._connections[config.host];
      dbclients.Client._connections[config.host] = this;
      console.log('In db.client.getconnection ; Storing the connection:');
//       console.log(onedbclient);
      function_to_exec(dbclients.Client._connections[config.host]);
    })
    .on('error', function(err) {
      console.log('DB Client error: ' + err);
      // Remove all connections for the connection list
//       dbclients.Client._connections = {};
    })
    .on('close', function(hadError) {
      console.log('DB Client closed');
      // Remove all connections for the connection list
//       dbclients.Client._connections = {};   
    });
//     console.log('In db.client.getconnection ; Finished with setting up the events (on/error/close).');    
//     console.log('In db.client.getconnection ; Connecting with config');    
    //console.log(config);    
    onedbclient.connect(config);
  } else { // connection was already established
    console.log('DB connection reused');
    //console.log(dbclients.Client._connections[config.host]);
    function_to_exec(dbclients.Client._connections[config.host]);
  };
};

exports.exec = function (function_to_exec, dbconfig) {
  if(typeof(dbconfig )==='undefined') dbconfig = config.getConfiguration().database;
  dbclients.Client.getConnection(function_to_exec, dbconfig);
};
