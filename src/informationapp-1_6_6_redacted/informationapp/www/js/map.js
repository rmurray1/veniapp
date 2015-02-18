/**
 * @file Mapping code file for map.html.  Kickoff is set at the end of this file, registered
 * on either pageinit or deviceReady, depending on whether we're run on a desktop
 * or mobile device.  the init sequence is:
 *			{@linkcode getPosition}->{@linkcode getPositionSuccess} or {@linkcode getPositionFail}->{@linkcode initMap}->Done
 */

/*
* vars:	map - the google map object
* 		lat/lng - the latitude/longitude for initially setting the map position
* 		initialzoom - the initial zoom level of the map
* 		poi - Point of Interest, var for handlebars template for facility
* 		infowindow - the map popup object
*  		oms - overlapping marker spidifier object
* 		facilities - array of location data loaded from geojson file
* 		markers - array of facility markers for the map.
*/
var map,
  lat,
  lng,
  initialzoom,
  poi,
  infowindow,
  oms,
  facilities,
  markers;
  
var usingScreenReader = false;
var useStatusBar = true;
/**
 * Basic logging function currently defaulting to console.log
*/
function logger( message, functionName ) {

  console.log( "map.js-->" + functionName + "-->" + message );

}

function initPage() {
  
  //IOS7 - Statusbar fix
  if (typeof device != "undefined") {
    if (device.platform != "iOS" || (device.platform == "iOS" && device.version.substring(0,1)!="7")) {
      if ($("[name='iosheader']").length>0) $("[name='iosheader']").remove();
      useStatusBar = false;
    }
  } else {
    if ($("[name='iosheader']").length>0) $("[name='iosheader']").remove();
    useStatusBar = false;
  }
  
  //force this to run here...timing of events can otherwise fire this out of sync & mess up display on IOS6
  fixContentHeight();

  //set whether they're using a screen reader
  if (typeof window.cordova !="undefined" && typeof window.MobileAccessibility !="undefined") {
    window.MobileAccessibility.isScreenReaderRunning(function(isRunning) {
      if (isRunning==true){
        usingScreenReader = true;
        $("#viewMapLink").remove();
      } 
      getPosition();
    });
  } else {
    getPosition();
  }
}


/**
 * Facility json data is first loaded here via getJSON
 * and the call to getCurrentPosition is made in its callback.  getCurrentPosition is also async, and its callbacks
 * are either {@linkcode getPositionSuccess} or {@linkcode getPositionFail}.
 */
function getPosition() {
  
  //start the spinner
  loading( "show", "Loading Facility Information" );

  //default position is approx. centroid of US and zoomed out to show most of it.
  lng = -98.00;
  lat = 41.00;
  initialzoom = 5;

  //load facilities into an array
  $.getJSON( "content/facilities.json", function( data ) {
    facilities = data.features;

    if ( !navigator.geolocation ) {
      alert( "Unable to retrieve your location." );
    } else {
      navigator.geolocation.getCurrentPosition( getPositionSuccess, getPositionFail, {
        timeout : 20000,
        enableHighAccuracy : true
      });
    }
  });
}

/**
 * Success callback from getCurrentPosition call.  Sets the center of the map (lat/lng vars) to user's current location,
 * sets the initial zoom (initialzoom) to a reasonable level and initializes the map via {@linkcode initMap}.
 */
function getPositionSuccess( position ) {

  lng = position.coords.longitude;
  lat = position.coords.latitude;
  initialzoom = 12;
  logger( "INFO: Success getting position - " + lat + ", " + lng, "getPositionSuccess" );
  initMap();
}

/**
 * Failure callback from getCurrentPosition call.  Leaves the center of the map set to central US & zoomed out pretty far.
 * Display's a friendly message to the user, logs the failure & then initializes the map via {@linkcode initMap}.
 */
function getPositionFail( error ) {

  var errText = "";

  switch(error.code) {
    case error.PERMISSION_DENIED:
      errText = "Device settings don't allow us to use your location.";
      break;
    case error.POSITION_UNAVAILABLE:
      errText = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      errText = "Getting your current location from the device is taking too long.";
      break;
    case error.UNKNOWN_ERROR:
      errText = "An unknown error occurred getting your location.";
      break;
    default: 
      errText = "Unable to retrieve your current location.";
      break;
  }

  logger( "WARN: Get position failed.  " + error.message, "getPositionFail" );

  errText = errText + "  Click the 'Find a Facility' button to locate a VA facility near you.";
  $( "#message" ).text( errText );
  $( "#talk" ).popup( "open" );
  initMap();

}

