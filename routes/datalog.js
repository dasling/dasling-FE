var dbclient = require('../lib/db');
var util = require('util');

/*
 * GET log overview.
 */

exports.overview = function(req, res) {

  log_overview = [];
  messages = [];
  devices = [];
  channels = [];
  variables = [];
  clients = [];
  devices.push('Choose device');
  channels.push('Choose channel');
  variables.push('Choose variable');
  clients.push('Choose client');

 if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access the log overview.');
    res.render('datalog', { title: 'Log overview',
		      messages: messages,
		      log_overview: {},
                      devices: {},
                      channels: {},
                      variables: {},
                      clients: {}
    })
  } 
 else { // user logged in
    dbclient.exec(function(conn) {
      console.log("In datalog.overview: Collecting log");
      var preproc_sql_statement = 'SELECT l.log_id, l.message, l.human_message,\
                                       l.device, l.channel, l.variable, l.client\
                                      FROM log l';
      var sql_preproc_data = {user_id: req.user.id};
      
      var preproc_sql = conn.prepare(preproc_sql_statement);
      conn.query(preproc_sql(sql_preproc_data))
      .on('result', function(res) {
	res.on('row', function(row) {
	  console.log("In datalog.overview: Log found: " + util.inspect(row));
	  log_overview.push(row);        
	})
	.on('error', function(err) {
	  console.log("In datalog.overview: Data log access error: " + util.inspect(err));  
	  messages.push('Error accessing log overview. Please report this to the administrator with as much detail as humanly possible.');
	})
	.on('end', function(info) {
	  if (info.numRows == 0) { // No logs found 
	    messages.push('You have no log associated to this database');
	  }
	});
      })
      
      preproc_sql_statement = 'SELECT DISTINCT l.device\
                                      FROM log l';
      sql_preproc_data = {user_id: req.user.id};
      
      preproc_sql = conn.prepare(preproc_sql_statement);
      conn.query(preproc_sql(sql_preproc_data))
      .on('result', function(res) {
	res.on('row', function(row) {
	  console.log("In datalog.overview: Device found: " + util.inspect(row));
          devices.push(row.device);       
	})
	.on('error', function(err) {
	  console.log("In datalog.overview: Data log access error: " + util.inspect(err));  
	  messages.push('Error accessing log devices. Please report this to the administrator with as much detail as humanly possible.');
	})
	.on('end', function(info) {
	  if (info.numRows == 0) { // No logs found 
	    messages.push('You have no devices associated to this log');
	  }
	});
      })

      preproc_sql_statement = 'SELECT DISTINCT l.channel\
                                      FROM log l';
      preproc_sql = conn.prepare(preproc_sql_statement);
      conn.query(preproc_sql(sql_preproc_data))
      .on('result', function(res) {
	res.on('row', function(row) {
	  console.log("In datalog.overview: Channel found: " + util.inspect(row));
          channels.push(row.channel);        
	})
	.on('error', function(err) {
	  console.log("In datalog.overview: Data log access error: " + util.inspect(err));  
	  messages.push('Error accessing log channels. Please report this to the administrator with as much detail as humanly possible.');
	})
	.on('end', function(info) {
	  if (info.numRows == 0) { // No logs found 
	    messages.push('You have no channels associated to this log');
	  }
	});
      })

      preproc_sql_statement = 'SELECT DISTINCT l.variable\
                                      FROM log l';
      preproc_sql = conn.prepare(preproc_sql_statement);
      conn.query(preproc_sql(sql_preproc_data))
      .on('result', function(res) {
	res.on('row', function(row) {
	  console.log("In datalog.overview: Variable found: " + util.inspect(row));
          variables.push(row.variable);        
	})
	.on('error', function(err) {
	  console.log("In datalog.overview: Data log access error: " + util.inspect(err));  
	  messages.push('Error accessing log variables. Please report this to the administrator with as much detail as humanly possible.');
	})
	.on('end', function(info) {
	  if (info.numRows == 0) { // No logs found 
	    messages.push('You have no variables associated to this log');
	  }
	});
      })

      preproc_sql_statement = 'SELECT DISTINCT l.client\
                                      FROM log l';
      preproc_sql = conn.prepare(preproc_sql_statement);
      conn.query(preproc_sql(sql_preproc_data))
      .on('result', function(res) {
	res.on('row', function(row) {
	  console.log("In datalog.overview: Client found: " + util.inspect(row));
          clients.push(row.client);        
	})
	.on('error', function(err) {
	  console.log("In datalog.overview: Data log access error: " + util.inspect(err));  
	  messages.push('Error accessing log clients. Please report this to the administrator with as much detail as humanly possible.');
	})
	.on('end', function(info) {
	  if (info.numRows == 0) { // No logs found 
	    messages.push('You have no clients associated to this log');
	  }
	});
      })
      .on('end', function() {
	console.log("In datalog.overview: Queries ended, datalog:");  
        console.log(log_overview);
	res.render('datalog', {title: 'Log overview',
                              log_overview:log_overview,
			      messages: messages,
                              devices: devices,
                              channels: channels,
                              variables: variables,
                              clients: clients 
	});
      });
    });
  }
}


