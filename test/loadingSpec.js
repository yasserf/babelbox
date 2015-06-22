describe( "initialisation", function() {

	var i18n;
	beforeEach( function() {
		i18n = new babelbox();
	} );

	it( "initially has no tokens", function() {
		expect( i18n.tokens ).toEqual( {} );
	} );

} );
