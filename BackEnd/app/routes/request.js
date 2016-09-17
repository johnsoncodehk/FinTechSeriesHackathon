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
    
    pool.getConnection(function(err, connection) {
      
      if (err) {
          console.log('request connection err = ' + err);
          res.status('502').send('Bad Gateway');
          return;
      }
      // Use the connection 
        
      var sql = 'SELECT *, UNIX_TIMESTAMP(END_DATE) AS `EDATE` FROM `ON_AIR_REQUEST` WHERE `END_DATE` > NOW() AND `STATUS` IN (0, 1)';
        
      connection.query(sql, function(err, rows) {

        if (err) {
            console.error('request-2 err = ' + err);
            res.status('502').send('Bad Gateway');
            return;
        }
          
        var requestIDAry = [];
        var requestCountObj = {};
        var requestShopAry= [];
        
        rows.forEach(function (row) {
            
            if (requestShopAry.indexOf(row.SHOP_ID) === -1) {
                 requestShopAry.push(row.SHOP_ID);
            }
            
            if (row.STATUS == 0) {
                row['count'] = 0;
            } else {
                requestIDAry.push(row.ID);
            }
        });
          
        sql = 'SELECT * FROM JOIN_REQUEST WHERE REQUEST_ID IN (?)';
        var arg = [requestIDAry];

         connection.query(sql, arg, function(err, rows2) {
            
             if (err) {
                 console.error('request-2 err = ' + err);
                 connection.release();
                 res.status('502').send('Bad Gateway');
                 return;
             }

             rows2.forEach( function(row) {
                 requestCountObj[row.REQUEST_ID] = requestCountObj[row.REQUEST_ID] + 1 || 1;
             }); 
             
             sql = 'SELECT * FROM SHOP WHERE SID IN (?)';
             arg = [requestShopAry];

             connection.query(sql, arg, function(err, rows3) {
                 
                 if (err) {
                     console.error('request-3 err = ' + err);
                     connection.release();
                     res.status('502').send('Bad Gateway');
                     return;
                 }
                 
                 var shopAry = {};
                 rows3.forEach( function(item) {
                     var shopObj = {};
                     shopObj['sid'] = item.SID;
                     shopObj['shop_name'] = item.SHOP_NAME;
                     shopObj['shop_location'] = item.SHOP_LOCATION;
                     shopObj['shop_phone'] = item.SHOP_PHONE;   
                     shopAry[item.SID] = shopObj;
                 });
                 
                 rows.forEach(function (row) {
   
                     row['id'] = row.ID;
                     row['uid'] = row.UID;
                     row['price'] = row.PRICE;
                     row['qty'] = row.QUANTITY;
                     row['remark'] = row.REMARK;
                     row['end_date'] = row.EDATE;
                     row['status'] = row.STATUS;
                     row['shop_id'] = row.SHOP_ID;
                     row['product_desc'] = row.PRODUCT_DESC;

                     delete row['PRODUCT_DESC'];
                     delete row['ID'];
                     delete row['UID'];
                     delete row['PRICE'];
                     delete row['QUANTITY'];
                     delete row['REMARK'];
                     delete row['EDATE'];
                     delete row['STATUS'];
                     delete row['SHOP_ID'];
                     
                     delete row['END_DATE'];
                     delete row['CREATE_DATE'];
                     row['count'] = requestCountObj[row.ID] || 0;
                     row['shop_data'] = shopAry[row.shop_id];
                 });
                 
                 connection.release();
                 res.status('200').json(rows);
             });
             
         });
      });
    }); // end of pool
});

