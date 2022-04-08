    //  Globals variables
    var draw;
    var flagIsDrawingOn = false;
    var pointType = ['Shops', 'Poles', 'Trees', 'Manholes'];
    var lineType = ['Rivers', 'Roads', 'Railways', 'Powerlines'];
    var polygonType = ['Boundaries', 'Forests', 'Water bodies', 'Residential Areas'];
    var selectedGeomType;
    /**
     * Define a namespace for the application.
     */
    window.app = {};
    var app = window.app;


    //
    // Define rotate to north control.
    //


    /**
     * @constructor
     * @extends {ol.control.Control}
     * @param {Object=} opt_options Control options.
     */
    app.DrawingApp = function(opt_options) {

        var options = opt_options || {};
        var button1 = document.createElement('button');
        var button = document.createElement('button');
        button.id = 'drawBtn'
        button1.id = 'drawBtn1'
        button.innerHTML = '<i class="fa-solid fa-pen-ruler"></i>';
        button1.innerHTML = '<i class="fa-solid fa-brush"></i>';
        var this_ = this;
        var startStopApp = function() {
            if (flagIsDrawingOn == false) {
                $('#startdrawModal').modal('show');

            } else {
                map.removeInteraction(draw);
                button.innerHTML = '<i class="fa-solid fa-pen-ruler"></i>';
                $('#infoModal').modal('show');
                defineTypeOfFeature();
                flagIsDrawingOn = false
            }

            //   this_.getMap().getView().setRotation(0);
            // console.log('you clicked control')
        };

        var clearSpace = function() {
            drawSource.clear();
        }

        button1.addEventListener('click', clearSpace, false);
        button1.addEventListener('touchstart', clearSpace, false);
        button.addEventListener('click', startStopApp, false);
        button.addEventListener('touchstart', startStopApp, false);

        var element = document.createElement('div');
        element.className = 'rotate-north ol-unselectable ol-control';
        element.appendChild(button);
        element.appendChild(button1);
        ol.control.Control.call(this, {
            element: element,
            target: options.target
        });
    };

    ol.inherits(app.DrawingApp, ol.control.Control);



    // View
    var mapView = new ol.View({
        center: [4194864.112290, 9783.939621],
        zoom: 7
    });

    // Base Layer
    var baseLayer = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    // Geoserver layer
    var featureLayerSource = new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/cite/wms',
        params: { 'LAYERS': 'cite:drawn_features', tiled: true },
        serverType: 'geoserver'
    });

    var featureLayer = new ol.layer.Tile({
        source: featureLayerSource
    })

    // Draw source
    var drawSource = new ol.source.Vector();

    // Draw layer
    var drawLayer = new ol.layer.Vector({
        source: drawSource
    });

    // Layer array
    var layerArray = [baseLayer, featureLayer, drawLayer];

    // Map
    var map = new ol.Map({
        controls: ol.control.defaults({
            attributionOptions: {
                collapsible: false
            }
        }).extend([
            new app.DrawingApp()
        ]),
        target: 'map',
        view: mapView,
        layers: layerArray,
    });


    //   Start Drawing function
    function startDraw(geomType) {
        selectedGeomType = geomType;
        // console.log(geomType)
        draw = new ol.interaction.Draw({
            type: geomType,
            source: drawSource
        });

        $('#startdrawModal').modal('hide');
        // drawSource.clear();
        document.getElementById('drawBtn').innerHTML = '<i class="fa-solid fa-circle-stop"></i>'
        flagIsDrawingOn = true
        map.addInteraction(draw);
    }


    // Function to add types based on features
    function defineTypeOfFeature() {
        var dropdownOfType = document.getElementById('typeOfFeatures');
        dropdownOfType.innerHTML = '';
        if (selectedGeomType == 'Point') {
            for (i = 0; i < pointType.length; i++) {
                var opt = document.createElement('option');
                opt.value = pointType[i];
                opt.innerHTML = pointType[i];
                dropdownOfType.appendChild(opt);
            }
        } else if (selectedGeomType == 'LineString') {
            for (i = 0; i < lineType.length; i++) {
                var opt = document.createElement('option');
                opt.value = lineType[i];
                opt.innerHTML = lineType[i];
                dropdownOfType.appendChild(opt);
            }
        } else if (selectedGeomType == 'Polygon') {
            for (i = 0; i < polygonType.length; i++) {
                var opt = document.createElement('option');
                opt.value = polygonType[i];
                opt.innerHTML = polygonType[i];
                dropdownOfType.appendChild(opt);
            }
        }
    }



    // Save data to db
    function saveToDB() {

        // get array of all features
        var featureArray = drawSource.getFeatures();
        // console.log(featureArray)

        // define geojson format
        var geoJSONFormat = new ol.format.GeoJSON()

        var geoJSONFeatures = geoJSONFormat.writeFeaturesObject(featureArray);
        // console.log(geoJSONFeature)

        var geoJSONFeatureArray = geoJSONFeatures.features;
        // console.log(geoJSONFeatureArray)

        for (i = 0; i < geoJSONFeatureArray.length; i++) {
            // console.log(geoJSONFeatureArray[i].geometry)

            var type = document.getElementById('typeOfFeatures').value;
            var name = document.getElementById('nameOfFeatures').value;
            geo1 = geoJSONFeatureArray[i].geometry
            var geometry = JSON.stringify(geo1);
            console.log(geometry)

            if (type != '') {
                $.ajax({
                    url: 'php/save_data.php',
                    method: 'POST',
                    data: {
                        type: type,
                        name: name,
                        geom: geometry
                    },
                    success: function(result) {
                        console.log(result)
                        $('#infoModal').modal('hide');
                        // drawSource.clear();

                    }
                });
            }
        }
    }


    // // set up geolocation to track our position
    // var geolocation = new ol.Geolocation({
    //     tracking: true,
    //     projection: map.getView().getProjection()
    // });

    // // bind it to the view's projection and update the view as we move
    // // geolocation.bindTo('projection', mapView);

    // geolocation.on('change:position', function() {
    //     mapView.setCenter(geolocation.getPosition());
    //     addMarker(geolocation.getPosition())
    // });

    // // add a marker to display the current location
    // var marker = new ol.Overlay({
    //     element: document.getElementById('locationMarker'),
    //     positioning: 'center-center',
    //     // position: geolocation
    // });
    // map.addOverlay(marker);

    // // // and bind it to the geolocation's position updates
    // function addMarker(array) {
    //     marker.setPosition(array);
    // }


    // // create a new device orientation object set to track the device
    // var deviceOrientation = new ol.DeviceOrientation({
    //     tracking: true
    // });

    // // when the device changes heading, rotate the view so that
    // // 'up' on the device points the direction we are facing
    // deviceOrientation.on('change:heading', onChangeHeading);

    // function onChangeHeading(event) {
    //     var heading = event.target.getHeading();
    //     view.setRotation(-heading);
    // }