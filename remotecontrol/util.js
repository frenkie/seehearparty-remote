var util = {

    extend: function ( target, obj ) {
        for ( var i = 0, keys = Object.keys( obj ), ii = keys.length; i < ii; i++ ) {

            var key = keys[ i ];
            if ( util.hasProperty( target, key ) && obj[ key ] && typeof obj[ key ] === 'object' ) {
                if ( Array.isArray( obj[ key ] ) ) {
                    target[ key ] = target[ key ] || [];
                } else {
                    target[ key ] = target[ key ] || {};
                }
                util.extend( target[ key ], obj[ key ] );
            } else {
                target[ key ] = obj[ key ];
            }
        }
    },

    hasProperty: function ( obj, prop ) {
        return Object.prototype.hasOwnProperty.call( Object( obj ), prop );
    }
};

module.exports = util;