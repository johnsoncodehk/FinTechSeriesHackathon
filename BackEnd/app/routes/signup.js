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
    
    var reqObj = req.body;
    
    if (!reqObj.uname || !reqObj.pwd || !reqObj.phoneNo || !reqObj.nickname) {
        res.status('403').send('Wrong Input');
    }
    
    pool.getConnection(function(err, connection) {
       
      if (err) {
          console.log('signup connection err = ' + err);
          res.status('502').send('Bad Gateway');
          return;
      }
        
      // Use the connection 
      var sql = 'SELECT * FROM USER WHERE USER_NAME = ? OR USER_PHONE = ? LIMIT 1';
      var arg = [reqObj.uname, reqObj.phoneNo];
      connection.query(sql, arg, function(err, rows) {         
        
        if (err) {
          console.log('signup-1 err = ' + err);
          res.status('502').send('Bad Gateway');
          return;
        }
          
        if (rows.length > 0) {
            connection.release();
            res.status('403').send('User or Phone number exist');
            return;
        }
        
        var sql = 'INSERT INTO `USER` (`UID`, `USER_NAME`, `USER_PASSWORD`, `USER_PHONE`, `USER_NICKNAME`) \
                VALUES (null, ?, ?, ?, ?)';
        var arg = [reqObj.uname, reqObj.pwd, reqObj.phoneNo, reqObj.nickname];
        
        connection.query(sql, arg, function(err, rows) {
            
            if (err) {
                console.error('signup-2 err = ' + err);
                connection.release();
                res.status('502').send('Bad Gateway');
                return;
            }
            
            connection.release();
            res.status('200').send('Sigup Success');
        });
      });
    }); 
});

module.exports = router;