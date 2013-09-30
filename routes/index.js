
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Open Source Sensor / Actuator System' }); // OSSAS OR OSIOT (OS IoT) 
};