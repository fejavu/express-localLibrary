var express = require('express');
var router = express.Router();

// Pratice of learning express app
router.get('/cool', function(req, res, next){
  res.send('Fejavu you are so cool!');
});

module.exports = router;
