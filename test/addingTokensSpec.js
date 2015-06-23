describe( "adding tokens", function() {

	var i18n = babelbox;

	it( "resets babelbox", function() {
		i18n.reset();
	} );

	it( "can add tokens", function() {
		var tokens = {
			"tomato": "value",
			"potato": "value"
		};
		i18n.addTokens( tokens );
		expect( i18n.tokens ).toEqual( tokens );
	} );

	it( "can add with multiple depths", function() {
		i18n.addTokens( {
			"countries.asia.japan": "japan",
			"countries.asia.china": "china"
		} );
		expect( i18n.tokens ).toEqual( {
			tomato: 'value',
			potato: 'value',
			countries: {
				asia: {
					japan: 'japan',
					china: 'china'
				}
			}
		} );
	} );

	it( "can merge tokens", function() {
		i18n.addTokens( {
			"countries.asia.singapore": "singapore",
			"countries.asia.thailand": "thailand",
			"cucumber": "cucumber"
		} );
		expect( i18n.tokens ).toEqual( {
			tomato: 'value',
			potato: 'value',
			cucumber: 'cucumber',
			countries: {
				asia: {
					japan: 'japan',
					china: 'china',
					singapore: 'singapore',
					thailand: 'thailand'
				}
			}
		} );
	} );

	it( "overwrites tokens when adding language extensions", function() {
		i18n.addExtendedTokens( {
			"countries.asia.japan": "an tSeapáin"
		} );
		expect( i18n.tokens ).toEqual( {
			tomato: 'value',
			potato: 'value',
			cucumber: 'cucumber',
			countries: {
				asia: {
					japan: 'an tSeapáin',
					china: 'china',
					singapore: 'singapore',
					thailand: 'thailand'
				}
			}
		} );
	} );

	it( "throws an error when trying to set an already existing token", function() {
		expect( i18n.addTokens.bind( i18n, {
			"countries.asia.singapore": "singapore"
		} ) ).toThrow( new Error( 'Duplicate token attempted to be added: \"countries.asia.singapore\"' ) );
	} );

	describe( 'when an emitter is set', function() {
		var emitter;
		beforeEach( function() {
			emitter = jasmine.createSpyObj( 'emitter', [ 'emit' ] );
			i18n.setEmitter( emitter );
		} );

		afterEach( function() {
			i18n.setEmitter( null );
		} );

		it( "emits an error event if emitter is set", function() {
			i18n.addTokens( {
				"countries.asia.singapore": "singapore"
			} );
			expect( emitter.emit ).toHaveBeenCalled();
			expect( emitter.emit ).toHaveBeenCalledWith( 'DUPLICATE_TOKEN', 'countries.asia.singapore' );
		} );

	} );
} );
