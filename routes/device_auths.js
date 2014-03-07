var dbclient = require('../lib/db');
var util = require('util');
var async = require('async');

/*
 * GET device_auths listing.
 */

exports.list = function(req, res) {

  device_auths = [];
  messages = [];
  
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your device_auth.');
    res.render('device_auths', { title: 'Device authorizations list',
		      messages: messages,
		      device_auths: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      console.log("In device_auths.list: Collecting device_auths");
      var preproc_sql = conn.prepare('SELECT da.device_auth_id, da.device_id, da.protocol_id, \
                                            da.username, da.password, da.client_id, stat.status_id, stat.description AS status \
                                      FROM device_auth da \
                                        JOIN devices d \
                                          ON da.device_id = d.device_id \
                                        JOIN map_users_devices map \
                                          ON d.device_id = map.device_id \
                                        JOIN statuses stat \
                                          ON da.status_id = stat.status_id \
                                      WHERE map.user_id = :id');
      conn.query(preproc_sql(req.user))
      .on('result', function(res) {
	res.on('row', function(row) {
	  console.log("In device_auths.list: device_auth found: " + util.inspect(row));
	  device_auths.push(row);
	})
	.on('error', function(err) {
	  console.log("In device_auths.list: device_auth access error: " + util.inspect(err));  
	  messages.push('Error accessing a device_auth. Please report this to the administrator with as much detail as humanly possible.');
	})
	.on('end', function(info) {
	  if (info.numRows == 0) { // No device_auths found 
	    messages.push('You have no Device Authorizations associated to this account');
	  }
	});
      })
      .on('end', function() {
	console.log("In device_auths.list: Queries ended, device_auths:");  
        console.log(device_auths);
	res.render('device_auths', {title: 'Device authorizations list',
			      messages: messages,
			      device_auths: device_auths
	});
      });
    });
  }
}

/*
 * ADD a device_auth
 */

exports.add = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your device_auths.');
    res.render('device_auths', { title: 'Device Authorizations list',
                      messages: messages,
                      device_auths: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {       // programmed in parallel with async (https://github.com/caolan/async)
      
      var get_last_device_id = function (callback) {
        // Get possible last device to cuople to this new device_auth
        var last_device = [];
        var preproc_sql = conn.prepare("SELECT d.device_id from devices d \
                                          JOIN map_users_devices map \
                                        WHERE d.device_id = map.device_id \
                                          AND map.user_id = :user_id \
                                        ORDER BY d.device_id DESC \
                                        LIMIT 1");
        conn.query(preproc_sql({user_id: req.user.id}))
        .on('result', function(res) {
          res.on('row', function(row) { 
            last_device.push(row);
          })
          .on('error', function(err) {
            console.log("an error" + err); 
          })
          .on('end', function(info) {
            console.log("end of first query"); 
            if (info.numRows == 1) {
              console.log("Got back last_device_id" + util.inspect(last_device));
              callback(null, last_device);
            } else {
              console.log("Got back no last_device_id");
              callback("no device", "no device");
            }
          });
        })
        .on('end', function() {
          console.log("Calling back from get_last_device_id");
        });
      }
      
      async.parallel([ // DOC: https://github.com/caolan/async#series
          get_last_device_id
        ],
        // optional callback
        function(err, results){
          if (err instanceof Error) { // Check this line whether it fires correctly
            console.log("No devices can be associated to this device authorization.")
            messages.push("No devices can be associated to this device authorization.")
          } 
          else {
            console.log("device_id returned: " + results[0][0]["device_id"]);
            var preproc_sql = conn.prepare("INSERT INTO device_auth \
                                              (organization_id, device_id, protocol_id, username, password, client_id, status_id) \
                                            VALUES(:organization_id, :device_id, :protocol_id, :username, :password, :client_id, :status_id)");
            conn.query(preproc_sql({organization_id: 0,
                                    device_id: results[0][0]["device_id"],
                                    protocol_id: null,
                                    username: null,
                                    password: null,
                                    client_id: null,
                                    status_id: 100}))
            .on('result', function(res) {
              res.on('row', function(row) {
                console.log("In device_auths.add: Added device_auth: " + util.inspect(row));
                messages.push('Added device_auth with ID: ' + row.new_device_auth_id);
              })
              .on('error', function(err) {
                console.log("In device_auths.add: Error adding device_auth: " + util.inspect(err));  
                messages.push('Error adding a device_auth. Please report this to the administrator with as much detail as humanly possible.');
              })
              .on('end', function(info) {
                console.log(info);
                if (info.numRows == 1) { // 1 device_auth was added
                  messages.push('Done.');
                }
              });
            })
            .on('end', function() {
              console.log("In device_auths.add: Queries ended:");  
              res.redirect('/device_auths');
            });
          };            
        });
    });
  }
}

/*
 * DISABLE a device_auth
 */

