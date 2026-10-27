import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep: "shop", productIds: [] };
}

export const BEGINNER_GUIDES_BATCH_SIXTEEN: BeginnerGuide[] = [
  g("How to check if perfume is original", "Product identity and trust", "To assess a perfume sold as an original brand product, verify the maker, seller and purchase channel before relying on the bottle. No home check of codes, packaging or smell can conclusively authenticate every perfume.", [
    ["Start with the claimed brand", "Use the brand's own store or retailer information to check the seller where available. A logo displayed by a shop is not independent confirmation."],
    ["Keep purchase evidence", "Save the exact listing, selected version, invoice and seller details. These are useful if the supplied product differs from the offer."],
    ["Ask the brand when concerned", "Use independently located official contact details. Avoid declaring a product genuine or counterfeit from one visual clue."],
  ], "Write who makes the perfume and what independently checked evidence supports the seller's original-product claim.", "HUME perfumes are identified as its own products, including inspired interpretations; a designer reference does not mean an original designer bottle."),
  g("Original vs fake perfume difference", "Product identity and trust", "An original brand perfume is made or supplied under that brand's identity; a counterfeit misrepresents its identity as that brand. A clearly identified inspired fragrance is a different product category, not automatically an original or counterfeit.", [
    ["Read the identity claim", "Check whose product the seller actually says it is. Similar scent direction alone cannot determine provenance."],
    ["Avoid visual verdicts", "Packaging, codes and scent impressions can raise questions but are not conclusive checks for every product."],
    ["Use traceable channels", "Prefer clear seller records and consult the claimed brand's official retailer information where available."],
  ], "Separate the product's claimed maker from the fragrance it references before assessing an offer.", "Read HUME listings as HUME fragrances rather than original designer products; no automatic verdict about other sellers follows from that distinction."),
  g("Designer perfume vs inspired perfume", "Product identity and trust", "A designer perfume and a clearly identified inspired perfume are separately made products. An inspiration reference describes a relationship in scent direction; it does not establish the same formula, materials or performance.", [
    ["Identify the actual maker", "The referenced designer name and the maker selling the interpretation are different entities. Keep both roles clear."],
    ["Compare the finished scents", "Similar notes do not guarantee identical opening, development or presence. Evaluate the exact product you intend to buy."],
    ["Choose for your priorities", "Brand identity, presentation, scent and price can matter differently. Do not substitute one category for an exact requested product without agreement."],
  ], "Write the maker and product type beside each designer or inspired candidate before comparing prices.", "HUME discovery samples help evaluate HUME bottles, not establish an identical experience with a referenced designer original."),
  g("What is a perfume clone", "Product identity and trust", "Perfume clone is informal language for a fragrance positioned around similarity to another scent. It does not specify one legal category, exact formula match or guaranteed level of resemblance.", [
    ["Read beyond the nickname", "Check the actual maker, product name and identity claims. Informal community wording is not a complete product specification."],
    ["Treat similarity as a comparison", "Opening resemblance, later character and wear can differ. A percentage claim needs evidence rather than repetition."],
    ["Keep authenticity separate", "A seller's own labelled interpretation and a product passed off as another brand involve different identity claims. Specific disputes need specific evidence."],
  ], "Describe a candidate by its own maker and scent direction instead of using clone as the whole product description.", "HUME's inspiration references do not promise a disclosed designer formula, exact similarity percentage or designer-brand affiliation."),
  g("Are inspired perfumes the same as originals", "Product identity and trust", "Inspired perfumes should not be assumed to be the same as the referenced originals. They are separately identified products whose complete scent and wearing behavior need their own evaluation.", [
    ["Separate notes from formula", "A similar notes list describes impressions, not equal ingredients, proportions or sourcing."],
    ["Compare actual development", "A familiar opening may lead to a different later scent. Record the candidate itself rather than transferring another product's reputation."],
    ["Check purchase expectations", "Someone wanting an exact original may value that brand identity. A different interpretation should be chosen knowingly."],
  ], "List which similarities you personally observed and which equivalence claims the listing does not establish.", "Use HUME samples to assess its own fragrances, without treating them as original designer decants or identical replacements."),
  g("Are tester perfumes genuine", "Product identity and trust", "Tester describes an intended demonstration or trial format, not proof that a perfume is genuine. A genuine brand tester can exist, but each seller's identity, provenance and actual offer still need checking.", [
    ["Clarify the format", "A demonstration bottle, a sample vial and an inspired trial product can all be described with tester wording."],
    ["Check the claim and channel", "Read maker, version, quantity and seller information. Confirm any claimed brand authorization independently where possible."],
    ["Avoid single-clue certainty", "A tester label, missing cap or batch code cannot authenticate the contents by itself."],
  ], "Ask what tester means in the specific offer before evaluating the seller's original-product claim.", "HUME's discovery testers contain HUME perfumes; the term does not present them as designer demonstration bottles."),
  g("Tester bottle vs retail bottle", "Product identity and trust", "Tester and retail bottles can differ in presentation or intended use, but there is no universal rule covering every brand and seller. Verify the exact version, condition and included packaging rather than assuming equivalence.", [
    ["Ask what is included", "Confirm cap, box, stated volume and whether the item has been used. Do not infer these from a stock photograph."],
    ["Match the fragrance identity", "Check maker and version before comparing prices. Tester wording does not establish a stronger or weaker formula."],
    ["Check provenance separately", "A presentation difference is not an authenticity verdict. Use the brand's own channels to check retailer claims where available."],
  ], "Compare the tester and retail offers using identity, quantity, condition and included presentation as separate fields.", "HUME's small discovery format is a trial quantity of its own fragrances, not a claim about designer retail-versus-tester equivalence."),
  g("What is a grey market perfume", "Product identity and trust", "Grey market generally describes goods sold outside a brand's authorized distribution channel. It is not, by itself, a verdict that the perfume is genuine, counterfeit or legally acceptable in every situation.", [
    ["Separate channel and contents", "An unauthorized channel and counterfeit identity are different questions. One label does not resolve the other."],
    ["Check the actual offer", "Read seller, product version, condition, source explanation and local purchase terms. Do not assume brand-backed support applies."],
    ["Avoid broad legal conclusions", "Import and resale questions depend on facts and jurisdiction. A general buying guide cannot decide a specific dispute."],
  ], "Write the evidence for product identity separately from any claim about the seller's distribution channel.", "Buy HUME fragrances as clearly identified HUME products through its current listings rather than inferring grey-market designer supply."),
  g("Can a perfume batch code prove authenticity", "Product identity and trust", "A perfume batch code alone cannot prove authenticity. A matching or plausible code is one piece of product information, not independent evidence that the container holds a genuine brand product.", [
    ["Understand the limited check", "A code lookup may describe a possible production reference. It does not verify the seller, the physical bottle or its contents."],
    ["Keep the wider record", "Save seller details, exact listing and purchase documentation. Compare any concerns with the claimed brand's official information."],
    ["Avoid automatic accusations", "A code discrepancy can prompt a question, but it does not alone establish counterfeiting or a specific explanation."],
  ], "List what a code check actually confirms and what it leaves unverified before using it in a purchase decision.", "HUME product references and order records should be read as information about HUME purchases, not authentication tools for a designer original."),
  g("How to check perfume seller reviews", "Product identity and trust", "Use seller reviews to assess patterns of service and product-description accuracy, while checking more than one source. Reviews can inform a decision but cannot authenticate a specific perfume bottle.", [
    ["Separate service from scent", "Delivery, wrong-item resolution and communication are different evidence from whether a reviewer liked the fragrance."],
    ["Read across time and sources", "Look for detailed experiences and how concerns were handled. One glowing or angry comment should not decide the whole case."],
    ["Treat badges as limited signals", "A verified-purchase label may indicate a platform transaction, not independent product authentication."],
  ], "Summarize repeated service themes separately from individual scent opinions before evaluating the seller.", "Review HUME's product identity and published policies alongside customer experiences rather than treating ratings as a substitute for clear terms."),
  g("Why is the same perfume cheaper online", "Product identity and trust", "A lower online price can reflect a different size, version, condition, seller or offer. Confirm that the products really match before interpreting the difference; cheapness alone proves neither a bargain nor counterfeiting.", [
    ["Match the exact variant", "Check maker, fragrance version, concentration label and millilitres. A reference image may show a different option."],
    ["Compare complete totals", "Include delivery and applicable charges consistently. Do not compare one checkout total with another headline price."],
    ["Read the seller explanation", "Unboxed, preorder and other conditions can matter. Do not invent a supply-chain reason the seller has not substantiated."],
  ], "Create two matching product-identity rows before deciding whether an online price is genuinely lower.", "Compare HUME's selected live variants as HUME products, not as cheaper containers of the referenced designer originals."),
  g("Sealed vs unboxed perfume", "Product identity and trust", "Sealed and unboxed describe presentation or condition claims, not conclusive authenticity evidence. Check exactly what is included, whether the item has been used and how the seller explains its status.", [
    ["Clarify the actual condition", "Unboxed does not automatically mean used, and sealed does not independently establish origin. Ask for precise wording."],
    ["Check intended use", "Gifting may make presentation important. A personal purchase may value other benefits, but identity still matters."],
    ["Read the purchase terms", "Review returns and resolution procedures for the specific condition offered. Keep the listing as a reference."],
  ], "Record product identity, stated condition and included packaging independently before comparing prices.", "Use HUME's current listing specification for what the order includes rather than assuming an unlisted sealed or unboxed discount tier."),
  g("Are perfume decants original", "Product identity and trust", "A decant is fragrance transferred into another container; the term alone does not establish where the liquid came from. A seller claiming an original-brand decant needs a credible identity and sourcing explanation.", [
    ["Check the claimed source", "Ask for the exact maker, version and source description. A photograph of another bottle is not conclusive proof of the delivered liquid."],
    ["Read the handling offer", "Confirm volume, applicator, labelling and the seller's stated filling process without assuming a universal quality standard."],
    ["Keep categories separate", "An inspired fragrance in a small vial is not automatically a decant of the referenced original."],
  ], "Write the seller's actual source claim beside the decant's exact identity before treating it as original-brand fragrance.", "HUME discovery contains HUME perfumes, including inspired interpretations, rather than decants from designer bottles."),
  g("What to check on a perfume ingredient label", "Product identity and trust", "Read the actual product label for ingredient information, directions, warnings and traceable maker details. A notes list describes scent impressions and is not a substitute for the ingredient label or the complete formula.", [
    ["Separate notes and ingredients", "Rose, amber or marine wording may describe an impression. Do not infer material sourcing or percentages from those words."],
    ["Ask product-specific questions", "If a particular ingredient matters to you, use the current label and maker's information. General format or natural claims cannot answer every concern."],
    ["Recognize label limits", "Disclosure requirements differ across markets. A listed fragrance term is not a transparent recipe or personal compatibility guarantee."],
  ], "Save the exact product's ingredient information separately from its marketing notes before evaluating an ingredient concern.", "Consult HUME's actual product information or contact the maker for a specific ingredient question rather than using inspiration notes as a formula."),
  g("Can I return perfume if I dislike the smell", "Product identity and trust", "Check the seller's current return terms before opening perfume; disliking the smell does not automatically qualify for a preference return. HUME's published policy excludes preference-based returns for opened, sprayed or used perfumes.", [
    ["Separate preference from an order issue", "Dislike is different from receiving a wrong item, leakage or missing contents. Describe the actual issue accurately."],
    ["Read the current process", "HUME asks buyers with eligible delivery problems to contact support within the stated policy window and provide order details and available evidence."],
    ["Reduce scent uncertainty earlier", "A small trial or guidance can help before a bottle purchase. Sampling does not imply a refund scheme."],
  ], "Read the current return policy and distinguish scent preference from any actual delivery discrepancy before ordering.", "Review HUME's linked return policy directly for current eligibility and procedure; use discovery as exploration, not a try-and-return promise."),
  g("How to identify a trustworthy perfume website", "Product identity and trust", "Assess a perfume website through clear seller identity, accurate product descriptions, reachable support and usable purchase terms. A polished design or secure connection alone cannot establish product authenticity.", [
    ["Read who sells what", "Check actual maker, format and quantity. Familiar inspiration names must not obscure the product being supplied."],
    ["Find the support path", "Look for order information, contact details, shipping and returns before payment. Check whether answers resolve your questions clearly."],
    ["Use independent context", "Review experiences across sources and verify claimed brand authorization from that brand where available."],
  ], "Check seller identity, product identity and resolution terms as three separate parts of website trust.", "Use HUME's live listings and policy links as facts to evaluate rather than treating this guide as an independent endorsement of every offer."),
  g("Why does my new perfume smell different", "Product identity and trust", "A new perfume can seem different because the product version, applicator, wearing context or your perception differs. A changed impression alone cannot establish counterfeit contents or prove that the formula is defective.", [
    ["Match the exact product", "Check maker, version and concentration label against what you tried earlier. A similar name may describe another fragrance."],
    ["Record the comparison context", "Note application, setting and which stage seems different. Do not demand that a sample and another atomizer deliver equal amounts per spray."],
    ["Ask about unresolved concerns", "Save the order details and contact the seller or maker with a precise description. Do not deliberately heat or alter the perfume to fix it."],
  ], "Write exactly what changed and which product facts match before deciding on a cause.", "Compare HUME samples with the exact corresponding HUME bottle, rather than expecting a referenced designer scent to be identical."),
  g("How to spot fake perfume reviews", "Product identity and trust", "You usually cannot prove a perfume review is fake from wording alone. Look for patterns that warrant caution and compare independent sources, while separating suspicious signals from a definite accusation.", [
    ["Look beyond one comment", "Repeated generic praise or unusual posting patterns can prompt closer checking. They are not conclusive proof of manipulation."],
    ["Read useful specifics", "Details about the exact version, setting or support experience can help assess relevance. A different scent opinion is not automatically dishonest."],
    ["Use reviews alongside facts", "Check the listing, maker and purchase terms directly. No review score authenticates a particular bottle."],
  ], "Compare review patterns across sources and label concerns as questions rather than proven fraud.", "Assess HUME reviews alongside exact product information and current policies; ratings do not guarantee identical personal scent experiences."),
  g("What is a niche perfume brand", "Product identity and trust", "Niche perfume brand is commonly used for a specialist fragrance-focused brand, but the term is not a universal quality or price certification. Read what the actual maker offers rather than treating niche as a performance guarantee.", [
    ["Use specific brand facts", "Look at the maker's stated focus and products. Do not infer ownership, production scale or ingredient sourcing from one category label."],
    ["Keep preference personal", "A specialist positioning does not mean every buyer will prefer the scent or experience longer wear."],
    ["Compare exact products", "Maker, version, size and later enjoyment are more useful purchase facts than prestige alone."],
  ], "Replace niche in your shortlist notes with verified maker facts and a concrete scent reason to try the product.", "Explore HUME fragrances according to their listed identity and your preferences rather than assigning an unsupported niche-quality label."),
  g("Branded perfume samples vs inspired samples", "Product identity and trust", "An original-brand sample and an inspired sample are different fragrances even when they refer to a similar direction. Branded is ambiguous unless the seller states whose product the liquid actually is.", [
    ["Check the actual maker", "An inspired perfume can have its own brand. Its label does not make it an official sample of the referenced designer."],
    ["Compare identity before price", "Record maker, exact version, sample volume and source description. Similar notes do not prove equal formula or contents."],
    ["Use trials appropriately", "A sample informs a purchase of the matching product. It cannot guarantee the experience of another maker's perfume."],
  ], "Write whose fragrance each sample contains before comparing prices or choosing a later bottle.", "HUME discovery samples evaluate HUME perfumes, including inspired interpretations, rather than original designer-brand decants."),
  g("How to verify perfume websites", "Checking sellers", "Verify a perfume website by checking the business behind it, the exact product identity and the purchase process. A professional-looking site or payment page is one part of the experience, not a certificate of authenticity.", [
    ["Check consistent seller details", "Read contact information, order terms and the name used on receipts. Resolve unexplained discrepancies before paying."],
    ["Verify external claims", "If authorization is claimed, check through the brand's independently located retailer information where available."],
    ["Save the offer", "Keep exact item, variant, total and policy details so you have a reference if something differs after delivery."],
  ], "Make a website verification note with seller identity, product identity and unresolved questions.", "Check HUME's current listings and support information directly before ordering its clearly identified fragrances."),
  g("How to verify perfume marketplaces", "Checking sellers", "On a perfume marketplace, verify the individual seller and selected listing rather than relying on the platform name alone. Different offers on one platform can involve different product identities and resolution terms.", [
    ["Identify the actual seller", "Check who supplies the selected variant and which entity handles the order. Similar listings may have different sellers."],
    ["Read offer-specific terms", "Confirm condition, size, returns and the actual support route. Do not assume every platform feature applies to every purchase."],
    ["Cross-check the identity claim", "Use the claimed maker's official information for authorization questions where possible. Platform ratings do not authenticate the liquid."],
  ], "Save the exact seller and listing version you intend to buy, not just the marketplace product title.", "If comparing a marketplace offer with HUME's own listing, confirm both describe the same HUME product and selected format."),
  g("How to verify local perfume shops", "Checking sellers", "For a local perfume shop, verify the actual business, exact product and written purchase terms. Being able to visit a counter is useful, but it does not independently prove the origin of every bottle.", [
    ["Ask for the item identity", "Confirm maker, version, size and condition rather than choosing only from a scent strip or display bottle."],
    ["Check the claimed relationship", "If the shop claims brand authorization, confirm through that brand where available rather than a shop sign alone."],
    ["Get usable records", "Ask what invoice and resolution process are provided. Confirm any exchange promise in the actual purchase terms."],
  ], "Write the exact retail item and stated after-sales process before comparing local-shop offers.", "For HUME product questions, use its current official contact information rather than assuming every local stockist relationship is verified here."),
  g("How to verify perfume decant sellers", "Checking sellers", "Verify a decant seller by checking product sourcing claims, exact identity, stated handling and order records. A decant label describes transfer to another container, not proof of original-brand contents.", [
    ["Ask for exact source identity", "Record maker, fragrance version and how the seller describes the source. A bottle image alone cannot conclusively establish the delivered liquid."],
    ["Read handling details", "Confirm quantity, applicator, labelling and the seller's filling description. Do not assume every seller uses the same process."],
    ["Check resolution terms", "Find a clear contact route for wrong labels, missing quantity or other discrepancies before paying."],
  ], "List the seller's sourcing and handling answers separately from what remains unverified.", "HUME discovery is its own fragrance sampling offer, not a designer-decant sourcing service."),
  g("How to verify designer tester sellers", "Checking sellers", "For designer tester sellers, verify the claimed brand relationship, exact condition and what tester means in the offer. A tester label or missing retail box does not establish authenticity by itself.", [
    ["Check identity and condition", "Ask for maker, version, volume, stated use history and included cap or packaging."],
    ["Verify authorization independently", "Use the brand's own contact or retailer information where available, rather than a seller-provided badge alone."],
    ["Keep purchase evidence", "Save the offer and invoice details. Do not treat code lookup results as a complete authentication process."],
  ], "Confirm exactly which designer product and condition the seller claims to supply before considering its discount.", "HUME's discovery testers are HUME perfumes, not original designer demonstration bottles sold through a tester channel."),
  g("How to verify inspired perfume brands", "Checking sellers", "Check an inspired perfume brand for transparent identity, clear product information and usable support terms. Inspiration references should not obscure who makes the fragrance or imply an undisclosed designer affiliation.", [
    ["Read the identity statement", "The actual maker and referenced scent should have distinct roles in the description."],
    ["Question equivalence claims", "Similar notes cannot establish an identical formula, fixed resemblance percentage or matched wear duration."],
    ["Evaluate the exact fragrance", "Try a sample when useful and compare later enjoyment. Reliability and personal preference are separate questions."],
  ], "Write the actual maker and every claimed relationship to the inspiration before evaluating a brand.", "Assess HUME as the maker of its own fragrances, with discovery available for its inspired and other listed directions."),
  g("How to verify perfume sample sellers", "Checking sellers", "For sample sellers, verify what each vial contains, its stated volume and how the order is labelled. Small size does not remove the need for clear product identity and purchase terms.", [
    ["Distinguish the sample type", "Read whether it is official, decanted or the seller's own fragrance. Familiar names do not resolve that distinction."],
    ["Check exact quantities", "Confirm ml, applicator and count. A photograph showing several vials may accompany a single-sample price."],
    ["Keep order traceability", "Save selected names and use the seller's stated contact process for discrepancies."],
  ], "Create a sample order inventory with maker, exact name, format and ml before payment.", "Review HUME's discovery builder selection and shared sample specification as the reference for its kit order."),
  g("How to verify Instagram perfume stores", "Checking sellers", "Verify an Instagram perfume store by checking the actual seller behind the account and keeping a clear order record. Follower counts, polished posts and message screenshots are not conclusive evidence of product authenticity.", [
    ["Check identity consistently", "Read the account's business details and independently check any linked official website or claimed brand relationship."],
    ["Request a written offer", "Confirm exact item, size, condition, total and delivery terms before paying. Avoid relying on disappearing or vague descriptions."],
    ["Keep the resolution route", "Know how to contact the seller about a mismatch and retain the relevant order information."],
  ], "Write the business identity and complete order terms outside the social-media post before deciding.", "Use HUME's independently located official site and contact information to check an account claiming to sell its products."),
  g("How to verify discount fragrance stores", "Checking sellers", "For discount stores, verify the exact discounted item and seller rather than judging from the reduction percentage. A low price is neither proof of a bargain nor a conclusive counterfeit signal.", [
    ["Read the variant", "Confirm maker, size, version and condition. Unboxed, sample and full retail offers are different comparisons."],
    ["Check the price basis", "Use final selected totals instead of comparing only crossed-out numbers or urgency messages."],
    ["Review source and service claims", "Verify claimed authorization with the brand where possible and read the actual resolution terms."],
  ], "Hide the discount percentage and evaluate the product identity, total and seller information first.", "Compare HUME's current offers as its own products without inferring authenticity or performance from a promotion's size."),
  g("How to verify niche perfume retailers", "Checking sellers", "For a niche perfume retailer, check the claimed maker relationship and exact product rather than relying on specialist styling. Niche positioning does not certify every retailer or guarantee a particular fragrance experience.", [
    ["Consult the maker", "Use the brand's official store or retailer information where available to check authorization claims."],
    ["Match the offer", "Confirm version, volume, availability and whether the item is a bottle, official sample or decant."],
    ["Read support terms", "Preorder timing, delivery and returns matter as much as an impressive catalogue."],
  ], "Check the retailer's brand relationship independently before treating a specialist assortment as proof of provenance.", "Evaluate HUME through its own product identity and policies rather than an unsupported niche-retailer label."),
  g("Are perfume websites reliable", "Seller reliability", "Perfume websites vary in reliability; the category alone cannot decide whether an individual order is trustworthy. Evaluate clear identity, accurate descriptions, service records and a usable resolution process.", [
    ["Separate website appearance", "Design and a secure connection are useful features but do not authenticate products or prove fulfilment quality."],
    ["Check the exact offer", "Maker, version, volume and current availability should be clear before payment."],
    ["Assess repeated service evidence", "Look across experiences and read current terms rather than relying on one rating or testimonial."],
  ], "List the specific website evidence supporting your purchase and any unanswered questions.", "Use HUME's published product and policy information as material to assess, not as a guarantee that every buyer will share the same scent preference."),
  g("Are perfume marketplaces reliable", "Seller reliability", "A marketplace's reliability for your order depends on the actual seller, listing and applicable support terms. A platform name or product-level star score does not authenticate every seller's perfume.", [
    ["Check seller-level information", "Read who supplies the selected offer, not just the general product page."],
    ["Understand order-specific support", "Check the current return and dispute process applicable to that item before relying on platform protection."],
    ["Match exact identities", "Different makers, sizes or conditions should not be merged into one price or review comparison."],
  ], "Assess the selected seller and applicable support process independently from the platform's reputation.", "If considering a HUME listing elsewhere, match the exact product and verify current seller information rather than assuming this guide endorses the offer."),
  g("Are local perfume shops reliable", "Seller reliability", "A local shop can offer direct conversation and product viewing, but its location alone does not establish authenticity or good after-sales service. Check the exact item and written terms as you would online.", [
    ["Use the counter visit well", "Confirm the item sold matches the maker and version you tried. A demonstration scent and packaged purchase need clear identities."],
    ["Ask about support", "Know what receipt, contact details and resolution process you receive."],
    ["Verify broader claims", "Check claimed authorization through the brand where possible rather than relying only on verbal assurances."],
  ], "Leave the shop with a clear product description and support terms before deciding reliability from personal rapport alone.", "Use HUME's official contact details for questions about its products rather than assuming every local seller is a confirmed partner."),
  g("Are perfume decant sellers reliable", "Seller reliability", "Decant sellers differ in transparency and service, and decant wording does not establish origin. Evaluate their exact source claim, handling description and order records without assuming all decants are genuine or suspect.", [
    ["Separate seller and scent", "Liking a delivered fragrance is not proof of the claimed maker. A dislike is not proof of counterfeit contents either."],
    ["Read the actual process", "Check quantity, labelling and how the seller describes filling and storage. Avoid inventing a common standard."],
    ["Check resolution experience", "Look for repeated accounts of accurate orders and clear responses to discrepancies, while keeping review limitations in mind."],
  ], "Record source transparency and service evidence as separate parts of decant-seller reliability.", "HUME discovery offers its own perfumes in sample quantities; it is not a claim about the reliability of third-party designer decants."),
  g("Are designer tester sellers reliable", "Seller reliability", "Designer tester sellers cannot be judged reliable from tester wording or discount size alone. Confirm exact condition, provenance claims and support terms for the specific purchase.", [
    ["Clarify the demonstration claim", "Ask whether it is a stated brand tester, an ordinary bottle or a small trial format."],
    ["Avoid packaging shortcuts", "A missing cap, plain box or tester print can describe presentation but cannot authenticate contents."],
    ["Use independent checks", "Consult the claimed brand's official retailer information and preserve the actual seller records."],
  ], "Separate the tester presentation claim from the evidence for seller identity and product origin.", "HUME discovery testers are its own fragrances, so do not compare them as original designer tester-bottle offers."),
  g("Are inspired perfume brands reliable", "Seller reliability", "An inspired perfume brand's reliability depends on accurate identity claims, consistent order information and usable service terms. Similarity to a reference fragrance and seller reliability are separate judgments.", [
    ["Look for clear naming", "The actual maker should remain understandable rather than hidden behind the inspiration name."],
    ["Question unsupported guarantees", "Exact formula equivalence or fixed performance cannot be established from a note list alone."],
    ["Judge preference separately", "A transparent purchase can still produce a scent you dislike. Sample uncertainty before buying quantity when useful."],
  ], "Assess product transparency and service terms before scoring personal similarity or scent enjoyment.", "Evaluate HUME's own product information and policies, using discovery to learn its fragrances rather than assuming designer identity."),
  g("Are perfume sample sellers reliable", "Seller reliability", "A sample seller is more useful to assess through clear contents, quantities and fulfilment records than a generic reliability label. A small order still needs accurate product identity and usable support.", [
    ["Check the sample category", "Official samples, decants and seller-made fragrances should be described distinctly."],
    ["Inspect order accuracy evidence", "Read experiences about correct labels, quantities and resolution, not only whether people liked the smells."],
    ["Keep your own reference", "Save selected names, sizes and current order terms for comparison after delivery."],
  ], "Build a sample-order checklist before treating low commitment as a reason to skip seller checks.", "Use HUME's final discovery selection and published specification as the reference for the actual kit order."),
  g("Are Instagram perfume stores reliable", "Seller reliability", "Instagram is a sales channel, not a product-authentication standard. Evaluate the individual business and order terms instead of deciding reliability from followers, aesthetics or influencer mentions.", [
    ["Look behind the account", "Check consistent business and contact information and independently verify any brand relationship claimed."],
    ["Read service evidence cautiously", "Testimonials and message screenshots can lack context. Compare broader information rather than relying on one post."],
    ["Keep clear order records", "Save exact item, total and fulfilment terms before payment, with a defined route for discrepancies."],
  ], "Describe the seller and purchase process without mentioning follower count before deciding whether enough information is available.", "Check HUME's independently located official site when assessing any social account claiming to represent it."),
  g("Are discount fragrance stores reliable", "Seller reliability", "Discount fragrance stores vary, so assess the exact seller and offer instead of treating cheapness as either a guarantee or a warning verdict. Clear identity and purchase terms remain essential.", [
    ["Check what changed in the offer", "A smaller size, unboxed condition or different version can affect price. Read the selected item carefully."],
    ["Ignore artificial price pressure", "Compare final totals and current terms rather than deciding from a large discount percentage alone."],
    ["Use traceable information", "Check contact details, records and independently verifiable maker relationships where available."],
  ], "Assess the discounted item as though no crossed-out price were displayed, then compare its actual value.", "Review HUME's current selected prices and policies without interpreting discounts as proof of authenticity or longevity."),
  g("Are niche perfume retailers reliable", "Seller reliability", "A niche retailer's specialist focus does not automatically establish reliability for every order. Check brand relationships, exact stock information and the service terms that apply to the item you want.", [
    ["Verify maker relationships", "Use the brand's own retailer information where available rather than assuming a specialist catalogue means authorization."],
    ["Read availability carefully", "Ready-stock, preorder and sourced-on-request offers can involve different timing. Use the stated current terms."],
    ["Separate preference and service", "A niche scent can be polarizing without the seller being dishonest. Evaluate order accuracy and resolution separately."],
  ], "Record the exact brand relationship and fulfilment status for the chosen item before judging retailer reliability.", "Use HUME's listed identity and current availability for its own fragrances rather than assigning specialist guarantees from a niche label."),
  g("What to ask perfume websites before buying", "Questions before purchase", "Before buying from a perfume website, ask for any missing facts about the exact item, seller and resolution process. Specific questions are more useful than asking for a broad guarantee that everything is original.", [
    ["Ask what will arrive", "Confirm maker, fragrance version, selected ml, condition and included packaging."],
    ["Ask about timing and total", "Clarify current availability, delivery basis and any displayed additional charges for the intended order."],
    ["Ask how issues are handled", "Read the process for wrong items, leakage or missing contents, separately from scent-preference returns."],
  ], "Resolve one unanswered question in each category—identity, fulfilment and resolution—before paying.", "Use HUME's product pages, shipping policy and return policy first, then contact support for the specific point still unclear."),
  g("What to ask perfume marketplaces before buying", "Questions before purchase", "On a marketplace, ask questions about the selected seller's exact offer and applicable support process. General platform promises may not answer what applies to a particular perfume order.", [
    ["Confirm who supplies it", "Ask which seller fulfils the selected variant and what maker, version and condition are claimed."],
    ["Clarify the item-specific terms", "Read returns, delivery and invoice information for that offer rather than another seller's listing."],
    ["Keep answers linked to the order", "Save written clarifications alongside the exact listing and selected variant."],
  ], "Prepare questions using the selected seller and variant name rather than a general marketplace product title.", "If comparing a HUME offer on another channel, confirm it matches the actual HUME product and stated seller terms."),
  g("What to ask local perfume shops before buying", "Questions before purchase", "At a local shop, ask which exact product you are testing and which item you would receive. Then confirm condition, receipt and after-sales terms rather than relying on a verbal promise alone.", [
    ["Match test and purchase", "Ask whether the demonstration and sale item share maker, version and concentration label."],
    ["Clarify presentation", "Confirm volume, use history and included cap or box. Do not assume every display item describes the packaged offer."],
    ["Ask for the written process", "Check how wrong-item or delivery concerns are resolved and whether any stated exchange applies to opened perfume."],
  ], "Ask the shop to describe the exact sale item and receipt terms before deciding from the scent strip alone.", "For a HUME product question, use its current maker information rather than assuming every shop's relationship or promise is confirmed here."),
  g("What to ask perfume decant sellers before buying", "Questions before purchase", "Ask a decant seller about exact source identity, quantity, applicator and their stated handling process. Those answers can clarify the offer, but a source photo alone cannot authenticate the liquid you receive.", [
    ["Ask what is decanted", "Confirm maker, full fragrance name and version rather than a shortened reference."],
    ["Ask what reaches you", "Check stated ml, container type, label and the seller's filling description."],
    ["Ask about discrepancies", "Know the process if the order is mislabelled, short or damaged before payment."],
  ], "Keep the decant's source claim and delivered-container specification as two separate written records.", "HUME discovery is not a designer-decant service; its samples are HUME fragrances evaluated under their own identities."),
  g("What to ask designer tester sellers before buying", "Questions before purchase", "Before buying a claimed designer tester, ask for the exact fragrance, condition and provenance explanation. Tester wording does not replace those details or prove stronger performance.", [
    ["Clarify the tester format", "Ask whether it is a demonstration bottle, retail item described as tester or small sample."],
    ["Confirm included presentation", "Check volume, stated use history, cap, box and any differences from the photographed offer."],
    ["Ask about independent confirmation", "Check claimed authorization through the brand where possible and read invoice and resolution terms."],
  ], "Record maker, version, condition and the seller's source explanation before assessing the tester discount.", "HUME's discovery testers are trial quantities of its own perfumes, not original designer demonstration stock."),
  g("What to ask inspired perfume brands before buying", "Questions before purchase", "Ask an inspired brand who makes the product, what the reference means and what the listing actually promises. Clear identity matters more than an unsupported similarity percentage.", [
    ["Ask about the actual product", "Confirm own-brand name, format, size and current ingredient information when relevant."],
    ["Clarify resemblance language", "Ask whether statements are descriptions or substantiated measurements. Do not assume formula identity or designer affiliation."],
    ["Check sampling and terms", "A small trial can help with preference, but does not imply a scent-refund or bottle-credit program."],
  ], "List the own-brand product facts separately from the inspiration reference before ordering.", "Use HUME's live descriptions and discovery offer to evaluate its own fragrances, contacting support about specific unclear claims."),
  g("What to ask perfume sample sellers before buying", "Questions before purchase", "Ask sample sellers exactly whose fragrance each sample contains and what quantity and applicator are supplied. Small format and familiar names can otherwise leave important purchase details ambiguous.", [
    ["Confirm the sample category", "Ask whether the item is official, decanted or the seller's own interpretation."],
    ["Check the selected quantities", "Confirm ml, count and labels. A pack photograph may accompany a single-vial price."],
    ["Review the order plan", "Ask about current availability, delivery and the process for mismatched contents."],
  ], "Prepare a sample inventory with maker, exact name, category, ml and applicator before payment.", "Review HUME's discovery selection and shared kit specification, then ask about any product-specific detail the listing leaves unresolved."),
  g("What to ask Instagram perfume stores before buying", "Questions before purchase", "Before buying through Instagram, ask for clear business details and a complete written offer. A direct-message assurance or popular account is not enough to define the product and purchase terms.", [
    ["Ask who sells it", "Confirm the business name, contact route and independently check any claimed connection to a maker."],
    ["Ask for the exact order", "Get maker, version, ml, condition and final total in writing rather than relying on a styled post."],
    ["Clarify support", "Know how order confirmation, tracking and any discrepancy are handled. Keep the relevant records."],
  ], "Write the complete order and seller identity in a saved record before making a social-media purchase.", "Use HUME's independently located official site and current contact details to check a social account's claim to represent it."),
  g("What to ask discount fragrance stores before buying", "Questions before purchase", "Ask a discount store what exact product and condition the reduced price applies to. A useful clarification explains the offer without relying only on a large percentage saving or urgency message.", [
    ["Confirm the matched variant", "Ask about maker, version, selected volume and whether the item is sealed, unboxed, used or a sample."],
    ["Read the actual total", "Check displayed additional charges and promotion conditions rather than assuming the headline price is the final cost."],
    ["Ask about resolution", "Review invoice information and the process for wrong or damaged items before ordering."],
  ], "Ask one concrete question about any difference between the discounted listing and the item you expected.", "Check HUME's live selected offer and policy links rather than inferring product origin or performance from its price reduction."),
  g("What to ask niche perfume retailers before buying", "Questions before purchase", "Ask a niche retailer about its relationship to the maker, the exact version and current availability. Specialist positioning does not answer product provenance, fulfilment or after-sales questions by itself.", [
    ["Clarify the maker relationship", "If authorization is claimed, use the brand's own information to check it where available."],
    ["Confirm the actual format", "Ask whether the selected item is a bottle, official sample or decant, with stated volume and condition."],
    ["Review the commitment", "Ask about preorder timing, delivery, returns and any explicitly included sampling benefits."],
  ], "Write the verified maker relationship and exact fulfilment status before placing a specialist-fragrance order.", "Evaluate HUME through its own listing and current policies rather than assuming an unsupported niche-retail designation."),
];

