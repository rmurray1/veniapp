/**
* @file Facility search code file for map.html.  This script handles searching facilities by type/zip,
* name and state as well as displaying the results.  Kickoff is set at the end of this file,
* registered on pageinit of #facility-search div.
*/

// initialize Google's Geocoder when the script is loaded.

var geocoder = new google.maps.Geocoder();

/**
 * Test if the object is a String and return a boolean.
 */
function isString( obj ) {

  return ( typeof obj === "string" ) ? true : false;
}

/**
 * Display a message to the user via a popup dialog.
 */
function showPopup( message ) {

  $("#popupmessage h3").text( message );
  $("#popupmessage").popup("open");
}

/**
 * Match facility by type. Return true if the type is 0 for all types, the entire division or an
 * exact match.
 */
function isTypeMatch( type, facility ) {

  if ( (type === "0") || (type === facility.division) || (type === facility.type) ) {
    return true;
  }
}

/**
 * Determine if a facility is within range of the user-entered zip code.
 */
function isWithinRange( origin, dest, range ) {

  // calculate the distance between coordinates of user-entered zip and coordinates of facility.
  // multiply the result by 0.000621371192 to convert from meters to miles.

  var distance = google.maps.geometry.spherical.computeDistanceBetween( origin, dest ) * 0.000621371192;

  if ( distance <= range ) {

    return true;
  }
}

/**
 * Get the coordinates of the user-entered zip code. Wait until the response comes back from
 * Google's Geocode web service before executing the callback.
 */
function geocodeZip( country, zip, callback ) {

  var distance = 0;

  // Call Google's Geocode service to get coordinates. If response is ok, execute callback.

  geocoder.geocode({ 'address': zip + " " + country }, function ( results, status ) {

    if ( status === google.maps.GeocoderStatus.OK ) {

      callback( results[0].geometry.location );
    }
  });
}

/**
 * Display the search results in a list view separated by division. Begin by sorting the results, then
 * insert the list items, and finally insert the list dividers.
 */
function displayFacilities( results ) {

  var output = [];

  // display a message if there are no search results

  if ( !results.length ) {

    loading("hide");
    showPopup("No locations found for the given search criteria.");
    return;
  }

  // sort the results by division and facility name

  results.sort(function( a, b ) {

    if ( (b.division + a.title) < (a.division + b.title) ) {
      return - 1;
    } 
    else {
      return ( (b.division + a.title) > (a.division + b.title) ) ? 1 : 0;
    }
  });

  // insert a list item for each facility in the results
  if (usingScreenReader) {
    $.each( results, function( i, facility ) {
      output.push("<li division='" + facility.division + "' style=padding:0;border:0 data-inset=false>");
      output.push( facility.data );
      output.push("</li>");
    });
  } else {
    $.each( results, function( i, facility ) {
      output.push("<li division='" + facility.division + "' style=padding:0;border:0 data-role=collapsible data-inset=false data-collapsed-icon=arrow-r data-expanded-icon=arrow-d>");
      output.push("<h6 style=margin:0>" + facility.title + "</h6>");
      output.push( facility.data );
      output.push("</li>");
    });
  }
  
  

  // append the list items to the unordered list

  $("#facility-results").append( output.join("") ).trigger("create");

  loading("hide");
  
  $.mobile.changePage( $("#facility-details") );

  // insert the list dividers by division
  
  
  $("#facility-results").listview(
    {
      autodividers: true,
      autodividersSelector: function ( li ) {

        return li.attr("division");
      }
    }
  ).listview("refresh");
}

/**
 * Search facilities by type and zip code within a range of miles. The zip code is dependent
 * on the country and range parameters. First, get the coordinates for the user-entered zip
 * code. Next, verify that the facility type and zip code fields are valid strings. Then,
 * filter by type and finally by zip code within range.
 */
function searchByTypeAndZip( country, type, zip, range ) {

  var results = [],
    distance = 0;

  // start the spinner

  loading( "show", "Loading Search Results..." );

  // get the coordinates of the zip code

  geocodeZip( country, zip, function( origin ) {

    // store the results of filtering by type and zip code

    results = markers.filter(function( facility ) {

      // verify type and zip are valid

      if ( isString( facility.type ) && isString( facility.zip ) ) {

        // filter by type

        if ( isTypeMatch( type, facility ) ) {

          // return true if zip is an exact match, otherwise test if within range.

          if ( facility.zip.substr( 0, 5 ) === zip ) {

            return true;
          }
          else {
            return isWithinRange( origin, facility.position, range);
          }
        }
      }
    });

    // display the search results

    displayFacilities( results );
  });
}

/**
 * Validate the input fields on the search form when the user taps the "Search" button.
 * Verify that the zip code conforms to the format based on country. Display an message
 * to the user if validation fails. Otherwise, continue to search by type and zip code.
 */
