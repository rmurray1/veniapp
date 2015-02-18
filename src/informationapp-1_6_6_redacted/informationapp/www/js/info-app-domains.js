/**
 * @file Contains domains classes, like WomenVeterans, utilized by the Information App.
 * 
 * Each domain class defines properties and methods that the Information App requires to render content for the domain and search that same content.
*/

/**
 * Creates a new instance of the WomenVeterans class
 * @class WomenVeterans
 * @classdesc Defines WomenVeterans class to be utilized by Information App. The class supplies methods used to search Women Veterans content and to build jquery mobile HTML for the content compatiable with Information App requirements.<br>
  * Methods:
  * <ul>
  *  <li>{@link WomenVeterans#getKeywordMatches|getKeywordMatches}</li>
  *  <li>{@link WomenVeterans#getHtmlContent|getHtmlContent}</li>
  * </ul>
  *  @constructor
  * 
  * @param {object} jsonContent - Women Veterans content in JSON format
  * @param {string} [indexText=wv] - text used as index (lookup value) when {@linkcode InfoAppResources#registerDomain|registering} with an instance of InfoAppResources
 */
function WomenVeterans( jsonContent, indexText ) {
   /**
   * Reference to new instance used by private functions and privileged methods
   * @private
   */
    var that = this,
   /**
   * Women Veterans content used by private functions and privileged methods
   * @private
   */
    _content = jsonContent;
    
  /**
   * @desc String value used to quickly access the domain in an instsance of the InfoAppResources class
   */
  this.indexText = ( indexText === undefined ) ? "wv" : indexText;
  /**
   * @desc String used when the name of domain is needed for any output
   */
  this.displayName = "Women Veterans";

  /** 
   * @method
   * @desc Searches domain content for keyword (usually user supplied). Search is against word boundaries. In other words, the keyword must start at the start of a word. Returns an array of objects used by the keyword search feature of the Information App.

   * @param {string} keyword - text used to to find matches agains the domain content
   * @returns {array} - array of topics [{topic, id, url, action, domain}]
   */
  this.getKeywordMatches = function( keyword ) {
    var items = [],
      matcher = new RegExp( "\\b" + $.ui.autocomplete.escapeRegex( keyword ), "i" ),
      
      pageSearch = function( page ) {
        var id = page["id"],
          topic = page["title"],
          url = ( page.hasOwnProperty("url") ) ? page["url"] : "";
          action = ( page.hasOwnProperty("action") ) ? page["action"] : "";
          pageContent = ( page.hasOwnProperty("content") ) ? page["content"] : "";

        if ( matcher.test( topic ) || matcher.test( pageContent )) {
          items.push({
            topic : topic,
            id : id,
            url : url,
            action : action,
            domain: that.indexText
          }); // push
        }

        // if pages has pages, call pageSearch for each page in pages
        if ( page.pages != undefined ) {
          var pageIdx;
          for ( pageIdx = 0; pageIdx < page.pages.length; pageIdx++ ) {
            pageSearch( page.pages[pageIdx] );
          }
        }
      }; // pageSearch

    // start search at the top of content
    pageSearch( _content );

    return items;
  };
    
  /** 
   * @method
   * @desc Using Handlebars templating, produces jquery mobile HTML based on the domain content.
   * The produced HTML is compatible for use in the Information App UI.
   * @returns {string} - jquery mobile HTML
   */
  this.getHtmlContent = function() {
    Handlebars.loadTemplate = function() {
      var template;
      
      Handlebars.registerPartial( "page", iaResources.getHbTemplate("page") );
        return Handlebars.compile( iaResources.getHbTemplate("main") );
      };

      Handlebars.registerHelper( "btnActiveStatus", function( btnCategory ) {
        return ( this.category === "string" ) && ( this.category === btnCategory ) ? " class='ui-btn-active ui-state-persist'" : "";
      });

      Handlebars.registerHelper( "getImageUrl", function( imageIndex ) {
        return ( typeof iaResources.getImageUrl( imageIndex ) === "string" ) ? iaResources.getImageUrl(imageIndex) : "";
      });

      Handlebars.registerHelper("isIOS7",function() {
        if (typeof device != "undefined" && device.platform=="iOS" && device.version.substring(0,1)=="7") {
          return "padding-top:20px";
        } else {
          return "margin-top:-1px";
        }
      });

      template = Handlebars.loadTemplate();
      return template( _content );
    };
    
} // WomenVeterans class definition

