describe( "translating text", function() {

	var i18n = babelbox;

	beforeEach( function() {
		babelbox.reset();
		i18n.addTokens( {
			name: 'Name',
			age: 'Age',
			dateofbirth: 'Date Of Birth'
		} );
	} );

	it( "translate multiple tokens in html", function() {
		expect( i18n.translate( '<div class="name">[[name]]</div><div>[[age]]</div><div>[[dateofbirth]]</div>' ) ).toEqual( '<div class="name">Name</div><div>Age</div><div>Date Of Birth</div>' );
	} );

	it( "translate multiple tokens in a normal string", function() {
		expect( i18n.translate( '[[name]]:Bob\n[[age]]:42\n[[dateofbirth]]:21/02/1984' ) ).toEqual( 'Name:Bob\nAge:42\nDate Of Birth:21/02/1984' );
	} );

	it( "returns the original text if no tokens are found", function() {
		expect( i18n.translate( 'Does not contain tokens' ) ).toEqual( 'Does not contain tokens' );
	} );
} );
