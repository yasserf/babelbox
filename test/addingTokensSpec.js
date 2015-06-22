describe( "adding tokens", function() {

	var i18n;
	it( "starts babelbox", function() {
		i18n = new babelbox();
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
			"countries": {
				"asia": {
					"japan": "japan",
					"china": "china"
				}
			}
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
			"countries": {
				"asia": {
					"singapore": "singapore",
					"thailand": "thailand"
				}
			},
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

	it( "throws an error when trying to set an already existing token", function() {
		expect( i18n.addTokens.bind( i18n, {
			"countries": {
				"asia": {
					"singapore": "singapore"
				}
			}
		} ) ).toThrow();
	} );


} );
