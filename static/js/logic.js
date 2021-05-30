let earthquakeAllWeek = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let tectonicPlateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Create the tile layers that will be the selectable backgrounds of the map.

// Create a L.tilelayer() using the 'mapbox/light-v10' map id
var grayMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", 
{ attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 15,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY});


// Create a L.tilelayer() using the 'mapbox/satellite-v9' map id
var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", 
{ attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 15,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY});

// Create a L.tilelayer() using the 'mapbox/outdoors-v9' map id
var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", 
{ attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 15,
  zoomOffset: -1,
  id: "mapbox/outdoors-v9",
  accessToken: API_KEY});


// We then create the map object with options. Adding the tile layers we just
// created to an array of layers.

var mapOptions = {center: [30.78, -20],
  zoom: 4}
// Create a L.map(), reference the 'mapid' element in the HTML page, and pass in the three layers above
var myMap = L.map("mapid", mapOptions);

// We create the layers for our two different sets of data, earthquakes and
// tectonicplates.
var tectonicPlates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Defining an object that contains all of our different map choices. Only one
// of these maps will be visible at a time!
// Create a basemaps object for the three tileLayers from above. 
// The key should be a human readable name for the tile layer, and the value should be a tileLayer variable
var baselayerMaps = {
  Outdoor: outdoorsMap,
  Satellite: satelliteMap,
  Grayscale: grayMap
};

// We define an object that contains all of our overlays. Any combination of
// these overlays may be visible at the same time!

// Create a overlays object for the two LayerGroups from above. 
// The key should be a human readable name for the layer group, and the value should be a LayerGroup variable
var overlayMaps = {
  Earthquakes: earthquakes,
  "Tectonic Plates": tectonicPlates
};

// Add a L.control.layers() object and pass in the baseMaps and overlayMaps, and then .addTo myMap
L.control.layers(baselayerMaps, overlayMaps).addTo(myMap);

// Use d3.json() to call the API endpoint for earthquake geoJSON data, 
// .then() fire off an anonymous function that takes a single argument `data`.


d3.json(earthquakeAllWeek).then(function(data) {
  // Use L.geoJson() to parse the data, and do the following:
  L.geoJson(data, {
    // use pointToLayer to convert each feature to an L.circleMarker, see https://geospatialresponse.wordpress.com/2015/07/26/leaflet-geojson-pointtolayer/ for a tutorial
    // use style to set the color, radius, and other options for each circleMarker dynamically using the magnitude data
    // use onEachFeature to bind a popup with the magnitude and location of the earthquake to the layer (see above tutorial for an example)
    pointToLayer: function(feature, latlng) {
      return new L.CircleMarker(latlng, {
          radius: 10,
          fillOpacity: 0.85
      });
  },
    style: (feature) => ({
      color: "#000000",
      radius: setRadius(feature.properties.mag),
      fillOpacity: 0.5,
      fillColor: setColor(feature.geometry.coordinates[2]),
      stroke: true,
      weight: 0.5
      }),

    onEachFeature: (feature, layer) => {
      layer.bindPopup(
        "<h3>Earthquake Info</h3><hr>"
        + "Location:" + feature.properties.place
        + "<br> Magnitude:" + feature.properties.mag
        + "<br> Depth:" + feature.geometry.coordinates[2]
       );
    }
  }).addTo(earthquakes) // use .addTo to add the L.geoJson object to the earthquakes LayerGroup

  // Then we add the earthquake layer to our map.
  earthquakes.addTo(myMap); // use .addTo to add the earthquakes LayerGroup to the myMap object
});

  // Create a dynamic legend that describes the color scheme for the circles
  // see this tutorial for guidance: https://www.igismap.com/legend-in-leafletjs-map-with-topojson/
  let controlOptions = {position: "bottomright"}
  let mapLegend = L.control(controlOptions);

  mapLegend.onAdd = function (myMap) {
    let div = L.DomUtil.create("div", "legend"),
      grades = [0, 10, 25, 50, 75, 90],
      labels = [];
    
    div.innerHTML += "<h4>Earthquake Depth:</h4>";
    for (var i=0; i < grades.length; i++) {
      div.innerHTML +=  
        '<i style="background: ' + 
        setColor(grades[i] + 1) + 
        '"></i>' +
        grades[i] + 
        (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  mapLegend.addTo(myMap);
 
 
function setColor(depth) {
  return depth > 90 ? '#F30':
  depth > 75  ? '#F60':
  depth > 50  ? '#F90':
  depth > 25  ? '#FC0':
  depth > 10  ? '#FF0':
            '#9F3';
}

function setRadius(mag) {
    if (mag === 0) {
      return 1;
    }

    return mag * 4;
}

  // BONUS
  // Make another d3.json() call to the tectonic plates API endpoint
  // then fire off an anonymous function that takes a single argument plateData
 d3.json(tectonicPlateUrl).then(function(plateData) {
  // Create an L.geoJson() that reads the plateData, and sets some options per your choosing 
     L.geoJson(plateData, {
       color: "#cc0000",
       weight: 3
     })
// use .addTo() to add the l.geoJson layer to the tectonicPlates LayerGroup
     .addTo(tectonicPlates);
// Then add the tectonicplates layer to the map.
 // use .addTo to add the tectonicPlates LayerGroup to the myMap object
    tectonicPlates.addTo(myMap);
  });
