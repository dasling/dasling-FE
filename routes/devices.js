var dbclient = require('../lib/db');
var util = require('util');

/*
 * GET devices listing.
 */

exports.list = function(req, res) {

  devices = [];
  messages = [];
  
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your devices.');
    res.render('devices', { title: 'Device list',
		      messages: messages,
		      devices: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      console.log("In devices.list: Collecting devices");
      var preproc_sql = conn.prepare('SELECT d.device_id, d.device_manufacturer_identification, d.description, d.created_at_timestamp, stat.status_id, stat.description AS status FROM devices d JOIN map_users_devices mud ON d.device_id = mud.device_id JOIN statuses stat ON d.status_id = stat.status_id WHERE mud.user_id = :id');
      console.log(preproc_sql(req.user));
      .on('result', function(res) {
	res.on('row', function(row) {
	  console.log("In devices.list: Device found: " + util.inspect(row));
	  devices.push(row);
	})
	.on('error', function(err) {
	  console.log("In devices.list: Device access error: " + util.inspect(err));  
	  messages.push('Error accessing a device. Please report this to the administrator with as much detail as humanly possible.');
	})
	.on('end', function(info) {
	  if (info.numRows == 0) { // No devices found 
	    messages.push('You have no device associated to this account');
	  }
	});
      })
      .on('end', function() {
	console.log("In devices.list: Queries ended, devices:");  
        console.log(devices);
	res.render('devices', {title: 'Device list',
			      messages: messages,
			      devices: devices
	});
      });
    });
  }
}

/*
 * ADD a device
 */