/**
 * Sets up the Google Maps object, generates the markers from the facilities array and adds them to both the spidifier
 * and the markerClusterer.  The {@link https://github.com/jawj/OverlappingMarkerSpiderfier OverlappingMarkerSpidifier} spreads
 * markers out if there are more than 1 on top of each other.
 * {@link http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/docs/reference.html MarkerClustererPlus}
 * is from the google maps utility library and  groups multiple markers into one symbol with a count to keep the map cleaner looking at
 * higher zoom levels.
 */
function initMap() {

  //set up map
  map = new google.maps.Map( document.getElementById( "map-canvas" ), {
    zoom : initialzoom,
    center : new google.maps.LatLng( lat, lng ),
    mapTypeId : google.maps.MapTypeId.ROADMAP
  });

  //fix close button hanging off screen on wide popups...
  var wide = $( window ).width() * .66;
  infowindow = new google.maps.InfoWindow( {
    maxWidth : wide
  });

  //spidifier
  oms = new OverlappingMarkerSpiderfier( map, {
    markersWontMove : true,
    markersWontHide : true,
    keepSpiderfied : true,
    circleSpiralSwitchover : 5
  });

  oms.addListener( "click", function( marker, event ) {
    var content = marker.data;
    infowindow.setContent( content );
    infowindow.open( map, marker );
  });

  //put together our handlebars template for popup info
  setupTemplate();

  markers = Array();

  var featureIndex = 0;

  //go through the facilities array & create a marker for each one
  for ( var i = 0; i < facilities.length; i++ ) {

    try {
      var feature = facilities[i];

      //skip those with no lat/long
      if ( isNaN( feature.geometry.coordinates[0] ) || isNaN( feature.geometry.coordinates[1] ) ) {
        continue;
      }

      var pinIcon = '';
      //pick the icon based on facility type
      switch(feature.properties.DIV_NAME) {
        case "Veterans Health Administration":
          pinIcon = "images/red-dot.png";
          break;
        case "Veterans Benefits Administration":
          pinIcon = "images/green-dot.png";
          break;
        case "National Cemetery Administration":
          pinIcon = "images/purple-dot.png";
          break;
        default:
          pinIcon = "images/gray-dot.png";
          break;
      }

      var marker = new google.maps.Marker( {
        position : new google.maps.LatLng( feature.geometry.coordinates[1], feature.geometry.coordinates[0] ),
        type : feature.properties.TYPE_DESC,
        state : feature.properties.STATE,
        zip : feature.properties.ZIP,
        title : feature.properties.FAC_NAME,
        division : ( feature.properties.DIV_NAME === "vaco" ) ? "Central Offices" : feature.properties.DIV_NAME,
        icon : pinIcon,
        data : poi( feature.properties ),
        id : feature.properties.FAC_ID
      });

      //push the marker onto the stack - oms is the spiderfier.
      oms.addMarker( marker );
      markers.push( marker );

    } catch (err) {
      logger( "ERROR setting facility marker: " + err.message, "initMap" );
    }
  }

  //sort the results by division and type
  markers.sort( function( a, b ) {

    if ( b.division + a.type < a.division + b.type ) {
      return -1;
    } else {
      if ( b.division + a.type > a.division + b.type ) {
        return 1;
      } else {
        return 0;
      }
    }
  });

  var mc = new MarkerClusterer( map, markers, {
    maxZoom : 6
  });

  loading( "hide" );

  $( "#legendButton" ).show();


  //if they are using a screen reader, the Google Map isn't much use...better to take them to the search page by default.
  if (usingScreenReader){
    //according to 508 office, apple voiceover was causing 'critical' navigation issues with the tab bar.  Since we have no control
    //over voiceover, remove the tab bar entirely.
    $("#searchTabBar").remove(); 
    $.mobile.navigate("#facility-search");
  }
}

/** Fixes height of the map to keep it full screen minus JQM header/footer. */
function fixContentHeight() {
  
    
    var footer = $( "div[data-role='footer']:visible" ), content = $( "div[data-role='content']:visible" ), header = $( "div[name='normalheader']:visible" ), viewHeight = $( window ).height(), contentHeight = viewHeight - footer.outerHeight() - header.outerHeight();

    if ( ( content.outerHeight() + footer.outerHeight() + header.outerHeight() ) !== viewHeight ) {
      contentHeight -= ( content.outerHeight() - content.height());
    }

    //IOS7 has 2 status bars...need to subtract 2nd from contentHeight
    if (useStatusBar==true) contentHeight -= 20;
    
    content.height( contentHeight );

    //maximize the map to fit (if we're on the map page)
    if ( $( "#map-canvas" ).is( ":visible" ) ) {
      $( "#map-canvas" ).height( contentHeight );
    }

}

