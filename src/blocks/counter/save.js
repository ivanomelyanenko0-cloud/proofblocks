import { useBlockProps, RichText } from '@wordpress/block-editor';

/**
 * Icon is deliberately never rendered here - render_callback always injects
 * it server-side via prfbl_render_counter_icon_svg(), so Pro icons added via
 * the proofblocks_counter_icons PHP filter render correctly even though the
 * editor bundle that saved this post never knew about them. Rendering it
 * here too would just duplicate it.
 */
export default function save( { attributes } ) {
	const {
		mode,
		numberValue,
		numberPrefix,
		numberSuffix,
		numberDuration,
		countdownDate,
		countdownExpiredText,
		label,
		icon,
		iconPosition,
		style,
		token,
		cardStyle,
		animation,
		font,
		textStyle,
		position,
	} = attributes;

	const className = [
		`proofblocks-counter--${ style }`,
		token ? `proofblocks-token-${ token }` : null,
		'flat' !== cardStyle ? `proofblocks-card-${ cardStyle }` : null,
		icon && 'inline' === iconPosition ? 'proofblocks-counter--icon-inline' : null,
		'none' !== animation ? `proofblocks-anim-${ animation }` : null,
		font ? `proofblocks-font-${ font }` : null,
		'normal' !== textStyle ? `proofblocks-textstyle-${ textStyle }` : null,
		'left' !== position ? `proofblocks-align-${ position }` : null,
	].filter( Boolean ).join( ' ' );

	const blockProps = useBlockProps.save( {
		className,
		'data-pb-mode': mode,
		'data-pb-style': style,
		...( 'number' === mode
			? { 'data-pb-value': numberValue, 'data-pb-prefix': numberPrefix, 'data-pb-suffix': numberSuffix, 'data-pb-duration': numberDuration }
			: { 'data-pb-date': countdownDate, 'data-pb-expired-text': countdownExpiredText } ),
		...( icon ? { 'data-pb-icon': icon } : {} ),
		...( 'none' !== animation ? { 'data-pb-animation': animation } : {} ),
	} );

	return (
		<div { ...blockProps }>
			<span className="proofblocks-counter__value">
				{ 'number' === mode ? `${ numberPrefix }0${ numberSuffix }` : '' }
			</span>
			<RichText.Content tagName="span" className="proofblocks-counter__label" value={ label } />
		</div>
	);
}
