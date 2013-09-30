var dbclient = require('../lib/db');

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
      var preproc_sql = conn.prepare('SELECT * FROM devices d JOIN map_users_devices mud ON d.device_id = mud.device_id WHERE mud.user_id = :id');
      conn.query(preproc_sql(req.user))
      .on('result', function(res) {
	res.on('row', function(row) {
	  console.log("In devices.list: Device found: " + util.inspect(row));
	  devices.push = row;
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
	console.log("In devices.list: Queries ended.");  
	res.render('devices', {title: 'Device list',
			      messages: messages,
			      devices: devices
	});
      });
    });
  }
}