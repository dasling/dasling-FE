// own modules
var dbclient = require('./db');
var util = require('util');

exports.findOrCreateUserByTwitterData = function(twitterData, promise) {

//   console.log("In: findOrCreateUserByTwitterData ; Requesting DB connection.");
  dbclient.exec(function(conn) {
//     console.log("In: findOrCreateUserByTwitterData.");
    // See if the user is in the DB
    var preproc_sql = conn.prepare('SELECT user_id as id, username FROM users WHERE username = :username');
    conn.query(preproc_sql({username : twitterData.screen_name}))
    .on('result', function(res) {
//       console.log('In: findOrCreateUserByTwitterData ; result returned:');
      last_row = {};
      res.on('row', function(row) {
	last_row = row;	
      })
      .on('error', function(err) {
// 	console.log("Error accessing user in DB");
// 	console.log(err);
	promise.fail(err);
	return;
      })
      .on('end', function(info) {
	// End of query
// 	console.log("In: findOrCreateUserByTwitterData ; 1 query ended.");
// 	console.log("In: findOrCreateUserByTwitterData ; info: " + util.inspect(info));
	if (info.numRows == 0) { // User not found: create it
// 	  console.log("In: findOrCreateUserByTwitterData ; numRows = 0 => creating user " + twitterData.screen_name);
	  CreateUserByTwitterData(twitterData, promise);
	} 
	else if (info.numRows == 1) {
// 	  console.log('In: findOrCreateUserByTwitterData ; 1 row returned.');
	  if (typeof last_row !== 'undefined' && last_row !== null && last_row !== {}) { // double check // User found: fulfill the promise
// 	    console.log('User found (row: ' + util.inspect(last_row) + ')');
	    promise.fulfill(last_row);
	  }
	}
      });
    })
    .on('end', function() {
      // console.log('SQL insert done.');
//       console.log('In: findOrCreateUserByTwitterData ; All queries ended.');
    });
  });
}

CreateUserByTwitterData = function(twitterData, promise) {
  console.log('In CreateUserByTwitterData : Creating the user in the DB.');
	
  // Insert the user in the DB
  dbclient.exec(function(conn) {
    var preproc_sql = conn.prepare('INSERT INTO users (username) VALUES (:username)');
    conn.query(preproc_sql({username : twitterData.screen_name}))
    .on('result', function(res) {
      res.on('row', function(row) {
      })
      .on('error', function(err) {
// 	console.log("In CreateUserByTwitterData: Error accessing user in DB");
// 	console.log(err);
	promise.fail(err);
	return;
      })
      .on('end', function(info) {
// 	console.log('In CreateUserByTwitterData: Result finished successfully');
// 	console.log('In CreateUserByTwitterData: Inserted ' + info.numRows + ' user(s) in the DB.');
// 	console.log('In CreateUserByTwitterData: Inserted a user ' + twitterData.screen_name + ' with id ' + info.insertId);
	promise.fulfill({'id': info.insertId}); // need a json with the inserted ID back
      });
    })
    .on('end', function() {
//       console.log('In CreateUserByTwitterData: All queries ended');
    });
  });
}

exports.findOne = function (json_with_user_id, cb) {
//   console.log("In: users.findOne ; Requesting DB connection.");
  dbclient.exec(function(conn) {
    // See if the user is in the DB
    var preproc_sql = conn.prepare('SELECT user_id as id, username FROM users WHERE user_id = :id');
    conn.query(preproc_sql(json_with_user_id))
    .on('result', function(res) {
//       console.log('In users.findOne ; result returned:');
      last_row = {};
      res.on('row', function(row) {
	last_row = row;	
      })
      .on('error', function(err) {
// 	console.log("Error accessing user in DB");
	console.log(err);
	cb(err);
      })
      .on('end', function(info) {
	// End of query
// 	console.log("In users.findOne; 1 query ended.");
// 	console.log("In users.findOne; info: " + util.inspect(info));
	if (info.numRows == 0) { // User not found 
// 	  console.log("In users.findOne; numRows = 0");
	  cb(new Error("findOne: User not found in DB"));
	} 
	else if (info.numRows == 1) {
// 	  console.log('In: findOrCreateUserByTwitterData ; 1 row returned.');
	  if (typeof last_row !== 'undefined' && last_row !== null && last_row !== {}) { // double check // User found: fulfill the promise
// 	    console.log('User found (row: ' + util.inspect(last_row) + ')');
	    cb(null, last_row)
	  }
	}
      });
    })
    .on('end', function() {
      // console.log('SQL insert done.');
//       console.log('In: findOrCreateUserByTwitterData ; All queries ended.');
    });
  });
}