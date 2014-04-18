var dbclient = require('../lib/db');
var util = require('util');
var async = require('async');

/*
 * GET variables listing
 */

exports.list = function(req, res) {

  variables = [];
  messages = [];
  
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your variables.');
    res.render('variables', { title: 'Variable list',
		      messages: messages,
		      variables: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      //console.log("In variables.list: Collecting variables");
      var preproc_sql = conn.prepare('SELECT v.organization_id, v.variable_id, v.unit_id, v.name, \
                                      v.description, v.current_channel_id, v.created_at_timestamp, \
                                      v.republish_topic, v.store_in_DB, v.setup_installed_at_time, v.status_id, \
                                      stat.description as status, u.name as unit_name \
                                      FROM variable v \
                                        JOIN statuses stat \
                                          ON v.status_id = stat.status_id \
                                        LEFT JOIN units u \
                                          ON v.unit_id = u.unit_id \
                                      WHERE v.user_id = :user_id');
      conn.query(preproc_sql({user_id: req.user.id}))
      .on('result', function(res) {
	res.on('row', function(row) {
	  //console.log("In variables.list: Variable found: " + util.inspect(row));
	  variables.push(row);
	})
	.on('error', function(err) {
	  console.log("In variables.list: Variable access error: " + util.inspect(err));  
	  messages.push('Error accessing a variable. Please report this to the administrator with as much detail as humanly possible.');
	})
	.on('end', function(info) {
	  if (info.numRows == 0) { // No variables found 
	    messages.push('You have no variables associated to this variable');
	  }
	});
      })
      .on('end', function() {
	console.log("In variables.list: Queries ended, variables:");  
	res.render('variables', {title: 'Variable list',
			      messages: messages,
			      variables: variables
	});
      });
    });
  }
}

/*
 * ADD a variable
 */

exports.add = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your variables.');
    res.render('variables', { title: 'Variable list',
                      messages: messages,
                      variables: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {      
      // TODO: Get the organization_id from the user_id (from DB)
      var preproc_sql = conn.prepare("INSERT INTO variable \
                                          (organization_id, name, description, status_id, user_id) \
                                        VALUES \
                                          (:organization_id, :name, :description, :status_id, :user_id)");
      conn.query(preproc_sql({organization_id:0,
                              name: "Fill in a name here",
                              description: "Fill in a description here, e.g. temperature at my lab.",
                              status_id: 100,
                              user_id: req.user.id}))
      .on('result', function(res) {
        res.on('row', function(row) {
        })
        .on('error', function(err) {
          console.log("In variables.add: Error adding variable: " + util.inspect(err));  
          messages.push('Error adding a variable. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          if (info.numRows == 1) { // 1 variable was added
            //TODO: pertain message over the redirect: http://stackoverflow.com/questions/7079048/passing-error-message-to-template-through-redirect-in-express-node-js
            messages.push('Added variable with ID: ' + info.insertId);
            console.log("In sensors.add: Added variable: " + info.insertId);
          }
        });
      })
      .on('end', function() {
        console.log("In variables.add: Queries ended:");  
        res.redirect('/variables');
      });
    });
  }
}

/*
 * DISABLE a variable
 */

