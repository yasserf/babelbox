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
		DUPLICATE_TOKEN: 'DUPLICATE_TOKEN',
		NAMESPACE_ALSO_VALUE: 'NAMESPACE_ALSO_VALUE'
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
		var mergedConfig;
		for( var key in defaultConfig ) {
			mergedConfig[ key ] = config[ key ] || defaultConfig[ key ];
		}
		this.config = mergedConfig;
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
		var locale = this._readUrl( this.config.URL_PARAM );
		locale = locale ? locale : this._readCookie( this.config.COOKIE_NAME );
		locale = locale ? locale : window.navigator.userLanguage || window.navigator.language;

		return locale.split( '-' );
	};

	babelbox.prototype.setLocale = function( locale ) {
		writeCookie( this.config.COOKIE_NAME, locale.join( '-' ) );
		this.locale = locale;
	};

	babelbox.prototype.addTokens = function( tokens ) {
		this._setTokenValues( tokens, false );
	};

	babelbox.prototype.addExtendedTokens = function( tokens ) {
		this._setTokenValues( tokens, true );
	};

	babelbox.prototype.blob = function( text ) {
		var message;
		var matches = text.match( /(\[\[[^\]]+\]\])/g );
		for( var i = 0; i < matches.length; i++ ) {
			message = this._getTokenValue( matches[ i ].substring( 2, matches[ i ].length - 2 ) );
			text = text.replace( matches[ i ], message );
		}
		return text;
	};

	babelbox.prototype.translate = function( token, mappings ) {
		var translateToken = this._getTokenValue( token, this.tokens, this.config.SPLIT_CHAR );
		if( translateToken != null ) {
			for( var key in mappings ) {
				translateToken = translateToken.replace( "[[" + key + "]]", mappings[ key ] );
			}
		}
		return translateToken;
	};

	babelbox.prototype._getTokenValue = function( token ) {
		return this._getObjectCrawl( token.split( this.config.SPLIT_CHAR ), null, this.tokens, 0 );
	};

	babelbox.prototype._setTokenValues = function( tokens, overwrite ) {
		for( var token in tokens ) {
			this._setObjectCrawl( token.split( this.config.SPLIT_CHAR ), tokens[ token ], this.tokens, 0, overwrite );
		}
	};

	babelbox.prototype._setObjectCrawl = function( parts, translation, tokens, iteration, overwrite ) {
		var part = parts[ iteration ];
		if( iteration < parts.length - 1 ) {
			if( !tokens[ part ] ) {
				tokens[ part ] = {};
			} else if( typeof tokens[ part ] === 'string' ) {
				if( this.emitter ) {
					this.emitter.emit( EVENTS.NAMESPACE_ALSO_VALUE, token );
				} else {
					throw new Error( 'Token is already declared as a value: "' + token + '"' );
				}
			}
			return this._setObjectCrawl( parts, translation, tokens[ part ], iteration + 1, overwrite );
		} else {
			if( tokens[ part ] && !overwrite ) {
				if( this.emitter ) {
					this.emitter.emit( EVENTS.DUPLICATE_TOKEN, parts.join( this.config.SPLIT_CHAR ) );
				} else {
					throw new Error( 'Duplicate token attempted to be added: "' + parts.join( this.config.SPLIT_CHAR ) + '"' );
				}
			}
			tokens[ part ] = translation;
		}
	};

	babelbox.prototype._getObjectCrawl = function( parts, translation, tokens, iteration ) {
		var lastpart = parts[ parts.length - 1 ];
		var part = parts[ iteration ];

		if( tokens[ lastpart ] ) {
			translation = tokens[ lastpart ]
		}
		if( iteration < parts.length - 1 && tokens[ part ] ) {
			return this._getObjectCrawl( parts, translation, tokens[ part ], iteration + 1 );
		} else {
			return translation || null;
		}
	};

	babelbox.prototype._readCookie = function( key ) {
		var result;
		return( result = new RegExp( '(?:^|; )' + encodeURIComponent( key ) + '=([^;]*)' ).exec( document.cookie ) ) ? ( result[ 1 ] ) : null;
	};

	babelbox.prototype._writeCookie = function( key, locale ) {
		document.cookie = key + "=" + locale + "; path=/";
	};

	babelbox.prototype._readUrl = function( key ) {
		var result = null;
		if( window.location.href ) {
			result = new RegExp( '[?&]?' + key + '=([^&]*)' ).exec( window.location.href );
			result = result ? result[ 1 ] : null;
		}
		return result;
	};

	return babelbox;
} ) );
