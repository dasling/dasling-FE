var dbclient = require('../lib/db');
var util = require('util');
var async = require('async');

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
 debug_types = [];
 devices.push('Choose device');
 channels.push('Choose channel');
 variables.push('Choose variable');
 clients.push('Choose client');
 debug_types.push('Choose debug type');

 if (req.loggedIn !== true) { // user not logged in
    messages.push('Please log in to access the log overview.');
    res.render('datalog', { title: 'Log overview',
                            messages: messages,
		   	    log_overview: {},
                      	    devices: {},
                      	    channels: {},
                      	    variables: {},
                      	    clients: {},
                      	    debug_types: {}
             })
  } 
 else { // user logged in
    dbclient.exec(function(conn) {
     async.parallel([
      function(callback){
       console.log("In datalog.overview: Collecting log");
       var preproc_sql_statement = '(SELECT l.log_id, l.message, l.human_message,\
                                       l.device, l.channel, l.variable, l.client, l.debug_type\
                                      FROM log l ORDER BY l.log_id DESC LIMIT 100) ORDER BY log_id ASC';
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
	   else{
 	     callback();
           }
	 });
       })
       .on('end', function() {
         console.log("In datalog.overview: Get log query ended");
       });
      },

      function(callback){
       preproc_sql_statement = 'select device_manufacturer_identification from devices d join map_users_devices mud on d.device_id = mud.device_id where mud.user_id = :user_id';
       sql_preproc_data = {user_id: req.user.id};
      
       preproc_sql = conn.prepare(preproc_sql_statement);
       conn.query(preproc_sql(sql_preproc_data))
       .on('result', function(res) {
	 res.on('row', function(row) {
	   console.log("In datalog.overview: Device found: " + util.inspect(row));
           devices.push(row.device_manufacturer_identification);       
	 })
	 .on('error', function(err) {
	   console.log("In datalog.overview: Data log access error: " + util.inspect(err));  
	   messages.push('Error accessing log devices. Please report this to the administrator with as much detail as humanly possible.');
	 })
	 .on('end', function(info) {
	   if (info.numRows == 0) { // No logs found 
	     messages.push('You have no devices associated to this log');
	   }
           else{
             callback();
           }
	 });
       })
       .on('end', function() {
         console.log("In datalog.overview: Get devices query ended");
       });
      },

      function(callback){
       preproc_sql_statement = 'select channel_user_given_id from channels where user_id = :user_id';
       preproc_sql = conn.prepare(preproc_sql_statement);
       sql_preproc_data = {user_id: req.user.id};
       conn.query(preproc_sql(sql_preproc_data))
       .on('result', function(res) {
 	 res.on('row', function(row) {
	   console.log("In datalog.overview: Channel found: " + util.inspect(row));
           channels.push(row.channel_user_given_id);        
	 })
	 .on('error', function(err) {
	   console.log("In datalog.overview: Data log access error: " + util.inspect(err));  
	   messages.push('Error accessing log channels. Please report this to the administrator with as much detail as humanly possible.');
	 })
	 .on('end', function(info) {
	   if (info.numRows == 0) { // No logs found 
	     messages.push('You have no channels associated to this log');
	   }
           else{
             callback();
           }
	 });
       })
       .on('end', function() {
         console.log("In datalog.overview: Get channels query ended");         
       });
      },

      function(callback){
       preproc_sql_statement = 'select name from variable where user_id = :user_id';
       preproc_sql = conn.prepare(preproc_sql_statement);
       sql_preproc_data = {user_id: req.user.id};
       conn.query(preproc_sql(sql_preproc_data))
       .on('result', function(res) {
 	 res.on('row', function(row) {
	   console.log("In datalog.overview: Variable found: " + util.inspect(row));
           variables.push(row.name);        
	 })
	 .on('error', function(err) {
	   console.log("In datalog.overview: Data log access error: " + util.inspect(err));  
	   messages.push('Error accessing log variables. Please report this to the administrator with as much detail as humanly possible.');
	 })
	 .on('end', function(info) {
	   if (info.numRows == 0) { // No logs found 
	     messages.push('You have no variables associated to this log');
	   }
           else{
             callback();
           }
	 });
       })
       .on('end', function() {
         console.log("In datalog.overview: Get variables query ended");
       });
      },

      function(callback){
       preproc_sql_statement = 'select client_id from device_auth da join map_users_devices map on da.device_id = map.device_id where map.user_id = :user_id';
       preproc_sql = conn.prepare(preproc_sql_statement);
       sql_preproc_data = {user_id: req.user.id};
       conn.query(preproc_sql(sql_preproc_data))
       .on('result', function(res) {
	 res.on('row', function(row) {
	   console.log("In datalog.overview: Client found: " + util.inspect(row));
           clients.push(row.client_id);        
	 })
	 .on('error', function(err) {
	   console.log("In datalog.overview: Data log access error: " + util.inspect(err));  
	   messages.push('Error accessing log clients. Please report this to the administrator with as much detail as humanly possible.');
	 })
	 .on('end', function(info) {
	   if (info.numRows == 0) { // No logs found 
	     messages.push('You have no clients associated to this log');
	   }
           else{
             callback();
           }
	 });
       })
       .on('end', function() {
         console.log("In datalog.overview: Get clients query ended");
       });
//      preproc_sql_statement = ''; //TO DO query to select debug type
//      preproc_sql = conn.prepare(preproc_sql_statement);
//      sql_preproc_data = {user_id: req.user.id};
//      conn.query(preproc_sql(sql_preproc_data))
//      .on('result', function(res) {
//	res.on('row', function(row) {
//	  console.log("In datalog.overview: Debug type found: " + util.inspect(row));
//          debug_types.push(row.debug_type);        
//	})
//	.on('error', function(err) {
//	  console.log("In datalog.overview: Data log access error: " + util.inspect(err));  
//	  messages.push('Error accessing log clients. Please report this to the administrator with as much detail as humanly possible.');
//	})
//	.on('end', function(info) {
//	  if (info.numRows == 0) { // No logs found 
//	    messages.push('There are no debug types associated to this log');
//	  }
//	});
//      })
      }],
       function(err, results){
        res.render('datalog', {title: 'Log overview',
                              log_overview: log_overview,
			      messages: messages,
                              devices: devices,
                              channels: channels,
                              variables: variables,
                              clients: clients,
                              debug_types: debug_types
	 });
      });
    });
  }
}


