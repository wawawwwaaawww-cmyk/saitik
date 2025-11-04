# Mobile Header & Menu Overlay Redesign

## Summary
Переделан мобильный хедер (≤960px): кнопка "Позвонить" в стиле главной CTA, нормальный бургер из трёх полосок, меню-оверлей, всё выровнено по центру. Десктоп не тронут.

## Changes Made

### 1. CSS Updates (style.css)

#### Mobile Header Structure (lines 5544-5815)
- **Sticky Header**: position: sticky, top: 0, z-index: 100
- **Grid Layout**: `grid-template-columns: auto 1fr auto auto` (logo | brand/phone | burger | call)
- **Vertical Centering**: `align-items: center` with min-height: 56px
- **Safe Areas**: Uses `env(safe-area-inset-left/right)` for notched devices

#### Call Button - Primary CTA Style (lines 5602-5642)
- **Background**: #03d3dd (matches main CTA)
- **Border Radius**: 999px (fully rounded)
- **Shadow**: 0 12px 24px rgba(3,211,221,.35)
- **Typography**: font-weight: 800, font-size: 14px
- **Dimensions**: height: 44px, padding: 0 14px
- **Icon**: 18x18px with 8px margin-right
- **Responsive**: On ≤360px, text hides and button becomes 44x44px circle

#### Burger Menu - 3 Lines to X (lines 5644-5704)
- **Structure**: Uses ::before, span:first-child, ::after pseudo-elements
- **Line Style**: 2.5px height, #111 color, 2px border-radius
- **Default State**: 3 horizontal lines (top, middle, bottom)
- **Active State**: Top and bottom lines rotate ±45deg and meet at center, middle line opacity: 0
- **Transition**: .2s ease on transform, opacity, top, bottom
- **Extra Spans**: span:nth-child(2) and span:nth-child(3) hidden

#### Menu Overlay Pattern (lines 5707-5799)
- **Type**: Top-down overlay (not bottom sheet)
- **Overlay Background**: Fixed, rgba(0,0,0,.32), z-index: 98
- **Menu Sheet**: Fixed at top: 56px (below header), z-index: 99
- **Animation**: translateY(-12px) + opacity 0 → translateY(0) + opacity 1
- **Background**: White with box-shadow
- **Max Height**: calc(100vh - 56px) with overflow-y: auto

#### Navigation Links (lines 5745-5764)
- **Layout**: Grid with 10px gaps
- **Link Style**: 12px padding, 12px border-radius
- **Active State**: Background #f1fbfc, color #03d3dd
- **Typography**: font-size: 16px, font-weight: 400

#### Mobile Nav CTAs (lines 5767-5799)
- **Layout**: Grid, single column, 10px gaps
- **Call Button**: Background #03d3dd, color #000
- **WhatsApp Button**: Background #25d366, color #fff
- **Typography**: font-weight: 600, font-size: 15px
- **Interaction**: scale(0.98) transform on :active

#### Sticky Bar Removal (lines 5801-5808)
- **Hidden Elements**: .sticky-bottom-bar, .sticky-bar, .mobile-sticky, #sticky-cta, .btn-sticky-call
- **CSS**: `display: none !important;` on mobile ≤960px

#### Override Styles (lines 8621-8728)
- Added override styles at end of second @media (max-width: 960px) block
- Ensures overlay pattern takes precedence over old bottom sheet styles
- Sets bottom: auto, border-radius: 0, transform: translateY(-12px)

### 2. JavaScript Updates (script.js)

No changes needed - existing functions work perfectly:
- `initMobileNavigation()` (line 2007) - Handles burger click, overlay click, ESC key, tab trap
- `initCallButtonAnalytics()` (line 2207) - Tracks call button clicks
- `initHeaderCTAAnalytics()` (line 2221) - Tracks phone number clicks in brand text
- `initMobileHeader()` (line 2236) - Master initialization function

### 3. HTML Files

All 8 HTML files already have correct structure:
- index.html
- about.html
- contacts.html
- vyvod-iz-zapoya.html
- kodirovanie.html
- snyatie-pohmelya.html
- snyatie-lomki.html
- kapelnitsa-ot-pohmelya.html

Each has:
- `.site-header` with `.container`
- `.logo` with img + `.logo-text` (title + phone)
- `.call-btn` with SVG icon + text span
- `.burger-menu` with 3 <span> elements
- `.mobile-nav-overlay` + `.mobile-nav-sheet`
- `.mobile-nav-links` + `.mobile-nav-ctas`

## Acceptance Criteria Met

✅ Call button styled like main CTA (#03d3dd, 999px radius, 800 weight, shadow)
✅ 3-line burger icon transforms to X on open
✅ Menu opens as overlay below header (not bottom sheet)
✅ Semi-transparent scrim background
✅ Click scrim to close menu
✅ All header elements vertically centered
✅ ESC key and Tab trap accessibility
✅ On ≤360px, call button shows icon only
✅ No sticky bottom bar on mobile
✅ Desktop layout untouched (>960px)
✅ Analytics tracking for all interactions
✅ aria-expanded and focus management working correctly

## Desktop Behavior (>960px)

- ✅ Horizontal navigation menu visible
- ✅ Burger menu hidden
- ✅ Call button hidden
- ✅ All desktop styles preserved

## Mobile Behavior (≤960px)

- ✅ Sticky header with grid layout
- ✅ Call button visible with primary CTA styling
- ✅ Burger menu visible with 3 lines
- ✅ Menu opens as top overlay
- ✅ Scrim darkens background
- ✅ Scroll locked when menu open
- ✅ All analytics events fire correctly
