/**
 * Reveal-on-scroll entrance animation (the `animation`: fade/slide attribute
 * shared by Banner, Counter, and Pricing Table). Imported by every block's
 * view.js, each bundled and enqueued independently, so the global guard
 * keeps this from running more than once per page no matter how many of
 * those view.js scripts load.
 */
function initEntranceAnimations() {
	if ( window.__pbEntranceAnimInit ) {
		return;
	}
	window.__pbEntranceAnimInit = true;

	var targets = document.querySelectorAll( '[data-pb-animation]:not([data-pb-animation="none"])' );

	if (
		targets.length &&
		'IntersectionObserver' in window &&
		( ! window.matchMedia || ! window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches )
	) {
		document.documentElement.classList.add( 'pb-has-anim-support' );

		var observer = new window.IntersectionObserver( function ( entries ) {
			entries.forEach( function ( entry ) {
				if ( entry.isIntersecting ) {
					entry.target.classList.add( 'is-pb-visible' );
					observer.unobserve( entry.target );
				}
			} );
		}, { threshold: 0.2 } );

		targets.forEach( function ( target ) {
			observer.observe( target );
		} );
	}
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initEntranceAnimations );
} else {
	initEntranceAnimations();
}
