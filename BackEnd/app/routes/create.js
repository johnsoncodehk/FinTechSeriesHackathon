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

router.use(function (req, res, next) {

    if (!req.session.user) {
       res.redirect('/login');
       next();
   } 
   
   next();
});

function isEmpty(val){
    return typeof val === 'undefined' || val === null;
}

router.post('/', function (req, res) {
    
	var productName = req.body.productName;
	var productDesc = req.body.productDesc;
	var remark = req.body.remark;
	var shopId = req.body.shopId;
	var price = req.body.price;
	var quantity = req.body.quantity;
	var maxUserCount = req.body.maxJoin;
	var second = req.body.second;
    
	if (isEmpty(productName)
		|| isEmpty(productDesc)
		|| isEmpty(remark)
		|| isEmpty(shopId)
		|| isEmpty(price)
		|| isEmpty(quantity)
		|| isEmpty(maxUserCount)
		|| isEmpty(second)
	) {
		res.status('403').send('Wrong Input');
	}

	pool.getConnection(function(err, connection) {
        
		if (err) {
			console.log('create connection err = ' + err);
			res.status('502').send('Bad Gateway');
			return;
		}
		// Use the connection

		var sql = 'INSERT INTO `ON_AIR_REQUEST` (`ID`, `UID`, `PRICE`, `QUANTITY`, `CREATE_DATE`, `END_DATE`, `PRODUCT_DESC`, `SHOP_ID`, `REMARK`, `STATUS`) \
				VALUES (null, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? second), ?, ?, ?, 0)';
		var arg = [req.session.user.ID, price, quantity, second, productDesc, shopId, remark];

		connection.query(sql, arg, function(err, rows) {

			if (err) {
				console.error('create-1 err = ' + err);
				connection.release();
				res.status('502').send('Bad Gateway');
				return;
			}

			connection.release();
			res.status('200').send('Create Request Success');
		});
	});
});


module.exports = router;