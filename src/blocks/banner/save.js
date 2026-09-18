import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		mediaUrl,
		mediaAlt,
		heading,
		text,
		ctaText,
		ctaUrl,
		ctaNewTab,
		layout,
		token,
		textAlign,
		shape,
		animation,
		videoUrl,
		parallax,
		countdownEnabled,
		countdownDate,
		countdownExpiredText,
		secondaryCtaText,
		secondaryCtaUrl,
		font,
		textStyle,
	} = attributes;

	const className = [
		`proofblocks-token-${ token }`,
		`proofblocks-banner--${ layout }`,
		'center' === textAlign ? 'proofblocks-align-center' : null,
		'rounded' !== shape ? `proofblocks-shape-${ shape }` : null,
		'none' !== animation ? `proofblocks-anim-${ animation }` : null,
		font ? `proofblocks-font-${ font }` : null,
		'normal' !== textStyle ? `proofblocks-textstyle-${ textStyle }` : null,
	].filter( Boolean ).join( ' ' );

	const blockProps = useBlockProps.save( {
		className,
		...( 'none' !== animation ? { 'data-pb-animation': animation } : {} ),
		...( videoUrl ? { 'data-pb-video-url': videoUrl } : {} ),
		...( parallax ? { 'data-pb-parallax': 'true' } : {} ),
		...( countdownEnabled && countdownDate ? { 'data-pb-countdown-date': countdownDate, 'data-pb-countdown-expired-text': countdownExpiredText || '' } : {} ),
	} );

	return (
		<div { ...blockProps }>
			<div className="proofblocks-banner__media">
				{ mediaUrl && <img src={ mediaUrl } alt={ mediaAlt } /> }
			</div>
			<div className="proofblocks-banner__body">
				<RichText.Content tagName="h2" className="proofblocks-banner__heading" value={ heading } />
				<RichText.Content tagName="p" className="proofblocks-banner__text" value={ text } />
				{ countdownEnabled && countdownDate && <span className="proofblocks-banner__countdown" data-pb-countdown /> }
				<div className="proofblocks-banner__ctas">
					{ ctaText && (
						<a
							className="proofblocks-banner__cta"
							href={ ctaUrl || '#' }
							target={ ctaNewTab ? '_blank' : undefined }
							rel={ ctaNewTab ? 'noopener noreferrer' : undefined }
						>
							{ ctaText }
						</a>
					) }
					{ secondaryCtaText && (
						<a className="proofblocks-banner__cta proofblocks-banner__cta--secondary" href={ secondaryCtaUrl || '#' }>
							{ secondaryCtaText }
						</a>
					) }
				</div>
			</div>
		</div>
	);
}
