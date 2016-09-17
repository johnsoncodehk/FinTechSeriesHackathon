var express = require('express');
var bodyParser = require('body-parser');

var router = express.Router();

router.use(function (req, res, next) {

    if (!req.session.user) {
       res.redirect('/login');
       next();
   } 
   
   next();
});


router.get('/', function (req, res) {
    res.status('200').send('create');
});


module.exports = router;