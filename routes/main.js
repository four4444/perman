var path = require('path');
var express = require('express');
var router = express.Router();
router.get('/', function(req, res) {
    res.render('main', {message: 'Главная'});
});
module.exports = router;
