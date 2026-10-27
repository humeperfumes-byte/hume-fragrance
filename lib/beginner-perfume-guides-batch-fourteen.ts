import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";
import { DISCOVERY_SET_PRICE, DISCOVERY_SET_SAMPLE_COUNT, DISCOVERY_SET_SAMPLE_SIZE_ML } from "@/lib/discovery-set";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep: "samples", productIds: [] };
}

export const BEGINNER_GUIDES_BATCH_FOURTEEN: BeginnerGuide[] = [
  g("Perfume samples India", "Samples and testers", "When comparing perfume samples in India, identify the maker, fragrance version, sample volume and complete delivered cost. Small containers can help you explore scent before buying more, but they are not all the same product type.", [
    ["Separate the sample categories", "Official brand samples, third-party decants and a seller's own inspired perfumes have different identities. A familiar reference name does not make them interchangeable."],
    ["Choose useful variety", "Begin with liked directions and one contrast. Avoid choosing every sample only because its inspiration is famous."],
    ["Check the purchase details", "Review availability, shipping and returns before paying. A trial format does not automatically include a refund for disliking the scent."],
  ], "Compare sample offers using maker, exact name, ml, product type and delivered total.", "HUME's selectable discovery set explores its own perfumes, including inspired interpretations, rather than original designer-brand decants."),
  g("Sample set perfume", "Samples and testers", "A perfume sample set brings several small fragrance quantities into one purchase. Its usefulness depends on the actual contents and what you want to learn, rather than the word set alone.", [
    ["Read the specification", "Check sample count, ml per sample and whether choices are fixed or selectable. Packaging is separate from perfume volume."],
    ["Define the comparison", "Fresh versus woody or soft versus sweet gives the trial a purpose. Similar names may not provide meaningful contrast."],
    ["Plan separate wears", "Use unfamiliar scents individually on suitable days and repeat promising favorites. Discovery need not lead to many full bottles."],
  ], "Give each proposed sample one distinct reason to be included before buying the set.", "Use HUME's builder to select contrasting listed fragrances and review its shared kit specification before ordering."),
  g("Luxury perfume testers", "Samples and testers", "Luxury perfume testers can refer to different things, including a brand's demonstration bottle or small samples marketed as premium. Read the actual product identity and condition before assuming what the term promises.", [
    ["Clarify tester versus sample", "A large demonstration bottle and a small trial vial are different formats. The listing should state volume and what is included."],
    ["Verify the maker", "Luxury wording and familiar inspiration names do not establish original designer contents. Look for clear seller disclosures."],
    ["Choose by the actual scent", "Price or presentation cannot guarantee enjoyment, authenticity or lasting power. Sample an unfamiliar candidate when possible."],
  ], "Rewrite a tester listing as plain facts: maker, exact product, container size and condition.", "HUME's small discovery testers contain HUME perfumes; they should not be described as original luxury-brand tester bottles."),
  g("Samples of perfume", "Samples and testers", "Samples of perfume let you explore an exact fragrance in a smaller quantity. Their main purpose is learning the scent's development before deciding whether you want more.", [
    ["Keep the identity", "Save maker, name and version so a favorite can be matched to the correct later listing."],
    ["Observe beyond the opening", "Record the later texture and whether you want another wear, not only the first impressive note."],
    ["Understand trial limits", "A sample is not a clinical allergy test or a universal performance measurement. Follow product directions during ordinary use."],
  ], "Create one sample record with exact identity, opening, later impression and repeat-wear interest.", "Keep a separate note for each HUME discovery choice so the eventual bottle matches the fragrance you actually tried."),
  g("Luxury perfume tester set", "Samples and testers", "For a luxury perfume tester set, compare the actual maker, contents and presentation rather than treating luxury as a standardized specification. Confirm whether the offer is original-brand samples, decants or inspired fragrances.", [
    ["Read every included item", "Check names, individual volumes and applicators. A styled box image may not describe the selected variant completely."],
    ["Separate presentation value", "Packaging can matter as part of the experience, but it does not establish formula quality or personal preference."],
    ["Assess useful exploration", "A relevant selection can be more valuable than extra samples whose scent directions you already dislike."],
  ], "Compare fragrance identity and useful contents before adding presentation or prestige to the decision.", "Consider HUME discovery for exploration of HUME fragrances, without implying a collection of original luxury-brand decants."),
  g("Perfume discovery set", "Samples and testers", "A perfume discovery set is a structured way to compare several fragrances before choosing favorites. The most useful set matches your questions, offers clear quantities and identifies who makes each scent.", [
    ["Choose the discovery goal", "Finding a daily favorite, learning scent families and exploring occasional variety are different aims."],
    ["Compare the offer", "Read count, individual sample size, selection method and complete total. Do not assume redemption credits are included."],
    ["Use the set deliberately", "Trial unfamiliar fragrances separately and revisit favorites. The result can be useful even without another purchase."],
  ], "Write your discovery goal and a realistic trial schedule before choosing the contents.", "HUME's builder supports choosing existing available fragrances; the current kit details and preorder status appear alongside this guide."),
  g("Sample perfumes", "Samples and testers", "Sample perfumes are best evaluated as exact fragrances rather than small versions of a vague marketing promise. Record what you tried and how its later character felt before making a larger commitment.", [
    ["Check the version", "Similar names or inspiration references can describe different products. Read the maker and format."],
    ["Keep application readable", "Follow directions and note the applicator. Equal spray counts across containers do not necessarily mean equal quantities."],
    ["Choose the next step", "Repeat a favorite before buying more, or keep enjoying occasional samples if that already meets your needs."],
  ], "Match one favorite sample to its exact product page before considering a bottle purchase.", "Use the names of your selected HUME samples in a wear log rather than ordering a later bottle from memory alone."),
  g("Fragrance samples", "Samples and testers", "Fragrance samples can help you learn texture, development and personal preference. They do not remove the need to identify the exact product or distinguish scent notes from ingredient disclosures.", [
    ["Use descriptions as clues", "Fresh, floral and woody wording can narrow choices, but a notes list cannot reproduce the finished smell."],
    ["Compare whole structures", "Supporting notes can make two rose or vanilla listings feel different. Assess each complete composition."],
    ["Keep judgments separate", "Enjoyment, surrounding presence and later detectability are different observations. Record them independently."],
  ], "Describe two samples by their whole later character rather than one shared listed note.", "Choose contrasting HUME fragrance structures in discovery to learn which arrangements you prefer."),
  g("Travel set perfume", "Samples and testers", "A perfume travel set should be assessed for familiar scents, container practicality and current transport requirements. Small packaging alone does not make a set suitable or automatically permitted for every journey.", [
    ["Separate travel from discovery", "A travel set may contain known favorites for portability, while a discovery set compares unfamiliar scents. Decide which need you have."],
    ["Check handling details", "Confirm actual size, applicator and secure closure. Follow product storage directions and avoid prolonged heat."],
    ["Review route rules", "Check current carrier, security and venue requirements for the trip before packing containers."],
  ], "List the known scents and actual travel needs before deciding whether a multi-scent set belongs in your luggage.", "HUME's discovery samples are a small trial format; verify current listing and transport details rather than assuming dedicated travel certification."),
  g("Mini testers perfume", "Samples and testers", "Mini testers can describe small trial vials or miniature-style bottles, so confirm the actual format. Container size does not establish concentration, scent quality or a weaker formula.", [
    ["Read volume and applicator", "Check stated millilitres and whether the product sprays or dabs. Images can make small containers look larger."],
    ["Check what is being sampled", "Save maker and exact version. A seller's inspired mini is not an official designer sample."],
    ["Evaluate useful quantity", "Choose enough for the comparison you want without assuming a fixed number of sprays or wears."],
  ], "Compare two mini offers using actual ml and applicator rather than the apparent bottle size in photographs.", "Read HUME's listed discovery sample size; these guides do not invent a separate decorative miniature-bottle range."),
  g("Perfume trial kit", "Samples and testers", "A perfume trial kit should help you answer specific scent questions in a manageable way. It is an exploration purchase, not automatically a try-and-return service or a credit toward a bottle.", [
    ["Define the trial question", "Decide whether you want a first favorite, a different texture or a scent for a particular routine."],
    ["Read the actual terms", "Check contents, availability and returns. The word trial does not itself create a scent-preference refund entitlement."],
    ["Keep the comparison useful", "Use unfamiliar samples separately and write later impressions. Return to a favorite before buying quantity."],
  ], "Write the question each trial sample is intended to answer before placing the kit order.", "Use HUME's selectable discovery kit for comparing its fragrances, reviewing current policies rather than assuming a redemption program."),
  g("Best perfume samples", "Samples and testers", "The best perfume samples are the ones that answer your own preference questions with clear product information. A universal sample ranking cannot replace knowing what you like and why you are exploring.", [
    ["Choose relevant contrast", "Include liked directions and a useful alternative rather than filling the shortlist only with famous names."],
    ["Check the identity", "Compare maker, version, volume and product type. Decants and inspired interpretations are different purchases."],
    ["Rank after wear", "Consider later enjoyment and repeat interest before choosing a winner. Opening impact alone is incomplete evidence."],
  ], "Rank sample candidates by the question each would resolve rather than by popularity alone.", "Use HUME's quiz and live notes to choose discovery directions, then let actual trial experience determine your favorites."),
  g("Tester perfumes India", "Samples and testers", "When shopping for tester perfumes in India, clarify whether the seller means a demonstration bottle, sample vial or its own trial fragrance. The term tester is not a universal authenticity certificate.", [
    ["Ask what arrives", "Confirm volume, condition, cap or box details where relevant, and the selected item rather than the display image."],
    ["Verify the maker", "Read the product's actual identity. A reference to a designer scent may describe an inspired interpretation."],
    ["Check purchase terms", "Review seller contact information, delivery and returns. A low price alone proves neither authenticity nor a problem."],
  ], "Translate the tester offer into maker, product type, millilitres and included packaging before comparing prices.", "HUME's discovery testers are small quantities of HUME fragrances, not original designer demonstration bottles."),
  g("Expensive perfume testers", "Samples and testers", "For expensive perfume testers, evaluate the exact offer before assuming high cost buys a particular authenticity, ingredient standard or wearing experience. Tester wording and price are separate from personal value.", [
    ["Identify the format", "A large demonstration bottle and small sample pack have different quantities and purposes."],
    ["Look for specific evidence", "Maker, seller disclosures and exact product information are stronger facts than rare-sounding notes or premium presentation."],
    ["Test the scent preference", "A higher price does not make a disliked later character more enjoyable or guarantee fixed longevity."],
  ], "Write which verified benefits justify the tester's price before treating it as a worthwhile purchase.", "Explore HUME's own fragrances if their directions interest you, without using a lower price as proof of designer equivalence."),
  g("Sample pack perfume", "Samples and testers", "A perfume sample pack is useful when its assortment provides purposeful comparison. Inspect how many different fragrances it contains and whether those choices align with what you want to learn.", [
    ["Check variation versus volume", "Several vials can contain different scents or repeated quantities. Read the exact selected contents."],
    ["Choose a selection method", "A fixed pack and a choose-your-own kit offer different control. Known dislikes can make that distinction important."],
    ["Plan manageable trials", "Separate unfamiliar scents and repeat a favorite. A pack does not need to be finished in one sitting."],
  ], "Compare the useful differences in two sample packs rather than counting containers alone.", "HUME's builder allows selection from available fragrances so each chosen sample can have a clear comparison role."),
  g("Perfumes testers", "Samples and testers", "If a listing uses the term perfumes testers, read its precise contents rather than relying on the phrase. What matters is the maker, actual fragrance, format and quantity being sold.", [
    ["Resolve ambiguous wording", "Check whether the offer contains full demonstration bottles, small vials or an assortment. Ask the seller when the specification is unclear."],
    ["Compare like with like", "A designer reference and an original designer product are not the same disclosure. Use actual product identity."],
    ["Review the complete order", "Confirm selected quantity, delivery and returns before paying. Do not infer extras from a promotional image."],
  ], "Rewrite one ambiguous tester listing into a clear sentence describing exactly what the buyer receives.", "HUME's shared discovery specification states its sample count and size; use that instead of guessing from the word tester."),
  g("Perfumes samples", "Samples and testers", "Perfume samples can make a larger purchase better informed when you keep exact identities and useful notes. Treat each small quantity as a chance to understand the complete scent rather than an instant yes-or-no opening sniff.", [
    ["Label before comparing", "Save the product name and maker so later impressions do not get assigned to the wrong sample."],
    ["Use separate observations", "Record opening, later texture and whether you want another wear. Avoid mixing several unfamiliar fragrances."],
    ["Choose an appropriate outcome", "You may find a bottle favorite, discover a dislike or enjoy occasional variety. All can be useful results."],
  ], "Create a sample log that ends with a repeat-wear decision rather than only a numerical opening score.", "Use the exact HUME sample choices in your log and return to the corresponding live listing if you want more."),
  g("Perfumes tester box and kit", "Samples and testers", "For a perfume tester box or kit, separate the box presentation from the fragrance contents and trial purpose. Clear specifications matter more than the number of containers visible in a styled image.", [
    ["Verify included contents", "Read selected count, individual volumes and fragrance identities. Accessories are not additional perfume millilitres."],
    ["Check choice and availability", "Confirm whether the assortment is fixed or selectable and whether current options match your interests."],
    ["Assess the whole purchase", "Review complete cost, delivery timing and returns, especially when the box is intended as a gift."],
  ], "Compare box contents and useful scent variety independently from presentation before choosing a kit.", "HUME's discovery listing provides its current kit specification; do not assume additional gift packaging or accessories unless listed."),
  g("Tester perfume set", "Samples and testers", "A tester perfume set should be chosen around the comparison it enables. First establish the exact fragrance types and quantities, then decide whether the variety is relevant to your preferences.", [
    ["Choose a coherent comparison", "Contrast texture or scent direction with a question in mind rather than collecting similar reference names."],
    ["Keep performance claims separate", "A sample set does not guarantee matching hours or projection across all contents. Assess each actual fragrance."],
    ["Buy for useful discovery", "A smaller relevant trial can be enough. More vials are not automatically more learning."],
  ], "Assign one comparison role to every scent before deciding whether the tester set offers useful variety.", "Select HUME discovery fragrances around those roles, using separate suitable wears to identify preferred structures."),
  g("Perfume testers India", "Samples and testers", "For perfume testers in India, use a clear buying checklist: maker, format, volume, seller terms and final total. The word tester does not standardize any of those facts.", [
    ["Confirm the product category", "Distinguish an official tester bottle from decants, samples and inspired fragrances. Each can be a different offer."],
    ["Check the selected variant", "The advertised price and image may not represent the same quantity. Read the option being ordered."],
    ["Keep a traceable purchase", "Use clear seller contact and order information, and review delivery and returns before payment."],
  ], "Record the exact product category and final selected total before treating two tester listings as comparable.", "Buy HUME discovery as clearly identified HUME perfumes, including inspired interpretations, with the current policies linked alongside."),
  g("Where to buy perfume samples in India", "Buying sample formats", "Choose a perfume-sample seller in India that clearly identifies the actual product, quantities and purchase terms. HUME's own discovery builder is one option for exploring HUME fragrances; it is not a source of original designer decants.", [
    ["Choose the product type first", "Decide whether you want a maker's own fragrance, an official brand sample or a third-party decant before selecting a seller."],
    ["Compare complete offers", "Read ml, applicator, availability and delivered total. Similar reference names can describe different products."],
    ["Review service information", "Check contact details, shipping and returns rather than assuming every sample order has the same terms."],
  ], "Choose the sample category you want before comparing where to order it.", "Use HUME's discovery builder when your goal is to compare its own available fragrances."),
  g("Where to buy fragrance sample packs in India", "Buying sample formats", "Buy a fragrance sample pack from a seller whose assortment and selection rules are clear. The relevant question is not only where a pack is sold, but whether its contents serve your exploration.", [
    ["Read the assortment", "Check exact fragrance identities, count and volume. Count useful choices rather than every pictured vial."],
    ["Compare fixed and selectable packs", "Known dislikes may make selection control valuable; a fixed pack can serve a different discovery preference."],
    ["Confirm fulfilment details", "Review current availability and dispatch information before planning a trial schedule."],
  ], "Compare two pack offers by relevant assortment, selection control and complete total.", "HUME's selectable discovery pack can suit a preference-led comparison when its live fragrance choices interest you."),
  g("Where to buy perfume discovery sets in India", "Buying sample formats", "For a discovery-set purchase in India, use a maker or seller that explains who makes the fragrances and what the set contains. Choose the offer that supports your learning goal and timing.", [
    ["Define the goal before the shop", "Finding one regular favorite and exploring unfamiliar families call for different selections."],
    ["Read the commitment", "Check whether the purchase is one-time and whether any credits or extras are explicitly included."],
    ["Check delivery fit", "Preorder information matters for gifts or events. An attractive set arriving too late may not serve the need."],
  ], "Write the discovery goal and deadline before choosing the seller or set.", "Review HUME's current discovery builder and preorder details if exploring its fragrances matches that goal."),
  g("Where to buy mini perfume testers in India", "Buying sample formats", "When buying mini testers in India, prioritize a listing with actual millilitres and applicator details. Mini can describe a trial vial or a miniature-style bottle, and the difference matters to the purchase.", [
    ["Confirm physical format", "Read container size and spray or dab application rather than estimating from photographs."],
    ["Verify fragrance identity", "Small size does not establish an official brand sample or a particular concentration."],
    ["Assess portability separately", "A mini still needs secure closure and sensible storage. Travel permissions depend on current route rules."],
  ], "Identify the exact mini format you want before comparing seller offers.", "HUME's discovery listing states its small sample specification; these pages do not claim a separate decorative miniature collection."),
  g("Where to buy perfume trial kits in India", "Buying sample formats", "Buy a trial kit from a seller with clear contents and trial terms. A kit helps you compare fragrance, but the word trial does not imply free returns after wearing or a guaranteed bottle credit.", [
    ["Read the trial arrangement", "Confirm what is purchased and what happens afterward. Do not copy another brand's redemption assumptions."],
    ["Match contents to uncertainty", "Choose the kit that addresses your actual questions rather than buying the largest apparent assortment."],
    ["Check the final order", "Review cost, availability and delivery before setting dates for the comparison."],
  ], "Write what the seller explicitly includes and what you must purchase separately after the trial.", "Use HUME discovery as a purchase of its listed samples, with current policies reviewed before ordering."),
  g("Where to buy travel perfume sets in India", "Buying sample formats", "For a travel perfume set, select a seller with clear container specifications and fragrances you already know or can test before departure. Portability and discovery are related but different needs.", [
    ["Confirm the travel purpose", "Decide whether you need one known favorite or several scents. More containers can add packing complexity."],
    ["Check route requirements", "Review current carrier and security rules rather than trusting travel wording as universal approval."],
    ["Plan product care", "Follow storage directions and avoid prolonged heat. Verify closure and handling information where available."],
  ], "Match the intended containers to your actual trip requirements before placing a travel-set order.", "Consider HUME samples for pre-trip exploration; check current format and transport requirements before packing them."),
  g("Where to buy customizable perfume kits in India", "Buying sample formats", "For a customizable kit in India, first clarify whether you want to choose existing fragrances or commission a new formula. Those are different services, and a selectable sample builder does not imply bespoke perfumery.", [
    ["Read what customization controls", "The offer may permit scent selection, packaging choices or something else. Use only the options actually described."],
    ["Check available choices", "A builder's live catalogue determines what can be selected. Do not assume every fragrance or format is eligible."],
    ["Review the order rules", "Check required count, quantities, current availability and final total before payment."],
  ], "Write whether you want selection of existing scents or creation of a new formula before choosing a service.", "HUME's discovery builder lets you choose existing available fragrances; it does not promise a newly commissioned personal formula."),
  g("Where to buy luxury fragrance samples in India", "Buying sample formats", "For luxury fragrance samples, choose the product identity before choosing the seller. Official brand samples, third-party decants and inspired fragrances should not be presented as the same type of purchase.", [
    ["Confirm what luxury means", "It may refer to brand positioning or presentation rather than a specified ingredient standard."],
    ["Look for exact disclosures", "Read maker, version, volume and source description. Reference names and polished packaging do not resolve identity."],
    ["Choose within a comfortable limit", "A premium image does not guarantee preference. Use the complete cost and relevant variety to assess value."],
  ], "State the exact fragrance category you want before comparing sample sellers using luxury wording.", "HUME discovery explores its own inspired and other listed fragrances, not original luxury-brand samples."),
  g("Where to buy perfume tester boxes in India", "Buying sample formats", "A tester-box seller should explain the exact contents as clearly as the box presentation. Choose according to the fragrance specification, selection method and delivery needs rather than the image alone.", [
    ["Verify what arrives", "Read count, individual volumes and any explicitly included accessories. Do not infer extra items from styling."],
    ["Check the actual variant", "A price can change with selected quantity or contents. Compare the same option you intend to order."],
    ["Plan a dated purchase", "For a gift or event, review current availability and delivery information before relying on the box."],
  ], "Write a plain-language inventory of the selected box before comparing its price with another offer.", "Review HUME's current discovery specification and preorder details instead of assuming separate tester-box editions."),
  g("Where to buy perfume sampler gifts in India", "Buying sample formats", "Choose a sampler gift from a seller whose scents, presentation information and delivery timing fit the recipient. A discovery gift should suit someone who actually wants exploration.", [
    ["Ask about the recipient", "Broad likes and dislikes help more than demographics. A known exact favorite may call for a bottle instead."],
    ["Check gift details", "Verify any wrapping, message or accessories explicitly. Do not assume they are included."],
    ["Work backwards from the date", "Review preorder and delivery information and leave enough time. Check returns without promising automatic exchanges."],
  ], "Confirm recipient interest and the gift deadline before choosing a sampler seller.", "Build HUME discovery choices with the recipient when possible, checking current kit details and preorder timing."),
  g("How to choose perfume samples", "Choosing sample formats", "Choose perfume samples by the decisions you want to make: preferred direction, later texture or occasion fit. A small purposeful shortlist is easier to learn from than many nearly identical candidates.", [
    ["Start with known clues", "List liked smells and strong dislikes. Use notes as shortlist information rather than a promise of the finished scent."],
    ["Add one useful contrast", "A fresh favorite and a woodier alternative can reveal a preference boundary without overwhelming the comparison."],
    ["Keep exact identities", "Save maker, name and version so each trial can guide an accurate later purchase."],
  ], "Give each chosen sample a specific question before ordering it.", "Use HUME's live notes and quiz to choose discovery contrasts, then judge the complete fragrances through separate wears."),
  g("How to choose fragrance sample packs", "Choosing sample formats", "Choose a fragrance sample pack by relevant variety, clear quantities and how much control you want over the contents. A large pack can be less useful if many included directions are ones you dislike.", [
    ["Compare the assortment", "Read exact identities rather than only broad collection names. Count the choices that address your interests."],
    ["Choose selection control", "A fixed assortment can invite surprise; a selectable pack can avoid known dislikes. Neither method is automatically better."],
    ["Assess manageable quantity", "Plan separate trials and repeat favorites. More samples are not useful if you will not work through them."],
  ], "Count relevant scent questions in each pack rather than simply counting vials.", "Use HUME's selectable builder when choosing the individual fragrance directions is part of what you value."),
  g("How to choose perfume discovery sets", "Choosing sample formats", "Choose a discovery set around its learning value, product identity and complete cost. The right set helps you explore with a plan rather than obliging you to buy more afterward.", [
    ["Define successful discovery", "Finding one favorite, learning families and enjoying variety are different endpoints. Name yours first."],
    ["Read the specification", "Compare count, sample size, selection method and current availability on the same basis."],
    ["Check follow-up terms", "Do not assume bottle credits, exchanges or membership benefits unless the current offer includes them."],
  ], "Choose the discovery endpoint before comparing kits and optional follow-up purchases.", "HUME's current set supports choosing existing fragrances; treat any later bottle as a separate decision unless published terms say otherwise."),
  g("How to choose mini perfume testers", "Choosing sample formats", "Choose mini testers by exact identity, stated volume and applicator rather than how substantial the container looks. Small formats can support exploration without representing a separate weaker fragrance category.", [
    ["Match the application preference", "Sprays and dabbers feel different to use. Check the actual listing instead of assuming a spray from the word mini."],
    ["Check the intended purpose", "A collectible miniature and a functional trial vial may appeal for different reasons."],
    ["Avoid exact-yield assumptions", "Container size does not establish one universal number of sprays or wears. Evaluate whether the stated quantity serves your comparison."],
  ], "Choose your preferred mini format and purpose before comparing photographs or unit prices.", "Read the HUME discovery sample specification directly rather than assuming an unlisted miniature-bottle style."),
  g("How to choose perfume trial kits", "Choosing sample formats", "Choose a trial kit by identifying the uncertainty you want to resolve and the time available to compare. A trial should answer a question rather than become an automatic collection purchase.", [
    ["Name the uncertainty", "You might want a daily favorite or a less sweet direction. Different questions need different contents."],
    ["Plan appropriate wears", "Use unfamiliar scents individually before important occasions. Leave time for a second wear of a favorite."],
    ["Read the purchase rules", "Check delivery, returns and what is included. Trial wording does not itself promise reimbursement or credit."],
  ], "Write a short trial plan with one question, separate wear days and a final review point.", "Choose HUME discovery samples around that plan and check the current preorder timing before relying on the schedule."),
  g("How to choose travel perfume sets", "Choosing sample formats", "Choose a travel perfume set by the trip's real activities, known scent preferences and container requirements. You do not need a different fragrance for every imagined holiday occasion.", [
    ["Keep the selection purposeful", "One familiar versatile favorite can be enough. Test unfamiliar scents before departure if discovery is needed."],
    ["Check physical practicality", "Review volume, applicator and closure information. Small size alone does not prevent leaks or remove storage needs."],
    ["Verify current rules", "Check the requirements for the actual route, carrier and venues before packing."],
  ], "Choose the smallest useful scent selection for the actual itinerary before comparing travel-set offers.", "HUME discovery samples can help settle preferences before a trip; check the format and current transport rules separately."),
  g("How to choose customizable perfume kits", "Choosing sample formats", "Choose a customizable perfume kit by checking exactly which decisions you control. Selecting existing fragrances is useful for discovery, but it is different from changing a fragrance formula.", [
    ["Read the customization scope", "Look for clear options for fragrance choices, count and any listed presentation details. Avoid assuming broader bespoke services."],
    ["Design purposeful contrasts", "Choose each scent for a reason rather than using all slots on similar popular references."],
    ["Review the completed selection", "Check names, required count, availability and the final total before placing the order."],
  ], "Assign a comparison role to every selected scent, then review the final kit list before payment.", "HUME's builder customizes the selection from its available fragrances; it does not edit the formulas or create a unique blend."),
  g("How to choose luxury fragrance samples", "Choosing sample formats", "Choose luxury fragrance samples by exact product identity and the experience you value. Prestige, presentation and rare-sounding notes do not guarantee enjoyment of the finished scent.", [
    ["Establish the category", "Decide whether you want official samples, decants or a maker's inspired fragrances before comparing offers."],
    ["Choose relevant directions", "Sample a texture you want to explore rather than a reference name solely because it is expensive."],
    ["Assess value after wear", "Compare later character and repeat interest. A costly opening impression is not the whole wearing experience."],
  ], "Write the actual maker and personal reason to try each luxury-labelled sample before buying.", "Use HUME samples when you want to explore its own fragrances, without describing them as original luxury-brand samples."),
  g("How to choose perfume tester boxes", "Choosing sample formats", "Choose a tester box by balancing useful fragrance contents with the presentation you actually want. The box can add enjoyment, but it does not establish perfume quantity or quality.", [
    ["Read contents first", "Check fragrance names, sample count, volumes and applicators before evaluating the package image."],
    ["Check selection flexibility", "A fixed box and a selectable assortment suit different preference needs. Known dislikes can make flexibility valuable."],
    ["Compare complete purchase details", "Review selected variant, delivery and any explicitly listed gift extras. Do not infer packaging benefits."],
  ], "Score the tester box for relevant contents and presentation as two separate benefits.", "Review HUME's current discovery offer for actual contents rather than assuming the box includes unlisted accessories or gift services."),
  g("How to choose perfume sampler gifts", "Choosing sample formats", "Choose a sampler gift by confirming that the recipient wants exploration and using their likes and dislikes to guide the contents. A broad assortment is not automatically a safer gift.", [
    ["Ask a useful preference question", "Request two liked directions and one dislike, or an exact fragrance they already enjoy."],
    ["Decide how much surprise matters", "Choosing samples together can preserve the gift occasion while reducing uncertainty about scent."],
    ["Check timing and presentation", "Review current delivery, preorder status and explicitly included gift details. Do not promise an exchange without reading terms."],
  ], "Choose between an agreed sampler and a known-favorite bottle based on what the recipient actually wants.", "Build HUME discovery choices together when useful and check current preorder timing against the gift date."),
  g("Are perfume samples worth buying", "Sample-format value", "Perfume samples are worth considering when a small trial can resolve uncertainty before a larger purchase. They can be unnecessary when you already know the exact favorite and simply want more of it.", [
    ["Identify the unknown", "Scent preference, later development and ordinary setting fit are useful questions. A sample cannot guarantee everyone will experience the same result."],
    ["Compare commitment", "A higher unit price can still involve less total spending than an unwanted bottle."],
    ["Keep the outcome useful", "Discovering a dislike can prevent another purchase. The trial need not produce a favorite every time."],
  ], "Compare the sample cost with the actual uncertainty it would remove before buying it.", "Use HUME discovery when comparing unfamiliar HUME directions helps, rather than treating sampling as compulsory for a known favorite."),
  g("Are fragrance sample packs worth buying", "Sample-format value", "A fragrance sample pack is worthwhile when enough of its assortment is relevant to your interests and you can make time to compare. Extra vials do not guarantee extra learning.", [
    ["Count useful contents", "Exclude strong dislikes and redundant directions when judging how much relevant variety the pack provides."],
    ["Consider trial capacity", "Separate wears and repeat favorites need time. A large unused pack can offer poor practical value."],
    ["Compare complete totals", "Check delivered price, actual quantities and selection method on the same basis."],
  ], "Count the pack's relevant comparison questions before dividing price by its total vial count.", "HUME's selectable discovery pack can support purposeful variety if the current choices align with what you want to learn."),
  g("Are perfume discovery sets worth buying", "Sample-format value", "Discovery sets can be worth buying as a complete exploration experience, not only as a route to a full bottle. Their value depends on your goal, relevant contents and a comfortable complete price.", [
    ["Choose an endpoint", "Finding one regular favorite and enjoying occasional variety are both valid goals."],
    ["Avoid a required follow-up", "Do not assume you must buy a bottle to justify discovery. A set can teach preferences or simply provide enjoyable comparisons."],
    ["Review the current offer", "Check quantities, selection, delivery and any explicit credits without importing another brand's program."],
  ], "Define what would make discovery successful even if you buy no full bottle afterward.", "HUME's existing discovery kit supports selecting its fragrances; treat any later bottle purchase as optional."),
  g("Are mini perfume testers worth buying", "Sample-format value", "Mini testers can be worthwhile for a clear trial, portability or an explicitly desired miniature format. Check which of those benefits you want before judging a small container's price.", [
    ["Clarify the format value", "A functional vial and a decorative miniature can justify interest for different reasons. Read what actually arrives."],
    ["Compare quantity honestly", "Use stated millilitres rather than visual size. Avoid exact spray-yield assumptions."],
    ["Check alternative needs", "A known favorite may call for a different size, while an unfamiliar scent may benefit from a low-commitment trial."],
  ], "Name whether your main reason is discovery, portability or collecting before evaluating mini value.", "HUME's small discovery samples serve exploration; do not infer a separate collectible miniature range."),
  g("Are perfume trial kits worth buying", "Sample-format value", "A trial kit is worth considering when it gives you a manageable way to answer a defined preference question. Trial language alone does not make the purchase risk-free or guarantee a later discount.", [
    ["Choose the question", "A first daily fragrance or a new woody texture creates a concrete reason to compare."],
    ["Plan the use", "Give each unfamiliar candidate its own suitable trial and revisit favorites before deciding on quantity."],
    ["Read the commitment", "Check current contents, returns and any explicit credits. Do not assume opened products can be returned for scent preference."],
  ], "Write the trial question and review date before deciding whether the kit is worth its complete cost.", "Use HUME discovery for a defined comparison and review its published policies rather than assuming a try-and-return service."),
  g("Are travel perfume sets worth buying", "Sample-format value", "Travel perfume sets can be worthwhile when their known scents and containers solve a real packing need. A set adds little value if you buy unfamiliar fragrances only because the packaging says travel.", [
    ["Check what you already own", "A suitable existing format may cover the trip. More scents are not automatically more useful."],
    ["Assess practical portability", "Review volume, closure and storage guidance as well as current route requirements."],
    ["Choose for the itinerary", "One tested versatile favorite can be enough. Do discovery before departure when possible."],
  ], "Compare a proposed travel set with the actual packing need your existing fragrance options leave unresolved.", "HUME discovery can help identify a favorite before travel, but small sample size does not itself provide transport approval."),
  g("Are customizable perfume kits worth buying", "Sample-format value", "A customizable kit can offer value when choosing existing scents helps avoid unwanted samples and creates a clearer comparison. It is less useful if the available choices do not match your interests.", [
    ["Check the real control", "Confirm whether customization means sample selection, packaging or formula creation. These are different services."],
    ["Use choice purposefully", "Select distinct roles and contrasts rather than duplicating a single familiar direction across the kit."],
    ["Review before ordering", "Check exact names, required count, live availability and total. Selection flexibility does not remove the need for careful review."],
  ], "Compare how many unwanted samples selection control removes before deciding whether customization adds value.", "HUME's builder customizes the choice of existing fragrances; it does not promise individual formula development."),
  g("Are luxury fragrance samples worth buying", "Sample-format value", "Luxury fragrance samples can be worthwhile when they provide access to an exact scent you genuinely want to evaluate. Prestige wording and high sample prices do not guarantee useful discovery.", [
    ["Verify the identity first", "Read maker and product type. Original-brand samples, decants and inspired interpretations are not interchangeable."],
    ["Choose personal relevance", "An unfamiliar expensive reference name is weaker guidance than a scent texture you actually want to explore."],
    ["Assess a complete trial", "Observe later enjoyment before deciding whether any larger purchase would be worthwhile."],
  ], "Write a personal scent question for each premium-labelled sample rather than choosing from reputation alone.", "Explore HUME's own fragrances when relevant, without using luxury inspiration references to imply original designer contents."),
  g("Are perfume tester boxes worth buying", "Sample-format value", "A tester box can be worthwhile when its fragrance assortment and presentation both serve your purpose. Separate the value of the box from the useful scent quantity and variety.", [
    ["Count actual contents", "Verify selected fragrances, volumes and accessories explicitly. Do not treat a styled photograph as an inventory."],
    ["Consider the user", "A personal trial and a gift can place different value on presentation. Neither justifies unwanted scents."],
    ["Check delivery and terms", "Current availability and timing can decide whether the box is practical for a planned occasion."],
  ], "Evaluate useful contents, presentation and delivery fit as separate reasons for a tester-box purchase.", "Compare HUME's published discovery contents and preorder information, without assuming additional box editions or gift extras."),
  g("Are perfume sampler gifts worth buying", "Sample-format value", "A sampler gift can be worthwhile for someone who wants fragrance exploration and would enjoy the actual selection. It is not automatically better than a confirmed favorite or a different gift.", [
    ["Confirm interest before variety", "Some recipients prefer one known scent or avoid perfume. Their wishes are more useful than a universal gift ranking."],
    ["Reduce unnecessary guessing", "Use liked directions and exclusions, or choose the samples together while keeping the occasion special."],
    ["Verify the complete gift plan", "Check contents, timing, presentation and returns before paying. Do not promise exchanges or extras that are not listed."],
  ], "Ask whether the recipient wants discovery before comparing sampler-gift prices or item counts.", "Choose HUME discovery as an agreed exploration gift when its current sample choices and preorder timing fit the recipient."),
];

BEGINNER_GUIDES_BATCH_FOURTEEN.find(guide => guide.title === "Perfume discovery set")!.chart = {
  headers: ["Current HUME discovery offer", "Listed detail"],
  rows: [
    ["Item price before additional charges", `₹${DISCOVERY_SET_PRICE}`],
    ["Choice and quantity", `${DISCOVERY_SET_SAMPLE_COUNT} selected fragrances × ${DISCOVERY_SET_SAMPLE_SIZE_ML}ml`],
    ["Total perfume volume", `${DISCOVERY_SET_SAMPLE_COUNT * DISCOVERY_SET_SAMPLE_SIZE_ML}ml`],
    ["Product identity", "HUME perfumes, including inspired interpretations; not original designer decants"],
    ["Customization", "Choose existing available fragrances; no new formula commissioned"],
  ],
};
