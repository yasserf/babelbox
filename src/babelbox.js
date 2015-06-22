( function( root, factory ) {
	if( typeof define === 'function' && define.amd ) {
		define( factory );
	} else if( typeof exports === 'object' ) {
		module.exports = factory();
	} else {
		root.babelbox = factory();
	}
}( this, function() {

	var SPLIT_CHAR = '.';

	function babelbox() {
		this.tokens = {};
	}

	babelbox.prototype.addTokens = function( tokens ) {
		this.tokens = deepmerge( this.tokens, tokens );
	};

	babelbox.prototype.blob = function( text ) {
		var message;
		var matches = text.match( /({{[^}]+}})/g );
		for( var i = 0; i < matches.length; i++ ) {
			message = getTokenValue( matches[ i ].substring( 2, matches[ i ].length - 2 ), this.tokens );
			text = text.replace( matches[ i ], message );
		}
		return text;
	};

	babelbox.prototype.translate = function( token, mappings ) {
		var translateToken = getTokenValue( token, this.tokens );
		if( translateToken != null ) {
			for( var key in mappings ) {
				translateToken = translateToken.replace( "{{" + key + "}}", mappings[ key ] );
			}
		}
		return translateToken;
	};

	function getTokenValue( token, tokens ) {
		return objectCrawl( token.split( SPLIT_CHAR ), tokens, "", 0 );
	}

	function objectCrawl( parts, tokens, translation, iteration ) {
		var lastpart = parts[ parts.length - 1 ];
		var part = parts[ iteration ];
		if( tokens[ lastpart ] ) {
			translation = tokens[ lastpart ]
		}
		if( iteration < parts.length - 1 && tokens[ part ] ) {
			return objectCrawl( parts, tokens[ part ], translation, iteration + 1 );
		} else {
			return translation || null;
		}
	}

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
