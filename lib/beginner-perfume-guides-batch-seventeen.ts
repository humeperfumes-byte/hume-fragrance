import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep: "shop", productIds: [] };
}

export const BEGINNER_GUIDES_BATCH_SEVENTEEN: BeginnerGuide[] = [
  g("How to compare reviews of perfume websites", "Comparing seller reviews", "Compare perfume-website reviews by recurring service themes and the exact products discussed, rather than star averages alone. Reviews can inform a purchase but cannot authenticate the particular bottle you will receive.", [
    ["Separate service and preference", "Order accuracy, communication and issue resolution are different evidence from a reviewer's enjoyment of the scent."],
    ["Check context across sources", "Read experiences over time and from more than one source. One enthusiastic or angry account cannot describe every order."],
    ["Compare with current terms", "A review may describe an old offer or policy. Use the live listing and published purchase information for the order you intend to make."],
  ], "Summarize repeated service themes separately from scent opinions before comparing two websites.", "Assess HUME experiences alongside its exact product identity and current policies, without expecting every wearer to share one scent verdict."),
  g("How to compare reviews of perfume marketplaces", "Comparing seller reviews", "On marketplaces, compare reviews connected to the selected seller and product variant. A general product rating may combine experiences that do not describe the offer you are considering.", [
    ["Identify the reviewed offer", "Check seller, size, version and condition where that information is available. Do not merge different suppliers into one conclusion."],
    ["Read fulfilment details", "Correct items, packaging and resolution are more relevant to seller service than whether a fragrance received compliments."],
    ["Keep badges limited", "A purchase badge may indicate a platform transaction; it is not independent authentication of the contents."],
  ], "Match review context to the exact marketplace seller and variant before treating the rating as relevant.", "If comparing a marketplace HUME offer, first confirm it describes the same HUME fragrance and selected format as the live maker listing."),
  g("How to compare reviews of local perfume shops", "Comparing seller reviews", "For local shops, compare accounts of accurate product descriptions, receipts and after-sales responses rather than friendliness alone. A pleasant visit is useful context, not proof of every product's origin.", [
    ["Look for the actual transaction", "A counter demonstration and the purchased item may differ. Reviews are more useful when the product and service issue are clear."],
    ["Separate advice from promises", "Helpful scent guidance does not establish authorization or a return entitlement. Check the shop's written terms."],
    ["Read how concerns ended", "Resolution detail can be more informative than an isolated complaint. Avoid assuming every low rating proves misconduct."],
  ], "Compare shop reviews using product accuracy, purchase records and issue resolution as separate columns.", "For HUME product or retailer questions, use the maker's current official contact information rather than assuming a reviewed shop is a confirmed partner."),
  g("How to compare reviews of perfume decant sellers", "Comparing seller reviews", "Compare decant-seller reviews for clear labels, stated quantities and order resolution while keeping sourcing claims separate. A reviewer liking the fragrance does not prove the liquid's claimed origin.", [
    ["Check exact identity references", "Version and maker details matter when reviewers compare a sample with another bottle. Similar names can obscure different products."],
    ["Read handling-related observations", "Labelling, applicator and leakage reports may help evaluate the delivered format, without certifying an entire filling process."],
    ["Avoid smell as authentication", "A different perception can have several explanations. Reviews alone cannot conclusively verify original-brand contents."],
  ], "Summarize sourcing statements separately from documented order-accuracy experiences for each decant seller.", "HUME discovery contains its own fragrances, not designer decants, so compare reviews using that actual product category."),
  g("How to compare reviews of designer tester sellers", "Comparing seller reviews", "For designer tester sellers, read reviews against the exact claimed condition and presentation. Tester wording, low prices and a reviewer saying original are not conclusive authentication evidence.", [
    ["Match the format", "A demonstration bottle, retail bottle and trial vial are different offers. Identify what the reviewer received."],
    ["Read condition accuracy", "Included cap, box and stated use history can affect whether the item matched the listing."],
    ["Check independent information", "Use the claimed brand's own retailer information where available rather than treating seller ratings as authorization."],
  ], "Compare whether each tester order matched its written condition before evaluating general praise.", "HUME's small discovery testers should be reviewed as HUME trial fragrances, not original designer demonstration bottles."),
  g("How to compare reviews of inspired perfume brands", "Comparing seller reviews", "Compare inspired-brand reviews by the exact own-brand product and the reviewer's criteria. Similarity, scent enjoyment, wear and seller service are different judgments that should not be collapsed into one score.", [
    ["Read the product being assessed", "A reference to a designer scent does not mean the sample contains that original fragrance."],
    ["Separate preference from resemblance", "Someone can enjoy an interpretation while finding it different from the reference, or dislike a resemblance they recognize."],
    ["Check service independently", "Order accuracy and support matter even when similarity opinions vary. Avoid using a scent disagreement as proof of dishonest service."],
  ], "Create separate notes for own-product enjoyment, perceived resemblance and purchase service.", "Use HUME reviews to assess its own fragrances and service, without transferring a designer original's reputation to the interpretation."),
  g("How to compare reviews of perfume sample sellers", "Comparing seller reviews", "For sample sellers, compare reviews about correct identities, stated volumes and usable labels as well as scent opinions. Small purchases still need clear fulfilment and support evidence.", [
    ["Identify the sample category", "Official samples, decants and seller-made fragrances should be evaluated under their actual identities."],
    ["Look for usable order detail", "Correct fragrance choices and a clear response to missing or mislabelled items are practical service themes."],
    ["Avoid universal wear conclusions", "Different applicators and personal experience limit comparisons of fixed hours or exact spray counts."],
  ], "Compare sample reviews by order accuracy and later scent preference in separate fields.", "Use HUME's selected discovery names and published kit specification as the reference for evaluating whether the order matched."),
  g("How to compare reviews of Instagram perfume stores", "Comparing seller reviews", "For Instagram stores, compare identifiable purchase experiences beyond reposted praise and follower counts. Message screenshots or influencer mentions can lack enough context to evaluate the actual transaction.", [
    ["Check the business being reviewed", "Similar account names can cause confusion. Match the seller identity and any independently verified official links."],
    ["Look for order specifics", "Exact item, fulfilment and resolution details are more useful than a generic endorsement."],
    ["Keep uncertainty explicit", "Repetitive praise can prompt closer checking but does not alone prove manipulation. Compare other available evidence."],
  ], "Describe the review evidence without using follower count or account aesthetics as a reliability score.", "Check HUME's independently located official site before assuming a social account or testimonial represents the maker."),
  g("How to compare reviews of discount fragrance stores", "Comparing seller reviews", "Compare discount-store reviews against the exact size, condition and product type sold. A low-price review can describe a very different offer from the retail bottle you have in mind.", [
    ["Match the discounted item", "Sample, unboxed and full retail products need separate comparisons. Do not judge only the percentage saving."],
    ["Read description accuracy", "Whether the delivered item matched the stated condition is a more concrete issue than whether it looked premium."],
    ["Assess complaint resolution", "Read the outcome where available rather than assuming a discount excuses unclear support or proves counterfeiting."],
  ], "Compare review context and product condition before comparing praise for a bargain.", "Evaluate HUME's live selected offer and current policies rather than interpreting promotion size as an authenticity or performance rating."),
  g("How to compare reviews of niche perfume retailers", "Comparing seller reviews", "For niche retailers, compare product accuracy, current availability and service detail rather than specialist reputation alone. A polarizing scent opinion does not necessarily describe seller reliability.", [
    ["Separate fragrance and retail experience", "A reviewer may dislike an unusual composition while receiving exactly what was ordered."],
    ["Check timing context", "Ready-stock, preorder and sourced items can involve different expectations. Read the terms that applied to the reviewed offer."],
    ["Verify maker relationships separately", "A well-reviewed catalogue is not independent confirmation of brand authorization."],
  ], "Summarize fragrance opinions and retailer-service patterns separately before choosing a specialist offer.", "Assess HUME by its own product information and service terms rather than assigning a niche-retailer certification."),
  g("Return policies to check at perfume websites", "Reading return terms", "Before buying from a perfume website, distinguish preference returns from wrong-item, missing-content or delivery-damage support. Read the current eligibility, contact process and timing for the exact order.", [
    ["Check opening and use terms", "Do not assume a scent you dislike can be returned after spraying. Read the policy before opening."],
    ["Find the discrepancy process", "Know what order details and available evidence the seller requests for a genuine delivery issue."],
    ["Keep the current record", "Save the terms relevant to the purchase and ask about unclear wording rather than treating a guide as legal advice."],
  ], "Write the policy's preference rule and delivery-issue process as two separate notes before payment.", "HUME's current policy excludes preference returns for opened, sprayed or used perfume; read the linked policy for eligible delivery cases and procedure."),
  g("Return policies to check at perfume marketplaces", "Reading return terms", "For a marketplace perfume order, read the terms applying to the selected seller and item, including the actual platform support route. Do not assume all listings share one return arrangement.", [
    ["Check item-level eligibility", "Size, condition or product category may affect the described process. Use the current selected offer."],
    ["Separate support responsibilities", "Find whether the seller or platform handles the issue and how to contact the right route."],
    ["Describe the issue accurately", "Disliking a scent and receiving the wrong item are different matters. Keep order records and available evidence."],
  ], "Save the selected listing's return terms and support route rather than a general platform slogan.", "If buying a HUME product through another channel, review that order's applicable terms instead of assuming the direct-site process is identical."),
  g("Return policies to check at local perfume shops", "Reading return terms", "At a local shop, ask for the actual written exchange or return terms before buying perfume. A friendly verbal assurance may leave important limits about opening, use and condition unclear.", [
    ["Clarify the preference rule", "Ask what happens if the purchased fragrance is simply not to your taste after use."],
    ["Confirm item-match support", "Know the process if the sale item differs from what was described or supplied. Keep the receipt and exact product details."],
    ["Record any specific promise", "Ask how the stated arrangement appears in the purchase record rather than relying on memory."],
  ], "Confirm opening restrictions and the written resolution process before leaving the shop with the purchase.", "Use HUME's direct published policy for direct orders; do not assume a local shop's separate promise is confirmed by the maker."),
  g("Return policies to check at perfume decant sellers", "Reading return terms", "For decants, check how the seller handles wrong labels, stated-quantity discrepancies and leakage separately from scent preference. Transfer into another container makes clear product and order records especially useful.", [
    ["Save the specification", "Record exact maker claim, fragrance version, ml and applicator before delivery."],
    ["Read the complaint process", "Check contact timing and what available evidence is requested. Do not assume a particular remedy without the actual terms."],
    ["Avoid taste-based accusations", "A different smell impression alone does not establish a wrong product or counterfeit origin."],
  ], "Write the decant order specification and support process before comparing the seller's price.", "HUME discovery is its own fragrance offer rather than designer decants; use its current policy for an actual HUME order."),
  g("Return policies to check at designer tester sellers", "Reading return terms", "For a designer tester offer, read return terms alongside the exact stated condition and included presentation. Tester status does not by itself define a refund rule or excuse a mismatched order.", [
    ["Document the condition", "Confirm stated use history, volume, cap and box before payment. A stock image may not describe the sale item."],
    ["Check discrepancy handling", "Find the process if the delivered condition or version differs from the written offer."],
    ["Separate preference from identity", "A disliked scent is not the same issue as a misdescribed product. Explain the concern precisely."],
  ], "Save the tester's written condition beside the current return procedure before ordering.", "HUME's discovery testers are small own-brand samples, not designer demonstration stock with an assumed tester-specific return scheme."),
  g("Return policies to check at inspired perfume brands", "Reading return terms", "For an inspired brand, read the scent-preference and product-discrepancy rules before buying. Not finding an interpretation identical to its reference is different from receiving an item other than the stated own-brand product.", [
    ["Read the identity promise", "Confirm what the brand actually sells and any specifically stated claims. Do not assume formula equivalence."],
    ["Check opened-product terms", "Sampling or trial wording does not automatically include returns after wear."],
    ["Use exact issue descriptions", "Wrong fragrance, leakage and a personal similarity opinion should not be merged into one complaint."],
  ], "Record the actual own-brand promise and the policy for opened scent-preference returns before paying.", "Review HUME's current policy: its discovery set is exploration of HUME fragrances, not a designer-equivalence refund program."),
  g("Return policies to check at perfume sample sellers", "Reading return terms", "For sample orders, read the process for missing choices, incorrect labels and delivery leakage as well as opening restrictions. Small volume does not make the order details or policy irrelevant.", [
    ["Keep the final selection", "Save exact names, count, individual ml and applicator. This is the comparison reference when the parcel arrives."],
    ["Check issue reporting", "Read current contact timing and requested information for a discrepancy rather than inventing a universal sample policy."],
    ["Understand trial commitment", "A sample can reduce scent uncertainty but is still a purchase under actual terms."],
  ], "Make an order inventory and read the sample seller's discrepancy process before ordering.", "Use HUME's final discovery list and published policy for its own kit; preference returns are not implied by the word sample."),
  g("Return policies to check at Instagram perfume stores", "Reading return terms", "Before a social-media perfume purchase, ask for a stable written return and issue-resolution policy. A short direct-message assurance can leave opening restrictions, timing and the responsible business unclear.", [
    ["Identify who handles support", "Save the business name and contact route, not only the social handle."],
    ["Get the exact terms", "Ask about scent preference, wrong items and delivery damage as separate situations."],
    ["Retain order context", "Keep the selected product, total and written clarifications so the purchase can be described accurately later."],
  ], "Save the actual resolution terms with the complete social-media order before payment.", "Check HUME's independently located official site and current policy instead of assuming an account's informal promise represents the maker."),
  g("Return policies to check at discount fragrance stores", "Reading return terms", "For a discounted perfume, read the exact condition and current return terms rather than assuming either normal eligibility or automatic exclusion. The applicable offer should explain the purchase commitment clearly.", [
    ["Read the condition first", "Unboxed, used, tester and retail descriptions are different. Save what the selected price actually covers."],
    ["Separate issue types", "Preference, wrong item and damage require accurate descriptions. A sale label does not explain every case."],
    ["Check before chasing savings", "A lower price may not serve your needs if the terms remain unclear. Ask the specific question before buying."],
  ], "Compare the discounted condition and return arrangement together before deciding the saving is worthwhile.", "Review HUME's current policy and selected offer; do not infer extra return rights or restrictions from a promotion alone."),
  g("Return policies to check at niche perfume retailers", "Reading return terms", "For a niche retailer, check returns and support alongside the actual fulfilment status. Specialist positioning does not create a universal policy for preorders, samples or opened fragrance.", [
    ["Check the purchase type", "Ready-stock, preorder and sourced offers can have different described timing. Read the exact current arrangement."],
    ["Clarify preference terms", "A polarizing scent is not necessarily a product defect. Ask what the seller states about opened products."],
    ["Find the support process", "Keep product identity and order records for wrong or damaged-item concerns."],
  ], "Write the order's fulfilment status and current opened-product rule before buying a specialist fragrance.", "HUME's discovery preorder and direct-site policy should be reviewed as their actual published offer, not a presumed niche-retail program."),
  g("Authenticity questions for perfume websites", "Clarifying authenticity", "Ask a perfume website whose fragrance it supplies, who sells it and how any brand-authorization claim can be independently checked. A broad original guarantee is weaker than clear product identity and traceable information.", [
    ["Ask for exact identity", "Confirm maker, version, concentration label and selected volume rather than relying on a reference name."],
    ["Check the claimed channel", "Use the maker's own retailer or contact information where available. A seller badge alone is not confirmation."],
    ["Keep limits explicit", "Codes, seals and photographs can inform questions but do not conclusively authenticate every delivered product."],
  ], "Ask which independently checkable fact supports the website's claim about the exact maker.", "HUME's listings identify HUME perfumes, including inspired interpretations, rather than designer originals sold under reference names."),
  g("Authenticity questions for perfume marketplaces", "Clarifying authenticity", "On marketplaces, direct authenticity questions to the exact seller and selected offer. A platform listing, aggregated rating or purchase badge cannot by itself establish the contents of every seller's stock.", [
    ["Identify the supplier", "Ask who supplies the selected variant and what maker and version are claimed."],
    ["Verify external relationships", "Check any authorization claim through the brand's official information rather than only the marketplace description."],
    ["Preserve the actual offer", "Save seller, variant and written clarifications so a later concern can refer to a specific purchase."],
  ], "Record the selected seller's precise product claim before using platform-level reassurance in a decision.", "If assessing a marketplace HUME offer, match the exact HUME product and check current seller details separately."),
  g("Authenticity questions for local perfume shops", "Clarifying authenticity", "At a local shop, ask about the maker, sale-item identity and any claimed authorization rather than treating a counter visit as authentication. The product tested and the item sold need clear matching details.", [
    ["Match the exact version", "Ask whether the display tester and sale bottle share maker, version and concentration label."],
    ["Check the shop's claim", "Where available, confirm authorization through the brand's own channels rather than a sign or verbal assurance."],
    ["Keep a purchase record", "Ask what receipt and product information are provided for the actual sale item."],
  ], "Write the sale item's maker and version before deciding from the demonstration scent alone.", "For HUME relationship questions, use current official maker contact information rather than assuming every local seller is verified."),
  g("Authenticity questions for perfume decant sellers", "Clarifying authenticity", "Ask a decant seller what exact source fragrance is claimed and how the delivered vial is identified. Decant describes transfer, not proof that the liquid came from the stated original bottle.", [
    ["Request exact source wording", "Maker and full version matter. A shortened name can hide a different concentration or product."],
    ["Check the transfer description", "Read stated volume, applicator, label and filling information without assuming all sellers follow one process."],
    ["Recognize evidence limits", "A source-bottle photo and a familiar smell cannot conclusively establish the delivered vial's provenance."],
  ], "Write what the seller claims about source and what remains unverified about the delivered vial.", "HUME discovery samples are its own fragrances rather than decants from designer source bottles."),
  g("Authenticity questions for designer tester sellers", "Clarifying authenticity", "For a claimed designer tester, ask what tester means, what condition is supplied and how the brand identity claim can be checked. Presentation differences are not authenticity certificates.", [
    ["Clarify the product", "Confirm demonstration bottle versus retail item or small trial format, with exact maker and version."],
    ["Ask about condition", "Record stated use history, volume and included cap or box. Check the selected offer rather than a generic photo."],
    ["Verify claims independently", "Consult the brand's official retailer information where available. Do not rely solely on printed tester text or a code lookup."],
  ], "Separate the tester-condition description from the evidence for the claimed designer origin.", "HUME's trial testers contain HUME perfumes, not designer demonstration stock that this guide authenticates."),
  g("Authenticity questions for inspired perfume brands", "Clarifying authenticity", "For inspired perfumes, clarify the actual maker and the meaning of the reference rather than asking whether the product is the designer original. A clearly identified interpretation is a separate fragrance to evaluate.", [
    ["Ask whose product it is", "The own-brand name and inspiration reference should remain distinct in the description."],
    ["Question identity overlap", "A similar notes list does not establish the same formula, ingredients or brand affiliation."],
    ["Assess the stated promise", "Treat resemblance and wearing claims according to the evidence offered, not a universal percentage assumption."],
  ], "Write the own-brand identity and inspiration claim in two separate lines before buying.", "Evaluate HUME as the maker of its own fragrances; samples inform HUME bottle choices rather than authenticate a designer original."),
  g("Authenticity questions for perfume sample sellers", "Clarifying authenticity", "Ask sample sellers whether the item is an official brand sample, a third-party decant or their own fragrance. Small format and familiar names do not answer that identity question.", [
    ["Confirm maker and version", "Save the full name rather than a vague reference. A sample should match the product you intend to evaluate."],
    ["Read source claims", "If a decant is offered, ask how the source is described. If own-brand, keep that identity explicit."],
    ["Keep order details", "Record count, ml and labelling so the delivered selection can be compared with the actual offer."],
  ], "Classify each sample by its actual product type before comparing its price or reviews.", "HUME discovery contains HUME perfumes, including inspired interpretations, and is not an official designer-sample assortment."),
  g("Authenticity questions for Instagram perfume stores", "Clarifying authenticity", "For an Instagram store, ask about the business behind the account and the exact fragrance identity. Followers, polished posts and shared testimonials do not independently establish product origin.", [
    ["Check who is speaking", "Match business details and independently located official links before trusting a claimed maker relationship."],
    ["Get the product claim in writing", "Confirm maker, version, condition and ml rather than relying on an image caption alone."],
    ["Avoid social proof as proof", "Screenshots, endorsements and engagement can lack transaction context. Use traceable facts alongside them."],
  ], "Write the actual business and maker claims without mentioning followers before assessing the account.", "Use HUME's independently located official site to check whether a social account's claim to represent it is consistent."),
  g("Authenticity questions for discount fragrance stores", "Clarifying authenticity", "At discount stores, ask which exact product and condition the low price describes before assessing origin. Cheapness alone cannot prove either authenticity or counterfeiting.", [
    ["Match the offer", "Check maker, version, volume and whether it is a sample, tester, unboxed or ordinary retail item."],
    ["Ask for a specific explanation", "Use what the seller actually states about the offer rather than inventing a supply-chain reason for the price."],
    ["Check wider evidence", "Review seller records and any independently verifiable brand relationship. Codes and seals remain limited clues."],
  ], "Write which exact difference explains the offer, if stated, and which origin questions remain unresolved.", "Compare HUME's selected live offer as HUME perfume without using its discount or inspiration reference to infer designer contents."),
  g("Authenticity questions for niche perfume retailers", "Clarifying authenticity", "For niche retailers, ask about the exact maker relationship and product format. A specialist catalogue or rare-looking assortment does not independently verify every stock claim.", [
    ["Check the maker connection", "Where available, consult the brand's own retailer information or official contact route."],
    ["Clarify the supplied item", "A bottle, official sample and decant have different source questions. Confirm version and stated condition."],
    ["Avoid category guarantees", "Niche does not certify ingredients, provenance or personal performance. Use specific product facts."],
  ], "Record the exact source claim and independently checked maker relationship before buying from a specialist assortment.", "Evaluate HUME through its own listed identity rather than assuming an unsupported niche-retailer classification."),
  g("Red flags when buying from perfume websites", "Purchase warning signs", "Unclear seller identity, ambiguous product descriptions and unanswered order questions are reasons to pause at a perfume website. They warrant clarification, not an automatic fraud accusation.", [
    ["Check consistency", "Compare maker, selected size and seller details across the page and checkout. Resolve unexplained differences."],
    ["Resist pressure", "Urgency messages should not replace reading the final total and policies. A large discount is not enough evidence either way."],
    ["Keep the decision reversible", "Do not buy until the important product and support questions have clear answers."],
  ], "List unresolved identity, price or resolution questions before deciding whether to proceed.", "Use HUME's current listings and policy pages to check a proposed order rather than treating this guide as an independent seller certification."),
  g("Red flags when buying from perfume marketplaces", "Purchase warning signs", "On marketplaces, a seller or variant changing during the purchase and unclear item-specific terms are reasons to stop and review. Platform familiarity does not remove the need to check the selected offer.", [
    ["Watch the actual supplier", "Confirm who supplies the variant currently selected rather than a seller from an earlier search result."],
    ["Read mixed information carefully", "Reviews or images may cover different sizes, conditions or sellers. Match the evidence to your order."],
    ["Clarify the support route", "Know which current process applies to discrepancies before relying on general platform reassurance."],
  ], "Recheck seller, variant and applicable terms at the final review stage before payment.", "For a marketplace offer claiming HUME identity, compare the exact product with the maker's current information rather than assuming platform verification."),
  g("Red flags when buying from local perfume shops", "Purchase warning signs", "At a local shop, vague product identity, pressure to skip a receipt or unclear sale-item condition are reasons to ask more questions. A friendly conversation does not replace a clear purchase record.", [
    ["Match demonstration and sale", "Confirm the item you receive is the stated maker and version, rather than assuming it matches the scent strip."],
    ["Ask for the written offer", "Check size, condition, price and resolution terms. Avoid relying on memory of a verbal promise."],
    ["Keep conclusions proportionate", "An unresolved question can justify not buying without proving misconduct by the shop."],
  ], "Pause until the exact sale item and purchase record are clear, even if you enjoyed the demonstration.", "Use HUME's official contact information for maker questions rather than assuming an unconfirmed local relationship."),
  g("Red flags when buying from perfume decant sellers", "Purchase warning signs", "For decants, missing source identity, unclear volume and vague labelling are reasons to pause. A source-bottle photograph or familiar smell cannot resolve every provenance question.", [
    ["Check the exact source claim", "Maker and full fragrance version should be clear before comparing price."],
    ["Read the delivered format", "Confirm ml, applicator and label information, with a usable process for discrepancies."],
    ["Avoid unsupported verdicts", "A scent difference alone does not prove a counterfeit decant. Ask for facts rather than inventing the cause."],
  ], "Identify which decant facts are missing before deciding whether the offer is sufficiently clear.", "HUME discovery is its own perfume sampling offer, not a claim that a small vial contains a referenced designer original."),
  g("Red flags when buying from designer tester sellers", "Purchase warning signs", "For designer testers, unexplained condition, guaranteed stronger formulas or code-only authentication claims deserve closer checking. Tester presentation is not a substitute for product identity and traceable seller information.", [
    ["Clarify format and use history", "Ask whether the item is a demonstration bottle and what quantity, cap and box are supplied."],
    ["Question broad guarantees", "Tester wording does not establish stronger concentration, exact duration or original-brand contents."],
    ["Use independent checks", "Check claimed authorization through the brand where available. If important questions remain unanswered, do not rush the purchase."],
  ], "Write the specific tester claim that needs evidence rather than treating every unusual box as a fake.", "HUME's small discovery testers should not be mistaken for designer tester bottles or assigned a stronger-tester formula claim."),
  g("Red flags when buying from inspired perfume brands", "Purchase warning signs", "For inspired brands, an obscured actual maker or unsupported claims of identical designer formula are reasons to seek clarification. Similarity language should not mislead you about what product is supplied.", [
    ["Read identity clearly", "An inspiration name should not replace the own-brand product identity."],
    ["Separate description and measurement", "Notes and enthusiasm cannot establish exact resemblance percentages, material quantities or guaranteed performance."],
    ["Check the real commitment", "A trial offer does not automatically include a refund if you disagree about similarity."],
  ], "List which inspiration claims are descriptive and which would require specific supporting evidence.", "Evaluate HUME as its own fragrance maker, with sample trials for HUME preference rather than a designer-equivalence promise."),
  g("Red flags when buying from perfume sample sellers", "Purchase warning signs", "For sample sellers, ambiguous product type, missing ml and a pack image attached to an unclear single-vial price are reasons to pause. Small order value should not replace basic product checks.", [
    ["Clarify what each sample is", "Official samples, decants and inspired fragrances need accurate identities."],
    ["Read selected quantities", "Confirm count, size and applicator before evaluating the price or trial plan."],
    ["Keep support clear", "Know how wrong labels, missing choices or leakage are reported rather than assuming small orders have no resolution process."],
  ], "Build a complete sample inventory before deciding whether the listing is clear enough to order.", "Use HUME's final builder selection and shared sample specification as the reference for its actual discovery purchase."),
  g("Red flags when buying from Instagram perfume stores", "Purchase warning signs", "For Instagram perfume stores, unclear business identity, disappearing order details and pressure to pay before questions are answered warrant caution. None alone establishes a final fraud verdict, but they can justify pausing.", [
    ["Check the account claim", "Independently locate the maker's official channels when representation is claimed. Similar handles are not enough."],
    ["Keep a complete offer", "Save product identity, condition, total and fulfilment terms rather than relying only on a temporary post."],
    ["Avoid social pressure", "Followers and influencer mentions should not override unresolved product or support questions."],
  ], "Pause until the business and full order can be described without relying on social engagement.", "Use HUME's independently located official website and contact route before trusting an account claiming to represent it."),
  g("Red flags when buying from discount fragrance stores", "Purchase warning signs", "For discount stores, a price that cannot be tied to a clear size, condition and maker deserves clarification. A large advertised saving is not a reason to ignore missing purchase information.", [
    ["Inspect the selected item", "Retail bottles, testers, samples and unboxed stock are different offers. Match them before comparing prices."],
    ["Question urgency", "Do not let a countdown or crossed-out number replace checking the final total and terms."],
    ["Keep identity separate", "Cheapness does not prove counterfeiting, and a plausible price does not prove authenticity."],
  ], "Evaluate the discounted product with the saving hidden, then decide whether the actual offer is useful.", "Check HUME's current selected variant and policy details without inferring formula quality or designer origin from a discount."),
  g("Red flags when buying from niche perfume retailers", "Purchase warning signs", "At niche retailers, unclear maker relationships, vague sourced-stock timing or prestige used in place of product facts are reasons to ask more questions. Specialist positioning is not a universal trust certificate.", [
    ["Verify relationship claims", "Use the maker's official information where available rather than treating a rare catalogue as authorization."],
    ["Clarify availability", "Ready-stock and preorder descriptions should not be treated as the same delivery promise."],
    ["Read the complete item", "Confirm format, version, volume and support terms. Niche does not establish rarity, natural content or longevity."],
  ], "Write the exact unresolved source or fulfilment question before paying for a specialist offer.", "Use HUME's own product identity and current availability rather than an unsupported premium-retailer assumption."),
  g("How to compare prices across perfume websites", "Comparing seller prices", "Across perfume websites, match exact maker, version, size and condition before comparing complete prices. Two listings with a familiar name may not supply the same product.", [
    ["Build matched product rows", "Record concentration label and selected quantity, not only the main image or search title."],
    ["Use a consistent total", "Include displayed delivery and other charges on the same basis. Apply only promotions the actual order qualifies for."],
    ["Read practical differences", "Availability, returns and seller information can affect whether a lower-cost offer serves your needs."],
  ], "Compare exact identity and delivered total in one row per website before ranking cost.", "Use HUME's live selected variants as clearly identified HUME offers rather than cheaper versions of designer originals."),
  g("How to compare prices across perfume marketplaces", "Comparing seller prices", "For marketplace prices, compare the exact seller offer and final selected variant rather than one aggregated product title. A different seller, size or condition can explain an apparent price difference.", [
    ["Track the supplier", "Save the seller attached to the option you intend to purchase, especially if offers change during selection."],
    ["Compare actual totals", "Use checkout information for the intended destination and applicable promotion conditions."],
    ["Include order-specific terms", "Support, returns and fulfilment can differ. A lower price is not the complete purchase comparison."],
  ], "Create one comparison row for each seller-and-variant combination rather than one row per platform.", "If comparing marketplace HUME listings, first match them to the exact current HUME product and format."),
  g("How to compare prices across local perfume shops", "Comparing seller prices", "Across local shops, compare the actual sale item, included presentation and written total. A demonstration bottle's name or a verbal price alone may not define the same offer everywhere.", [
    ["Match the retail item", "Confirm maker, version, selected ml and condition at each shop."],
    ["Record included benefits", "Box, cap and any explicitly offered services should be separate comparison facts rather than assumed extras."],
    ["Keep purchase terms", "Ask about receipt and resolution arrangements before deciding a small saving is worthwhile."],
  ], "Write the exact sale-item specification and total after each visit instead of comparing remembered quotes.", "Use HUME's current product information for maker-level facts without assuming every local-shop offer or relationship is verified."),
  g("How to compare prices across perfume decant sellers", "Comparing seller prices", "Compare decant prices only after matching the claimed maker, version, stated volume and applicator. Cost per ml is useful arithmetic, but it does not authenticate the source or assess handling.", [
    ["Record the source claim", "Do not compare an inspired sample and a claimed designer decant as identical products."],
    ["Calculate consistently", "Use actual ml and the same delivered-price basis across offers. Avoid exact price-per-spray assumptions."],
    ["Keep clarity in the decision", "Labelling, order records and support matter alongside the number. A low unit price cannot answer every sourcing question."],
  ], "Compare source claim, ml, format and complete total before calculating decant unit prices.", "HUME discovery contains HUME fragrances, so keep its quantity arithmetic separate from designer-decant equivalence claims."),
  g("How to compare prices across designer tester sellers", "Comparing seller prices", "For designer tester prices, match the exact fragrance and stated condition before assessing savings. A missing box, different size or used item may create a different offer rather than a cheaper identical purchase.", [
    ["List condition details", "Confirm volume, stated use history, cap and packaging for each option."],
    ["Check identity independently", "Price and tester print do not prove origin. Use brand information for authorization questions where available."],
    ["Read the full commitment", "Compare final total and current resolution terms rather than a headline tester discount alone."],
  ], "Build a tester comparison table with product identity and condition before entering the prices.", "HUME's small own-brand discovery testers are not equivalent offers to designer demonstration bottles."),
  g("How to compare prices across inspired perfume brands", "Comparing seller prices", "Across inspired brands, compare separately made fragrances by exact identity, quantity and your own enjoyment. A shared reference name does not establish equal formula or equal performance.", [
    ["Read the actual product", "Record own-brand name, maker, size and format instead of treating the inspiration as the product identity."],
    ["Use trial evidence", "Assess later character and repeat preference before choosing a large quantity purely on unit price."],
    ["Compare complete offers", "Include delivery and current terms without inventing a universal similarity or longevity score."],
  ], "Compare own-product enjoyment and delivered cost in separate columns for each inspired candidate.", "Evaluate HUME through its own samples and live prices rather than claiming the same reference makes all interpretations identical."),
  g("How to compare prices across perfume sample sellers", "Comparing seller prices", "For sample-seller prices, compare product category, exact fragrance, stated ml and useful variety. A small price can refer to one vial while another offer includes a whole assortment.", [
    ["Match the category", "Official samples, decants and maker-owned interpretations need distinct identities before price comparison."],
    ["Read pack quantities", "Confirm count and individual volumes rather than inferring contents from a group image."],
    ["Count relevant learning", "A lower cost per vial can be poor value if many scents do not interest you. Include complete order charges."],
  ], "Calculate delivered cost and relevant sample count separately before deciding which offer serves your trial.", "Use HUME's shared kit specification and builder choices to compare actual quantity and useful selection."),
  g("How to compare prices across Instagram perfume stores", "Comparing seller prices", "Across Instagram stores, get a complete written offer before comparing prices. A promotional post or direct-message quote may omit size, condition or fulfilment details that change the purchase.", [
    ["Identify the business", "Keep the seller name and contact route with each quote rather than a screenshot detached from its context."],
    ["Match product and condition", "Confirm maker, version, ml and included presentation so the offers describe comparable items."],
    ["Compare complete totals", "Add displayed delivery and other stated charges. Do not let follower counts replace checking the terms."],
  ], "Create a saved quote row with seller identity, exact item and final total before choosing a social-media offer.", "Compare any account claiming HUME identity with the independently located maker site and current product information."),
  g("How to compare prices across discount fragrance stores", "Comparing seller prices", "Across discount stores, compare actual selected prices rather than the size of advertised reductions. First match product identity, quantity and condition, then check complete costs and terms.", [
    ["Ignore reference-price drama", "A larger crossed-out figure does not by itself establish a better saving on the item you want."],
    ["Read the exact variant", "Samples, unboxed bottles, testers and ordinary retail offers are different comparisons."],
    ["Keep timing and support visible", "A lower price may not fit a fixed deadline or leave clear resolution terms. Ask before ordering."],
  ], "Compare all offers with discount percentages hidden and selected final totals visible.", "Use HUME's current live price and item specification rather than comparing promotions as evidence of authenticity or lasting power."),
  g("How to compare prices across niche perfume retailers", "Comparing seller prices", "Across niche retailers, match the exact maker, version, format and fulfilment status before comparing totals. Specialist positioning does not make every price a like-for-like offer.", [
    ["Check the actual format", "A bottle, official sample and third-party decant supply different quantities and source claims."],
    ["Include availability", "Ready-stock and preorder offers can serve different deadlines. Use the current stated terms."],
    ["Separate prestige and value", "Price cannot establish ingredients or personal preference. Choose verified benefits you actually want."],
  ], "Build a matched-format price table that includes current fulfilment status for each specialist offer.", "Assess HUME's own listing and published terms without assuming niche status or a premium retail tier."),
];

const byTitle = (title: string) => BEGINNER_GUIDES_BATCH_SEVENTEEN.find(guide => guide.title === title)!;
byTitle("How to compare reviews of perfume websites").sources = [{ title: "FTC consumer guidance: evaluating online reviews", url: "https://consumer.ftc.gov/articles/how-evaluate-online-reviews" }];
byTitle("Authenticity questions for perfume websites").sources = [{ title: "CHANEL: brand guidance on counterfeit products and authorized channels", url: "https://www.chanel.com/us/anti-counterfeit/" }];
for (const guide of BEGINNER_GUIDES_BATCH_SEVENTEEN.filter(guide => guide.group === "Reading return terms")) {
  guide.sources = [{ title: "HUME: current direct-site return and refund policy", url: "/return-refund-policy" }];
}
byTitle("How to compare prices across perfume websites").chart = {
  headers: ["Comparison field", "What to record"],
  rows: [
    ["Product identity", "Actual maker, full version and concentration label"],
    ["Selected offer", "Millilitres, condition and included presentation"],
    ["Complete price", "Selected item plus displayed additional charges"],
    ["Purchase terms", "Current availability and applicable resolution process"],
  ],
};
