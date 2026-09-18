import '../../shared/view-animations';

/**
 * Number count-up / countdown frontend behavior. Reads the data-pb-* attributes
 * save.js baked into the block's static markup - render_callback only ever
 * tweaks the wrapper's class list and injects the icon, it never touches
 * these.
 *
 * The count-up animation only runs for the 'basic' style; a Pro visual style
 * (odometer/ring/flip/particles/gradient) still gets its final value printed
 * here so there's a correct result with JS disabled or before Pro's own
 * per-style script (enqueued by proofblocks_counter_render_extra) takes over.
 */
function pad2( n ) {
	return n < 10 ? '0' + n : '' + n;
}

function animateNumber( el ) {
	var value = parseFloat( el.getAttribute( 'data-pb-value' ) ) || 0;
	var prefix = el.getAttribute( 'data-pb-prefix' ) || '';
	var suffix = el.getAttribute( 'data-pb-suffix' ) || '';
	var duration = parseInt( el.getAttribute( 'data-pb-duration' ), 10 ) || 2000;
	var valueEl = el.querySelector( '.proofblocks-counter__value' );

	if ( ! valueEl ) {
		return;
	}

	var start = null;
	window.requestAnimationFrame( function tick( timestamp ) {
		if ( ! start ) {
			start = timestamp;
		}
		var progress = Math.min( 1, ( timestamp - start ) / duration );
		var current = Math.floor( progress * value );
		valueEl.textContent = prefix + current + suffix;
		if ( progress < 1 ) {
			window.requestAnimationFrame( tick );
		} else {
			valueEl.textContent = prefix + value + suffix;
		}
	} );
}

function renderStaticNumber( el ) {
	var value = parseFloat( el.getAttribute( 'data-pb-value' ) ) || 0;
	var prefix = el.getAttribute( 'data-pb-prefix' ) || '';
	var suffix = el.getAttribute( 'data-pb-suffix' ) || '';
	var valueEl = el.querySelector( '.proofblocks-counter__value' );
	if ( valueEl ) {
		valueEl.textContent = prefix + value + suffix;
	}
}

function initCountdown( el ) {
	var dateAttr = el.getAttribute( 'data-pb-date' );
	var expiredText = el.getAttribute( 'data-pb-expired-text' ) || '';
	var valueEl = el.querySelector( '.proofblocks-counter__value' );

	if ( ! valueEl || ! dateAttr ) {
		return;
	}

	var target = new Date( dateAttr ).getTime();
	if ( isNaN( target ) ) {
		return;
	}

	( function tick() {
		var remaining = target - Date.now();
		if ( remaining <= 0 ) {
			valueEl.textContent = expiredText;
			return;
		}
		var totalSeconds = Math.floor( remaining / 1000 );
		var days = Math.floor( totalSeconds / 86400 );
		var hours = Math.floor( ( totalSeconds % 86400 ) / 3600 );
		var minutes = Math.floor( ( totalSeconds % 3600 ) / 60 );
		var seconds = totalSeconds % 60;
		valueEl.textContent = ( days > 0 ? days + 'd ' : '' ) + pad2( hours ) + ':' + pad2( minutes ) + ':' + pad2( seconds );
		window.setTimeout( tick, 1000 );
	} )();
}

function initCounters() {
	var counters = document.querySelectorAll( '[data-pb-mode]' );
	if ( ! counters.length ) {
		return;
	}

	var observer = 'IntersectionObserver' in window
		? new window.IntersectionObserver( function ( entries ) {
			entries.forEach( function ( entry ) {
				if ( entry.isIntersecting ) {
					var el = entry.target;
					observer.unobserve( el );
					if ( 'number' === el.getAttribute( 'data-pb-mode' ) ) {
						animateNumber( el );
					}
				}
			} );
		}, { threshold: 0.3 } )
		: null;

	counters.forEach( function ( el ) {
		var mode = el.getAttribute( 'data-pb-mode' );
		var style = el.getAttribute( 'data-pb-style' ) || 'basic';

		if ( 'countdown' === mode ) {
			initCountdown( el );
			return;
		}

		if ( 'number' !== mode ) {
			return;
		}

		if ( 'basic' !== style ) {
			renderStaticNumber( el );
			return;
		}

		if ( observer ) {
			observer.observe( el );
		} else {
			animateNumber( el );
		}
	} );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initCounters );
} else {
	initCounters();
}
