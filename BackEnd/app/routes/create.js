var express = require('express');
var bodyParser = require('body-parser');

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
		res.redirect('/create');
		next();
	}

	next();
});


router.get('/', function (req, res) {
	res.status('200').send('create');
});

function isEmpty(val){
    return val === undefined || val === null;
}

router.post('/', function (req, res) {
	var productName = req.productName;
	var productDesc = req.productDesc;
	var remark = req.remark;
	var shopId = req.shopId;
	var price = req.price;
	var quantity = req.quantity;
	var maxUserCount = req.maxJoin;
	var second = req.second;

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
				VALUES (null, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? second), ?, ?, ?, ?)';
		var arg = [null, req.session.user.ID, price, quantity, null, null, productDesc, shopId, remark, 0];

		connection.query(sql, arg, function(err, rows) {

			if (err) {
				console.error('create err = ' + err);
				connection.release();
				res.status('502').send('Bad Gateway');
				return;
			}

			connection.release();
			res.status('200').send('Sigup Success');
		});
	});

	// res.status('200').send('create');
});

module.exports = router;