router.post('/rid/:rid', function (req, res) {
    
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}

	var rid = req.params.rid;

	if (!rid) {
		res.status('403').send('Wrong Input');
        return;
	}

	pool.getConnection(function(err, connection) {
        
		if (err) {
			console.log('create/:rid connection err = ' + err);
			res.status('502').send('Bad Gateway');
			return;
		}

		var sql = 'SELECT * FROM ON_AIR_REQUEST WHERE ID IN (?) AND END_DATE > NOW()';
		var arg = [rid];

		connection.query(sql, arg, function(err, rows) {

			if (err) {
				console.error('join err = ' + err);
				connection.release();
				res.status('502').send('Bad Gateway');
				return;
			}

            if (rows.length == 0) {
                console.error('join err = no match row');
                connection.release();
                res.status('502').send('Bad Gateway');
                return;
            }

            var request = rows[0];
            var maxJoinCount = request.QUANTITY;

            sql = 'SELECT * FROM JOIN_REQUEST WHERE REQUEST_ID IN (?)';
            var arg = [rid];

            connection.query(sql, arg, function(err, rows) {
                
                if (err) {
                    console.error('join-2 err = ' + err);
                    connection.release();
                    res.status('502').send('Bad Gateway');
                    return;
                }

                if (rows.length >= maxJoinCount) {
                    console.error('join err = user full');
                    connection.release();
                    res.status('502').send('Is full');
                    return;
                }

                sql = 'INSERT INTO `JOIN_REQUEST` (`REQUEST_ID`, `UID`, `CREATE_DATE`) \
                    VALUES (?, ?, NOW())';
                arg = [rid, req.session.user.ID];

                connection.query(sql, arg, function(err, rows) {
                    
                    if (err) {
                        console.error('join-3 err = ' + err);
                        connection.release();
                        res.status('502').send('Bad Gateway');
                        return;
                    }

                    connection.release();
                    res.status('200').send('join Success');
                });
            });
		});
	});
});

router.get('/history/:uid', function (req, res) {
    
    pool.getConnection(function(err, connection) {
      
      if (err) {
          console.log('history connection err = ' + err);
          res.status('502').send('Bad Gateway');
          return;
      }
      // Use the connection 
        
      var sql = 'SELECT *, UNIX_TIMESTAMP(END_DATE) AS `EDATE` FROM `ON_AIR_REQUEST` WHERE `END_DATE` ';
        
      connection.query(sql, function(err, rows) {

        if (err) {
            console.error('request-2 err = ' + err);
            res.status('502').send('Bad Gateway');
            return;
        }
          
        var requestIDAry = [];
        var requestCountObj = {};
        var requestShopAry= [];
        
        rows.forEach(function (row) {
            
            if (requestShopAry.indexOf(row.SHOP_ID) === -1) {
                 requestShopAry.push(row.SHOP_ID);
            }
            
            if (row.STATUS == 0) {
                row['count'] = 0;
            } else {
                requestIDAry.push(row.ID);
            }
        });
          
        sql = 'SELECT * FROM JOIN_REQUEST WHERE REQUEST_ID IN (?)';
        var arg = [requestIDAry];

         connection.query(sql, arg, function(err, rows2) {
            
             if (err) {
                 console.error('request-2 err = ' + err);
                 connection.release();
                 res.status('502').send('Bad Gateway');
                 return;
             }

             rows2.forEach( function(row) {
                 requestCountObj[row.REQUEST_ID] = requestCountObj[row.REQUEST_ID] + 1 || 1;
             }); 
             
             sql = 'SELECT * FROM SHOP WHERE SID IN (?)';
             arg = [requestShopAry];

             connection.query(sql, arg, function(err, rows3) {
                 
                 if (err) {
                     console.error('request-3 err = ' + err);
                     connection.release();
                     res.status('502').send('Bad Gateway');
                     return;
                 }
                 
                 var shopAry = {};
                 rows3.forEach( function(item) {
                     var shopObj = {};
                     shopObj['sid'] = item.SID;
                     shopObj['shop_name'] = item.SHOP_NAME;
                     shopObj['shop_location'] = item.SHOP_LOCATION;
                     shopObj['shop_phone'] = item.SHOP_PHONE;   
                     shopAry[item.SID] = shopObj;
                 });
                 
                 rows.forEach(function (row) {
   
                     row['id'] = row.ID;
                     row['uid'] = row.UID;
                     row['price'] = row.PRICE;
                     row['qty'] = row.QUANTITY;
                     row['remark'] = row.REMARK;
                     row['end_date'] = row.EDATE;
                     row['status'] = row.STATUS;
                     row['shop_id'] = row.SHOP_ID;
                     row['product_desc'] = row.PRODUCT_DESC;

                     delete row['PRODUCT_DESC'];
                     delete row['ID'];
                     delete row['UID'];
                     delete row['PRICE'];
                     delete row['QUANTITY'];
                     delete row['REMARK'];
                     delete row['EDATE'];
                     delete row['STATUS'];
                     delete row['SHOP_ID'];
                     
                     delete row['END_DATE'];
                     delete row['CREATE_DATE'];
                     row['count'] = requestCountObj[row.ID] || 0;
                     row['shop_data'] = shopAry[row.shop_id];
                 });
                 
                 connection.release();
                 res.status('200').json(rows);
             });
             
         });
      });
    }); // end of pool
});


module.exports = router;