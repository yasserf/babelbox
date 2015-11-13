define( function( require ) {
	require( 'babelbox!../i18n' );

	var jQuery = require( 'jquery' );
	var i18n = require( 'i18n' );

	var languageSelection = i18n.translate( require( 'text!../templates/language-selection.html' ) );
	var formTemplate = i18n.translate( require( 'text!../templates/form.html' ) );
	$( '.content' )
		.append( languageSelection )
		.append( '<hr/>' )
		.append( formTemplate );

	$( '.current-language' ).text( i18n( 'language.current', {
		language: i18n.getLocale().join( ' ' )
	} ) );

	$( 'select' ).change( function() {
		var selectedLanguage = $('option:selected').val();
		i18n.setLocale( selectedLanguage.split('-') );
		window.location.reload();
	} );
} );

