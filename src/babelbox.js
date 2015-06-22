( function( root, factory ) {
	if( typeof define === 'function' && define.amd ) {
		define( factory );
	} else if( typeof exports === 'object' ) {
		module.exports = factory();
	} else {
		root.babelbox = factory();
	}
}( this, function() {

	function babelbox() {
		this.tokens = {};
	}

	babelbox.prototype.addTokens = function( tokens ) {
		this.tokens = deepmerge( this.tokens, tokens );
	};

	function deepmerge( target, src, eventHub ) {
		var dst = {};
		for( var key in target ) {
			dst[ key ] = target[ key ];
		}
		for( var key in src ) {
			if( typeof src[ key ] === 'string' && typeof target[ key ] === 'string' ) {
				throw new Error( "Duplicate token attempted to be added: " + key );
			} else if( typeof src[ key ] !== 'object' || !src[ key ] ) {
				dst[ key ] = src[ key ];
			} else if( !target[ key ] ) {
				dst[ key ] = src[ key ];
			} else {
				dst[ key ] = deepmerge( target[ key ], src[ key ] );
			}
		}
		return dst;
	}

	return babelbox;
} ) );
