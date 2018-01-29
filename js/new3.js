var map, infoWindow;
var markers = [];
var type = [];
var results;
// Create the Google Maps, centered in the neighbourhood, and call the KO ViewModel
function initialize() {
    geocoder = new google.maps.Geocoder();

    // set initial position (New York)
    var myLatlng = new google.maps.LatLng(29.567496, -95.713618);

    var myOptions = { // default map options
        zoom: 14,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var autocompleteoptions = {
        types: ['(places)']
    };
    map = new google.maps.Map(document.getElementById('map'), myOptions);

    drawMyMarker();

    ko.applyBindings(new viewModel());
}

function drawMyMarker() {
    myLatlng = new google.maps.LatLng(29.567496, -95.713618);
    myMarker = new google.maps.Marker({
        map: map,
        title: 'My location',
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        position: myLatlng
    });
}


var viewModel = function () {
    var self = this;
    self.allPlaces = ko.observableArray([]);

    this.search = function () {
        var searchTimeout;
        if (searchTimeout) {
            window.clearTimeout(searchTimeout);
        }
        searchTimeout = window.setTimeout(reallyDoSearch, 500);
    }

    function reallyDoSearch() {
        var type = document.getElementById('typeOf')
            .value;
        var keyword = document.getElementById('keyword')
            .value;

        var search = {};

        if (keyword) {
            search.keyword = keyword;
        }

        if (type != 'establishment') {
            search.types = [type];
        }

        placesservice = new google.maps.places.PlacesService(map);
        infowindow = new google.maps.InfoWindow();
        var myLatlng = new google.maps.LatLng(29.567496, -95.713618);
        search.rankBy = google.maps.places.RankBy.DISTANCE;
        search.location = myLatlng;



        placesservice.search(search, function (results, status, pagination) {

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                clearMarkers();
                self.allPlaces.removeAll();
                var bounds = new google.maps.LatLngBounds();
                var getNextPage = null;
                var moreButton = document.getElementById('more');
                moreButton.onclick = function () {
                    moreButton.disabled = true;
                    if (getNextPage) getNextPage();
                };

                moreButton.disabled = !pagination.hasNextPage;
                getNextPage = pagination.hasNextPage && function () {
                    pagination.nextPage();
                };
                for (var i = 0; i < results.length; i++) {
                    createMarker(results[i]);
                    bounds.extend(results[i].geometry.location);


                    var R = 3961;
                    let destinationLat = results[i].geometry.location.lat();
                    let destinationLng = results[i].geometry.location.lng();
                    var φ1 = toRadians(29.567496);
                    var φ2 = toRadians(destinationLat);
                    var deltaLat = destinationLat - 29.567496;
                    var deltaLng = destinationLng - -95.713618;
                    var Δφ = toRadians(deltaLat);
                    var Δλ = toRadians(deltaLng);
                    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                        Math.cos(φ1) * Math.cos(φ2) *
                        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var d = R * c;
                    distance = +(Math.round(d + "e+2") + "e-2");
                    results[i].distance = distance + "miles";

                }
                map.fitBounds(bounds);
                results.forEach(getAllPlaces);
            }
        });
    }

    go = function(formElement){
        var searchType = document.getElementById('typeOf')
            .value;
        var radius = document.getElementById('radius')
            .value;
        var myLatlng = new google.maps.LatLng(29.567496, -95.713618);
        var keyword = document.getElementById('keyword')
            .value;



        var request = {
            location: myLatlng,
            radius: radius,
            types: [searchType]
        };

        if (keyword) {
            request.keyword = [keyword];
        }

        infowindow = new google.maps.InfoWindow();
        placesservice = new google.maps.places.PlacesService(map);
        placesservice.nearbySearch(request, callback);
    }

    function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i]) {
                markers[i].setMap(null);
            }
        }
        // reset markers
        markers = [];
    }

    toRadians = function (num) {
        return num * Math.PI / 180;
    }

    function callback(results, status, pagination) {

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearMarkers();
            self.allPlaces.removeAll();
            var bounds = new google.maps.LatLngBounds();
            var getNextPage = null;
            var moreButton = document.getElementById('more');
            moreButton.onclick = function () {
                moreButton.disabled = true;
                if (getNextPage) getNextPage();
            };

            moreButton.disabled = !pagination.hasNextPage;
            getNextPage = pagination.hasNextPage && function () {
                pagination.nextPage();
            };
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
                bounds.extend(results[i].geometry.location);


                var R = 3961;
                let destinationLat = results[i].geometry.location.lat();
                let destinationLng = results[i].geometry.location.lng();
                var φ1 = toRadians(29.567496);
                var φ2 = toRadians(destinationLat);
                var deltaLat = destinationLat - 29.567496;
                var deltaLng = destinationLng - -95.713618;
                var Δφ = toRadians(deltaLat);
                var Δλ = toRadians(deltaLng);
                var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c;
                distance = +(Math.round(d + "e+2") + "e-2");
                results[i].distance = distance + "miles";

            }
            map.fitBounds(bounds);
            results.forEach(getAllPlaces);
        }
    }




    function createMarker(place) {
        var bounds = new google.maps.LatLngBounds();
        var photos = place.photos; // photos of the place from place service
        var photoUrl = ''; // Url of place photo
        if (!photos) {
            photoUrl = 'not found';
        } else {
            photoUrl = photos[0].getUrl({
                'maxWidth': 200,
                'maxHeight': 200
            });
        }
        self.fourSquareAPI = '';
        var url;
        var twitter;
        var formattedPhoneNumber;

        var marker = new google.maps.Marker({
            map: map,
            place_id: place.place_id,
            title: place.name,
			icon: photos[0].getUrl({'maxWidth': 35, 'maxHeight': 35}),
            animation: google.maps.Animation.DROP,
            position: place.geometry.location
        });

        if (place.vicinity !== undefined) {
            address = place.vicinity;
        } else if (place.formatted_address !== undefined) {
            address = place.formatted_address;
        }
        place.address = address;

        var contentString = '';
        var client_id = '1JM24EFDXPAAABQRAZQD5MBRRNDONBTF1ZBCX0SDPE2P5XND';
        var client_secret = 'S4AYKN2LZIJEGLKXCSWGQAOOBDVAYGPC2HU11DRPSGRBSFQ0';
        // foursquare api url
        var foursquare = "https://api.foursquare.com/v2/venues/search?v=20161016&ll=" + place.geometry.location.lat() + "," + place.geometry.location.lng() + "&query=" + encodeURIComponent(place.name) + "&client_id=MWXWVYKPA5TVSL0QJX230SUTBNZZHNELA500FK4PAHI5PPWE&client_secret=3DZWKCZHGLOVVPTH0XCURJXT3POB3K0HBQYIEXQLPYA5SUWP"

        // start ajax and grab: venue name, phone number and twitter handle
        $.getJSON(foursquare)
            .done(function (response) {

                var url = response.response.venues[0].url ? '<a href="' + response.response.venues[0].url + '" target="_blank">' + response.response.venues[0].url + '</a>' : 'Not available via Foursquare';
                var formattedPhoneNumber = response.response.venues[0].contact.formattedPhone ? response.response.venues[0].contact.formattedPhone : 'Not available via Foursquare';
                var twitter = response.response.venues[0].contact.twitter ? response.response.venues[0].contact.twitter : 'Not available via Foursquare';

                if (formattedPhoneNumber !== null && formattedPhoneNumber !== undefined) {
                    self.fourSquareAPI += 'Phone: ' + formattedPhoneNumber + ' ';
                } else {
                    self.fourSquareAPI += 'Phone not available' + ' ';
                }
                if (twitter !== null && twitter !== undefined) {
                    self.fourSquareAPI += '<br>' + 'twitter: @' + twitter + ' ';
                } else {
                    self.fourSquareAPI += 'Phone not available' + ' ';
                }
                if (url !== null && url !== undefined) {
                    self.fourSquareAPI += '<br>' + url + ' ';
                } else {
                    self.fourSquareAPI += 'website not available' + ' ';
                }

                var contentString = '<div class="infoWindowContainer"><img class="infoWindowImage" src="' + photoUrl + '"></img></div><div class="infoWindowText"><b>' + place.name + '</b><div>' + place.address + '</div><div> Rating: ' + place.rating + '</div></div>' + '<p>' + 'Phone: ' + formattedPhoneNumber + '<br/>' + '</p>' + '<p>' + 'twitter: @' + twitter + '<br/>' + '</p>' + '<br>' + url + ' ';



                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent(contentString);
                    infowindow.open(map, this);
                    map.panTo(marker.position);

                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function () {
                        marker.setAnimation(null);
                    }, 1450);
                });

            })

        markers.push(marker);
        return marker;
    }


    self.focusMarker = function (place) {
        var marker;
        for (var i = 0; i < markers.length; i++) {
            if (place.place_id === markers[i].place_id) {
                google.maps.event.trigger(markers[i], 'click');
            }
        }

    };


    function getAllPlaces(place) {
        var placeit = {};
        placeit.place_id = place.place_id;
        placeit.position = place.geometry.location.toString();
        placeit.name = place.name;
        placeit.distance = place.distance;

        var address;
        if (place.vicinity !== undefined) {
            address = place.vicinity;
        } else if (place.formatted_address !== undefined) {
            address = place.formatted_address;
        }
        placeit.address = address;


        self.allPlaces.push(placeit);
    }




}

