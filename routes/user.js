
/*
 * GET users listing.
 */

var users = [];
users.push({name: 'Paul'});
users.push({name: 'Dennis'});

exports.list = function(req, res){
  
  messages = [];
  
//   res.send("respond with a resource");
//   console.log(users);
  res.render('users', { title: 'User list',
			users: users
  });
};