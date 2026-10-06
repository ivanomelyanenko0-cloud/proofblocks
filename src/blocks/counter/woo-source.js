import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { ComboboxControl, SelectControl, Notice } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { dateI18n, getSettings } from '@wordpress/date';
import apiFetch from '@wordpress/api-fetch';

/**
 * Countdown source controls for WooCommerce: pick a product (or "current
 * product"), optionally one of its variations, and what to show when there
 * is no running sale. Product search goes through WooCommerce's public
 * Store API; the sale end shown here comes from the same ProofBlocks
 * endpoint the frontend uses, so the editor shows exactly what visitors get.
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

function useSaleEnd( productId, variationId ) {
	const [ state, setState ] = useState( { loading: false, saleEnd: null } );
	useEffect( () => {
		if ( ! productId ) {
			setState( { loading: false, saleEnd: null } );
			return;
		}
		let cancelled = false;
		setState( { loading: true, saleEnd: null } );
		apiFetch( { path: `/proofblocks/v1/wc-product/${ productId }?variation=${ variationId || 0 }` } )
			.then( ( data ) => ! cancelled && setState( { loading: false, saleEnd: data.saleEnd } ) )
			.catch( () => ! cancelled && setState( { loading: false, saleEnd: null } ) );
		return () => {
			cancelled = true;
		};
	}, [ productId, variationId ] );
	return state;
}

export default function WooSourceControls( { attributes, setAttributes } ) {
	const { productId, variationId, wcFallback } = attributes;
	const product = useProduct( productId );
	const sale = useSaleEnd( productId, variationId );
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

	const variations = product && product.variations ? product.variations : [];

	let status = null;
	if ( ! productId ) {
		status = __( 'Uses the product of the page or product template this block is on.', 'proofblocks' );
	} else if ( sale.loading ) {
		status = __( 'Checking the sale…', 'proofblocks' );
	} else if ( sale.saleEnd ) {
		status = sprintf(
			/* translators: %s: date and time the sale ends. */
			__( 'Sale ends %s.', 'proofblocks' ),
			dateI18n( `${ getSettings().formats.date } ${ getSettings().formats.time }`, sale.saleEnd )
		);
	} else {
		status = __( 'No running sale with an end date. Visitors get the fallback below until one starts.', 'proofblocks' );
	}

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
						{ value: 0, label: __( 'Whichever variation\'s sale ends first', 'proofblocks' ) },
						...variations.map( ( variation ) => ( { value: variation.id, label: variationLabel( variation ) } ) ),
					] }
					onChange={ ( value ) => setAttributes( { variationId: Number( value ) || 0 } ) }
				/>
			) }
			<Notice status={ productId && ! sale.loading && ! sale.saleEnd ? 'warning' : 'info' } isDismissible={ false }>
				{ status }
			</Notice>
			<SelectControl
				label={ __( 'When there is no running sale', 'proofblocks' ) }
				value={ wcFallback }
				options={ [
					{ value: 'hide', label: __( 'Hide the block', 'proofblocks' ) },
					{ value: 'expired-text', label: __( 'Show the expired text', 'proofblocks' ) },
				] }
				onChange={ ( value ) => setAttributes( { wcFallback: value } ) }
			/>
		</>
	);
}
