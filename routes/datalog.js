var dbclient = require('../lib/db');
var util = require('util');

/*
 * GET log overview.
 */

exports.overview = function(req, res) {

  log_overview = [];
  messages = [];

  if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access the log overview.');
    res.render('datalog', { title: 'Log overview',
		      messages: messages,
		      log_overview: {}
    })
  } 
}
