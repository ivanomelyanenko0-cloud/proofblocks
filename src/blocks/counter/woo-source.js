import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { ComboboxControl, SelectControl, TextControl, Notice } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { dateI18n, getSettings } from '@wordpress/date';
import apiFetch from '@wordpress/api-fetch';

/**
 * WooCommerce source controls, shared by the countdown ("when this sale
 * ends", kind 'sale') and the number ("how many are left", kind 'stock'):
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
export function useLiveProduct( productId, variationId ) {
	const [ state, setState ] = useState( { loading: false, saleEnd: null, stock: null } );
	useEffect( () => {
		if ( ! productId ) {
			setState( { loading: false, saleEnd: null, stock: null } );
			return;
		}
		let cancelled = false;
		setState( { loading: true, saleEnd: null, stock: null } );
		apiFetch( { path: `/proofblocks/v1/wc-product/${ productId }?variation=${ variationId || 0 }` } )
			.then( ( data ) => ! cancelled && setState( { loading: false, saleEnd: data.saleEnd, stock: data.stock } ) )
			.catch( () => ! cancelled && setState( { loading: false, saleEnd: null, stock: null } ) );
		return () => {
			cancelled = true;
		};
	}, [ productId, variationId ] );
	return state;
}

function statusText( kind, productId, live ) {
	if ( ! productId ) {
		return __( 'Uses the product of the page or product template this block is on.', 'proofblocks' );
	}
	if ( live.loading ) {
		return 'stock' === kind ? __( 'Checking the stock…', 'proofblocks' ) : __( 'Checking the sale…', 'proofblocks' );
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

	const variations = product && product.variations ? product.variations : [];

	const stockHidden = 'stock' === kind && window.proofblocksWoo && window.proofblocksWoo.stockHidden;
	const hasValue = 'stock' === kind ? !! live.stock : !! live.saleEnd;

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
			{ stockHidden ? (
				<Notice status="warning" isDismissible={ false }>
					{ __( 'Your store hides stock amounts (WooCommerce → Settings → Products → Inventory → Stock display format), so ProofBlocks won\'t show them either. Visitors get the fallback below.', 'proofblocks' ) }
				</Notice>
			) : (
				<Notice status={ productId && ! live.loading && ! hasValue ? 'warning' : 'info' } isDismissible={ false }>
					{ statusText( kind, productId, live ) }
				</Notice>
			) }
			<SelectControl
				label={ 'stock' === kind ? __( 'When there is no stock count', 'proofblocks' ) : __( 'When there is no running sale', 'proofblocks' ) }
				value={ wcFallback }
				options={ [
					{ value: 'hide', label: __( 'Hide the block', 'proofblocks' ) },
					{
						value: 'expired-text',
						label: 'stock' === kind ? __( 'Show a text instead', 'proofblocks' ) : __( 'Show the expired text', 'proofblocks' ),
					},
				] }
				onChange={ ( value ) => setAttributes( { wcFallback: value } ) }
			/>
			{ 'stock' === kind && 'expired-text' === wcFallback && (
				<TextControl
					label={ __( 'Text instead of the number', 'proofblocks' ) }
					value={ wcEmptyText }
					placeholder={ __( 'e.g. Sold out', 'proofblocks' ) }
					onChange={ ( value ) => setAttributes( { wcEmptyText: value } ) }
				/>
			) }
		</>
	);
}
