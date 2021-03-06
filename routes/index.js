const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.sendFile('index.html', { root: 'public'});
});

router.get('/config', function(req, res, next) {
  res.sendFile('config.html');
});

module.exports = router;
