import { __ } from '@wordpress/i18n';
import { InspectorControls, RichText, URLInput, useBlockProps } from '@wordpress/block-editor';
import { Button, PanelBody, RadioControl, ToggleControl } from '@wordpress/components';
// Unused today (no icon field on this block) - kept because the original
// bundle imports it too, evaluating each icon's __() label as a side effect.
import '../../../shared/icons';

function CheckIcon() {
	return (
		<svg className="proofblocks-icon proofblocks-icon--check" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function CrossIcon() {
	return (
		<svg className="proofblocks-icon proofblocks-icon--cross" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const { planName, price, period, features, isPopular, badgeText, popularStyle, ctaUrl, ctaNewTab, ctaText } = attributes;

	const blockProps = useBlockProps( {
		className: isPopular
			? [ 'is-popular', 'border-glow' !== popularStyle ? `popular-style-${ popularStyle }` : null ].filter( Boolean ).join( ' ' )
			: undefined,
	} );

	function updateFeature( index, changes ) {
		const next = features.slice();
		next[ index ] = { ...next[ index ], ...changes };
		setAttributes( { features: next } );
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Badge', 'proofblocks' ) }>
					<ToggleControl
						label={ __( 'Mark as popular', 'proofblocks' ) }
						checked={ !! isPopular }
						onChange={ ( value ) => setAttributes( { isPopular: value } ) }
					/>
					{ isPopular && (
						<>
							<RichText
								tagName="div"
								placeholder={ __( 'Popular', 'proofblocks' ) }
								value={ badgeText }
								onChange={ ( value ) => setAttributes( { badgeText: value } ) }
								allowedFormats={ [] }
							/>
							<RadioControl
								label={ __( 'Highlight style', 'proofblocks' ) }
								selected={ popularStyle }
								options={ [
									{ label: __( 'Border glow', 'proofblocks' ), value: 'border-glow' },
									{ label: __( 'Ribbon', 'proofblocks' ), value: 'ribbon' },
									{ label: __( 'Scale up', 'proofblocks' ), value: 'scale' },
								] }
								onChange={ ( value ) => setAttributes( { popularStyle: value } ) }
							/>
						</>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Call to Action', 'proofblocks' ) }>
					<p>{ __( 'Link URL', 'proofblocks' ) }</p>
					<URLInput value={ ctaUrl } onChange={ ( value ) => setAttributes( { ctaUrl: value } ) } />
					<ToggleControl
						label={ __( 'Open in new tab', 'proofblocks' ) }
						checked={ !! ctaNewTab }
						onChange={ ( value ) => setAttributes( { ctaNewTab: value } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ isPopular && (
					<span className="proofblocks-column__badge">{ badgeText || __( 'Popular', 'proofblocks' ) }</span>
				) }
				<RichText
					tagName="h3"
					className="proofblocks-column__name"
					placeholder={ __( 'Plan name', 'proofblocks' ) }
					value={ planName }
					onChange={ ( value ) => setAttributes( { planName: value } ) }
					allowedFormats={ [] }
				/>
				<div className="proofblocks-column__price-row">
					<RichText
						tagName="span"
						className="proofblocks-column__price"
						placeholder="19"
						value={ price }
						onChange={ ( value ) => setAttributes( { price: value } ) }
						allowedFormats={ [] }
					/>
					<RichText
						tagName="span"
						className="proofblocks-column__period"
						placeholder={ __( '/mo', 'proofblocks' ) }
						value={ period }
						onChange={ ( value ) => setAttributes( { period: value } ) }
						allowedFormats={ [] }
					/>
				</div>
				<ul className="proofblocks-column__features">
					{ features.map( ( feature, index ) => (
						<li className="proofblocks-column__feature" key={ index }>
							<button
								type="button"
								className="proofblocks-column__feature-toggle"
								onClick={ () => updateFeature( index, { included: ! feature.included } ) }
								aria-label={ __( 'Toggle included', 'proofblocks' ) }
							>
								{ feature.included ? <CheckIcon /> : <CrossIcon /> }
							</button>
							<RichText
								tagName="span"
								placeholder={ __( 'Feature', 'proofblocks' ) }
								value={ feature.text }
								onChange={ ( value ) => updateFeature( index, { text: value } ) }
								allowedFormats={ [] }
							/>
							<Button
								icon="no-alt"
								label={ __( 'Remove feature', 'proofblocks' ) }
								onClick={ () => setAttributes( { features: features.filter( ( _, i ) => i !== index ) } ) }
							/>
						</li>
					) ) }
				</ul>
				<Button
					variant="secondary"
					onClick={ () => setAttributes( { features: [ ...features, { text: '', included: true } ] } ) }
				>
					{ __( '+ Add feature', 'proofblocks' ) }
				</Button>
				<RichText
					tagName="span"
					className={ 'proofblocks-column__cta' + ( ctaText ? '' : ' is-empty-placeholder' ) }
					placeholder={ __( 'Get Started', 'proofblocks' ) }
					value={ ctaText }
					onChange={ ( value ) => setAttributes( { ctaText: value } ) }
					allowedFormats={ [] }
				/>
				{ ! ctaText && (
					<p className="proofblocks-column__cta-hint">
						{ __( 'Empty - no button will show on the published page until you type a label here.', 'proofblocks' ) }
					</p>
				) }
			</div>
		</>
	);
}
