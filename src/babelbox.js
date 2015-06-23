( function( root, babelbox ) {
	console.log( babelbox )
	if( typeof define === 'function' && define.amd ) {
		define( function() {
			return babelbox;
		} );
	} else if( typeof exports === 'object' ) {
		module.exports = babelbox;
	} else {
		root.babelbox = babelbox;
	}
}( this, function() {

	var EVENTS = {
		DUPLICATE_TOKEN: 'DUPLICATE_TOKEN',
		NAMESPACE_ALSO_VALUE: 'NAMESPACE_ALSO_VALUE'
	};

	var defaultConfig = {
		SPLIT_CHAR: '.',
		COOKIE_NAME: 'babelbox-locale',
		URL_PARAM: 'locale'
	};

	var config = defaultConfig;
	var tokenStore = {};
	var locale;
	var emitter = null;

	function BabelBox( token, mappings ) {
		var translateToken = getTokenValue( token );
		if( translateToken != null ) {
			for( var key in mappings ) {
				translateToken = translateToken.replace( "[[" + key + "]]", mappings[ key ] );
			}
		}
		return translateToken;
	}

	BabelBox.setConfig = function( config ) {
		var mergedConfig;
		for( var key in defaultConfig ) {
			mergedConfig[ key ] = config[ key ] || defaultConfig[ key ];
		}
		config = mergedConfig;
	};

	BabelBox.setEmitter = function( emitr ) {
		emitter = emitr;
	};

	BabelBox.reset = function() {
		config = defaultConfig;
		locale = BabelBox.getLocale();
		tokenStore = {};
		emitter = null;
	};

	BabelBox.getLocale = function() {
		var locale = readUrl( config.URL_PARAM );
		locale = locale ? locale : readCookie( config.COOKIE_NAME );
		locale = locale ? locale : window.navigator.userLanguage || window.navigator.language;
		return locale.split( '-' );
	};

	BabelBox.setLocale = function( newLocale ) {
		writeCookie( config.COOKIE_NAME, newLocale.join( '-' ) );
		locale = newLocale;
	};

	BabelBox.getTokens = function() {
		return tokenStore;
	};

	BabelBox.addTokens = function( tokens ) {
		setTokenValues( tokens, false );
	};

	BabelBox.addExtendedTokens = function( tokens ) {
		setTokenValues( tokens, true );
	};

	BabelBox.blob = function( text ) {
		var message;
		var matches = text.match( /(\[\[[^\]]+\]\])/g );
		for( var i = 0; i < matches.length; i++ ) {
			message = getTokenValue( matches[ i ].substring( 2, matches[ i ].length - 2 ) );
			text = text.replace( matches[ i ], message );
		}
		return text;
	};


	function getTokenValue( token ) {
		return getObjectCrawl( token.split( config.SPLIT_CHAR ), null, tokenStore, 0 );
	};

	function setTokenValues( tokens, overwrite ) {
		for( var token in tokens ) {
			setObjectCrawl( token.split( config.SPLIT_CHAR ), tokens[ token ], tokenStore, 0, overwrite, emitter, config.SPLIT_CHAR );
		}
	};

	function setObjectCrawl( parts, translation, tokens, iteration, overwrite, emitter, SPLIT_CHAR ) {
		var part = parts[ iteration ];
		if( iteration < parts.length - 1 ) {
			if( !tokens[ part ] ) {
				tokens[ part ] = {};
			} else if( typeof tokens[ part ] === 'string' ) {
				if( emitter ) {
					emitter.emit( EVENTS.NAMESPACE_ALSO_VALUE, token );
				} else {
					throw new Error( 'Token is already declared as a value: "' + token + '"' );
				}
			}
			return setObjectCrawl( parts, translation, tokens[ part ], iteration + 1, overwrite, emitter, SPLIT_CHAR );
		} else {
			if( tokens[ part ] && !overwrite ) {
				if( emitter ) {
					emitter.emit( EVENTS.DUPLICATE_TOKEN, parts.join( SPLIT_CHAR ) );
				} else {
					throw new Error( 'Duplicate token attempted to be added: "' + parts.join( SPLIT_CHAR ) + '"' );
				}
			}
			if( typeof translation !== 'string' ) {
				tokens[ part ] = deepmerge( tokenStore[ part ] || {}, translation, overwrite, parts.join( SPLIT_CHAR ) );
			} else {
				tokens[ part ] = translation;
			}

		}
	};

	function getObjectCrawl( parts, translation, tokens, iteration ) {
		var lastpart = parts[ parts.length - 1 ];
		var part = parts[ iteration ];

		if( tokens[ lastpart ] ) {
			translation = tokens[ lastpart ]
		}
		if( iteration < parts.length - 1 && tokens[ part ] ) {
			return getObjectCrawl( parts, translation, tokens[ part ], iteration + 1 );
		} else {
			return translation || null;
		}
	};

	function deepmerge( target, src, overwrite, prefix ) {
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
	};

	function writeCookie( key, locale ) {
		document.cookie = key + "=" + locale + "; path=/";
	};

	function readUrl( key ) {
		var result = null;
		if( window.location.href ) {
			result = new RegExp( '[?&]?' + key + '=([^&]*)' ).exec( window.location.href );
			result = result ? result[ 1 ] : null;
		}
		return result;
	};

	return BabelBox;
}() ) );