google.maps.event.addDomListener(window, 'load', initialize);
var results, allResults = [];
var distance = [];
// Create the Google Maps, centered in the neighbourhood, and call the KO ViewModel
function initialize() {
     geocoder = new google.maps.Geocoder();

    // set initial position (New York)
    var myLatlng = new google.maps.LatLng(29.567496,-95.713618);

    var myOptions = { // default map options
        zoom: 14,var map, infoWindow;
var markers = [];
var type = [];
var checkboxval = "";
var textSearchrequest;
var results, allResults = [];
// Create the Google Maps, centered in the neighbourhood, and call the KO ViewModel
function initialize() {
    geocoder = new google.maps.Geocoder();

    // set initial position (New York)
    var myLatlng = new google.maps.LatLng(29.567496, -95.713618);

    var myOptions = { // default map options
        zoom: 14,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var autocompleteoptions = {
        types: ['(places)']
    };
    map = new google.maps.Map(document.getElementById('map'), myOptions);
    var input = $("#searchTextField")[0];

    var autocomplete = new google.maps.places.Autocomplete(input, autocompleteoptions);
    drawMyMarker();

    ko.applyBindings(new viewModel());
}

function drawMyMarker() {
    myLatlng = new google.maps.LatLng(29.567496, -95.713618);
    myMarker = new google.maps.Marker({
        map: map,
        title: 'My location',
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        position: myLatlng
    });
}


var viewModel = function () {
    var self = this;
    self.allPlaces = ko.observableArray([]);

    this.search = function () {
        var searchTimeout;
        if (searchTimeout) {
            window.clearTimeout(searchTimeout);
        }
        searchTimeout = window.setTimeout(reallyDoSearch, 500);
    }

    function reallyDoSearch() {
        var type = document.getElementById('typeOf')
            .value;
        var keyword = document.getElementById('keyword')
            .value;

        var search = {};

        if (keyword) {
            search.keyword = keyword;
        }

        if (type != 'establishment') {
            search.types = [type];
        }

        placesservice = new google.maps.places.PlacesService(map);
        infowindow = new google.maps.InfoWindow();
        var myLatlng = new google.maps.LatLng(29.567496, -95.713618);
        search.rankBy = google.maps.places.RankBy.DISTANCE;
        search.location = myLatlng;



        placesservice.search(search, function (results, status, pagination) {

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                clearMarkers();
                self.allPlaces.removeAll();
                var bounds = new google.maps.LatLngBounds();
                var getNextPage = null;
                var moreButton = document.getElementById('more');
                moreButton.onclick = function () {
                    moreButton.disabled = true;
                    if (getNextPage) getNextPage();
                };

                moreButton.disabled = !pagination.hasNextPage;
                getNextPage = pagination.hasNextPage && function () {
                    pagination.nextPage();
                };
                for (var i = 0; i < results.length; i++) {
                    createMarker(results[i]);
                    bounds.extend(results[i].geometry.location);


                    var R = 3961;
                    let destinationLat = results[i].geometry.location.lat();
                    let destinationLng = results[i].geometry.location.lng();
                    var φ1 = toRadians(29.567496);
                    var φ2 = toRadians(destinationLat);
                    var deltaLat = destinationLat - 29.567496;
                    var deltaLng = destinationLng - -95.713618;
                    var Δφ = toRadians(deltaLat);
                    var Δλ = toRadians(deltaLng);
                    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                        Math.cos(φ1) * Math.cos(φ2) *
                        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var d = R * c;
                    distance = +(Math.round(d + "e+2") + "e-2");
                    results[i].distance = distance + "miles";

                }
                map.fitBounds(bounds);
                results.forEach(getAllPlaces);
            }
        });
    }

    go = function(formElement){
        var searchType = document.getElementById('typeOf')
            .value;
        var radius = document.getElementById('radius')
            .value;
        var myLatlng = new google.maps.LatLng(29.567496, -95.713618);
        var keyword = document.getElementById('keyword')
            .value;



        var request = {
            location: myLatlng,
            radius: radius,
            types: [searchType]
        };

        if (keyword) {
            request.keyword = [keyword];
        }

        infowindow = new google.maps.InfoWindow();
        placesservice = new google.maps.places.PlacesService(map);
        placesservice.nearbySearch(request, callback);
    }

    function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i]) {
                markers[i].setMap(null);
            }
        }
        // reset markers
        markers = [];
    }

    toRadians = function (num) {
        return num * Math.PI / 180;
    }

    function callback(results, status, pagination) {

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearMarkers();
            self.allPlaces.removeAll();
            var bounds = new google.maps.LatLngBounds();
            var getNextPage = null;
            var moreButton = document.getElementById('more');
            moreButton.onclick = function () {
                moreButton.disabled = true;
                if (getNextPage) getNextPage();
            };

            moreButton.disabled = !pagination.hasNextPage;
            getNextPage = pagination.hasNextPage && function () {
                pagination.nextPage();
            };
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
                bounds.extend(results[i].geometry.location);


                var R = 3961;
                let destinationLat = results[i].geometry.location.lat();
                let destinationLng = results[i].geometry.location.lng();
                var φ1 = toRadians(29.567496);
                var φ2 = toRadians(destinationLat);
                var deltaLat = destinationLat - 29.567496;
                var deltaLng = destinationLng - -95.713618;
                var Δφ = toRadians(deltaLat);
                var Δλ = toRadians(deltaLng);
                var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c;
                distance = +(Math.round(d + "e+2") + "e-2");
                results[i].distance = distance + "miles";

            }
            map.fitBounds(bounds);
            results.forEach(getAllPlaces);
        }
    }




    function createMarker(place) {
        var bounds = new google.maps.LatLngBounds();
        var photos = place.photos; // photos of the place from place service
        var photoUrl = ''; // Url of place photo
        if (!photos) {
            photoUrl = 'not found';
        } else {
            photoUrl = photos[0].getUrl({
                'maxWidth': 200,
                'maxHeight': 200
            });
        }
        self.fourSquareAPI = '';
        var url;
        var twitter;
        var formattedPhoneNumber;

        var marker = new google.maps.Marker({
            map: map,
            place_id: place.place_id,
            title: place.name,
            icon: photos[0].getUrl({'maxWidth': 35, 'maxHeight': 35}),
            animation: google.maps.Animation.DROP,
            position: place.geometry.location
        });

        if (place.vicinity !== undefined) {
            address = place.vicinity;
        } else if (place.formatted_address !== undefined) {
            address = place.formatted_address;
        }
        place.address = address;

        var contentString = '';
        var client_id = '1JM24EFDXPAAABQRAZQD5MBRRNDONBTF1ZBCX0SDPE2P5XND';
        var client_secret = 'S4AYKN2LZIJEGLKXCSWGQAOOBDVAYGPC2HU11DRPSGRBSFQ0';
        // foursquare api url
        var foursquare = "https://api.foursquare.com/v2/venues/search?v=20161016&ll=" + place.geometry.location.lat() + "," + place.geometry.location.lng() + "&query=" + encodeURIComponent(place.name) + "&client_id=MWXWVYKPA5TVSL0QJX230SUTBNZZHNELA500FK4PAHI5PPWE&client_secret=3DZWKCZHGLOVVPTH0XCURJXT3POB3K0HBQYIEXQLPYA5SUWP"

        // start ajax and grab: venue name, website, phone number and twitter handle
        $.getJSON(foursquare)
            .done(function (response) { 

                var url = response.response.venues[0].url ? '<a href="' + response.response.venues[0].url + '" target="_blank">' + response.response.venues[0].url + '</a>' : 'Not available via Foursquare';
                var formattedPhoneNumber = response.response.venues[0].contact.formattedPhone ? response.response.venues[0].contact.formattedPhone : 'Not available via Foursquare';
                var twitter = response.response.venues[0].contact.twitter ? response.response.venues[0].contact.twitter : 'Not available via Foursquare';

                if (formattedPhoneNumber !== null && formattedPhoneNumber !== undefined) {
                    self.fourSquareAPI += 'Phone: ' + formattedPhoneNumber + ' ';
                } else {
                    self.fourSquareAPI += 'Phone not available' + ' ';
                }
                if (twitter !== null && twitter !== undefined) {
                    self.fourSquareAPI += '<br>' + 'twitter: @' + twitter + ' ';
                } else {
                    self.fourSquareAPI += 'Phone not available' + ' ';
                }
                if (url !== null && url !== undefined) {
                    self.fourSquareAPI += '<br>' + url + ' ';
                } else {
                    self.fourSquareAPI += 'website not available' + ' ';
                }

                var contentString = '<div class="infoWindowContainer"><img class="infoWindowImage" src="' + photoUrl + '"></img></div><div class="infoWindowText"><b>' + place.name + '</b><div>' + place.address + '</div><div> Rating: ' + place.rating + '</div></div>' + '<p>' + 'Phone: ' + formattedPhoneNumber + '<br/>' + '</p>' + '<p>' + 'twitter: @' + twitter + '<br/>' + '</p>' + '<br>' + url + ' ';



                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent(contentString);
                    infowindow.open(map, this);
                    map.panTo(marker.position);

                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function () {
                        marker.setAnimation(null);
                    }, 1450);
                });

            })

        markers.push(marker);
        return marker;
    }


    self.focusMarker = function (place) {
        var marker;
        for (var i = 0; i < markers.length; i++) {
            if (place.place_id === markers[i].place_id) {
                google.maps.event.trigger(markers[i], 'click');
            }
        }

    };


    function getAllPlaces(place) {
        var placeit = {};
        placeit.place_id = place.place_id;
        placeit.position = place.geometry.location.toString();
        placeit.name = place.name;
        placeit.distance = place.distance;

        var address;
        if (place.vicinity !== undefined) {
            address = place.vicinity;
        } else if (place.formatted_address !== undefined) {
            address = place.formatted_address;
        }
        placeit.address = address;


        self.allPlaces.push(placeit);
    }




}

