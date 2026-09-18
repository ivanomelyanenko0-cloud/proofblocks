=== ProofBlocks ===
Contributors: lukystile
Tags: pricing table, cta banner, countdown timer, animated counter, blocks
Requires at least: 6.5
Tested up to: 7.1
Stable tag: 1.0.1
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Pricing tables, banners/CTAs, and animated counters for the Block Editor - no separate page builder required.

== Description ==

**ProofBlocks** adds a focused set of conversion-oriented blocks to the WordPress Block Editor:

**[Try the live demo](https://founder.cognitolab.net/proofblocks-demo/index.html)** — a real WordPress site with a Pricing Table, Banner, and Counter already published, no install needed.

* **Pricing Table** — build a pricing table with plan columns, feature lists, and a CTA button per plan. Columns are native blocks, so you have full control over each one.
* **Banner / CTA** — an image + heading + text + button banner for promotions, announcements, or lead-ins, with left/right image layouts.
* **Counter / Countdown** — an animated number counter (counts up when scrolled into view) or a countdown to a date, with a message shown when it expires.

Each block ships with its own style presets and works in both the Post Editor and the Site Editor (Full Site Editing themes). Assets are only loaded on pages where a block is actually used.

Need more plan columns, premium gradients and an animated "popular" badge, a monthly/yearly price toggle, video/parallax banners, extra banner layouts, or odometer-style counter animations? Those are available in **[ProofBlocks Pro](https://cognitolab.net/products/proofblocks)** — a separate, optional add-on. Everything listed above is fully functional in the free version with no restrictions.

== External services ==

This plugin does not connect to any external service. No data leaves your site. All block content is stored in your own WordPress database as standard post content, like any other block.

== Installation ==

1. Upload the `proofblocks` folder to `/wp-content/plugins/`, or install it directly from the WordPress plugin directory.
2. Activate the plugin through the **Plugins** screen.
3. Open any post/page in the Block Editor (or the Site Editor) and search for "Pricing Table", "Banner", or "Counter" in the block inserter.

== Frequently Asked Questions ==

= Does this work with the Site Editor / block themes? =

Yes, all three blocks work in both the classic Post Editor and the Site Editor.

= Does this plugin slow down my site? =

No. Each block's CSS/JS is only loaded on pages where that block is actually present, using the Block Editor's built-in asset-loading mechanism.

= What happens to my pricing tables/banners/counters if I deactivate the plugin? =

The block content stays in your page as standard HTML - it doesn't disappear, though it will lose its styling until the plugin is reactivated. This is standard Gutenberg behavior.

== Screenshots ==

1. Editing a Pricing Table in the Block Editor.
2. A Banner block on the frontend.
3. A Counter block animating into view.

== Changelog ==

= 1.0.1 =
* Renumbered ahead of the first public release - nothing above 1.0.0 was ever published, so this replaces what was internally 1.1.0 through 1.3.1 with a single real-world version.
* 8 ready-made color presets shared across all three blocks.
* Card shape control (Sharp/Rounded/Pill) for Pricing Table and Banner, and card style control (Flat/Bordered/Shadow) for Pricing Table and Counter.
* "Popular plan" highlight style (border glow, ribbon, or scale) for Pricing Table columns.
* "Image top" Banner layout, alongside image-left/image-right, plus a left/center text alignment control.
* Color tokens, an 8-icon picker, and an icon position control (above or beside the number) for Counter.
* Entrance animation (fade in / slide up on scroll into view) for all three blocks.
* Font choice (Default/theme, Sans-serif, Serif, Monospace, Bold condensed) and text style presets (Normal, Bold, Uppercase, Italic) for all three blocks.
* "Design preset" one-click buttons (Minimal, Bold, Corporate, Playful) in the Style panel of all three blocks - each fills in a matching combination of the above in one click. Every control stays fully editable afterward.

= 1.0.0 =
* Initial release.