const byTitle = (title: string) => BEGINNER_GUIDES_BATCH_SIXTEEN.find(guide => guide.title === title)!;
byTitle("How to check if perfume is original").sources = [{ title: "CHANEL: brand guidance on counterfeit products and authorized channels", url: "https://www.chanel.com/us/anti-counterfeit/" }];
for (const title of ["How to check perfume seller reviews", "How to spot fake perfume reviews"]) {
  byTitle(title).sources = [{ title: "FTC consumer guidance: evaluating online reviews", url: "https://consumer.ftc.gov/articles/how-evaluate-online-reviews" }];
}
byTitle("What to check on a perfume ingredient label").sources = [{ title: "FDA: fragrance ingredients in cosmetics (US disclosure background; not Indian legal guidance)", url: "https://www.fda.gov/cosmetics/cosmetic-ingredients/fragrances-cosmetics" }];
byTitle("Can I return perfume if I dislike the smell").sources = [{ title: "HUME: current return and refund policy", url: "/return-refund-policy" }];
byTitle("Branded perfume samples vs inspired samples").chart = {
  headers: ["Offer", "Identity to check", "What the description does not prove"],
  rows: [
    ["Official brand sample", "Maker and exact version", "That every seller's claim is verified"],
    ["Third-party decant", "Claimed source and transfer information", "Origin from the word decant alone"],
    ["Inspired sample", "Actual maker and own-product name", "Identical designer formula or affiliation"],
  ],
};
