$(function() {
   // begin app on DOM load
  App.init();

  $( window ).resize( function() {
    $( ".profile:not(.me)" ).remove();
    App.circle();
  } );
});

App = (function() {
  return {
    data: {},
    nodes: {},
    shares: [],
    chosen: false,

    init: function () {
      $.getJSON(
        "../data/shares.json",
        $.proxy( this.applyData, this )
      );
    },

    /**
     * Accept the loaded JSON and setup the inital app state
     */
    applyData: function ( json ) {
      this.data = json;

      // Add the center circle
      this._addContact( {
        name: this.data.me.display_name,
        image: this.data.me.photo_urls.large
      }, "me" );

      this._collectShares();
      this.cacheNodes();
      this.bindEvents();
      this.circle();
    },

    /**
     * Grab static nodes for future use
     */
    cacheNodes: function () {
      this.nodes = {
        $name: $( ".name" ),
        $info: $( ".info" )
      }
    },

    /**
     * Delegate events for interacting with the circle
     */
    bindEvents: function () {
      var notMeSelector = ".profile:not(.me)",
        notLockedSelector = notMeSelector + ":not(.locked)";

      // On Hover over, highlight the circle and show the name
      $( "body" ).delegate( notLockedSelector, "mouseover", function () {
        var $profile = $( this ),
          data = $profile.data( "profile" );

        $profile.addClass( "active" );
        App.updateName( data.display_name );
      });

      // When leaving the circle, return state to normal
      $( "body" ).delegate( notLockedSelector, "mouseout", function () {
        $( this ).removeClass( "active" );
        App.updateName( "" );
      });

      // When clicking on a profile, mark it as chosen and lock shared contacts as active
      $( "body" ).delegate( notMeSelector, "click", function ( event ) {
        var $profile = $( this ),
          data = $profile.data( "profile" ),
          shares = data.shares;

        App.chosen = false;
        App.updateName( data.display_name );
        App.updateInfo( shares.length + " shared contacts" );
        App.chosen = data.id;

        // Clean all profiles in the circle
        $( notMeSelector ).removeClass( "active locked chosen" );
        // Set clicked profile as "chosen"
        $profile.addClass( "active locked chosen" );

        // For all shared contacts, mark as active and lock style
        shares.forEach( function( id ) {
          $( ".profile[data-id=" + id + "]" ).addClass( "active locked" );
        } );

        // Prevent the event bubbling to the generic document handler
        event.stopPropagation();
      });

      // Generic handler that will diable the chosen user and return to original state
      $( document ).on( "click", function () {
        $( ".profile:not(.me)" ).removeClass( "active locked chosen" );
        this.updateName( "" );
        this.updateInfo( "" );
        this.chosen = false;
      }.bind( this ) );
    },

    /**
     * Change the name text value
     */
    updateName: function ( val ) {
      if ( this.chosen ) { return;}
      this.nodes.$name.text( val );
    },

    /**
     * Change the info text value
     */
    updateInfo: function ( val ) {
      this.nodes.$info.text( val );
    },

    /**
     * Define the angle for each profile and animate them in a circle around the "owner" profile
     */
    circle: function () {
      var total = this.shares.length,
        distance = 200 + ( 2 * total ),
        circle = Math.PI,
        angleSegments = 2 / total,
        angle = 0;

      for ( var i = 0; i < total; i++ ) {
        var share = this.shares[ i ],
          left = ~~( Math.sin( angle * circle ) * distance ),
          top = ~~( Math.cos( angle * circle ) * distance );

        $profile = this._addContact( share, "contact", {
          angleLeft: left,
          angleTop: top
        } );

        $profile.attr( "data-id", share.id );
        angle += angleSegments;
      }

      this.animate();
    },

    // Animate all profile segments together
    animate: function () {
      $( ".profile:not(.me)" ).each( function() {
        var $profile = $( this );

        $profile.animate( {
          left: "+=" + $profile.data( "angleLeft" ),
          top: "+=" + $profile.data( "angleTop" )
        }, 800, "swing" );
      } );
    },

    /**
     * Populate `shares` array with profile information and sort it
     */
    _collectShares: function () {
      for ( var id in this.data.shares ) {
        var sharedIDs = this.data.shares[ id ],
          profile = this._getProfile( id ),
          result;

        result = $.extend( true, {}, profile );
        result.image = profile.photo_urls.medium_thumb;
        result.shares = sharedIDs;

        this.shares.push( result );
      }

      this.shares = this.shares.sort( function( a, b ) {
        return a.shares.lenth > b.shares.length ? +1 : -1;
      } );
    },

    /**
     * Create a profile node and append it to the DOM
     */
    _addContact: function ( profile, styles, data ) {
      data = ( typeof data === "undefined" ) ? {} : data;

      var $node = $( "<div class='profile'></div>" ),
        $img = $( "<img>" ).attr( "src", profile.image ).attr( "alt", profile.display_name );

      // Setup callback to fix image height
      $img.on( "load", function () {
        var $img = $( this ),
          $profile = $img.parent();

        $img.css( "margin-top", -( $img.height() - $profile.height() ) / 2 );
      } );


      $node.addClass( styles );
      $node.data( "profile", profile );

      for ( var key in data ) {
        $node.data( key, data[ key ] );
      }

      $node.html( $img );
      $( "body" ).append( $node );

      return $node;
    },

    /**
     * A convenience getter for profiles
     */
    _getProfile: function ( id ) {
      return this.data.profiles[ id ];
    }
  };
})();
