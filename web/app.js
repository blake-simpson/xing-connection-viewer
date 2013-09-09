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
    userID: "16184731_41d6ee",
    data: {},
    shares: [],
    active: false,

    init: function () {
      $.getJSON(
        "../data/shares_" + this.userID + ".json",
        $.proxy( this.applyData, this )
      );
    },

    applyData: function ( json ) {
      this.data = json;

      this._addContact( {
        name: this.data.me.display_name,
        image: this.data.me.photo_urls.large
      }, "me" );

      this._collectShares();
      this.circle();
      this.bindEvents();
    },

    bindEvents: function () {
      var $name = $( ".name" ),
        $info = $( ".info" );

      $( "body" ).delegate( ".profile:not(.me):not(.locked)", "mouseover", function () {
        var $profile = $( this ),
          data = $profile.data( "profile" );

        $profile.addClass( "active" );

        if ( !App.active ) {
          $name.text( data.display_name );
        }
      });

      $( "body" ).delegate( ".profile:not(.me):not(.locked)", "mouseout", function () {
        $( this ).removeClass( "active" );

        if ( !App.active ) {
          $name.text( "" );
        }
      });

      $( "body" ).delegate( ".profile:not(.me)", "click", function ( event ) {
        var $profile = $( this ),
          data = $profile.data( "profile" ),
          shares = data.shares;

        App.active = data.id;
        $name.text( data.display_name );
        $info.text ( shares.length + " shared contacts" );

        $( ".profile:not(.me)" ).removeClass( "active locked chosen" );
        $profile.addClass( "active locked chosen" );

        shares.forEach( function( id ) {
          $( ".profile[data-id=" + id + "]" ).addClass( "active locked" );
        } );

        event.stopPropagation();
      });

      $( document ).on( "click", function () {
        $( ".profile:not(.me)" ).removeClass( "active locked chosen" );
        $name.text( "" );
        $info.text( "" );
        this.active = false;
      } );
    },

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
        $profile.animate( {
          left: "+=" + left,
          top: "+=" + top
        }, 800, "swing" );

        angle += angleSegments;
      }
    },

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

    _addContact: function ( profile, styles, data ) {
      data = ( typeof data === "undefined" ) ? {} : data;

      var $node = $( "<div class='profile'></div>" ),
        $img = $( "<img>" ).attr( "src", profile.image ).attr( "alt", profile.display_name );

      $node.addClass( styles );
      $node.data( "profile", profile );

      for ( var key in data ) {
        $node.data( key, data[ key ] );
      }

      $node.html( $img );
      $( "body" ).append( $node );
      return $node;
    },

    _getProfile: function ( id ) {
      return this.data.profiles[ id ];
    }
  };
})();
