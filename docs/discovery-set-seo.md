# Discovery set search consolidation

## Feature guides

Four distinct editorial guides now live under `/discovery-guides/`: `15-perfume-samples-under-1000`, `build-your-own-perfume-sample-kit`, `try-perfume-before-buying`, and `travel-perfume-set-mini-testers`. They cover price arithmetic, selection planning, a wear-test scorecard and packing considerations respectively. Each has its own canonical URL, Article data, product image, builder links and related guides. They are linked from the main product and included in the sitemap. Existing equivalent product aliases stay redirected; these guides do not duplicate the builder. Copy derives kit facts from shared constants and distinguishes selection customization from formula development.

## Target query groups supplied by the business

| Intent | Queries | Destination and treatment |
| --- | --- | --- |
| Buy samples | perfume samples india; samples of perfume; sample perfumes; fragrance samples; perfumes samples | Main discovery product. Lead with sample count, size, selection, price and accurate availability. |
| Choose a kit | sample set; perfume discovery set; sample pack perfume; perfumes tester box and kit; tester perfume set; perfume trial | Same main product, with visible selection instructions and buyer FAQs. |
| Testers in India | tester perfumes india; perfume testers india; perfumes testers; buy perfume testers online india | Same product. Clarify HUME samples versus original designer testers and third-party decants. |
| Premium comparison | luxury perfume testers; luxury perfume tester set; expensive perfume testers; best perfume samples | Buyer questions on the main product, with factual brand identity and selection criteria. Do not claim original designer stock, highest quality or market superiority without evidence. |
| Portability | travel set perfume; mini testers | Existing travel benefit and new travel FAQ. Do not promise airline approval. |
| Customization | customize perfume | Address choosing existing fragrances in the kit. Custom fragrance formulation is a different service; do not create a landing page promising it without a confirmed consumer offer. |

Spelling and word-order variants are research targets, not text to repeat verbatim in customer copy. These groups do not require one duplicate page per phrase. FAQ structured data uses the same array as visible questions; no FAQ rich-result eligibility is assumed.

The supplied Search Console screenshot records four URLs with 4, 3, 2 and 1 impressions respectively, all with zero clicks. The separately supplied query has 8 impressions, zero clicks and average position 22.3. Date range, country, device, search type and filters were not supplied, so these are observations rather than a reliable trend or a complete baseline. The root aliases already have redirects in next.config.ts; discovery aliases now redirect through middleware.

After deployment, inspect the main `.in` URL and redirect sources in Search Console, submit the sitemap and request indexing of the canonical once. Export the same query/page filters over comparable periods, recording clicks, impressions, CTR and position by device and country. Prioritize qualified organic visits and completed orders alongside rankings. Human work still needed: genuine buyer reviews, original sample demonstrations, substantiated product comparisons and relevant independent editorial coverage. No ranking position or timeline is guaranteed.

The main product remains `/discovery-set/build-your-own-perfume-trial-kit-choose-15-3ml-samples`. The short entry path and previous ten-sample path retain their existing redirects. All 27 keyword aliases now permanently redirect to this same product; unknown aliases remain 404. Alias entries were removed from the sitemap. This consolidates equivalent product pages without discarding old incoming links.

The main page now passes the public/sample-opted-in catalogue from the server into the builder. Its first HTML response contains the sample choices rather than starting with an empty catalogue. Client refresh and checkout availability validation remain in place. Hidden products without a discovery opt-in are not serialized into the public builder.

Robots rules allow Next.js JavaScript/CSS/image assets so crawlers can render the storefront. Admin, invoice, bill, API and checkout paths remain disallowed. Product metadata and the main heading describe the customizable 15 × 3ml offer; price and pre-order availability still use shared product constants. No fabricated reviews or product-performance claims were added.

The automatically repeating five-day countdown was replaced with factual kit details. Review widgets with no rating-bearing reviews display no rating instead of a five-star score.

The existing `.com` and `.in` host-specific canonical behavior is preserved. Choosing or migrating a primary domain needs the actual Search Console/indexing and market requirements, not an assumption from search snippets. No Search Console access or verified ranking baseline was available for this change. A fetch that returns a loading screen alone does not establish what Google indexed.

Validation: TypeScript, ESLint, `tests/discovery-seo.test.ts`, existing discovery checkout tests, and local HTTP checks for the canonical page's initial sample grid, permanent alias redirects, unknown-URL 404 and crawlable framework assets. These changes improve crawlability and consistency; ranking changes must be measured after deployment and recrawling.
