( function( root, factory ) {
	var babelbox = new( factory() );
	if( typeof define === 'function' && define.amd ) {
		define( babelbox );
	} else if( typeof exports === 'object' ) {
		module.exports = babelbox;
	} else {
		root.babelbox = babelbox;
	}
}( this, function() {

	var EVENTS = {
		DUPLICATE_TOKEN: 'DUPLICATE_TOKEN'
	};

	var defaultConfig = {
		SPLIT_CHAR: '.',
		COOKIE_NAME: 'babelbox-locale',
		URL_PARAM: 'locale'
	}

	function babelbox() {
		this.emitter = null;
		this.reset();
	}

	babelbox.prototype.setConfig = function( config ) {
		this.config = deepmerge( this.config, config, true );
	};

	babelbox.prototype.setEmitter = function( emitter ) {
		this.emitter = emitter;
	};

	babelbox.prototype.reset = function() {
		this.config = defaultConfig;
		this.locale = this.getLocale();
		this.tokens = {};
		this.emitter = null;
	};

	babelbox.prototype.getLocale = function() {
		var locale = readUrl( this.config.URL_PARAM );
		locale = locale ? locale : readCookie( this.config.COOKIE_NAME );
		locale = locale ? locale : window.navigator.userLanguage || window.navigator.language;

		return locale.split( '-' );
	};

	babelbox.prototype.setLocale = function( locale ) {
		writeCookie( this.config.COOKIE_NAME, locale );
		this.locale = locale;
	};

	babelbox.prototype.addTokens = function( tokens ) {
		this.tokens = deepmerge( this.tokens, tokens, false, this.emitter );
	};

	babelbox.prototype.addExtendedTokens = function( tokens ) {
		this.tokens = deepmerge( this.tokens, tokens, true );
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
		var translateToken = getTokenValue( token, this.tokens, this.config.SPLIT_CHAR );
		if( translateToken != null ) {
			for( var key in mappings ) {
				translateToken = translateToken.replace( "{{" + key + "}}", mappings[ key ] );
			}
		}
		return translateToken;
	};

	function getTokenValue( token, tokens, splitChar ) {
		return objectCrawl( token.split( splitChar ), tokens, "", 0 );
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

	function deepmerge( target, src, overwrite, emitter, prefix ) {
		var token;
		var dst = {};
		prefix = prefix ? prefix + '.' : '';
		for( var key in target ) {
			dst[ key ] = target[ key ];
		}
		for( var key in src ) {
			token = prefix + key;
			if( !overwrite && typeof src[ key ] === 'string' && typeof target[ key ] === 'string' ) {
				if( emitter ) {
					emitter.emit( EVENTS.DUPLICATE_TOKEN, token );
				} else {
					throw new Error( "Duplicate token attempted to be added: '" + token + "'" );
				}
			} else if( typeof src[ key ] !== 'object' || !src[ key ] ) {
				dst[ key ] = src[ key ];
			} else if( ( overwrite && typeof src[ key ] === 'string' ) || !target[ key ] ) {
				dst[ key ] = src[ key ];
			} else {
				dst[ key ] = deepmerge( target[ key ], src[ key ], overwrite, emitter, token );
			}
		}
		return dst;
	}

	function readCookie( key ) {
		var result;
		return( result = new RegExp( '(?:^|; )' + encodeURIComponent( key ) + '=([^;]*)' ).exec( document.cookie ) ) ? ( result[ 1 ] ) : null;
	}

	function writeCookie( key, locale ) {
		document.cookie = key + "=" + locale + "; path=/";
	}

	function readUrl( key ) {
		var result = null;
		if( window.location.href ) {
			result = new RegExp( '[?&]?' + key + '=([^&]*)' ).exec( window.location.href );
			result = result ? result[ 1 ] : null;
		}
		return result;
	}

	return babelbox;
} ) );