exports.dis = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your variables.');
    res.render('variables', { title: 'Variable list',
                      messages: messages,
                      variables: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      var preproc_sql = conn.prepare("UPDATE variable v \
                                        SET v.status_id = 16 \
                                        WHERE v.variable_id = :variable_id AND v.user_id = :user_id;");
      conn.query(preproc_sql({user_id: req.user.id, variable_id: req.params.variable_id}))
      .on('result', function(res) {
        res.on('row', function(row) {
          //console.log("In variables.dis: result: " + util.inspect(row));
          messages.push('Disabled variable with ID: ' + req.params.variable_id);
        })
        .on('error', function(err) {
          console.log("In variables.dis: error: " + util.inspect(err));  
          messages.push('Error disabling a variable. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          if (info.affectedRows == 1) { // 1 variable was deleted
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In variables.dis: Queries ended:");  
        res.redirect('/variables');
      });
    });
  }
}

/*
 * ENABLE a variable
 */

exports.act = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your variables.');
    res.render('variables', { title: 'Variable list',
                      messages: messages,
                      variables: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      var preproc_sql = conn.prepare("UPDATE variable v \
                                        SET v.status_id = 1 \
                                        WHERE v.variable_id = :variable_id AND v.user_id = :user_id;");
      conn.query(preproc_sql({user_id: req.user.id, variable_id: req.params.variable_id}))
      .on('result', function(res) {
        res.on('row', function(row) {
          //console.log("In variables.act: result: " + util.inspect(row));
          messages.push('Enabling variable with ID: ' + req.params.variable_id);
        })
        .on('error', function(err) {
          console.log("In variables.act: error: " + util.inspect(err));  
          messages.push('Error enabling a variable. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          if (info.affectedRows == 1) { // 1 variable was deleted
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In variables.act: Queries ended:");  
        res.redirect('/variables');
      });
    });
  }
}

/*
 * EDIT a variable -> present a form
 */

exports.edit_form = function(req, res) {

  messages = [];
  
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your variables.');
    res.render('variables', { title: 'Variable list',
                      messages: messages,
                      variables: {}
    })
  } 
  else {
    dbclient.exec(function(conn) {
      // programmed in parallel with async (https://github.com/caolan/async)
      
      var get_units = function (callback) {
        // Get possible units to fill in the listbox
        var units_for_user = [];
        var preproc_sql = conn.prepare("SELECT * from units u \
                                          WHERE u.user_id = :user_id");
        conn.query(preproc_sql({user_id: req.user.id}))
        .on('result', function(res) {
          res.on('row', function(row) {
            units_for_user.push(row);
          })
          .on('error', function(err) {
          })
          .on('end', function(info) {
          });
        })
        .on('end', function() {
          console.log("Calling back from get_units");
          callback(null, units_for_user);
        });
      }
      
      var get_channels = function (callback) {
        // Get possible channels to fill in the listbox
        var channels_for_user = [];
        var preproc_sql = conn.prepare("SELECT * from channels c \
                                          WHERE c.user_id = :user_id");
        conn.query(preproc_sql({user_id: req.user.id}))
        .on('result', function(res) {
          res.on('row', function(row) {
            console.log("Got back a channels: " + util.inspect(row));
            channels_for_user.push(row);
          })
          .on('error', function(err) {
          })
          .on('end', function(info) {
          });
        })
        .on('end', function() {
          console.log("Calling back from get_channels");
          callback(null, channels_for_user);
        });
      }
      
      async.parallel([ // DOC: https://github.com/caolan/async#series
          get_units,
          get_channels
        ],
        // optional callback
        function(err, results){
          // results is now equal to [units_for_user, 'two']
          console.log(results);
          var preproc_sql = conn.prepare("SELECT * FROM variable v \
                                  WHERE v.variable_id = :variable_id \
                                    AND v.user_id = :user_id");
          conn.query(preproc_sql({user_id: req.user.id, variable_id: req.params.variable_id}))
          .on('result', function(result) {
            result.on('row', function(row) {
              console.log("In variables.edit_form: result: " + util.inspect(row));
              messages.push('Editing variable with ID: ' + req.params.variable_id);
              res.render('variable_edit', { title: 'Variable edit form',
                messages: messages,
                variable: row,
                units: results[0],
                channels: results[1],
              })
            })
            .on('error', function(err) {
              console.log("In variables.edit_form: error: " + util.inspect(err));  
              messages.push('Error editing a variable. Please report this to the administrator with as much detail as humanly possible.');
            })
            .on('end', function(info) {
              console.log(info);
              if (info.numRows == 1) { // 1 variable is going to be edited
              }
            });
          })
          .on('end', function() {
            //console.log("In variables.edit_form: Queries ended:");  
            });
        }
      );
    });
  }
}

/*
 * EDIT a variable
 */

exports.edit = function(req, res) {

  messages = [];
 
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your variables.');
    res.render('variables', { title: 'Variable list',
                      messages: messages,
                      variables: {}
    })
  } 
  else { // user logged in
    dbclient.exec(function(conn) {
      console.log(req.body);
      var preproc_sql = conn.prepare("UPDATE variable v \
                                        SET v.unit_id = :unit_id, \
                                            v.name = :name, \
                                            v.description = :description, \
                                            v.current_channel_id = :current_channel_id, \
                                            v.republish_topic = :republish_topic, \
                                            v.store_in_DB = :store_in_DB, \
                                            v.setup_installed_at_time = :setup_installed_at_time, \
                                            v.status_id = 1 \
                                        WHERE v.variable_id = :variable_id \
                                          AND v.user_id = :user_id");
      conn.query(preproc_sql({user_id: req.user.id,
                              variable_id: req.body.variable_id,
                              unit_id: req.body.unit_id,
                              name: req.body.name,
                              description: req.body.description, 
                              current_channel_id: req.body.current_channel_id,
                              republish_topic: req.body.republish_topic,
                              store_in_DB: req.body.store_in_DB,
                              setup_installed_at_time: req.body.setup_installed_at_time,                              
                             }))
      .on('result', function(res) {
        res.on('row', function(row) {
          console.log("In variables.edit: result: " + util.inspect(row));
          messages.push('Edited variable with ID: ' + req.params.variable_id);
        })
        .on('error', function(err) {
          console.log("In variables.edit: error: " + util.inspect(err));  
          messages.push('Error editing a variable. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.affectedRows == 1) { // 1 variable was deleted
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In variables.edit: Queries ended:");  
        res.redirect('/variables');
      });
    });
  }
}
