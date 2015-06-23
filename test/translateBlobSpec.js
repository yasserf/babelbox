describe( "replacing tokens in a blob", function() {

	var i18n = babelbox;

	beforeEach( function() {
		babelbox.reset();
		i18n.addTokens( {
			name: 'Name',
			age: 'Age',
			dateofbirth: 'Date Of Birth'
		} );
	} );

	it( "translate multiple tokens in a html blob", function() {
		expect( i18n.blob( '<div class="name">[[name]]</div><div>[[age]]</div><div>[[dateofbirth]]</div>' ) ).toEqual( '<div class="name">Name</div><div>Age</div><div>Date Of Birth</div>' );
	} );

	it( "translate multiple tokens in a normal string", function() {
		expect( i18n.blob( '[[name]]:Bob\n[[age]]:42\n[[dateofbirth]]:21/02/1984' ) ).toEqual( 'Name:Bob\nAge:42\nDate Of Birth:21/02/1984' );
	} );

} );
