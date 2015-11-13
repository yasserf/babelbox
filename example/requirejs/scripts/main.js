requirejs.config( {
	paths: {
		'jquery': 'https://code.jquery.com/jquery-1.11.3.min',
		'text': 'https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min',
		'babelbox': './babelbox',
		'i18n': 'https://rawgit.com/hoxton-one/babelbox/master/dist/babelbox.min'
	},
	babelbox: {
		folders: true,
		localedepth: 2
	}
} );
require( [ './app' ] );