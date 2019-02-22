var map;
// Create a new blank array for all the listing markers.
var markers = [];
var largeInfowindow;

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    // Google Map will show with "For Development Purpose only" due to 
    // Google Maps no longer being free.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 18.017140, lng: -76.808898 },
        zoom: 13
    });
    map.setOptions({ styles: mapStyle });
    largeInfowindow = new google.maps.InfoWindow();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < markerLocation.length; i++) {
        // Push the marker to our array of markers.
        markers.push(new mapLocations(markerLocation[i]));
    }
}
// Function populates infowindow when the marker is clicked.
// Map will populate based upon the marker that is clicked.
function populateInfoWindow() {
    marker = this;
    infowindow = largeInfowindow;
    marker.setAnimation(google.maps.Animation.BOUNCE);

    setTimeout(function () {
        self.marker.setAnimation(null);
    }, 1000);

    LocationModel(infowindow);
    infowindow.marker = marker;
    infowindow.open(map, marker);

    infowindow.addListener('closeclick', function () {
        infowindow.setMarker = null;
        marker.setAnimation(null);
    });
}
// Function is used for the search filter.
// The function will control which locations are viewed on the map.
function ViewModel() {
    initMap();
    var self = this;
    this.searchContent = ko.observable("");

    this.markerLocation = ko.computed(function () {
        var result = [];
        markers.forEach(function (marker) {
            if (marker.title.toLowerCase().includes(
                self.searchContent().toLowerCase())) {
                result.push(marker);
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }
        });
        return result;
    }, this);
}

function LocationModel(infowindow) {
    // Foursquare API Client
    clientID = "G1TSQVS4L32UOS0GY4JQ0ITVJ1WODBKXOFWN4I2AY2UQDDXE";
    clientSecret = "G5VTFLV14HJCAWUEH4JIUEMKAZZSILNYS0YE20NZY4IFLJY2";

    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?v=20180125&ll=' +
        marker.position.lat() + ',' + marker.position.lng() + '&client_id=' + clientID +
        '&client_secret=' + clientSecret + '&query=' + marker.title;

    // get JSON request of foursquare info
    $.getJSON(foursquareURL).done(function (marker) {
        response = marker.response.venues[0];

        var name = response.name;
        var street = response.location.formattedAddress[0];
        var city = response.location.formattedAddress[1];
        var country = response.location.country;
        var type = response.categories[0].name;

        windowContent = '<h4>' + name + '</h4><p>' + 'Establishment Type: ' + type + '</p>' +
            '<p>' + 'Address: ' + street + ', ' + city + ', ' + country + '</p>';
        infowindow.setContent(windowContent);

    }).fail(function (e) {
        infowindow.setContent('<h4>An error occured during data retrieval from Foursquare!</h4>');
    });
}
// Function creates the map locations
var mapLocations = function (locations) {
    this.title = locations.title;
    this.type = locations.type;

    var coord = new google.maps.LatLng(locations.lat, locations.long);
    var marker = new google.maps.Marker({
        position: coord,
        title: locations.title,
        map: map,
        animation: google.maps.Animation.DROP
    });

    this.marker = marker;

    this.setVisible = function (access) {
        this.marker.setVisible(access);
    };

    this.marker.addListener('click', populateInfoWindow);

    // this.marker.addListener('mouseover', function () {
        // this.setIcon();
    // });
    // this.marker.addListener('mouseout', function () {
    //    this.setIcon();
    // });

    this.showMarkerContent = function () {
        google.maps.event.trigger(this.marker, 'click');
    };
};

function initializeApp() {
    ko.applyBindings(new ViewModel());
}

function mapsError() {
    $('#map').html('An error occured while loading Google maps');
}