function validateSearchForm() {

  var country = $("#facility-country").val(),
    type = $("#facility-type").val(),
    zip = $("#zip-code").val(),
    range = Number( $("#facility-nearest").val() ),
    rUsaZip = /^\d{5}$/,
    rPhilipinesZip = /^\d{4}$/;

  // validate zip code using regular expressions based on country code.

  if ( country === "PH" ) {

    if ( !rPhilipinesZip.test( $.trim( zip ) ) ) {

      showPopup("Please enter a four-digit zip code.");
      return;
    }
  }
  else if ( !rUsaZip.test( $.trim( zip ) ) ) {

    showPopup("Please enter a five-digit zip code.");
    return;
  }

  // search by type and zip code within range

  searchByTypeAndZip( country, type, zip, range );
}

/**
 * Filter facilities based on the property name. This function is invoked when searching by
 * name and state.
 */
function filterFacilities( searchParam, propertyName ) {

  // store the results of filtering by property name

  var results = markers.filter(function( facility ) {

    if ( searchParam === facility[propertyName] ) {
      return true;
    }
  });

  // display the search results

  displayFacilities( results );
}

/**
 * Search facilities by state code.
 */
function searchByState( stateCode ) {

  // start the spinner

  loading( "show", "Loading Search Results..." );

  // setTimeout wraps the call to filterFacilities so the loading spinner gets displayed

  setTimeout(function() {

    filterFacilities( stateCode, "state" );
  }, 0 );
}

/**
 * Set the active tab on the search form.
 */
function setTab( tab ) {

  // hide all tabs and then show selected tab

  $("div[name^=searchTab]").hide();
  $("div[name^=searchTab]").eq( tab ).show();
}

/**
 * Set the tab bar on the search form.
 */
function setTabBar() {
  
  var i;

  // iterate through each tab and set them to active/hidden

  for ( i = 0; i < 3; i++ ) {

    if ( $("div[name=searchTab" + i + "]").is(":hidden") ) {

      $("a[name=tab" + i + "]").removeClass("ui-btn-active");
    }
    else {
      $("a[name=tab" + i + "]").addClass("ui-btn-active");
    }
  }
}

/**
 * Initialize the search form. First, get the list of facility names. Then, load and display a list of potential
 * matches based on user-entered input. Finally, load the facility types by division.
 */
function initializeSearchForm() {

  var facilityNames = [],
    output = [],
    type = [],
    division = "";

  // get the list of facility names

  facilityNames = markers.map(function( facility ) {

    return facility.title;
  });

  // populate the list of potential name matches

  $("#facility-name").on( "listviewbeforefilter", function ( e, data ) {

    var $ul = $( this ),
      $input = $( data.input ),
      value = $input.val(),
      html = "",
      searchResults = [];

    $ul.html("");

    // begin displaying the list of potential matches when the user enters three or more characters

    if ( value && (value.length > 2) ) {

      $ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>");
      $ul.listview("refresh");

      // use jQuery UI autocomplete to find name matches

      searchResults = $.ui.autocomplete.filter( facilityNames, $input.val() );

      // limit the list of matches to five and insert the list items

      $.each( searchResults.slice( 0, 5 ), function ( i, val ) {

        html += "<li><a href='javascript:filterFacilities(\"" + val + "\", \"title\");'>" + val + "</a></li>";
      });

      // display the potential matches

      $ul.html( html );
      $ul.listview("refresh");
      $ul.trigger("updatelayout");
    }
  });

  // iterate through each facility to build the list of divisions and types.
  // this assumes the markers array is already sorted by division and type.
  $.each( markers, function( i, facility ) {

    // reset the list of types if a new division is encountered

    if ( facility.division !== division ) {

      type = [];
      division = facility.division;
      output.push("<option value='" + division + "'>" + division + "</option>");
    }

    // if the type is valid and has not already been encountered, add it to the list

    if ( (isString( facility.type )) && (type.indexOf( facility.type ) === -1) ) {

      type.push( facility.type );
      output.push("<option value='" + facility.type + "'>-- " + facility.type + "</option>");
    }
  });

  $("#facility-type").append( output.join("") ).selectmenu( "refresh", true );
}

/******************************************************************
EVENT BINDINGS FOR THE PAGE.
******************************************************************/

// initialize the search form on pageinit.

$( document ).on( "pageinit", "#facility-search", initializeSearchForm );


// empty the search results list on transition back to search form.

$( document ).on( "pagebeforehide", "#facility-details", function() {

  $("#facility-results").empty();
});


// set the tab bar at the top of the search form.

$( document ).on( "pageshow", "#facility-search", setTabBar );