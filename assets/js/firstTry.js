'use strict';

const app  = {
    item :  {
        map: undefined,
        autocompleteInput: undefined,
        infoWindow: undefined,
        marker: undefined,
        directionsService: undefined,
        directionsDisplay: undefined
    },

    init : function () {
        app.item.map = new google.maps.Map($('#map')[0],{
            zoom: 7,
            center: {lat: -9.1191427, lng: -77.0349046},
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false,
        });
        
        let origin = document.getElementById('origin');
        let destination = document.getElementById('destination');  
        app.setup();      
        app.setPosition(origin);
        app.setPosition(destination);
    },

    setup: function () {
        document.getElementById("findMe").addEventListener("click", function(){app.searchPosition()});
        app.item.directionsService = new google.maps.DirectionsService;
        app.item.directionsDisplay = new google.maps.DirectionsRenderer;
        document.getElementById("route").addEventListener("click", function(){app.traceRoute(app.item.directionsService, app.item.directionsDisplay)});
        app.item.directionsDisplay.setMap(app.item.map);
    },

    setPosition: function(id){
        app.item.autocompleteInput = new google.maps.places.Autocomplete(id);
        app.item.autocompleteInput.bindTo('bounds', app.item.map);
        app.item.infoWindow = new google.maps.InfoWindow();
        app.item.marker = app.createMarker(app.item.map);
        app.createListener(app.item.autocompleteInput, app.item.infoWindow, app.item.marker);
    },

    createListener: function(autocomplete, locationDetails, marker){
        autocomplete.addListener('place_changed', function() {
            locationDetails.close();
            marker.setVisible(false);
            let place = autocomplete.getPlace();
            app.placePosition(place, locationDetails, marker);
        });
    },

    searchPosition: function () {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(app.drawCurrentPosition, app.error);
        }
    },

    drawCurrentPosition: function (position) {
        let latitude,longitude;
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        app.item.marker.setPosition(new google.maps.LatLng(latitude,longitude));
        app.item.map.setCenter({lat:latitude,lng:longitude});
        app.item.map.setZoom(17);

        //$('#origin').val() = new google.maps.LatLng(latitude,longitude); //CON ESTO LOGRO QUE EN EL INPUT ORIGEN SALGA LAS COORDENADAS DE MI UBICACION

        app.item.marker.setVisible(true);
        app.item.infoWindow.setContent('<div><strong>Mi ubicación actual</strong><br>');
        app.item.infoWindow.open(app.item.map, app.item.marker);
    },

    error: function(){
        alert('Tenemos un problema con encontrar tu ubicacion');
    },

    placePosition: function(place, locationDetails, marker){
        if (!place.geometry) {
            // Error si no encuentra el lugar indicado
            window.alert("No encontramos el lugar que indicaste: '" + place.name + "'");
            return;
        }
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            app.item.map.fitBounds(place.geometry.viewport);
        } else {
            app.item.map.setCenter(place.geometry.location);
            app.item.map.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        let address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        locationDetails.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        locationDetails.open(app.item.map, marker);
    },

    createMarker: function(map){
        let icono = {
            url: 'http://icons.iconarchive.com/icons/sonya/swarm/128/Bike-icon.png',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        };

        let marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            icon: icono,
            anchorPoint: new google.maps.Point(0, -29)
        });

        return marker;
    },

    traceRoute: function(directionsService, directionsDisplay){
        let origin = document.getElementById("origin").value;
        let destination = document.getElementById('destination').value;

        if(destination != "" && destination != "") {
            directionsService.route({
                origin: origin,
                destination: destination,
                travelMode: "DRIVING"
            },
            function(response, status) {
                if (status === "OK") {
                    directionsDisplay.setDirections(response);
                } else {
                    app.errorRoute();
                }
            });
        }
    },

    errorRoute: function(){
        alert("No ingresaste un origen y un destino validos");
    }
};

function initMap(){
    app.init();
}