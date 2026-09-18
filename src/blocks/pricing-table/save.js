import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { token, shape, cardStyle, animation, font, textStyle } = attributes;

	const className = [
		`proofblocks-token-${ token }`,
		'rounded' !== shape ? `proofblocks-shape-${ shape }` : null,
		'bordered' !== cardStyle ? `proofblocks-card-${ cardStyle }` : null,
		'none' !== animation ? `proofblocks-anim-${ animation }` : null,
		font ? `proofblocks-font-${ font }` : null,
		'normal' !== textStyle ? `proofblocks-textstyle-${ textStyle }` : null,
	].filter( Boolean ).join( ' ' );

	const blockProps = useBlockProps.save( {
		className,
		...( 'none' !== animation ? { 'data-pb-animation': animation } : {} ),
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}
