/**
 * Module dependencies.
 */

var OAUTH_DEBUG = true;

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , devices = require('./routes/devices')
  , device_auths = require('./routes/device_auths')
  , sensors = require('./routes/sensors')
  , variables = require('./routes/variables')
  , units = require('./routes/units')
  , data_log = require('./routes/datalog')
  , http = require('http')
  , util = require('util')
  , path = require('path')
  , config = require('./lib/config');

var everyauth = require('everyauth'),
    Promise = everyauth.Promise;
everyauth.debug = OAUTH_DEBUG;
  
// own modules
var dbclient = require('./lib/db');
var users = require('./lib/users');

////////////////////////////////////////////////////////
// added for Twitter authentication (based on everyauth)
var twitter_config = config.getConfiguration().twitter;
everyauth.twitter
  .consumerKey(twitter_config.consumerKey)
  .consumerSecret(twitter_config.consumerSecret)
  .findOrCreateUser(function(session, accessToken, accessTokenSecret, twitterUserData) {
      //console.log(util.inspect(twitterUserData));
      var promise = this.Promise();
      users.findOrCreateUserByTwitterData(twitterUserData, promise);
      return promise;
  })
  .redirectPath('/');
  
everyauth.everymodule.findUserById(function(userId, cb) {
//   console.log('findByUserId called');
  users.findOne({ id: userId }, function(err, user) {
    return cb(err, user);
  });
});  
////////////////////////////////////////////////////////

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('mydfvdfveaqsdvq'));
app.use(express.session());
app.use(everyauth.middleware()); // added for everyauth
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*************** ROUTES MAIN *****************/
app.get('/', routes.index);

/*************** ROUTES FOR USERS *****************/
//app.get('/users', user.list);
app.get('/account', user.edit_form);

/*************** ROUTES FOR DEVICES *****************/
app.get('/devices/add', devices.add);
app.get('/devices/dis/:device_id', devices.dis);
app.get('/devices/act/:device_id', devices.act);
app.get('/devices/edit/:device_id', devices.edit_form);
app.get('/devices', devices.list);

app.post('/devices/edit/', devices.edit);

/*************** ROUTES FOR DEVICE AUTHORIZATIONS *****************/
app.get('/device_auths/add', device_auths.add);
app.get('/device_auths/dis/:device_auth_id', device_auths.dis);
app.get('/device_auths/act/:device_auth_id', device_auths.act);
app.get('/device_auths/edit/:device_auth_id', device_auths.edit_form);
app.get('/device_auths', device_auths.list);

app.post('/device_auths/edit/', device_auths.edit);

/*************** ROUTES FOR SENSORS *****************/
app.get('/sensors', sensors.list);
app.get('/sensors/list/:device_id', sensors.list);
app.get('/sensors/dis/:channel_id', sensors.dis);
app.get('/sensors/act/:channel_id', sensors.act);
app.get('/sensors/add/:device_id', sensors.add);
app.get('/sensors/edit/:channel_id', sensors.edit_form);

app.post('/sensors/edit/', sensors.edit);

/*************** ROUTES FOR VARIABLES *****************/
app.get('/variables', variables.list);
app.get('/variables/add', variables.add);
app.get('/variables/dis/:variable_id', variables.dis);
app.get('/variables/act/:variable_id', variables.act);
app.get('/variables/edit/:variable_id', variables.edit_form);

app.post('/variables/edit/', variables.edit);

/*************** ROUTES FOR UNITS *****************/
app.get('/units', units.list);
app.get('/units/add', units.add);
app.get('/units/edit/:unit_id', units.edit_form);
app.get('/units/dis/:unit_id', units.dis);
app.get('/units/act/:unit_id', units.act);

app.post('/units/edit/', units.edit);

/*************** ROUTES FOR LOG ***************/
app.get('/datalog', datalog.overview);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
