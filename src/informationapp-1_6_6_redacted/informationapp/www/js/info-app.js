/**
 * @namespace InformationApp
 * @desc Main code for the Information App
 * The code performs the following: 
 * <ul>
 *   <li>Setting event handler code on key events</li>
 *   <li>Initialize Information App domains</li>
 *   <li>Initialize Information App HTML</li>
 *   <li>Runtime utilities, like playing videos</li>
 * </ul> 
 * 
 * Static Methods:
 * <ul>
 *   <li>{@link InformationApp.onDeviceReady|onDeviceReady}</li>
 *   <li>{@link InformationApp.browse|browse}</li>
 *   <li>{@link InformationApp.playVideo|playVideo}</li>
 *   <li>{@link InformationApp.sendText|sendText}</li>
 *   <li>{@link InformationApp.sortJsonArrayByProperty|sortJsonArrayByProperty}</li>
 *   <li>{@link InformationApp.setUpContentSearch|setUpContentSearch}</li>
 *   <li>{@link InformationApp.kickOff|kickOff}</li>
 * </ul>
*/

/**
 * @file Information App code for index.html.
 * This file contains the initialization and utility code for the Information App.<br>
 * Click {@link InformationApp|here} for more details.
*/

/**
 * Global variable to an instance of the InfoAppResources class
 * @memberof InformationApp
 */
var iaResources;
var subNav = "";	

/**
 * Utility function used open a url in separate browser window on the mobile device.
 * User is returned to the Information App after done viewing web site of url.
 * @param {string} url - web site url
 * @memberof InformationApp
 */
function browse( url ) {
  if ( (url.search(/(\.pdf$|.PDF$)/) > -1 ) && (typeof device != "undefined") && (typeof device.platform === "string") && (device.platform.toLowerCase()=="android") ) {
      var ref = window.open( encodeURI( "http://docs.google.com/viewer?url=" + url ), "_blank", "location=yes,closebuttoncaption=Exit" );
  } else {
    var ref = window.open( encodeURI( url ), "_blank", "location=yes,closebuttoncaption=Exit" );
  }
  
  //handle loadErrors from inaccessible services
  ref.addEventListener('loaderror',function(event){
      alert('Unable to load the requested resource.  We apologize for the inconvenience.  Error code ' + event.code);
      ref.close();
  });

}

/**
 * Utility function used to play a video in a separate window on the mobile device.
 * User is returned to the Information App after done viewing video.
 * @param {string} url - index of video resource that is used to look up the url of the video
 * @memberof InformationApp
 */
function playVideo( url ) {

  if ( typeof device != "undefined" && (typeof device.platform === "string") && device.platform.toLowerCase()=="android" ) {
    cordova.plugins.videoPlayer.play( "file:///android_asset/www/" + url );
  } else {
    var ref = window.open( encodeURI( url ), "_blank", "location=no" );
  }
}

/**
 * Utility function used to allow user to send a sms text.<br>
 * Note: This utility checks if device is an iOS device.<br>
 * If it is an iOS device, the SMS Composer plugin for Cordova is utilized.
 * @param {string} smsNum - short sms text number or a telephone number where text message will be sent
 * @memberof InformationApp
 */
function sendText( smsNum ) {
  
  if ( typeof device != "undefined" && (typeof device.platform === "string") && device.platform.toLowerCase()=="ios" ) {
    var val = {"phones":[smsNum]};
    window.plugins.smsComposer.showComposer( val, function(status){});
  } else {
    window.location.href = "sms:" + smsNum;
  }
  
}

/**
 * Utility function used to email a link
 * @param {string} url - link to send
 * @param {string} sub - subject of email
 * @memberof InformationApp
 */

function sendEmail(url,sub) {
  
   try {
    
    //check if they have email capability first.
    window.plugin.email.isServiceAvailable(function(isAvailable) {
      
      if (isAvailable) {
        
        //arguments for email composer is a simple object 
        var args = {
          isHtml : true,          
        };
        args["subject"] = sub;
        args["body"] = "<a href='" + url + "'>" + url + "</a>";
        window.plugin.email.open(args)
      } else {
        alert("Email Service is Unavailable.");
      }
    });

  } catch (err) {

    console.log("ERROR: " + err.description, "composeEmail" );

  }
}


/**
 * Utility function that sorts array by a property value.
 * @param {array} objArray - array to sort
 * @param {string} prop - name of property to sort
 * @param {number} [direction=1] - direction of sort [ 1 - ascending | -1 desending]
 * @memberof InformationApp
 */
function sortJsonArrayByProperty( objArray, prop, direction ) {
    if ( arguments.length < 2 )
        throw new Error( "sortJsonArrayByProp requires 2 arguments" );
        
    //Default to ascending
    var direct = arguments.length > 2 ? arguments[ 2 ] : 1;

    if ( objArray && objArray.constructor === Array ) {
        var propPath = ( prop.constructor === Array ) ? prop : prop.split(".");
        objArray.sort(function( a, b ) {
            for ( var p in propPath ) {
                if ( a[ propPath[p] ] && b[ propPath[p] ] ) {
                    a = a[ propPath[p] ];
                    b = b[ propPath[p] ];
                }
            }
            // convert numeric strings to integers
            a = a.match( /^\d+$/ ) ? +a : a;
            b = b.match( /^\d+$/ ) ? +b : b;
            return ( (a < b) ? -1 * direct : ((a > b) ? 1 * direct : 0) );
        });
    }
}
/**
 * Sets up the framework that allows the user to search the registered domain content for the Information App.<br>
 * Note: Only the Women Veterans domain content is currently defined and registered.
 * @memberof InformationApp
 */