google.maps.event.addDomListener(window, 'load', initialize);
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map'), myOptions);
	drawMyMarker();
	
	 ko.applyBindings(new viewModel());
}



function drawMyMarker(){
    myLatlng = new google.maps.LatLng(29.567496,-95.713618);
	myMarker = new google.maps.Marker({
		map: map,
		title: 'My location',
		icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
		position: myLatlng
	});
}

var viewModel = function() {
	var self = this; 
    this.allPlaces = ko.observableArray(); // will contain search result objects of type { marker, header, description} 
	this.searchRad = 500;
	this.radString = this.searchRad.toString();
	this.currentSearchRadius = ko.observable(this.radString); 
	this.placesSearch = ko.observable("");




		self.searchForText = function(){
        var query = self.placesSearch();
        if(query !== ''){
            self.textSearchPlaces();
        } else {
            window.alert('Please specify a search query first');
        }        
    };

	self.textSearchPlaces = function() {
		var myLatlng = new google.maps.LatLng(29.567496,-95.713618);
            var request = {
                  location: myLatlng,
                  query: self.placesSearch(),
                  radius: viewModel.radString
            }
			      infowindow = new google.maps.InfoWindow();
				service = new google.maps.places.PlacesService(map);
				service.textSearch(request, callback);
      }
	  
	  this.increaseRadius = function(){
            if(this.searchRad != 50000){
                this.searchRad = this.searchRad + 500;
                this.radString = this.searchRad.toString();
                this.currentSearchRadius(this.radString);
            } else {
                  this.radString = this.searchRad.toString();
                  this.errorHandle('You have reached the maximum search radius');
            }
            
      }
	  
	  
	  
	  this.decreaseRadius = function(){
            if(this.searchRad != 500){
                this.searchRad = this.searchRad - 500;
                this.radString = this.searchRad.toString();
                this.currentSearchRadius(this.radString);
            } else {
                  this.radString = this.searchRad.toString();
                  this.errorHandle('You have reached the minimum search radius');
            }
      }
	  
	go = function(formElement){
      var searchType = document.getElementById('typeOf').value;
	  var radius = document.getElementById('radius').value;
	  var myLatlng = new google.maps.LatLng(29.567496,-95.713618);
        
	  var request = {
                location: myLatlng,
                radius: radius,
                type: [searchType]
              };
			  			      infowindow = new google.maps.InfoWindow();
              service = new google.maps.places.PlacesService(map);
              service.nearbySearch(request, callback);
			}
			

  
	function callback(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK){
          for (var i = 0; i < results.length; i++) {
			 bounds = new google.maps.LatLngBounds();
             results.forEach(function(place) {
                place.marker = createMarker(place);
                bounds.extend(new google.maps.LatLng(
                    place.geometry.location.lat(),
                    place.geometry.location.lng()));
					var position = new google.maps.LatLng(place.geometry.location.lat(),place.geometry.location.lng());
				    var distance = google.maps.geometry.spherical.computeDistanceBetween(myLatlng, position);
	                distance = (distance/1000)*0.6214;	
		
	                distance = +(Math.round(distance + "e+2")  + "e-2");
            });
			map.fitBounds(bounds);
            results.forEach(getAllPlaces)
            }
          }
        }
		
		


		
		function createMarker(place) {
		
      var marker = new google.maps.Marker({
        map: map,
		place_id: place.place_id,
        animation: google.maps.Animation.DROP,
        position: place.geometry.location,
		distance: place.distance
      });
				
    google.maps.event.addListener(marker, 'click', function() {
            self.clickMarker(place);
        });
		

	   
	   self.allPlaces.push(distance);
	  
	   

         


    markers.push(marker);
    return marker;
    
	
		}
		

		
		
	
	
	  // Foursquare Credentials
    var clientID = 'UVSLUM00CXLUB1P0UKPJSLDTG0VVYQ2E20W1C045PBU1OJNZ';
    var clientSecret = 'JERNMOY0EUXF4LGZTWDLLJFR2CXWDSZWL1JU2W5CS1POPZBF';

    // callback function to handle results object and render resturant details
    function renderPlaceInfo(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var galleryImages = {};
            var galleryImagesHtml = '';
            var thumbUrl;
            if (typeof(place.photos) !== 'undefined') {
                for (var i = 0; i < place.photos.length; i++) {
                    var imgUrl = place.photos[i].getUrl({
                        'maxWidth': 100,
                        'maxHeight': 72
                    });
                    thumbUrl = imgUrl;
                    galleryImages[i] = imgUrl;
                    galleryImagesHtml += '<img height="72px" src="' + imgUrl + '" />';
                }
                place.galleryImages = galleryImages;
            }

            if (typeof(place.vicinity) !== undefined) {
                address = place.vicinity;
            } else if (typeof(place.formatted_address) !== undefined) {
                address = place.formatted_address;
            }
            place.address = address;
			place.distance = distance;
			

            //Send a new call here.
            //Fetch the JSON, parse it. Extract Herenow, checkin count and category information and add to info window
            //venues/search?ll=39.13966719999999,-77.2062876&query=Ken Leslies Country Cooking
            $.get("https://api.foursquare.com/v2/venues/search?v=20161016&ll=" + place.geometry.location.lat() + "," + place.geometry.location.lng() + "&query=" + encodeURIComponent(place.name) + "&client_id=MWXWVYKPA5TVSL0QJX230SUTBNZZHNELA500FK4PAHI5PPWE&client_secret=3DZWKCZHGLOVVPTH0XCURJXT3POB3K0HBQYIEXQLPYA5SUWP")
                .done(function(response) {
                    setTimeout(function() {
                        var starRating = (place.rating / 5) * 80;
                        var reviewsHtml = (typeof(place.reviews) !== undefined) ? '<p class="public-reviews"><a target="blank" title="' + place.reviews[0].author_name + '" href="' + place.reviews[0].author_url + '"><img width="36" src="' + place.reviews[0].profile_photo_url + '"/></a>' + place.reviews[0].text + '</p>' : '';
                        var contentString = '<div class="detailed-info-box"><div class="text-info-container"><strong>' + place.name + " (Here Now: " + response.response.venues[0].hereNow.summary + ")" + '</strong><p>' + place.address + '</p><p class="rating"><span class="rating-span">' + place.rating + '</span><span class="rating-span"><span class="stars"><span style="width: ' + starRating + 'px;"></span></span></span> from <b>' + response.response.venues[0].stats.checkinsCount + ' check-ins.</b><br/>' + '<b>' + response.response.venues[0].categories[0].name + '</b>' + '<br/>' + '</p>' + reviewsHtml + '</div><div class="image-slider">' + galleryImagesHtml + '</div></div>';
                        infowindow.setContent(contentString);
                    }, 300);
                }).fail(function(err) {
                    setTimeout(function() {
                        var starRating = (place.rating / 5) * 80;
                        var reviewsHtml = (typeof(place.reviews) !== undefined) ? '<p class="public-reviews"><a target="blank" title="' + place.reviews[0].author_name + '" href="' + place.reviews[0].author_url + '"><img width="36" src="' + place.reviews[0].profile_photo_url + '"/></a>' + place.reviews[0].text + '</p>' : '';
                        var contentString = '<div class="detailed-info-box"><div class="text-info-container"><strong>' + place.name + '</strong><p>' + place.address + '</p><p class="rating"><span class="rating-span">' + place.rating + '</span><span class="rating-span"><span class="stars"><span style="width: ' + starRating + 'px;"></span></span></span></p>' + reviewsHtml + '</div><div class="image-slider">' + galleryImagesHtml + '</div></div>';
                        infowindow.setContent(contentString);
                    }, 300);
                })
        } else {
            alert("Restaurant reviews and images are not loaded")
        }
		
		 var distance = getDistance(29.567496, -95.713618, place.geometry.location.lat(), place.geometry.location.lng());