exports.add = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your devices.');
    res.render('devices', { title: 'Device list',
                      messages: messages,
                      devices: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      var preproc_sql = conn.prepare("SELECT add_device(:id) AS new_device_id");
      conn.query(preproc_sql(req.user.id))
      .on('result', function(res) {
        res.on('row', function(row) {
          console.log("In devices.add: Added device: " + util.inspect(row));
          messages.push('Added device with ID: ' + row.new_device_id);
        })
        .on('error', function(err) {
          console.log("In devices.add: Error adding device: " + util.inspect(err));  
          messages.push('Error adding a device. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.numRows == 1) { // 1 device was added
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In devices.add: Queries ended:");  
        res.redirect('/devices');
//         res.render('devices', {title: 'Device list',
//                               messages: messages,
//                               devices: devices
//         });
        // JOIN map_users_devices mud ON d.device_id = mud.device_id JOIN statuses stat ON d.status_id = stat.status_id WHERE mud.user_id = :id');
      });
    });

    // res.render('device_add', {title: 'Add new device'});
  }
}

/*
 * DISABLE a device
 */

exports.dis = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your devices.');
    res.render('devices', { title: 'Device list',
                      messages: messages,
                      devices: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      var preproc_sql = conn.prepare("UPDATE devices d \
                                        JOIN map_users_devices map ON d.device_id = map.device_id \
                                        SET d.status_id = 16 \
                                        WHERE d.device_id = :device_id AND map.user_id = :user_id; \
                                      ");
      conn.query(preproc_sql({user_id: req.user.id, device_id: req.params.device_id}))
      .on('result', function(res) {
        res.on('row', function(row) {
          console.log("In devices.dis: result: " + util.inspect(row));
          messages.push('Deleted device with ID: ' + req.params.device_id);
        })
        .on('error', function(err) {
          console.log("In devices.dis: error: " + util.inspect(err));  
          messages.push('Error deleting a device. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.affectedRows == 1) { // 1 device was deleted
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In devices.dis: Queries ended:");  
        res.redirect('/devices');
//         res.render('devices', {title: 'Device list',
//                               messages: messages,
//                               devices: devices
//         });
        // JOIN map_users_devices mud ON d.device_id = mud.device_id JOIN statuses stat ON d.status_id = stat.status_id WHERE mud.user_id = :id');
      });
    });

    // res.render('device_add', {title: 'Add new device'});
  }
}

/*
 * ACTIVATE a device
 */

exports.act = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your devices.');
    res.render('devices', { title: 'Device list',
                      messages: messages,
                      devices: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      var preproc_sql = conn.prepare("UPDATE devices d \
                                          JOIN map_users_devices map ON d.device_id = map.device_id \
                                          SET d.status_id = 1 \
                                          WHERE d.device_id = :device_id \
                                              AND map.user_id = :user_id");
      conn.query(preproc_sql({user_id: req.user.id, device_id: req.params.device_id}))
      .on('result', function(res) {
        res.on('row', function(row) {
          console.log("In devices.act: result: " + util.inspect(row));
          messages.push('Activated device with ID: ' + req.params.device_id);
        })
        .on('error', function(err) {
          console.log("In devices.act: error: " + util.inspect(err));  
          messages.push('Error activating a device. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.affectedRows == 1) { // 1 device was deleted
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In devices.act: Queries ended:");  
        res.redirect('/devices');
//         res.render('devices', {title: 'Device list',
//                               messages: messages,
//                               devices: devices
//         });
        // JOIN map_users_devices mud ON d.device_id = mud.device_id JOIN statuses stat ON d.status_id = stat.status_id WHERE mud.user_id = :id');
      });
    });

    // res.render('device_add', {title: 'Add new device'});
  }
}

/*
 * EDIT a device -> present a form
 */

exports.edit_form = function(req, res) {

  messages = [];
  
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your devices.');
    res.render('devices', { title: 'Device list',
                      messages: messages,
                      devices: {}
    })
  } 
  else {
    dbclient.exec(function(conn) {
      var preproc_sql = conn.prepare("SELECT * FROM devices d \
                                          JOIN map_users_devices map ON d.device_id = map.device_id \
                                          WHERE d.device_id = :device_id \
                                              AND map.user_id = :user_id");
      conn.query(preproc_sql({user_id: req.user.id, device_id: req.params.device_id}))
      .on('result', function(result) {
        result.on('row', function(row) {
          console.log("In devices.edit_form: result: " + util.inspect(row));
          messages.push('Editing device with ID: ' + req.params.device_id);
          res.render('device_edit', { title: 'Device Edit form',
                  messages: messages,
                  device: row
          })
        })
        .on('error', function(err) {
          console.log("In devices.edit_form: error: " + util.inspect(err));  
          messages.push('Error editing a device. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.numRows == 1) { // 1 device is going to be edited
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In devices.edit_form: Queries ended:");  
//         res.redirect('/devices');
//         res.render('devices', {title: 'Device list',
//                               messages: messages,
//                               devices: devices
//         });
        
      });
    });
  }
}

/*
 * EDIT a device
 */

exports.edit = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your devices.');
    res.render('devices', { title: 'Device list',
                      messages: messages,
                      devices: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      console.log(req.body);
      var preproc_sql = conn.prepare("UPDATE devices d \
                                        JOIN map_users_devices map ON d.device_id = map.device_id \
                                        SET d.device_manufacturer_identification = :device_manufacturer_id, \
                                            d.description = :device_description, \
                                            d.status_id = 1 \
                                        WHERE d.device_id = :device_id \
                                          AND map.user_id = :user_id");
      conn.query(preproc_sql({user_id: req.user.id,
                              device_id: req.body.device_id,
                              device_manufacturer_id: req.body.device_manufacturer_identification,
                              device_description: req.body.description
                             }))
      .on('result', function(res) {
        res.on('row', function(row) {
          console.log("In devices.edit: result: " + util.inspect(row));
          messages.push('Edited device with ID: ' + req.params.device_id);
        })
        .on('error', function(err) {
          console.log("In devices.edit: error: " + util.inspect(err));  
          messages.push('Error editing a device. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.affectedRows == 1) { // 1 device was deleted
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In devices.edit: Queries ended:");  
        res.redirect('/devices');
      });
    });
  }
}

