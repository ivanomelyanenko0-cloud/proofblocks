import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import {
	InspectorControls,
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import {
	TokenSwatches,
	ShapeControl,
	CardStyleControl,
	AnimationControl,
	FontControl,
	TextStyleControl,
} from '../../shared/editor-controls';
import { DesignPresetPicker } from '../../shared/design-presets';

const ALLOWED_BLOCKS = [ 'proofblocks/pricing-column' ];

const TEMPLATE = [
	[ 'proofblocks/pricing-column', { planName: __( 'Basic', 'proofblocks' ), price: '19', period: __( '/mo', 'proofblocks' ) } ],
	[ 'proofblocks/pricing-column', { planName: __( 'Pro', 'proofblocks' ), price: '49', period: __( '/mo', 'proofblocks' ), isPopular: true } ],
	[ 'proofblocks/pricing-column', { planName: __( 'Business', 'proofblocks' ), price: '99', period: __( '/mo', 'proofblocks' ) } ],
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { token, shape, cardStyle, animation, font, textStyle } = attributes;

	const className = [
		`proofblocks-token-${ token }`,
		'rounded' !== shape ? `proofblocks-shape-${ shape }` : null,
		'bordered' !== cardStyle ? `proofblocks-card-${ cardStyle }` : null,
		'none' !== animation ? `proofblocks-anim-${ animation }` : null,
		font ? `proofblocks-font-${ font }` : null,
		'normal' !== textStyle ? `proofblocks-textstyle-${ textStyle }` : null,
	].filter( Boolean ).join( ' ' );

	const blockProps = useBlockProps( { className } );

	// Free's soft cap just switches the appender to a hint once reached -
	// columns already past it (e.g. from an upgrade/downgrade) still work.
	const underCap = useSelect(
		( select ) => select( 'core/block-editor' ).getBlockOrder( clientId ).length,
		[ clientId ]
	) < applyFilters( 'proofblocks.pricingTable.maxColumns', 3 );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		orientation: 'horizontal',
		templateLock: false,
		renderAppender: underCap
			? InnerBlocks.ButtonBlockAppender
			: () => (
				<p className="proofblocks-columns-cap-hint">
					{ __( 'Free is limited to a soft cap of columns shown by the "Add Column" button. Existing extra columns still work fine.', 'proofblocks' ) }
				</p>
			),
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Style', 'proofblocks' ) }>
					<p>{ __( 'Design preset', 'proofblocks' ) }</p>
					<DesignPresetPicker
						fields={ [ 'token', 'shape', 'cardStyle', 'animation', 'font', 'textStyle' ] }
						onApply={ ( values ) => setAttributes( values ) }
					/>
					<TokenSwatches value={ token } onChange={ ( value ) => setAttributes( { token: value } ) } />
					<p>{ __( 'Corners', 'proofblocks' ) }</p>
					<ShapeControl value={ shape } onChange={ ( value ) => setAttributes( { shape: value } ) } />
					<p>{ __( 'Card style', 'proofblocks' ) }</p>
					<CardStyleControl value={ cardStyle } onChange={ ( value ) => setAttributes( { cardStyle: value } ) } />
					<p>{ __( 'Entrance animation', 'proofblocks' ) }</p>
					<AnimationControl value={ animation } onChange={ ( value ) => setAttributes( { animation: value } ) } />
					<FontControl value={ font } onChange={ ( value ) => setAttributes( { font: value } ) } />
					<TextStyleControl value={ textStyle } onChange={ ( value ) => setAttributes( { textStyle: value } ) } />
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
