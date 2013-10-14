var dbclient = require('../lib/db');
var util = require('util');

/*
 * GET sensors listing for a certain device.
 */

exports.list = function(req, res) {

  sensors = [];
  messages = [];
  
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your sensors.');
    res.render('sensors', { title: 'Sensor list',
		      messages: messages,
		      sensors: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      console.log("In sensors.list: Collecting sensors");
      var preproc_sql_statement = 'SELECT s.organization_id, s.channel_id, s.device_id, \
                                              s.channel_user_given_id, s.description, s.status_id, stat.description as status \
                                      FROM channels s \
                                        JOIN devices d \
                                          ON s.device_id = d.device_id \
                                        JOIN map_users_devices map \
                                          ON d.device_id = map.device_id \
                                        JOIN statuses stat \
                                          ON s.status_id = stat.status_id \
                                      WHERE map.user_id = :user_id';
      var sql_preproc_data = {user_id: req.user.id};
      if (req.params.device_id != null) {
        preproc_sql_statement += ' AND s.device_id = :device_id';
        sql_preproc_data.device_id= req.params.device_id; 
        
      }
      var preproc_sql = conn.prepare(preproc_sql_statement);
      conn.query(preproc_sql(sql_preproc_data))
      .on('result', function(res) {
	res.on('row', function(row) {
	  console.log("In sensors.list: Sensor found: " + util.inspect(row));
	  sensors.push(row);
	})
	.on('error', function(err) {
	  console.log("In sensors.list: Sensor access error: " + util.inspect(err));  
	  messages.push('Error accessing a sensor. Please report this to the administrator with as much detail as humanly possible.');
	})
	.on('end', function(info) {
	  if (info.numRows == 0) { // No sensors found 
	    messages.push('You have no sensors associated to this device');
	  }
	});
      })
      .on('end', function() {
	console.log("In sensors.list: Queries ended, sensors:");  
        console.log(sensors);
        console.log(req.params.device_id);
        var current_device = (req.params.device_id == undefined)? 'all' : req.params.device_id;
        console.log(current_device);
	res.render('sensors', {title: 'Sensor list (device_id = ' + current_device + ')',
			      messages: messages,
			      sensors: sensors,
                              current_device: current_device
	});
      });
    });
  }
}

/*
 * ADD a sensor
 */

exports.add = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your sensors.');
    res.render('sensors', { title: 'Sensor list',
                      messages: messages,
                      sensors: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      // TODO: Need to check whether user is authorized to add a channel to this device
      // execute a query to check device for a user_id == req.user.id
      
      var preproc_sql = conn.prepare("INSERT INTO channels \
                                          (organization_id, device_id, channel_user_given_id, description, status_id) \
                                        VALUES \
                                          (:organization_id, :device_id, :channel_user_given_id, :description, :status_id)");
      conn.query(preproc_sql({organization_id:1,
                              device_id: req.params.device_id,
                              channel_user_given_id: "Fill in unique identifier for sensor (device: " + req.params.device_id + ")",
                              description: "Fill in a description here, e.g. temperature sensor on my_cool_device",
                              status_id: 100}))
      .on('result', function(res) {
        res.on('row', function(row) {
        })
        .on('error', function(err) {
          console.log("In sensors.add: Error adding sensor: " + util.inspect(err));  
          messages.push('Error adding a sensor. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.numRows == 1) { // 1 sensor was added
            //TODO: pertain message over the redirect: http://stackoverflow.com/questions/7079048/passing-error-message-to-template-through-redirect-in-express-node-js
            messages.push('Added sensor with ID: ' + info.insertId);
            console.log("In sensors.add: Added sensor: " + info.insertId);
          }
        });
      })
      .on('end', function() {
        console.log("In sensors.add: Queries ended:");  
        res.redirect('/sensors/list/' + req.params.device_id);
      });
    });
  }
}

/*
 * EDIT a sensor -> present a form
 */

