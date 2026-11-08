import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { ComboboxControl, SelectControl, TextControl, ToggleControl, Notice } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { dateI18n, getSettings } from '@wordpress/date';
import apiFetch from '@wordpress/api-fetch';

/**
 * WooCommerce source controls, shared by the countdown ("when this sale
 * ends", kind 'sale') and the number (kinds 'stock', 'sold', 'reviews',
 * 'rating'):
 * pick a product (or "current product"), optionally one of its variations,
 * and what to show when there is no live value. Product search goes
 * through WooCommerce's public Store API; the sale end / stock shown here
 * comes from the same ProofBlocks endpoint the frontend uses, so the
 * editor shows exactly what visitors get.
 */

function productOption( product ) {
	return { value: product.id, label: decodeEntities( product.name ) };
}

function variationLabel( variation ) {
	const parts = ( variation.attributes || [] ).map( ( attr ) => attr.value ).filter( Boolean );
	return parts.length ? decodeEntities( parts.join( ' / ' ) ) : sprintf( /* translators: %d: variation ID. */ __( 'Variation #%d', 'proofblocks' ), variation.id );
}

function useProduct( productId ) {
	const [ product, setProduct ] = useState( null );
	useEffect( () => {
		if ( ! productId ) {
			setProduct( null );
			return;
		}
		let cancelled = false;
		apiFetch( { path: `/wc/store/v1/products/${ productId }` } )
			.then( ( data ) => ! cancelled && setProduct( data ) )
			.catch( () => ! cancelled && setProduct( null ) );
		return () => {
			cancelled = true;
		};
	}, [ productId ] );
	return product;
}

/**
 * The live sale end and stock for a product, from ProofBlocks' own endpoint.
 * Exported so the block canvas can preview the real stock too.
 */
const EMPTY_LIVE = { saleEnd: null, stock: null, sold: null, reviews: null, rating: null, ratingText: null };

export function useLiveProduct( productId, variationId ) {
	const [ state, setState ] = useState( { loading: false, ...EMPTY_LIVE } );
	useEffect( () => {
		if ( ! productId ) {
			setState( { loading: false, ...EMPTY_LIVE } );
			return;
		}
		let cancelled = false;
		setState( { loading: true, ...EMPTY_LIVE } );
		apiFetch( { path: `/proofblocks/v1/wc-product/${ productId }?variation=${ variationId || 0 }` } )
			.then( ( data ) => ! cancelled && setState( { loading: false, ...EMPTY_LIVE, ...data } ) )
			.catch( () => ! cancelled && setState( { loading: false, ...EMPTY_LIVE } ) );
		return () => {
			cancelled = true;
		};
	}, [ productId, variationId ] );
	return state;
}

/**
 * The live value a kind of source shows, from useLiveProduct()'s state.
 */
export function liveValueFor( kind, live ) {
	return {
		stock: live.stock,
		sale: live.saleEnd,
		sold: live.sold,
		reviews: live.reviews,
		rating: live.rating,
	}[ kind ];
}

function statusText( kind, productId, live ) {
	if ( ! productId ) {
		return __( 'Uses the product of the page or product template this block is on.', 'proofblocks' );
	}
	if ( live.loading ) {
		if ( 'sale' === kind ) {
			return __( 'Checking the sale…', 'proofblocks' );
		}
		return 'stock' === kind ? __( 'Checking the stock…', 'proofblocks' ) : __( 'Checking the product…', 'proofblocks' );
	}
	if ( 'sold' === kind ) {
		return live.sold
			? sprintf(
				/* translators: %d: number of units sold. */
				__( 'Sold so far: %d (paid orders, as WooCommerce counts them).', 'proofblocks' ),
				live.sold
			)
			: __( 'Nothing sold yet, so there is no number to show. Visitors get the fallback below.', 'proofblocks' );
	}
	if ( 'reviews' === kind ) {
		return live.reviews
			? sprintf(
				/* translators: %d: number of reviews. */
				__( 'Approved reviews right now: %d.', 'proofblocks' ),
				live.reviews
			)
			: __( 'No approved reviews yet. Visitors get the fallback below.', 'proofblocks' );
	}
	if ( 'rating' === kind ) {
		return live.rating
			? sprintf(
				/* translators: 1: average rating, e.g. 4.8. 2: number of reviews. */
				__( 'Average rating right now: %1$s out of 5, from %2$d reviews.', 'proofblocks' ),
				live.ratingText,
				live.reviews
			)
			: __( 'No rated reviews yet. Visitors get the fallback below.', 'proofblocks' );
	}
	if ( 'stock' === kind ) {
		return live.stock
			? sprintf(
				/* translators: %d: number of items in stock. */
				__( 'In stock right now: %d.', 'proofblocks' ),
				live.stock
			)
			: __( 'No stock count for this product: stock isn\'t tracked, it\'s sold out, or (for a variable product) one of its variations doesn\'t track stock. Visitors get the fallback below.', 'proofblocks' );
	}
	return live.saleEnd
		? sprintf(
			/* translators: %s: date and time the sale ends. */
			__( 'Sale ends %s.', 'proofblocks' ),
			dateI18n( `${ getSettings().formats.date } ${ getSettings().formats.time }`, live.saleEnd )
		)
		: __( 'No running sale with an end date. Visitors get the fallback below until one starts.', 'proofblocks' );
}

