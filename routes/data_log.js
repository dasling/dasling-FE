var dbclient = require('../lib/db');
var util = require('util');

/*
 * GET log overview.
 */

exports.overview = function(req, res) {

  res.render('data_log', { title: 'Log overview',
		      messages: messages,
    })
}
