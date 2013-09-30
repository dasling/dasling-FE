var dbclient = require('../lib/db');
var util = require('util');

/*
 * GET unit listing
 */

exports.list = function(req, res) {

  units = [];
  messages = [];
  
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your units.');
    res.render('units', { title: 'Unit list',
		      messages: messages,
		      units: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      console.log("In units.list: Collecting units");
      var preproc_sql_statement = 'SELECT u.*, stat.description as status \
                                      FROM units u \
                                        JOIN statuses stat \
                                          ON u.status_id = stat.status_id \
                                      WHERE u.user_id = :user_id';
      var preproc_sql = conn.prepare(preproc_sql_statement);
      conn.query(preproc_sql({user_id: req.user.id, device_id: req.params.device_id}))
      .on('result', function(res) {
	res.on('row', function(row) {
	  console.log("In units.list: Unit found: " + util.inspect(row));
	  units.push(row);
	})
	.on('error', function(err) {
	  console.log("In units.list: Unit access error: " + util.inspect(err));  
	  messages.push('Error accessing a unit. Please report this to the administrator with as much detail as humanly possible.');
	})
	.on('end', function(info) {
	  if (info.numRows == 0) { // No units found 
	    messages.push('You have no units associated to this device');
	  }
	});
      })
      .on('end', function() {
	console.log("In units.list: Queries ended, units:");  
	res.render('units', {title: 'Unit list',
			      messages: messages,
			      units: units
	});
      });
    });
  }
}

/*
 * ADD a unit
 */

exports.add = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your units.');
    res.render('units', { title: 'Unit list',
                      messages: messages,
                      units: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {      
      var preproc_sql = conn.prepare("INSERT INTO units \
                                          (organization_id, name, description, status_id) \
                                        VALUES \
                                          (:organization_id, :name, :description, :status_id)");
      conn.query(preproc_sql({organization_id:1,
                              name: "Fill in unique name for this unit (e.g. Watt, Ohm, °C/10, ...)",
                              description: "Fill in a description here, e.g. temperature in 10th of a degree Celsius",
                              status_id: 100}))
      .on('result', function(res) {
        res.on('row', function(row) {
        })
        .on('error', function(err) {
          console.log("In units.add: Error adding unit: " + util.inspect(err));  
          messages.push('Error adding a unit. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.numRows == 1) { // 1 unit was added
            //TODO: pertain message over the redirect: http://stackoverflow.com/questions/7079048/passing-error-message-to-template-through-redirect-in-express-node-js
            messages.push('Added unit with ID: ' + info.insertId);
            console.log("In units.add: Added unit: " + info.insertId);
          }
        });
      })
      .on('end', function() {
        console.log("In units.add: Queries ended:");  
        res.redirect('/units');
      });
    });
  }
}

/*
 * EDIT a unit -> present a form
 */

exports.edit_form = function(req, res) {

  messages = [];
  
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your units.');
    res.render('units', { title: 'Unit list',
                      messages: messages,
                      units: {}
    })
  } 
  else {
    dbclient.exec(function(conn) {
      var preproc_sql = conn.prepare("SELECT u.*, stat.description as status \
                                      FROM units u \
                                        JOIN statuses stat \
                                          ON u.status_id = stat.status_id \
                                      WHERE u.unit_id = :unit_id \
                                        AND u.user_id = :user_id");
      conn.query(preproc_sql({user_id: req.user.id, unit_id: req.params.unit_id}))
      .on('result', function(result) {
        result.on('row', function(row) {
          console.log("In units.edit_form: result: " + util.inspect(row));
          messages.push('Editing unit with ID: ' + req.params.unit_id);
          res.render('unit_edit', { title: 'Unit Edit form',
                  messages: messages,
                  unit: row
          })
        })
        .on('error', function(err) {
          console.log("In units.edit_form: error: " + util.inspect(err));  
          messages.push('Error editing a unit. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.numRows == 1) { // 1 unit is going to be edited
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In units.edit_form: Queries ended:");  
      });
    });
  }
}

/*
 * EDIT a unit
 */

exports.edit = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your units.');
    res.render('units', { title: 'Unit list',
                      messages: messages,
                      units: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      console.log(req.body);
      var preproc_sql = conn.prepare("UPDATE units u \
                                        SET u.name = :unit_name, \
                                            u.description = :description, \
                                            u.status_id = 1 \
                                        WHERE u.unit_id = :unit_id \
                                          AND u.user_id = :user_id");
      console.log(req.user.id);
      conn.query(preproc_sql({user_id: req.user.id,
                              unit_id: req.body.unit_id,
                              unit_name: req.body.name,
                              description: req.body.description
                             }))
      .on('result', function(res) {
        res.on('row', function(row) {
          console.log("In units.edit: result: " + util.inspect(row));
          messages.push('Edited unit with ID: ' + req.params.unit_id);
        })
        .on('error', function(err) {
          console.log("In units.edit: error: " + util.inspect(err));  
          messages.push('Error editing a unit. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.affectedRows == 1) { // 1 unit was edited
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In units.edit: Queries ended:");  
        res.redirect('/units');
      });
    });
  }
}

/*
 * ACTIVATE a unit
 */

exports.act = function(req, res) {
  
  var messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your units.');
    res.render('units', { title: 'Unit list',
                      messages: messages,
                      units: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      var preproc_sql = conn.prepare("UPDATE units u \
                                        SET u.status_id = 1 \
                                        WHERE u.unit_id = :unit_id AND u.user_id = :user_id;");
      conn.query(preproc_sql({user_id: req.user.id, unit_id: req.params.unit_id}))
      .on('result', function(result) {
        result.on('row', function(row) {
          console.log("In units.act: result: " + util.inspect(row));
          messages.push('Acivated unit with ID: ' + req.params.unit_id);
        })
        .on('error', function(err) {
          console.log("In units.act: error: " + util.inspect(err));  
          messages.push('Error activating a unit. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.affectedRows == 1) { // 1 unit was activated
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In units.act: Queries ended:");  
        res.redirect('/units/');
      });
    });
  }
}


exports.dis = function(req, res) {
  
  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your units.');
    res.render('units', { title: 'Unit list',
                      messages: messages,
                      units: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      var preproc_sql = conn.prepare("UPDATE units u \
                                        SET u.status_id = 16 \
                                        WHERE u.unit_id = :unit_id AND u.user_id = :user_id;");
      conn.query(preproc_sql({user_id: req.user.id, unit_id: req.params.unit_id}))
      .on('result', function(result) {
        result.on('row', function(row) {
          console.log("In units.dis: result: " + util.inspect(row));
          messages.push('Disabled unit with ID: ' + req.params.unit_id);
        })
        .on('error', function(err) {
          console.log("In units.dis: error: " + util.inspect(err));  
          messages.push('Error disabling a unit. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.affectedRows == 1) { // 1 unit was disabled
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In units.dis: Queries ended:");  
        res.redirect('/units');
      });
    });
  }
}