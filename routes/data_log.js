var dbclient = require('../lib/db');
var util = require('util');

/*
 * GET log overview.
 */

exports.overview = function(req, res) {

  res.render('sensors', { title: 'Log overview',
		      messages: messages,
    })
}
