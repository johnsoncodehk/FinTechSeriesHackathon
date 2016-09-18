var map;
var groupList;
var shopData = {};

function initMap() {
	var item ;
    map = new google.maps.Map(document.getElementById('map'),{
        center: {
            lat: 22.28056,
            lng: 114.18667
        },
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

	map.addListener('click', function() {
		var Element = document.getElementById("GroupMenu");
		if(Element != null)
		document.getElementsByTagName('body')[0].removeChild(Element);

	});
	
	getneargroup();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var marker = new google.maps.Marker({
                position: pos,
                map: map,
                title: 'Your Position'
            });
			
            marker.addListener('click', function() {
				if(!document.getElementById("GroupMenu")){
                //document.getElementById('LoginMenu').style.visibility = 'hidden';
				//document.getElementById('loading').style.visibility = 'visible';
				
				var iDiv = document.createElement('div');
				iDiv.id = 'GroupMenu';
				iDiv.className = 'ui left fixed vertical inverted sticky menu';
				iDiv.setAttribute("style", "overflow-y:scroll;left: 0px; top: 0px; width: 400px ; height: 100%; margin-top: 0px;");
				
				var GroupList;
				for(var index = 0; index < 100; index++){
					// item = document.createElement('A');
					// item.className = "item";
					// item.id = index;
					// item.innerHTML = index;
					// item.onclick = function(){OnGroupClick(this);};
					// iDiv.appendChild(item);
					
					card = document.createElement('div');
					card.className = "ui card post";
					card.id = index;
					
					cardContent = document.createElement('div');
					cardContent.className = "content";
					cardHeader = document.createElement('div');
					cardHeader.className = "header";
					cardHeader.innerHTML = index;
					card.appendChild(cardContent);
					cardContent.appendChild(cardHeader);

					
					iDiv.appendChild(card);
				}
				document.getElementsByTagName('body')[0].appendChild(iDiv);
			}
            });
            map.setCenter(pos);
        });
    }
}

function getneargroup(){
	sendRequest("GET","/",null, function(response) {
		groupList = response;
		console.log(groupList);
		initMarker();
	})
};

function initMarker() {
	//var marker;
	//var pos;
	var jsData;
	var addedShopID = [];
	
	groupList.forEach(function (item) {
		if(!shopData["_" + item.shop_id]) shopData["_" + item.shop_id] = [];
		shopData["_" + item.shop_id].push(item);
	});
	
	for(var index = 0; index < groupList.length;index++){
		if(addedShopID.indexOf(groupList[index].shop_id < 0)) {
			addedShopID.push(groupList[index].shop_id);
			var jsData = JSON.parse(groupList[index].shop_data.shop_location);
			var pos = {
				lat: jsData.lat,
				lng: jsData.lng
			};
		
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(jsData.lat,jsData.lng),
				map: map,
				title: groupList[index].shop_data.shop_name
			});
			
			marker.shopID = groupList[index].shop_id;
			
			marker.addListener('click', function(){onClickShowItemList(this)});
		}		
	}
};

function onClickShowItemList(evt) {
		if(document.getElementById("GroupMenu")){
			var Element = document.getElementById("GroupMenu");
			if(Element != null)
			document.getElementsByTagName('body')[0].removeChild(Element);
		}
	
		var iDiv = document.createElement('div');
		iDiv.id = 'GroupMenu';
		iDiv.className = 'ui left fixed vertical inverted sticky menu';
		iDiv.setAttribute("style", "overflow-y:scroll;left: 0px; top: 0px; width: 400px ; height: 100%; margin-top: 0px;");
		for(var index = 0; index < shopData["_" + evt.shopID].length; index++){
			var item = shopData["_" + evt.shopID][index];
			card = document.createElement('div');
			card.className = "ui card post";
			card.name = "ui_card_post";
			card.id = index + "_" + evt.shopID;
			
			cardContent = document.createElement('div');
			cardContent.className = "content";
			cardHeader = document.createElement('div');
			cardHeader.className = "header";
			cardHeader.innerHTML = "$" + item.price + "<p>" + item.product_desc;
			card.appendChild(cardContent);
			cardContent.appendChild(cardHeader);
			cardDesc = document.createElement('div');
			cardDesc.className = "description";
			cardDesc.innerHTML = item.count + " / " + item.qty;
			cardContent.appendChild(cardDesc);
			
			iDiv.appendChild(card);
		}
		document.getElementsByTagName('body')[0].appendChild(iDiv);
	
};	

function OnGroupClick(evt){
	sendRequest("get","/",null, function(response) {
		console.log(response);
	})
};


function onClickLogin(evt) {
	var obj = {
		uname:document.getElementById("uname").value,
		pwd:document.getElementById("password").value
	}
	sendRequest("POST", "/login", obj, function(response) {
		console.log(response);
		document.getElementById("disNickname").innerHTML = response.nickname;
		document.getElementById('LoginMenu').style.visibility = 'hidden';
		document.getElementById('PostMenu').style.visibility = 'visible';
	});
};

function onClickSignIn(evt) {
	var obj = {
		uname:document.getElementById("uname1").value,
		pwd:document.getElementById("password1").value,
		nickname:document.getElementById("nickname").value,
		phoneNo:document.getElementById("phone").value
	}
	sendRequest("POST", "/signup", obj, function(response) {
		document.getElementById('LoginMenu').style.visibility = 'hidden';
		document.getElementById('PostMenu').style.visibility = 'visible';
	});
};

function onClickPost(){
	var obj = {
		productName:document.getElementById("txtProductName").value,
		productDesc:document.getElementById("txtProductDesc").value,
		remark:document.getElementById("textRemark").value,
		shopId:document.getElementById("txtShop").value,
		price:document.getElementById("txtprice").value,
		quantity:document.getElementById("txtQuantity").value,
		maxJoin:document.getElementById("txtQuantity").value,
		second:document.getElementById("textLimitTime").value
	}
	sendRequest("POST", "/create", obj, function(response) {
		console.log(response);
	});
}

function onClickLoginTest(evt) {
	document.getElementById('LoginMenu').style.visibility = 'hidden';
	document.getElementById('PostMenu').style.visibility = 'visible';
};

function sendRequest(method, fnPath, obj, cb) {
	var ip = "folio-uranium.codio.io";
	var port = 8080;
	var xhttp = new XMLHttpRequest(); 
	xhttp.onload = function(e) {
		cb(JSON.parse(xhttp.responseText));
	};
	xhttp.onerror = function (e) {
	}
	xhttp.open(method, "http://" + ip + ":" + port + fnPath, true);
	xhttp.setRequestHeader("Content-type", "application/json");
	if(obj) {
		console.log(xhttp);
		xhttp.send(JSON.stringify(obj));
		console.log(JSON.stringify(obj));
	}else {
		xhttp.send(null);
	}
};