exports.dis = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your device_auths.');
    res.render('device_auths', { title: 'DEvice Authorizations list',
                      messages: messages,
                      device_auths: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      var preproc_sql = conn.prepare("UPDATE device_auth da \
                                        JOIN map_users_devices map \
                                          ON da.device_id = map.device_id \
                                      SET da.status_id = 16 \
                                        WHERE da.device_auth_id = :device_auth_id \
                                          AND map.user_id = :user_id");
      conn.query(preproc_sql({user_id: req.user.id, device_auth_id: req.params.device_auth_id}))
      .on('result', function(res) {
        res.on('row', function(row) {
          console.log("In device_auths.dis: result: " + util.inspect(row));
          messages.push('Disabled device_auth with ID: ' + req.params.device_auth_id);
        })
        .on('error', function(err) {
          console.log("In device_auths.dis: error: " + util.inspect(err));  
          messages.push('Error disabling a device_auth. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.affectedRows == 1) { // 1 device_auth was deleted
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In device_auths.dis: Queries ended:");  
        res.redirect('/device_auths');
      });
    });

  }
}

/*
 * ACTIVATE a device_auth
 */

exports.act = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your device_auths.');
    res.render('device_auths', { title: 'Device Authorizations list',
                      messages: messages,
                      device_auths: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      var preproc_sql = conn.prepare("UPDATE device_auth da \
                                        JOIN map_users_devices map \
                                          ON da.device_id = map.device_id \
                                      SET da.status_id = 1 \
                                        WHERE da.device_auth_id = :device_auth_id \
                                          AND map.user_id = :user_id");
      conn.query(preproc_sql({user_id: req.user.id, device_auth_id: req.params.device_auth_id}))
      .on('result', function(res) {
        res.on('row', function(row) {
          console.log("In device_auths.act: result: " + util.inspect(row));
          messages.push('Activation device_auth with ID: ' + req.params.device_auth_id);
        })
        .on('error', function(err) {
          console.log("In device_auths.act: error: " + util.inspect(err));  
          messages.push('Error activating a device_auth. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.affectedRows == 1) { // 1 device_auth was deleted
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In device_auths.act: Queries ended:");  
        res.redirect('/device_auths');
      });
    });

  }
}

/*
 * EDIT a device_auth -> present a form
 */

exports.edit_form = function(req, res) {

  messages = [];
  
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your device_auths.');
    res.render('device_auths', { title: 'device_auth list',
                      messages: messages,
                      device_auths: {}
    })
  } 
  else {
    dbclient.exec(function(conn) {
      // programmed in parallel with async (https://github.com/caolan/async)
      
      var get_devices = function (callback) {
        // Get possible devices 
        var devices_from_user = [];
        var preproc_sql = conn.prepare("SELECT * \
                                        FROM devices d \
                                          JOIN map_users_devices map \
                                            ON d.device_id = map.device_id \
                                        WHERE map.user_id = :user_id");
        conn.query(preproc_sql({user_id: req.user.id}))
        .on('result', function(res) {
          res.on('row', function(row) {
            devices_from_user.push(row);
          })
          .on('error', function(err) {
          })
          .on('end', function(info) {
          });
        })
        .on('end', function() {
          console.log("Calling back from get_devices");
          callback(null, devices_from_user);
        });
      }
      
      async.parallel([ // DOC: https://github.com/caolan/async#series
          get_devices
        ],
        // optional callback
        function(err, results){
          var preproc_sql = conn.prepare("SELECT * FROM device_auth da \
                                            JOIN devices d \
                                              ON da.device_id = d.device_id \
                                            JOIN map_users_devices map \
                                              ON d.device_id = map.device_id \
                                          WHERE da.device_auth_id = :device_auth_id \
                                            AND map.user_id = :user_id");
          conn.query(preproc_sql({user_id: req.user.id, device_auth_id: req.params.device_auth_id}))
          .on('result', function(result) {
            result.on('row', function(row) {
              console.log("In device_auths.edit_form: result: " + util.inspect(row));
              messages.push('Editing device_auth with ID: ' + req.params.device_auth_id);
              res.render('device_auth_edit', { title: 'Device Authorization Edit form',
                      messages: messages,
                      device_auth: row,
                      devices: results[0]
              })
            })
            .on('error', function(err) {
              console.log("In device_auths.edit_form: error: " + util.inspect(err));  
              messages.push('Error editing a device_auth. Please report this to the administrator with as much detail as humanly possible.');
            })
            .on('end', function(info) {
              console.log(info);
              if (info.numRows == 1) { // 1 device_auth is going to be edited
                messages.push('Done.');
              }
            });
          })
          .on('end', function() {
            console.log("In device_auths.edit_form: Queries ended:");  
          });
        });
    });
  }
}

/*
 * EDIT a device_auth
 */

exports.edit = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your device_auths.');
    res.render('device_auths', { title: 'device_auth list',
                      messages: messages,
                      device_auths: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      console.log(req.body);
      // TODO: Check that the new device_id is owned by the user
      var preproc_sql = conn.prepare("UPDATE device_auth da \
                                        JOIN map_users_devices map ON da.device_id = map.device_id \
                                        SET da.device_id = :device_id, \
                                            da.protocol_id = :protocol_id, \
                                            da.username = :username, \
                                            da.password = :password, \
                                            da.client_id= :client_id, \
                                            da.status_id = 1 \
                                        WHERE da.device_auth_id = :device_auth_id \
                                          AND map.user_id = :user_id");
      conn.query(preproc_sql({user_id: req.user.id,
                              device_auth_id: req.body.device_auth_id,
                              device_id: req.body.device_id,
                              protocol_id: req.body.protocol_id,
                              username: req.body.username,
                              password: req.body.password,
                              client_id: req.body.client_id }))
      .on('result', function(res) {
        res.on('row', function(row) {
          console.log("In device_auths.edit: result: " + util.inspect(row));
          messages.push('Edited device_auth with ID: ' + req.params.device_auth_id);
        })
        .on('error', function(err) {
          console.log("In device_auths.edit: error: " + util.inspect(err));  
          messages.push('Error editing a device_auth. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.affectedRows == 1) { // 1 device_auth was deleted
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In device_auths.edit: Queries ended:");  
        res.redirect('/device_auths');
      });
    });
  }
}

