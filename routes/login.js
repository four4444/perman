var express = require('express');
var router = express.Router();
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'views/login.html'));
});
module.exports = router;
