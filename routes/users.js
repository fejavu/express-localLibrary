var express = require('express');
var router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// Pratice of learning express app
router.get('/cool/', function(req, res, next){
  res.send('Fejavu you are so cool!');
});

module.exports = router;
