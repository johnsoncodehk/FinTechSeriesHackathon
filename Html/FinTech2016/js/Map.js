var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 22.28056, lng: 114.18667},
    zoom: 15
  });
  
  var infoWindow = new google.maps.InfoWindow({map: map});
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
		var pos = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
		};

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