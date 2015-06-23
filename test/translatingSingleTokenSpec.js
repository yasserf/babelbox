describe( "translating single tokens", function() {

	var i18n = babelbox;


	beforeEach( function() {
		i18n.reset();
		i18n.addTokens( {
			confirmed: 'It\'s confirmed!',
			please_confirm: 'Please confirm your booking',
			booking: {
				confirmed: 'Your booking no:[[booking_no]] on [[day]] was succesfully confirmed!',
				to_confirm: 'Your booking will be confirmed shortly!',
				hotel: {
					confirmed: 'Your hotel booking at [[hotel]] is confirmed!',
					to_confirm: 'Your hotel booking will be confirmed shortly!',
				}
			}
		} );
	} );

	it( "can get a top level translation", function() {
		expect( i18n( 'confirmed' ) ).toEqual( 'It\'s confirmed!' );
	} );

	it( "can get a translation one level deep", function() {
		expect( i18n( 'booking.to_confirm' ) ).toEqual( 'Your booking will be confirmed shortly!' );
	} );

	it( "can get a translation two levels deep", function() {
		expect( i18n( 'booking.hotel.to_confirm' ) ).toEqual( 'Your hotel booking will be confirmed shortly!' );
	} );

	it( "can gets a booking one level higher when not available", function() {
		expect( i18n( 'booking.please_confirm' ) ).toEqual( 'Please confirm your booking' );
	} );

	it( "can gets a booking two levels higher when not available", function() {
		expect( i18n( 'booking.hotel.please_confirm' ) ).toEqual( 'Please confirm your booking' );
	} );

	it( "can replace a token correctly in translation", function() {
		expect( i18n( 'booking.hotel.confirmed', {
			hotel: 'TheHotel'
		} ) ).toEqual( 'Your hotel booking at TheHotel is confirmed!' );
	} );

	it( "can replace multiple tokens correctly in translation", function() {
		expect( i18n( 'booking.confirmed', {
			booking_no: '12432',
			day: 'Sunday'
		} ) ).toEqual( 'Your booking no:12432 on Sunday was succesfully confirmed!' );
	} );


} );