exports.filter = function(req, res) {

  log_overview = [];
  messages = [];

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
                           l.device, l.channel, l.variable, l.client, l.debug_type \
                    FROM log l";
      var alreadyOne = 0;
      var index;
      var SQL_options = ["l.message","l.human_message","l.device","l.channel","l.variable","l.client","l.debug_type"];
      var chan;
      if(req.body.channel.length>45)
	chan = req.body.channel.substring(0,45);  
      else
        chan = req.body.channel;
      var options = [req.body.message,req.body.human_message,req.body.device,chan,req.body.variable,req.body.client,req.body.debug_type];
      var values = ["","","Choose device", "Choose channel", "Choose variable", "Choose client", "Choose debug type"];
      for (index = 0; index < options.length; ++index) {
        if(options[index]!=values[index] && options[index]!=""){
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
        else if(options[index] == '' && index>1){
         if(!alreadyOne){
          SQL += " WHERE " + SQL_options[index] + " is NULL";
          alreadyOne = 1;
         }
         else{
          SQL += " AND " + SQL_options[index] + " is NULL";
         }
        }
      }
      SQL += " ORDER BY l.log_id DESC";
      
      if(req.body.limit != 'ALL'){
         SQL += " LIMIT " + req.body.limit;
      }
      SQL += ") ORDER BY log_id ASC";
      console.log("SQL:  " +SQL);
      var preproc_sql = conn.prepare(SQL);
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