$('#distance').html(Math.round(distance) + ' mi.').css('display', 'block');
			console.log(distance);

    }

    this.getPlaceInfo = function(point) {
        var request = {
            placeId: point.place_id
        };

        service = new google.maps.places.PlacesService(map);
        service.getDetails(request, renderPlaceInfo);
    }; 
	
	this.getDescriptionString = function(place) {
            var name = place.name;
            var address = place.formatted_address;
            var phone_number = place.formatted_phone_number;
            var closed = place.permanently_closed;
            var website = place.website;
			var distance = place.distance;

            var description = "<p>" + address + "<br>";

            if (typeof phone_number !== 'undefined') { // Check if the location contains phone or permanently closed information
                description += phone_number + "<br>";

                if (typeof closed !== 'undefined') {
                    description += "Permanently closed: " + closed;
                }
            };

            description += "</p>";

            if (typeof website !== 'undefined') { // Link to a location website
                description += "<a href='" + website + "'>" + website + "</a>";
            }

            var html = {
                header: name,
                description: description,
            }

            return html;

        }
		
		 this.panTo = function(clickedPlace){
        map.panTo(clickedPlace.geometry.location);
        map.setZoom(16);
        for(let i=0; i<markers.length; i++){
            if(clickedPlace.name === markers[i].title){
                service.getDetails(clickedPlace, function(result,status){
                    if(status !== google.maps.places.PlacesServiceStatus.OK){
                        console.error(status);
                        return;
                    }

                    var contentString = self.contentString(result);
                    infoWindow.setContent(contentString);
                    infoWindow.open(map, markers[i]);
                    self.addInfo(result);
                });
                break;
            }
        }
    };
	
   
    /*
    Function that will pan to the position and open an info window of an item clicked in the list.
    */
    self.clickMarker = function(place) {
      var marker;

      for(var e = 0; e < markers.length; e++) {      
        if(place.place_id === markers[e].place_id) { 
          marker = markers[e];
          break; 
        }
      } 
      self.getPlaceInfo(place);         
      map.panTo(marker.position);   

      // waits 300 milliseconds for the getFoursquare async function to finish
      setTimeout(function() {
        infowindow.open(map, marker); 
        marker.setAnimation(google.maps.Animation.DROP); 
      }, 300);     
    }
	
	this.clickedHeader = function(clickedItem) {
            google.maps.event.trigger(clickedItem.marker, 'click');
        };
		
	 function getAllPlaces(place) {
             var placeit = {};
             placeit.place_id = place.place_id;
             placeit.position = place.geometry.location.toString();
             placeit.name = place.name;
			 placeit.distance =place.distance;

             var address;
             if (place.vicinity !== undefined) {
                 address = place.vicinity;
             } else if (place.formatted_address !== undefined) {
                 address = place.formatted_address;
             }
             placeit.address = address;
			 
			 
             self.allPlaces.push(placeit);
         }
		 
	

		 
		 
		 self.filterPlaces = ko.computed(function() {
             var return_arr = [];
	
             for (var k = 0, place; k < self.allPlaces().length; k++) {
                 place = self.allPlaces()[k];
                     return_arr.push(place);

             };
             return return_arr;
         
	
	
		
		});
		
}
		

		
		google.maps.event.addDomListener(window, 'load', initialize);
