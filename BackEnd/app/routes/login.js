var express = require('express');
var bodyParser = require('body-parser');
var mysql      = require('mysql');

var pool  = mysql.createPool({
  connectionLimit : 100,
  acquireTimeout  : 30000,
  connectTimeout  : 30000,
  host            : 'localhost',
  user            : 'root',
  password        : 'codio',
  database        : 'DEVELOPMENT'
});

var router = express.Router();

router.post('/', function (req, res) {
    
    console.log(req.body);
    
    var reqObj = req.body;
    
    if (typeof reqObj.uname === 'undefined' 
      || typeof reqObj.pwd === 'undefined') {
        res.status('401').send('Login Fail' + reqObj.uname + ", " + reqObj.pwd);
        return;
    }
    
    pool.getConnection(function(err, connection) {
        
      if (err) {
          console.log('login connection err = ' + err);
          res.status('502').send('Bad Gateway1');
          return;
      }
      // Use the connection 
 
      var sql = 'SELECT * FROM USER WHERE USER_NAME = ? AND USER_PASSWORD = ? LIMIT 1';
      var arg = [reqObj.uname, reqObj.pwd];
        
      connection.query(sql, arg, function(err, rows) {

        if (err) {
            console.error('login-1 err = ' + err);
            res.status('502').send('Bad Gateway2');
            return;
        }
          
        req.session.user = {'ID': rows[0].UID, 'PHONE': rows[0].USER_PHONE, 'NICKNAME': rows[0].USER_NICKNAME};
          
        connection.release();
        res.status('200').send('Login Success');
      });
    }); 
});

module.exports = router;