# Cart Drawer

## Purpose

The cart is a conversion-focused sidebar drawer for HUME Fragrance. It should feel
clean, sharp, premium, and easy to buy from. It is not a full cart page.

Primary goals:

- Make selected products easy to review.
- Make quantity changes and removal obvious.
- Show gift progress without distracting from checkout.
- Apply and explain offers clearly.
- Make returning-visitor rewards feel urgent and valuable.
- Preserve checkout confidence by keeping totals, discounts, and shipping clear.

Main implementation file:

- `components/CartDrawer.tsx`

Supporting systems:

- Cart state: `context/CartContext.tsx`
- Shared discount/reward logic: `lib/cart-discounts.ts`
- Coupons API: `app/api/coupons/route.ts`
- Coupon loader/fallback: `lib/db/coupons.ts`
- Checkout coupon handoff: `components/CheckoutClient.tsx`
- Cart analytics: `components/CartAnalyticsTracker.tsx`
- Preview surface: `components/CartPreviewExperience.tsx`

## Layout Order

The live drawer is a right-side overlay with max width around `430px`.

The visible order should stay:

1. Header
   - Title: `Your Selection`
   - Small status line:
     - If coupon active: `<CODE> active`
     - Otherwise: item count
   - Close button on the right

2. Welcome-back timer bar
   - Only appears when a returning-visitor reward is active
   - Shows a live 24-hour countdown
   - Keep the bar to two readable content lines:
     - `Extra 5% off + free delivery` or `Extra 10% off + free delivery`
     - secret-offer tease line
   - Uses short secret-offer tease copy:
     - `2nd visit? Secret reward unlocked ;)`
     - `Still deciding? Bigger secret unlocked ;)`
   - Emoji is visually separated so it stays visible against muted text

3. Gift progress card
   - Soft tinted card
   - Shows whether gift 1/gift 2 is unlocked
   - Shows progress toward gift thresholds
   - Does not show the small `1/1 unlocked` count line
   - Current thresholds:
     - Gift 1: `1299`
     - Gift 2: `1899`

4. Product rows
   - Image left
   - Name and inspiration/size center
   - Quantity stepper for paid products
   - `Unlocked` badge for gift products
   - Remove icon on right
   - Price on right

5. Coupon/offers section
   - Soft off-white/lilac card
   - When a code is applied, show an `Applied code` card first
   - Applied code card shows:
     - label: `Applied code`
     - large code, for example `HUME100`
     - underlined `Remove` action on the right
     - sans-serif savings line, for example `You save INR 80`
     - small green `Applied` badge
   - When no code is applied, show a compact enter-code row
   - Available coupons appear as always-visible divided rows below
   - Available coupon rows show code, short benefit, and a bordered `Apply` button

6. Complete your ritual
   - Compact add-on recommendation area
   - Current card points to `/kit-pack`
   - This is intentionally below coupons so the discount remains the stronger conversion push

7. Footer
   - Estimated total only is visible by default
   - Subtotal, offer, and shipping are collapsed behind the total row
   - Checkout button is black, sharp, and full width
   - No `Continue shopping` link at the bottom

## Visual Direction

Cart style:

- Minimal, sharp, workmanlike luxury.
- Use warm off-white backgrounds rather than heavy colored blocks.
- Avoid rounded pill-heavy or overly playful coupon UI.
- Product rows should be compact and easy to scan.
- CTA should be black, direct, and high confidence.

Current key visual choices:

- Drawer background: warm off-white.
- Gift progress card: soft tinted `#f4f0f5`.
- Offer card: soft off-white/lilac `#fbf7fb`.
- Savings accents: green `#0f6b46` / `#0f3a2b`.
- Checkout CTA: black.

## Coupon Rules

Only one coupon should be active at a time.

Coupon state is stored with:

- `hume_applied_coupon_code`

Coupons are loaded from:

- `/api/coupons`
- `/api/coupons?includeHidden=1`

Important:

- Cart and checkout totals must stay aligned.
- Manual coupons stack with the welcome-back reward.
- Gifts stack with coupons and welcome-back rewards.
- The welcome-back reward is not shown as a normal coupon row.

## Welcome-Back Rewards

Returning-visitor rewards are algorithmic rewards, not normal coupons.

Current reward stages:

- Visit 2: `Welcome Back 5`
  - Code preserved internally as `WELCOME-BACK-5`
  - Extra 5 percent off
  - Free delivery
  - 24-hour timer
