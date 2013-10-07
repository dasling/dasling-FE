var dbclient = require('../lib/db');
var util = require('util');
var async = require('async');

/*
 * EDIT a user -> present a form
 */

exports.edit_form = function(req, res) {

  messages = [];
  
  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access your account info.');
    res.render('user_edit', { title: 'Account',
                      messages: messages,
                      user: {}
    })
  } 
  else {
    dbclient.exec(function(conn) {
      // programmed in parallel with async (https://github.com/caolan/async)
      var preproc_sql = conn.prepare("SELECT * FROM users u \
                                        WHERE u.user_id = :user_id");
      conn.query(preproc_sql({user_id: req.user.id}))
      .on('result', function(result) {
        result.on('row', function(row) {
          console.log("In user.edit_form: result: " + util.inspect(row));
          messages.push('Editing user with ID: ' + req.user.id);
          res.render('user_edit', { title: 'User edit form',
                  messages: messages,
                  device: row
          })
        })
        .on('error', function(err) {
          console.log("In user.edit_form: error: " + util.inspect(err));  
          messages.push('Error editing a user. Please report this to the administrator with as much detail as humanly possible.');
        })
        .on('end', function(info) {
          console.log(info);
          if (info.numRows == 1) { // 1 device is going to be edited
            messages.push('Done.');
          }
        });
      })
      .on('end', function() {
        console.log("In user.edit_form: Queries ended:");  
      });
    });
  }
}

