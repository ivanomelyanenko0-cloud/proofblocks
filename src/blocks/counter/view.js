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

/**
 * (Re)start the countdown toward `dateAttr`. Safe to call again with a new
 * date: the previous timer is cancelled first. An empty/invalid date stops
 * the timer; for a WooCommerce countdown that means "no running sale" and
 * the block's fallback applies.
 *
 * Fires `proofblocks:countdown` on the block (detail.target: ms timestamp,
 * or null when there's nothing to count down to) every time the target is
 * set, so ProofBlocks Pro can react to the real end date - including one
 * that changed after the live check below.
 */
function startCountdown( el, dateAttr ) {
	var expiredText = el.getAttribute( 'data-pb-expired-text' ) || '';
	var valueEl = el.querySelector( '.proofblocks-counter__value' );
	var isWoo = 'wc_sale' === el.getAttribute( 'data-pb-source' );

	window.clearTimeout( el.pbCountdownTimer );

	if ( ! valueEl ) {
		return;
	}

	var target = dateAttr ? new Date( dateAttr ).getTime() : NaN;
	var hasTarget = ! isNaN( target );

	if ( isWoo ) {
		var hide = ! hasTarget && 'hide' === el.getAttribute( 'data-pb-fallback' );
		el.classList.toggle( 'proofblocks-counter--no-sale', hide );
		if ( ! hasTarget ) {
			valueEl.textContent = expiredText;
		}
	}

	el.dispatchEvent( new window.CustomEvent( 'proofblocks:countdown', { bubbles: true, detail: { target: hasTarget ? target : null } } ) );

	if ( ! hasTarget ) {
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
		el.pbCountdownTimer = window.setTimeout( tick, 1000 );
	} )();
}

/**
 * A WooCommerce countdown's date comes baked into the HTML, which a page
 * cache can serve long after the sale was extended, shortened or ended.
 * Re-read the live sale end once per page load and restart if it differs.
 * A failed request leaves the baked-in date in place.
 */
function refreshSaleEnd( el ) {
	var url = el.getAttribute( 'data-pb-sale-url' );
	if ( ! url || ! window.fetch ) {
		return;
	}

	window.fetch( url, { credentials: 'omit' } )
		.then( function ( response ) {
			return response.ok ? response.json() : Promise.reject();
		} )
		.then( function ( data ) {
			var live = data && data.saleEnd ? data.saleEnd : '';
			var baked = el.getAttribute( 'data-pb-date' ) || '';
			var same = ( ! live && ! baked ) || ( live && baked && new Date( live ).getTime() === new Date( baked ).getTime() );
			if ( ! same ) {
				el.setAttribute( 'data-pb-date', live );
				startCountdown( el, live );
			}
		} )
		.catch( function () {} );
}

/**
 * Show a WooCommerce stock level (null/0 = nothing to show: the block's
 * fallback applies). Fires `proofblocks:stock` on the block (detail.stock:
 * number, or null) every time, so ProofBlocks Pro can react to the real
 * stock - including stock that changed after the live check below.
 */
function showStock( el, stock ) {
	var valueEl = el.querySelector( '.proofblocks-counter__value' );
	var hasStock = stock > 0;

	el.setAttribute( 'data-pb-value', hasStock ? stock : '' );
	el.classList.toggle( 'proofblocks-counter--no-sale', ! hasStock && 'hide' === el.getAttribute( 'data-pb-fallback' ) );
	if ( valueEl ) {
		valueEl.textContent = hasStock
			? ( el.getAttribute( 'data-pb-prefix' ) || '' ) + stock + ( el.getAttribute( 'data-pb-suffix' ) || '' )
			: el.getAttribute( 'data-pb-empty-text' ) || '';
	}

	el.dispatchEvent( new window.CustomEvent( 'proofblocks:stock', { bubbles: true, detail: { stock: hasStock ? stock : null } } ) );
}

/**
 * Same idea as refreshSaleEnd(): the stock baked into a cached page can be
 * out of date, so re-read it once per page load.
 */
function refreshStock( el ) {
	var url = el.getAttribute( 'data-pb-stock-url' );
	if ( ! url || ! window.fetch ) {
		return;
	}

	window.fetch( url, { credentials: 'omit' } )
		.then( function ( response ) {
			return response.ok ? response.json() : Promise.reject();
		} )
		.then( function ( data ) {
			var live = data && data.stock > 0 ? data.stock : null;
			var baked = parseInt( el.getAttribute( 'data-pb-value' ), 10 ) || null;
			if ( live !== baked ) {
				showStock( el, live );
			}
		} )
		.catch( function () {} );
}

function initStock( el ) {
	showStock( el, parseInt( el.getAttribute( 'data-pb-value' ), 10 ) || null );
	refreshStock( el );
}

function initCountdown( el ) {
	startCountdown( el, el.getAttribute( 'data-pb-date' ) );
	if ( 'wc_sale' === el.getAttribute( 'data-pb-source' ) ) {
		refreshSaleEnd( el );
	}
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

		if ( 'wc_stock' === el.getAttribute( 'data-pb-source' ) ) {
			initStock( el );
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