exports.filter = function(req, res) {

  log_overview = [];
  messages = [];
  max_limit = [];

 if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access the log overview.');
    res.render('datalog', { title: 'Log overview',
		      messages: messages,
		      log_overview: {},
    })
  } 
 else { // user logged in
    dbclient.exec(function(conn) {
      console.log(req.body);          

      var SQL = "(SELECT l.log_id, l.message, l.human_message, \
                           l.device, l.channel, l.variable, l.client \
                    FROM log l";
      var alreadyOne = 0;
      var index;
      var SQL_options = ["l.message","l.human_message","l.device","l.channel","l.variable","l.client"];
      var options = [req.body.message,req.body.human_message,req.body.device,req.body.channel,req.body.variable,req.body.client];
      var values = ["","","Choose device", "Choose channel", "Choose variable", "Choose client"];
      for (index = 0; index < options.length; ++index) {
        if(options[index]!=values[index]){
          if(!alreadyOne){
           if(index>1){
            SQL += " WHERE " + SQL_options[index] + " = '" + options[index] + "'";
           }
           else{
            SQL += " WHERE " + SQL_options[index] + " LIKE '" + options[index] + "'";
           } 
            alreadyOne = 1;
          }
          else{
           if(index>1){
            SQL += " AND " + SQL_options[index] + " = '" + options[index] + "'";
           }
           else{
            SQL += " AND " + SQL_options[index] + " LIKE '" + options[index] + "'";
           }
          }
        }
      }
      SQL += " ORDER BY log_id DESC";
      
      if(req.body.limit != 'ALL'){
         SQL += " LIMIT " + req.body.limit;
      }
      SQL += ") ORDER BY log_id ASC";
      var preproc_sql = conn.prepare(SQL);
      console.log(req.user.id);
      conn.query(preproc_sql({user_id: req.user.id
                             }))
      .on('result', function(res) {
	res.on('row', function(row) {
	  console.log("In datalog.filter: Log found: " + util.inspect(row));
	  log_overview.push(row);
	})
	.on('error', function(err) {
	  console.log("In datalog.filter: Data log access error: " + util.inspect(err));  
	  messages.push('Error accessing log. Please report this to the administrator with as much detail as humanly possible.');
	})
	.on('end', function(info) {
	  if (info.numRows == 0) { // No logs found 
	    messages.push('There are no results for your selection.');
	  }
	});
      })
      .on('end', function() {
	console.log("In datalog.filter: Queries ended, datalog:");  
        console.log(log_overview);
	res.render('datalog', {title: 'Filtered log overview',
			      messages: messages,
			      log_overview: log_overview
        }); 
      });
    });
  }
}
