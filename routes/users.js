var express = require('express');
var router = express.Router();

// Pratice of learning express app
router.get('/cool/', function(req, res, next){
  res.send('Fejavu you are so cool!');
});

// Test page
router.get('/Test',function(req, res, next) {
  res.send('This is a router user test page.');
});

module.exports = router;