- Visit 5: `Welcome Back 10`
  - Code preserved internally as `WELCOME-BACK-10`
  - Extra 10 percent off
  - Free delivery
  - 24-hour timer
  - Replaces/upgrades `Welcome Back 5`

Visit counting:

- A new visit requires a meaningful time gap.
- Current minimum gap: 30 minutes.
- Refreshing repeatedly in the same session should not increase the visit count.

Relevant localStorage keys live in `lib/cart-discounts.ts`:

- `hume_welcome_back_visit_count_v1`
- `hume_welcome_back_last_visit_at_v1`
- `hume_welcome_back_reward_v1`
- `hume_welcome_back_celebrated_reward_v1`

Important:

- Welcome-back rewards stack with manual coupons.
- They do not replace `HUME100`, `HUME200`, `B3G1`, or gifts.
- They are displayed as a timer/reward bar at the top of the cart.
- They are preserved into checkout/order context as additional offer codes.
- Preview route shows both reward states safely without touching live cart:
  - `app/admin/cart-preview/page.tsx`
  - first panel: `Welcome Back 5`
  - second panel: `Welcome Back 10`

Tracking event:

- `coupon_auto_applied` with `WELCOME-BACK-5` or `WELCOME-BACK-10` payload

## Celebration Flow

When a welcome-back reward is unlocked:

1. Full-drawer celebration overlay appears.
2. Message focuses on:
   - `5% OFF` or `10% OFF`
   - `+ Free Delivery`
3. Confetti and premium dark reward card animate.
4. Overlay fades away.
5. Product-line price magic begins.

The overlay is intentionally large because the offer should feel like something
valuable happened, not like a small toast.

## Product Price Magic

After the discount celebration ends, product prices show a staged transformation.

The animation must not overlap stages. The current design uses explicit stages:

1. `old`
   - Old product line price appears alone in a small capsule.

2. `strike`
   - Red line draws left-to-right across the old price.
   - The red line must only exist during this stage.
   - It must not overlap the discounted price.

3. `calculate`
   - Old price disappears.
   - A `Repricing` capsule appears with a sweep effect.

4. `new`
   - Discounted product line price appears in green.
   - `Discount applied` appears briefly.

State:

- `priceMagicActive`
- `priceMagicStage`: `idle | old | strike | calculate | new`

Current stage timing:

- `old` starts after the celebration closes.
- `strike` starts around `1100ms`.
- `calculate` starts around `2900ms`.
- `new` starts around `4050ms`.
- animation ends around `5800ms`.

If changing this animation, keep stages exclusive. Do not return to overlapping
keyframes where the old and new price are rendered on top of each other.

## Price Display Rules

When a percent coupon or welcome-back percent reward is active:

- Each paid product line should show:
  - Original line price struck through
  - Discounted line price

Example:

- Product: `799`
- Reward: `WELCOME-BACK-5`
- Discounted line price: `759.05`

Footer total:

- Default collapsed footer shows:
  - old total struck through when discount exists
  - new total

Expanded footer shows:

- Subtotal
- Offer discount
- Welcome-back reward discount
- Shipping

## Gift Products

Gift products:

- Should show `Unlocked`.
- Should show price as `Free`.
- Should not show quantity stepper.
- Can be removed from cart, but automatic gift eligibility may re-add gifts based on cart state.

Gift logic is controlled by cart state in:

- `context/CartContext.tsx`

## Do Not Regress

When editing the cart, preserve these behaviors:

- Cart opens as right-side drawer.
- Close button works.
- Product quantity plus/minus works.
- Product remove works.
- Gift products show as free/unlocked.
- Coupon input can apply available hidden/visible coupons.
- Active coupon can be removed.
- Available offers are visible below the applied/input area.
- Welcome-back reward persists to checkout.
- Manual coupons and welcome-back rewards stack.
- Checkout total matches cart total.
- Price magic stages do not overlap.
- Footer summary is collapsed by default.
- Bottom `Continue shopping` link should stay removed.

## Validation

After cart changes, run:

```bash
npx eslint components/CartDrawer.tsx
npx tsc --noEmit --pretty false
```

If checkout math is changed, also inspect:

- `components/CheckoutClient.tsx`

If coupon loading is changed, inspect:

- `lib/db/coupons.ts`
- `app/api/coupons/route.ts`
