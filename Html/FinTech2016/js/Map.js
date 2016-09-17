var map;
function initMap() {
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
    var marker = new google.maps.Marker({
        position: {
            lat: 22.258358,
            lng: 114.131389
        },
        map: map,
        title: 'Hello World!'
    });
    var infoWindow = new google.maps.InfoWindow({
        map: map
    });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var marker = new google.maps.Marker({
                position: pos,
                map: map,
                title: 'Hello World!'
            });
            marker.addListener('click', function() {
                document.getElementById('MainMenu').style.visibility = 'none';
				//document.getElementById('loading').style.visibility = 'visible';
				
				var iDiv = document.createElement('div');
				iDiv.id = 'GroupMenu';
				iDiv.className = 'ui left fixed inverted vertical menu';
				
				var GroupList;
				for(var index = 0; index < 20; index++){
					var item = document.createElement('A');
					item.className = "item";
					item.innerHTML = index;
					iDiv.appendChild(item);
				}
				document.getElementsByTagName('body')[0].appendChild(iDiv);
            });
            infoWindow.setPosition(pos);
            infoWindow.setContent('You Location');
            map.setCenter(pos);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}
