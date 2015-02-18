/**
 * @file Catalogs and indexes all Information App resources.<br>
 * Types of Resources:
 * <ul>
 *    <li>Images</li>
 *    <li>Media (like videos)</li>
 *    <li>JSON domain content</li>
 *    <li>Handlebars templates</li>
 * </ul>
 * Utility functions are also defined related to each resource type, like functions to access and retrieve each resource by type.
 *
 * Besides production use, the unit test framework also utilizes this file. Unit testing validates both utility functions and accessibility of all the resources.
*/

// defines InfoAppResources class
/**
 * Creates a new instance of the InfoAppResources class
 * @class InfoAppResources
 * @classdesc Defines InfoAppResources class to be utilized by Information App.<br>
 * Types of Resources:
 * <ul>
 *    <li>Images</li>
 *    <li>Media (like videos)</li>
 *    <li>JSON domain content</li>
 *    <li>Handlebars templates</li>
 * </ul>

 * The class supplies methods used by the Information App to access these resources. <br>
  * Methods:
  * <ul>
  *   <li>{@link InfoAppResources#registerDomain|registerDomain}</li>
  *   <li>{@link InfoAppResources#getHbTemplate|getHbTemplate}</li>
  *   <li>{@link InfoAppResources#getJsonData|getJsonData}</li>
  *   <li>{@link InfoAppResources#getImageUrl|getImageUrl}</li>
  *   <li>{@link InfoAppResources#getJsonUrl|getJsonUrl}</li>
  *   <li>{@link InfoAppResources#getVideoUrl|getVideoUrl}</li>
  *   <li>{@link InfoAppResources#testFilesExistent|testFilesExistent}</li>
  * </ul>
  *  @constructor
  */
function InfoAppResources() {
   /**
   * Reference to new instance used by private functions and privileged methods
   * @private
   */
  var that = this,
   /**
   * path prefix for resource folders (checks if running karma tests and set path prefix accordingly)
   * @private
   */
    _pathPrefix = ( typeof __karma__ !== "undefined" ) ? "base/" : "",
   /**
   * JSON object containing a property for each type of Information App resource.<br>
   * Properties:
   * <ul>
   *    <li>json</li>
   *    <li>images</li>
   *    <li>media</li>
   *    <li>hb</li>
   * </ul>
   * Each of the above properties contains properties for each specific resource. For example, the 'images' property contains a property called 'facilityImage' that equals the url for the facility image that appears on the home screen of the Information App.
   * @private
   */
    _files = {

      json : {
        // json used for Women Veterans content (BN6)
        wvContent : _pathPrefix + "content/info-app.json",
        facilities : _pathPrefix + "content/facilities.json"
      },

      images : {
        // images used on in the info app
		aboutUsImage : _pathPrefix + "images/aboutUs3.png",
        facilityImage : _pathPrefix + "images/facilityLocator.png",
        womanVetImage : _pathPrefix + "images/womenVeterans.png",
        benefitsImage : _pathPrefix + "images/benefits.png",
        rightPlaceImage : _pathPrefix + "images/rightPlace.png",
        newPatientImage : _pathPrefix + "images/newPatient.png",
        next : _pathPrefix + "images/next.png",
        prev : _pathPrefix + "images/prev.png",
        directions : _pathPrefix + "images/directionsIcon.png",
        share : _pathPrefix + "images/shareIcon.png",
        website : _pathPrefix + "images/websiteIcon.png",
        blue_dot : _pathPrefix + "images/blue-dot.png",
        gray_dot : _pathPrefix + "images/gray-dot.png",
        green_dot : _pathPrefix + "images/green-dot.png",
        orange_dot : _pathPrefix + "images/orange-dot.png",
        purple_dot : _pathPrefix + "images/purple-dot.png",
        red_dot : _pathPrefix + "images/red-dot.png",
        yellow_dot : _pathPrefix + "images/yellow-dot.png",
        prosthethic_leg : _pathPrefix + "images/prosthethic_leg.png",
        prosthethic_foot: _pathPrefix + "images/prosthethic_foot.png",
        prosthethic_breast : _pathPrefix + "images/prosthethic_breast.png"
      },

      media : {
        // media used on in the info app
        patientWelcomeVideo : _pathPrefix + "media/Patient-Welcome.mp4",
        rightPlaceVideo : _pathPrefix + "media/Right-Place.mp4"
      },

      hb : {
        // handlebars templates used to build html content for Women Veterans (BN6)
        main : _pathPrefix + "templates/main.handlebars",
        page : _pathPrefix + "templates/page.handlebars",
        facility : _pathPrefix + "templates/facility.handlebars"
      }
  };
  /**
   * @desc JSON object that contains the registered Information App domain instances
   */
  this.domains = {
  };

  /**
   * @method
   * @desc Registers a domain instance
   * @param {object} instance - instance of an Information App domain class
   * @returns {boolean} - was registration successful?
   */
  this.registerDomain = function( instance ) {
    if ( typeof instance === "object" && typeof instance.indexText === "string" ) {
      that.domains[ instance.indexText ] = instance;
      console.log( instance.displayName + " domain successfully registered" );
      return true;
    }
    return false;
  };

  /**
   * @method
   * @desc Retrieves a Handlebars template resource
   * @param {string} index - index of Handlebars template
   * @returns {string} - Handlebars template value
   */
  this.getHbTemplate = function( index ) {
    var templateData,
      url = _files.hb[ index ];

    if ( url === undefined ) {
     return templateData;
    }

     $.ajax({
      url : url,
      success : function( data ) {
        templateData = data;
      },
      async : false
    });

    return templateData;
  };

  /**
   * @method
   * @desc Retrieves a JSON file resource
   * @param {string} index - index of the JSON file
   * @returns {object} - JSON object
   */
  this.getJsonData = function( index ) {
    var jsonData,
      url = this.getJsonUrl( index );

    if ( url === undefined ) {
      return jsonData;
    }

    $.ajax({
      url : url,
      success : function( data ) {
        jsonData = data;
      },
      dataType : "json",
      async : false
    });

    return jsonData;
  };

  /**
   * @method
   * @desc Retrieves url of a image resource
   * @param {string} index - index of image resource
   * @returns {string} - url of image file
   */
  this.getImageUrl = function( index ) {
    return _files.images[ index ];
	};

  /**
   * @method
   * @desc Retrieves url of a JSON resource
   * @param {string} index - index of JSON resource
   * @returns {string} - url of JSON file
   */
	this.getJsonUrl = function( index ) {
    return _files.json[ index ];
	};

  /**
   * @method
   * @desc Retrieves url of a video resource
   * @param {string} index - index of video resource
   * @returns {string} - url of video file
   */
	this.getVideoUrl = function( index ) {
    return _files.media[ index ];
	};

  // method needed for unit test because "_files" is private
  /**
   * @method
   * @desc Method used by unit test frame to access and test the properties of the private variable {@link InfoAppResources~_files|_files}.
   * @param {function} addTruthyTest - truthy unit test function
   * @param {function} addFalsyTest - falsy unit test function
   */
  this.testFilesExistent = function( addTruthyTest, addFalsyTest ) {
    var falsyTested = false,
      category;

    for ( category in _files ) {
      var categoryList = _files[ category ],
        type;

      for ( type in categoryList ) {
        addTruthyTest(categoryList[ type ], category, type);
        // just do 1 falsy test
        if ( falsyTested === false ) {
          falsyTested = true;
          addFalsyTest( categoryList[ type ], category, type );
        }
      } // for type
    } // for category
  };

}; // InfoAppResources class definition