/** Used to invoke inappbrowser for facility url's */
function browse( url ) {
  var ref = window.open( encodeURI( url ), "_blank", "location=yes" );
}

/** Shows/hides the JQM spinner */
function loading( showOrHide, message ) {
  
  //if using a screen reader, let them know what we're doing...
  if (usingScreenReader) {
      if (showOrHide == "show") MobileAccessibility.speak(message);
  } else {
    $.mobile.loading( showOrHide, {
      "textVisible" : true,
      "text" : message
    });
  }
}

/** Set up handlebars template and helper functions for facility popup */
function setupTemplate() {

  //Register a handlebars helper for parsing phone number data fields that have ' Or ' in them
  Handlebars.registerHelper( "parsePhone", function( phoneString ) {
    var retVal = "";
    if ( typeof phoneString === "string" ) {
      var phoneArray = phoneString.split( " Or " );
      for ( var i = 0; i < phoneArray.length; i++ ) {
        if ( phoneArray[i].length )
          retVal = retVal + "&nbsp;<a href='tel:" + phoneArray[i] + "'>" + phoneArray[i] + "</a>&nbsp;<br />";
      }
    }
    return retVal;
  });

  //rough check for something in the url field...
  Handlebars.registerHelper( "checkWebsite", function( url ) {
    if ( typeof url === "string" && url.length > 12 ) {
      return "";
    } else {
      return "display:none";
    }
  });

  //get directions :-)
  Handlebars.registerHelper( "getDirections", function( address, city, state, zip ) {
    var dest = address + "+" + city + "+" + state + "+" + zip;
    return "browse(&quot;http://maps.google.com/?daddr=" + dest + "&quot;)";
  });

  //sets up a call to composeEmail with the subject & body of the message as arguments - for sending location info to someone
  Handlebars.registerHelper( "emailFacility", function( name, address, city, state, zip, phone ) {

    var str = "<html><body><h4>" + name + "</h4><p>" + address + "<br />" + city + ", " + state + " " + zip + "<br /><br />";
    str = str + "<a href='tel:" + phone + "'>" + phone + "</a><br /><br />";
    str = str + "<a href='http://maps.google.com/?q=" + address + "," + city + "," + state + "," + zip + "'>View Map</a></body></html>";

    return "composeEmail(&quot;VA Location: " + name + "&quot;,&quot;" + str + "&quot;,null)";

  });

  //sets up a call to composeEmail as above, but for sending location feedback/corrections
  Handlebars.registerHelper( "reportProblem", function( name, address, city, state, zip, phone ) {

    var str = "<html><body>" + name + "<br />" + address + "<br />" + city + ", " + state + " " + zip + "<br />" + phone + "<br />" +
      "<br /><b>What would you like to tell us about this location?</b>  ";

    //TODO: Find out the proper email recipient for these reports
    return "<a href=javascript:composeEmail(&quot;" + encodeURI( "Feedback for " + name ) + "&quot;,&quot;" +
      encodeURI( str ) + "&quot;,&quot;socialmedia@domain&quot;)>Let us know!</a>";

  });

  //initialize handlebars template for popup information
  $.ajax( {
    url : "templates/facility.handlebars",
    success : function( data ) {
      poi = Handlebars.compile( data );
    },
    async : false
  });
}

/**
 * Used to create a new message using device's default email client and lets us put HTML code in the
 * message body.  If HTML in the message body isn't required, the mailto: URI hint is sufficient.  This
 * function relies on the cordova emailComposer plugin being properly loaded for the target platform.
 */
function composeEmail( sub, body, to ) {

  try {
    
    window.plugin.email.isServiceAvailable(function(isAvailable) {
      
      if (isAvailable) {
        
        //arguments for email composer is a simple object 
        var args = {isHtml:true};
        
        //comma delimited list of email addresses is allowed in the 'to' string.
        var sendList = new Array();
        if ( to != null ) {
          sendList = to.split( "," );
        }
        args["to"] = sendList;
        args["subject"] = sub;
        args["body"] = body;
        window.plugin.email.open(args)
      } else {
        alert("Email Service is Unavailable.");
      }
    })

  } catch (err) {

    logger( "ERROR: " + err.description, "composeEmail" )

  }
}

/******************************************************************
 EVENT BINDINGS FOR THE PAGE.
 ******************************************************************/

//redo map on these events
$( window ).on( "orientationchange resize pageshow", fixContentHeight );

//kick off the mapping initializer either with cordova's deviceready or
//using pageinit if we're testing with a browser
if ( typeof window.cordova != "undefined" ) {
  document.addEventListener( "deviceready", initPage, false );
} else {
  $( "#mappage" ).on( "pageinit", function() {
    initPage();
  });
}
