import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { planName, price, period, features, isPopular, badgeText, popularStyle, ctaText, ctaUrl, ctaNewTab, yearlyPrice } = attributes;

	const blockProps = useBlockProps.save( {
		className: isPopular
			? [ 'is-popular', 'border-glow' !== popularStyle ? `popular-style-${ popularStyle }` : null ].filter( Boolean ).join( ' ' )
			: undefined,
	} );

	return (
		<div { ...blockProps }>
			{ isPopular && (
				<span className="proofblocks-column__badge">{ badgeText || 'Popular' }</span>
			) }
			<RichText.Content tagName="h3" className="proofblocks-column__name" value={ planName } />
			<div className="proofblocks-column__price-row">
				<span className="proofblocks-column__price" { ...( yearlyPrice ? { 'data-pb-yearly-price': yearlyPrice } : {} ) }>
					<RichText.Content tagName="span" value={ price } />
				</span>
				<RichText.Content tagName="span" className="proofblocks-column__period" value={ period } />
			</div>
			<ul className="proofblocks-column__features">
				{ features.map( ( feature, index ) => (
					<li className={ 'proofblocks-column__feature' + ( feature.included ? ' is-included' : ' is-excluded' ) } key={ index }>
						<span className="proofblocks-column__feature-text">{ feature.text }</span>
					</li>
				) ) }
			</ul>
			{ ctaText && (
				<a className="proofblocks-column__cta" href={ ctaUrl || '#' } target={ ctaNewTab ? '_blank' : undefined } rel={ ctaNewTab ? 'noopener noreferrer' : undefined }>
					{ ctaText }
				</a>
			) }
		</div>
	);
}