exports.edit_form = function(req, res) {

  messages = [];
  
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your sensors.');
    res.render('sensors', { title: 'Sensor list',
                      messages: messages,
                      sensors: {}
    })
  } 
  else {
    dbclient.exec(function(conn) {
      var preproc_sql = conn.prepare("SELECT c.* FROM channels c \
                                          JOIN devices d ON c.device_id = d.device_id \
                                          JOIN map_users_devices map ON d.device_id = map.device_id \
                                          WHERE c.channel_id = :channel_id \
                                              AND map.user_id = :user_id");
      conn.query(preproc_sql({user_id: req.user.id, channel_id: req.params.channel_id}))
      .on('result', function(result) {
        result.on('row', function(row) {
          console.log("In sensors.edit_form: result: " + util.inspect(row));
          messages.push('Editing sensor with ID: ' + req.params.sensor_id);
          res.render('sensor_edit', { title: 'Sensor Edit form',
                  messages: messages,
                  sensor: row
          })
        })
        .on('error', function(err) {
          console.log("In sensors.edit_form: error: " + util.inspect(err));  
          messages.push('Error editing a sensor. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.numRows == 1) { // 1 sensor is going to be edited
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In sensors.edit_form: Queries ended:");  
      });
    });
  }
}

/*
 * EDIT a sensor
 */

exports.edit = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your sensors.');
    res.render('sensors', { title: 'Sensor list',
                      messages: messages,
                      sensors: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      console.log("inside exit, req.body: " + util.inspect(req.body));
      // TODO: Need to check whether the device_id belong to this user FIRST !
      var preproc_sql = conn.prepare("UPDATE channels c \
                                        SET c.device_id = :device_id, \
                                            c.channel_user_given_id = :channel_user_given_id, \
                                            c.description = :description, \
                                            c.payload_regexp = :payload_regexp, \
                                            c.status_id = 1 \
                                        WHERE c.channel_id = :channel_id");
      conn.query(preproc_sql({user_id: req.user.id,
                              channel_id: req.body.channel_id,
                              channel_user_given_id: req.body.channel_user_given_id,
                              description: req.body.description,
                              device_id : req.body.device_id,
                              payload_regexp: req.body.payload_regexp
                             }))
      .on('result', function(res) {
        res.on('row', function(row) {
          console.log("In sensors.edit: result: " + util.inspect(row));
          messages.push('Edited sensor with ID: ' + req.params.sensor_id);
        })
        .on('error', function(err) {
          console.log("In sensors.edit: error: " + util.inspect(err));  
          messages.push('Error editing a sensor. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.affectedRows == 1) { // 1 sensor was edited
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In sensors.edit: Queries ended:");  
        res.redirect('/sensors/list/' + req.body.device_id);
      });
    });
  }
}

/*
 * ACTIVATE a sensor
 */

exports.act = function(req, res) {
  
  var messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your sensors.');
    res.render('sensors', { title: 'Sensor list',
                      messages: messages,
                      sensors: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      
      // Get device_id in order to be able to redirect to sensors with this device_id
      var current_device_id;
      var preproc_sql = conn.prepare("SELECT c.* FROM channels c \
                                        JOIN map_users_devices map ON c.device_id = map.device_id \
                                      WHERE c.channel_id = :channel_id AND map.user_id = :user_id;");
      conn.query(preproc_sql({user_id: req.user.id, channel_id: req.params.channel_id}))
      .on('result', function(result) {
        result.on('row', function(row) {
          console.log("Retrieving device_id, result: " + util.inspect(row));
          current_device_id = row.device_id;
          
          // device 
            var preproc_sql = conn.prepare("UPDATE channels c \
                                              JOIN map_users_devices map ON c.device_id = map.device_id \
                                              SET c.status_id = 1 \
                                              WHERE c.channel_id = :channel_id AND map.user_id = :user_id;");
            conn.query(preproc_sql({user_id: req.user.id, channel_id: req.params.channel_id}))
            .on('result', function(result) {
              result.on('row', function(row) {
                console.log("In sensors.act: result: " + util.inspect(row));
                messages.push('Disabled sensor with ID: ' + req.params.sensor_id);
              })
              .on('error', function(err) {
                console.log("In sensors.act: error: " + util.inspect(err));  
                messages.push('Error activating a sensor. Please report this to the administrator with as much detail as humanly possible.');
              })
              .on('end', function(info) {
                console.log(info);
                if (info.affectedRows == 1) { // 1 sensor was activated
                  messages.push('Done.');
                }
              });
            })
            .on('end', function() {
              console.log("In sensors.act: Queries ended:");  
              res.redirect('/sensors/list/' + current_device_id);
            });
        })
        .on('error', function(err) {
          console.log("In sensors.act: error: " + util.inspect(err));  
          messages.push('Error activating a sensor. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.numRows == 1) { // 1 sensor was activated
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In sensors.act: Device ID retrieved:");
      });
    });
  }
}


exports.dis = function(req, res) {
  
  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your sensors.');
    res.render('sensors', { title: 'Sensor list',
                      messages: messages,
                      sensors: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      
      // Get device_id in order to be able to redirect to sensors with this device_id
      var current_device_id;
      var preproc_sql = conn.prepare("SELECT c.* FROM channels c \
                                        JOIN map_users_devices map ON c.device_id = map.device_id \
                                      WHERE c.channel_id = :channel_id AND map.user_id = :user_id;");
      conn.query(preproc_sql({user_id: req.user.id, channel_id: req.params.channel_id}))
      .on('result', function(result) {
        result.on('row', function(row) {
          console.log("Retrieving device_id, result: " + util.inspect(row));
          current_device_id = row.device_id;
          
          // device 
            var preproc_sql = conn.prepare("UPDATE channels c \
                                              JOIN map_users_devices map ON c.device_id = map.device_id \
                                              SET c.status_id = 16 \
                                              WHERE c.channel_id = :channel_id AND map.user_id = :user_id;");
            conn.query(preproc_sql({user_id: req.user.id, channel_id: req.params.channel_id}))
            .on('result', function(result) {
              result.on('row', function(row) {
                console.log("In sensors.dis: result: " + util.inspect(row));
                messages.push('Disabled sensor with ID: ' + req.params.sensor_id);
              })
              .on('error', function(err) {
                console.log("In sensors.dis: error: " + util.inspect(err));  
                messages.push('Error disabling a sensor. Please report this to the administrator with as much detail as humanly possible.');
              })
              .on('end', function(info) {
                console.log(info);
                if (info.affectedRows == 1) { // 1 sensor was disabled
                  messages.push('Done.');
                }
              });
            })
            .on('end', function() {
              console.log("In sensors.dis: Queries ended:");  
              res.redirect('/sensors/list/' + current_device_id);
            });
        })
        .on('error', function(err) {
          console.log("In sensors.dis: error: " + util.inspect(err));  
          messages.push('Error disabling a sensor. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.numRows == 1) { // 1 sensor was disabled
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In sensors.dis: Device ID retrieved:");
      });
    });
  }
}
