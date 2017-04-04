var path = require('path');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('registration', {message: req.flash('signupMessage')});
});

module.exports = router;
