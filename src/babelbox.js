/*global define, define.amd */

/**
 * BabelBox is a tiny i18n library that allows multiple different languages to be used inside of a web application.
 * It's main features are:
 * 1) Determining what language is used via a url token, cookie or browser locale.
 * 2) Allowing tokens to be added dynamically through the application lifetime.
 * 3) Using token paths to provide token trees, which provides cascading translations.
 * 4) Translating text to use for client side templating
 *
 * @param token
 * @param mappings
 */
( function( root, babelbox ) {
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
    var locale = null;
	var emitter = null;

    /**
     * Used to translate tokens.
     * For example,
     *
     * Given you provided a translation
     *
     * { booking.confirmation: 'Booking [[id]] confirmed!' }
     *
     * And you call
     *
     * BabelBox( 'booking.confirmation', { id: 12345 } )
     *
     * The result will be
     *
     * Booking 12345 confirmed!
     *
     * @param {string} token The token to translate
     * @param {object} mappings The set values to interpolate
     * @returns
     */
	function BabelBox( token, mappings ) {
		var translateToken = getTokenValue( token );
		if( translateToken !== null ) {
			for( var key in mappings ) {
				translateToken = translateToken.replace( "[[" + key + "]]", mappings[ key ] );
			}
		}
		return translateToken;
	}

    /**
     * Allows you to override default configuration settings.
     * You can configure:
     * SPLIT_CHAR to change how token paths are parsed
     * COOKIE_NAME to change what cookie to use to store the locale
     * URL_PARAM to change what url parameter to use to select a locale
     * @param {{SPLIT_CHAR: string, COOKIE_NAME: string, URL_PARAM: string}} overrideConfig
     */
	BabelBox.setConfig = function( overrideConfig ) {
		var mergedConfig= {};
		for( var key in defaultConfig ) {
			mergedConfig[ key ] = overrideConfig[ key ] || defaultConfig[ key ];
		}
		config = mergedConfig;
	};

    /**
     * Allows you to set an emitter in order to capture errors thrown.
     * An Emitter requires the same API as the node emitter ( although only emit function is used! )
     * @param {Object} emitr
     */
    BabelBox.setEmitter = function( emitr ) {
        if( typeof emitr.emit !== 'function' ) {
            throw new Error( 'Emitter requires an emit function in order to be used' );
        }
		emitter = emitr;
	};

    /**
     * Resets babelbox to it's initial state
     */
	BabelBox.reset = function() {
		config = defaultConfig;
		locale = BabelBox.getLocale();
		tokenStore = {};
		emitter = null;
	};

    /**
     * Returns the locale to be used
     *
     * @returns {Array} An array of locales, allowing sub regions
     */
	BabelBox.getLocale = function() {
		if( isNode() ) {
			if( locale ) {
				return locale;
			} else {
				throw new Error( 'Provide a locale using setLocale' );
			}
		} else {
			var newLocale = readUrl( config.URL_PARAM );
			newLocale = newLocale ? newLocale : readCookie( config.COOKIE_NAME );
			newLocale = newLocale ? newLocale : window.navigator.userLanguage || window.navigator.language;
			return newLocale.split( '-' );
		}	
	};

    /**
     * Set the locale to use, which will be contained within cookie for future references
     *
     * @returns {Array} An array of locales, allowing sub regions
     */
	BabelBox.setLocale = function( newLocale ) {
		if( !isNode() ) {
			writeCookie( config.COOKIE_NAME, newLocale.join( '-' ) );
		}
		locale = newLocale;
	};

    /**
     * Return all tokens
     * @returns {{}}
     */
	BabelBox.getTokens = function() {
		return tokenStore;
	};

    /**
     * Add tokens dynamically to allow new phrases to be added. Phrases that already exist will not
     * be overriden and instead throw an error. This is useful to avoid having duplicated tokens in codebase.
     * @returns {{}}
     */
	BabelBox.addTokens = function( tokens ) {
		setTokenValues( tokens, false );
	};

    /**
     * Add tokens dynamically to allow new phrases to be added. Phrases that already exist will be overriden.
     * This is useful to avoid errors being thrown, but in async conditions can cause problems depending on load order.
     * @returns {{}}
     */
	BabelBox.addExtendedTokens = function( tokens ) {
		setTokenValues( tokens, true );
	};

    /**
     * Translate tokens within a large blob of text. This is useful when loading in html/xml files and
     * translating them on the client side.
     *
     * For example:
     *
     * Given you provided a translation map
     *
     * {
     *  "colors": {
     *      "yellow": "gelb",
     *      "red": "rot",
     *      "blue": "blau"
     *  }
     * }
     *
     * And a string template:
     *  <ul>
     *      <li>[[colors.yellow]]</li>
     *      <li>[[colors.red]]</li>
     *      <li>[[colors.blue]]</li>
     *  <ul>
     *
     * And you call:
     * BabelBox.translate( template )
     *
     * The result will be
     *
     *  <ul>
     *      <li>gelb</li>
     *      <li>rot</li>
     *      <li>blau</li>
     *  <ul>
     *
     * @param text
     * @returns {*}
     */
	BabelBox.translate = function( text ) {
		var message;
		var matches = text.match( /(\[\[[^\]]+\]\])/g );
		if( matches === null ) {
			return text;
		}

		for( var i = 0; i < matches.length; i++ ) {
			message = getTokenValue( matches[ i ].substring( 2, matches[ i ].length - 2 ) );
			text = text.replace( matches[ i ], message );
		}
		return text;
	};

	function getTokenValue( token ) {
		return getObjectCrawl( token.split( config.SPLIT_CHAR ), null, tokenStore, 0 );
	}

	function setTokenValues( tokens, overwrite ) {
		for( var token in tokens ) {
			setObjectCrawl( token.split( config.SPLIT_CHAR ), tokens[ token ], tokenStore, 0, overwrite, emitter, config.SPLIT_CHAR );
		}
	}

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
	}

	function getObjectCrawl( parts, translation, tokens, iteration ) {
		var lastpart = parts[ parts.length - 1 ];
		var part = parts[ iteration ];

		if( tokens[ lastpart ] ) {
			translation = tokens[ lastpart ];
		}
		if( iteration < parts.length - 1 && tokens[ part ] ) {
			return getObjectCrawl( parts, translation, tokens[ part ], iteration + 1 );
		} else {
			return translation || null;
		}
	}

	function deepmerge( target, src, overwrite, prefix ) {
		var token;
		var dst = {};
		var key;
		prefix = prefix ? prefix + '.' : '';
		for( key in target ) {
			dst[ key ] = target[ key ];
		}
		for( key in src ) {
			token = prefix + key;
			if( !overwrite && typeof src[ key ] === 'string' && typeof target[ key ] === 'string' ) {
				if( emitter ) {
					emitter.emit( EVENTS.DUPLICATE_TOKEN, token );
				} else {
					throw new Error( 'Duplicate token attempted to be added: "' + token + '"' );
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

	function isNode() {
		return typeof process !== 'undefined' && process.toString() === '[object process]';
	};

	return BabelBox;
}() ) );