function setUpContentSearch() {
  $("#ia-content-search").on( "listviewbeforefilter", function( event, data ) {
    var $ul = $( this ),
      $input = $( data.input ),
      value = $input.val();
      
      $ul.html("");
      
    if ( value && value.length > 2 ) {
      var items = [],
        html = "",
        selectedDomains = [],
        domain;

      $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
      $ul.listview("refresh");

      // only 1 domain, so search w/o user selection until more than 1 ; "tester" is used to test > 1
      selectedDomains.push("wv");
      //selectedDomains.push("tester");
            
      // get keyword matches for selected domains
      for ( domain in iaResources.domains ) {
        if ( selectedDomains.indexOf( domain ) > -1 ) {
          // expects an array of objects { topic, id, url, action, domain }
          items = items.concat( iaResources.domains[ domain ].getKeywordMatches( value ) );
        }
      }
            
      // sort by topic
      sortJsonArrayByProperty( items, "topic" );

      // build html for insertion into listview
      var href,
        item;
      for ( idx = 0; idx < items.length; idx++ ) {
        item = items[ idx ]; 

        if ( item["action"] ) {
          href="javascript:" + item["action"];
        } else {
            href = ( item["url"] ) ? item["url"] : "#" + item["id"];
        }
        /* \" used for inner quotes to be consistent with pages.handlebars and 
           that 'action' in info-app.json uses single quotes */
        html += "<li><a href=\"" + href + "\" style=\"white-space:normal;\"";
        html += ( item["url"] ) ? " data-ajax=\"false\"" : "";
        html += ">" + item["topic"] ;
        // if more than 1 domains searched, show domain in link text
        html += ( selectedDomains.length > 1 ) ? " [" + item["domain"] + "]" : "";
        html += "</a></li>";
      };
      
      //update the count
      if (items.length==0) {
        $("#matchCount").html("0 matches");
      } else if (items.length==1) {
        $("#matchCount").html("1 match");
      } else {
        $("#matchCount").html(items.length + " matches")
      }

      // list is already filtered; do not block any of the list items
      $("#ia-content-search").listview("option", "filterCallback", function( itemText, filterText ) {
        return false;
      });

      $ul.html(html);
      $ul.listview("refresh");
      $ul.trigger("updatelayout");
      
    } else {
      $("#matchCount").html("0 matches");
    }
  }); //ia-content-search
}; // setUpContentSearch


 /**
 * Information App kickoff function
 * @function
 * @name kickOff
 * @desc At the end of the file, the kickoff code performs the following:
 * <ul>
 *   <li>Creates InfoAppResources instance</li>
 *   <li>Creates WomenVeterans domain instance and registers instance with InfoAppResources instance</li>
 *   <li>Creates jquery mobile HTML and appends to 'body' of document</li>
 *   <li>Sets up content search framework</li>
 * </ul>
 * @memberof InformationApp
 */
function onDeviceReady() {
  
  //TODO:  Several of these items should only be done once, when the app starts up.  Instead they're done each time a user navigates between
  //map.html & index.html...
  
  setTimeout(function() {
        if (typeof window.cordova != "undefined") navigator.splashscreen.hide();
    }, 2000);
    
  // create InfoAppResources object
  iaResources = new InfoAppResources();
  
  // register domains with iaResources (currently only Women Veterans)
  if ( !iaResources.registerDomain(new WomenVeterans(iaResources.getJsonData( "wvContent" ))) ) {
    console.log( "Women Veterans domain failed to register" ); 
  }
  
  // build and apply HTML
  $("body").append( iaResources.domains["wv"].getHtmlContent() );
  
  //for navigating to a subpage coming from an external page.
  //see the window.load function for more detail.
  if (subNav!=""){
    window.location.hash = subNav;
  } else {
    window.location.hash = 'ia';
  }
  
  $.mobile.initializePage();
  
  // set up content search framework
  setUpContentSearch();

  //if a screen reader is in use, remove collapsible panels as they cause navigation issues.
  if (typeof window.cordova !="undefined" && typeof window.MobileAccessibility !="undefined") {
    window.MobileAccessibility.isScreenReaderRunning(function(isRunning) {
      if (isRunning==true){
         $("div[data-role=collapsible]").attr("data-role","none")
         $("div[data-role=collapsible-set]").attr("data-role","none");
      } 
    });
  }
  
}

//on load, check if we were sent a hash.  If so, this means we're meant to navigate to a sub-page.
//we do this by setting the 'subNav' variable, which gets checked once JQM has fully loaded everything on
//pagebeforeshow.  At that point, if it is non-empty, JQM will navigate to the subpage.
$(window).load(function() {
  
  if (document.URL.indexOf("ia-wv-crisis-manager")>0 && document.URL.indexOf("ia-wv-crisis-manager-")<0) {
    subNav = "ia-wv-crisis-manager";
  } else {
    if (document.URL.indexOf("ia-wv-crisis")>0 && document.URL.indexOf("ia-wv-crisis-")<0) {
      subNav = "ia-wv-crisis";
    } else {
      if (document.URL.indexOf("ia-wv")>0 && document.URL.indexOf("ia-wv-")<0) {
        subNav = "ia-wv";
      } 
    }
  }
});

if (typeof window.cordova != "undefined") {
  document.addEventListener( "deviceready", onDeviceReady, false);
} else {
  $(document).ready( function() {
    onDeviceReady();
    });
}
