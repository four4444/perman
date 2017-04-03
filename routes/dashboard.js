var path = require('path');
var express = require('express');
var router = express.Router();
router.get('/', function(req, res) {
    res.sendFile(path.resolve(__dirname, '../views/dashboard.html'), {user: req.user});
});
module.exports = router;
