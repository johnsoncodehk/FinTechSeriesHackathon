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

router.get('/', function (req, res) {
    
//     var reqObj = req.body; 
    
//     if (!reqObj.lat || !reqObj.lon) {
//         res.status('403').send('Wrong Input');
//     }
    
    pool.getConnection(function(err, connection) {
      
      if (err) {
          console.log('signup connection err = ' + err);
          res.status('502').send('Bad Gateway');
          return;
      }
      // Use the connection 
        
      var sql = 'SELECT * FROM ON_AIR_REQUEST WHERE END_DATE > NOW() AND STATUS IN (0, 1)';
        
      connection.query(sql, function(err, rows) {

        if (err) {
            console.error('request-2 err = ' + err);
            res.status('502').send('Bad Gateway');
            return;
        }
          
        var requestIDAry = [];
        var requestCountObj = {};
        
        rows.filter(function (row) {
           return row.STATUS == 0;  
        }).forEach(function (item) {
            requestIDAry.push(item.ID);
        });
          
        sql = 'SELECT * FROM JOIN_REQUEST WHERE REQUEST_ID IN (?)';
        arg = [requestIDAry];

         connection.query(sql, arg, function(err, rows2) {
            
             if (err) {
                 console.error('request-2 err = ' + err);
                 connection.release();
                 res.status('502').send('Bad Gateway');
                 return;
             }

             rows2.forEach( function(row) {
                 console.log(row.REQUEST_ID);
                 requestCountObj[row.REQUEST_ID]  = requestCountObj[row.REQUEST_ID] + 1 || 1;
             }); 
             
             connection.release();
             res.status('200').json(requestCountObj);
         });
      });
    }); // end of pool
});

module.exports = router;