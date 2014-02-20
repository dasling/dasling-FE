var dbclient = require('../lib/db');
var util = require('util');

/*
 * GET log overview.
 */

exports.overview = function(req, res) {

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
