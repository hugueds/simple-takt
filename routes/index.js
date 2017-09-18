var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.sendFile('index.html');
});

router.get('/config', function(req, res, next) {
  res.sendFile('config.html');
});

module.exports = router;