export default function WooSourceControls( { attributes, setAttributes, kind = 'sale', live } ) {
	const { productId, variationId, wcFallback, wcEmptyText } = attributes;
	const product = useProduct( productId );
	const [ options, setOptions ] = useState( [] );

	const search = ( term ) => {
		apiFetch( { path: `/wc/store/v1/products?per_page=20&search=${ encodeURIComponent( term || '' ) }` } )
			.then( ( data ) => setOptions( data.map( productOption ) ) )
			.catch( () => setOptions( [] ) );
	};

	useEffect( () => {
		search( '' );
	}, [] );

	const comboOptions = product && ! options.some( ( option ) => option.value === product.id )
		? [ productOption( product ), ...options ]
		: options;

	// Sales and reviews belong to the product as a whole: WooCommerce doesn't count them per variation.
	const perVariation = 'stock' === kind || 'sale' === kind;
	const variations = perVariation && product && product.variations ? product.variations : [];

	const woo = window.proofblocksWoo || {};
	let hiddenNotice = null;
	if ( 'stock' === kind && woo.stockHidden ) {
		hiddenNotice = __( 'Your store hides stock amounts (WooCommerce → Settings → Products → Inventory → Stock display format), so ProofBlocks won\'t show them either. Visitors get the fallback below.', 'proofblocks' );
	} else if ( 'reviews' === kind && woo.reviewsHidden ) {
		hiddenNotice = __( 'Product reviews are turned off in WooCommerce (Settings → Products → Reviews), so ProofBlocks won\'t show a review count either. Visitors get the fallback below.', 'proofblocks' );
	} else if ( 'rating' === kind && woo.ratingsHidden ) {
		hiddenNotice = __( 'Star ratings on reviews are turned off in WooCommerce (Settings → Products → Reviews), so ProofBlocks won\'t show an average rating either. Visitors get the fallback below.', 'proofblocks' );
	}
	const hasValue = !! liveValueFor( kind, live );
	const isNumber = 'sale' !== kind;

	return (
		<>
			<ComboboxControl
				label={ __( 'Product', 'proofblocks' ) }
				value={ productId || null }
				options={ comboOptions }
				onFilterValueChange={ search }
				onChange={ ( value ) => setAttributes( { productId: Number( value ) || 0, variationId: 0 } ) }
				help={ __( 'Leave empty to use the current product.', 'proofblocks' ) }
			/>
			{ variations.length > 0 && (
				<SelectControl
					label={ __( 'Variation', 'proofblocks' ) }
					value={ variationId }
					options={ [
						{
							value: 0,
							label: 'stock' === kind
								? __( 'All variations combined', 'proofblocks' )
								: __( 'Whichever variation\'s sale ends first', 'proofblocks' ),
						},
						...variations.map( ( variation ) => ( { value: variation.id, label: variationLabel( variation ) } ) ),
					] }
					onChange={ ( value ) => setAttributes( { variationId: Number( value ) || 0 } ) }
				/>
			) }
			{ hiddenNotice ? (
				<Notice status="warning" isDismissible={ false }>
					{ hiddenNotice }
				</Notice>
			) : (
				<Notice status={ productId && ! live.loading && ! hasValue ? 'warning' : 'info' } isDismissible={ false }>
					{ statusText( kind, productId, live ) }
				</Notice>
			) }
			<SelectControl
				label={ { stock: __( 'When there is no stock count', 'proofblocks' ), sale: __( 'When there is no running sale', 'proofblocks' ) }[ kind ] || __( 'When there is no number to show yet', 'proofblocks' ) }
				value={ wcFallback }
				options={ [
					{ value: 'hide', label: __( 'Hide the block', 'proofblocks' ) },
					{
						value: 'expired-text',
						label: isNumber ? __( 'Show a text instead', 'proofblocks' ) : __( 'Show the expired text', 'proofblocks' ),
					},
				] }
				onChange={ ( value ) => setAttributes( { wcFallback: value } ) }
			/>
			{ 'rating' === kind && (
				<ToggleControl
					label={ __( 'Show stars', 'proofblocks' ) }
					help={ __( 'Five stars under the number, filled to the average rating. Screen readers read the number only.', 'proofblocks' ) }
					checked={ false !== attributes.ratingStars }
					onChange={ ( value ) => setAttributes( { ratingStars: value } ) }
				/>
			) }
			{ isNumber && 'expired-text' === wcFallback && (
				<TextControl
					label={ __( 'Text instead of the number', 'proofblocks' ) }
					value={ wcEmptyText }
					placeholder={ 'stock' === kind ? __( 'e.g. Sold out', 'proofblocks' ) : __( 'e.g. Be the first to review', 'proofblocks' ) }
					onChange={ ( value ) => setAttributes( { wcEmptyText: value } ) }
				/>
			) }
		</>
	);
}
