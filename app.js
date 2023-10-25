var L = require('leaflet');
require('leaflet-routing-machine');
require('leaflet-control-geocoder');

if (!navigator.geolocation) {
    console.log("Your browser doesn't support geolocation feature!");
} else {
    navigator.geolocation.getCurrentPosition(loadMap, err => console.log(err));
}

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
            L.latLng(-0.924521, 100.363363),
            L.latLng(-1.557592, 101.239464)
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
                            .then(cityResp => cityResp.json())
                            .then(cityResp => {

                                console.table({
                                    'alamat': cityResp.display_name,
                                    'region': cityResp.address.region,
                                    'city': cityResp.address.city,
                                    'kab': cityResp.address.county,
                                    'latitude': cityResp.lat,
                                    'longitude': cityResp.lon,
                                });
                            });
                    });

                
            }
        }
    })
    .addTo(map);
}