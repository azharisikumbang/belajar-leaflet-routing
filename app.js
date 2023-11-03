var L = require('leaflet');
var xml2js = require('xml2js');
require('leaflet-routing-machine');
require('leaflet-control-geocoder');

// if (!navigator.geolocation) {
//     console.log("Your browser doesn't support geolocation feature!");
// } else {
//     // navigator.geolocation.getCurrentPosition(loadMap, err => console.log(err));
// }

function loadMap(position) {

    // Initialize the map
    var map = L.map('map', {
        scrollWheelZoom: false
    });
    
    // Set the position and zoom level of the map
    map.setView([position.coords.latitude, position.coords.longitude], 9);

    // Initialize the base layer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.Routing.control({
        waypoints: [
            L.latLng(-0.924521, 100.363363), // padang
            L.latLng(-1.557592, 101.239464) // solok selatan
        ],
        routeWhileDragging: true,
        geocoder: L.Control.Geocoder.nominatim()
    })
    .on('routesfound', async function(e) {
        for (const route of e.routes) {
            // console.log(route);

            for(const instruction of route.instructions) {
                if (instruction.road == '' || instruction.road == undefined) continue;

                let touched = '';
                if (instruction.road == touched) continue;
                touched = instruction.road;
                
                // get lat long
                await fetch('http://nominatim.openstreetmap.org/search?format=json&q=' + touched)
                    .then(resp => resp.json())
                    .then(resp => {
                        
                        // reverse lat long
                        fetch('http://nominatim.openstreetmap.org/reverse?format=json&lat=' + resp[0].lat + '&lon=' + resp[0].lon) 
                            .then(city => city.json())
                            .then(city => {
                                console.table({
                                    'alamat': city.display_name,
                                    'region': city.address.region,
                                    'city': city.address.city,
                                    'kab': city.address.county,
                                    'latitude': city.lat,
                                    'longitude': city.lon,
                                });
                            });
                    });
            }
        }
    })
    .addTo(map);
}

fetch('https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-SumateraBarat.xml')
    .then(resp => resp.text())
    .then(resp => {

        var parser = new xml2js.Parser();

        parser.parseString(resp, function (err, result) {
            console.dir(result.data.forecast);
        });
        
    })

