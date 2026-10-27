import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";
import { DISCOVERY_SET_PRICE, DISCOVERY_SET_SAMPLE_COUNT, DISCOVERY_SET_SAMPLE_SIZE_ML } from "@/lib/discovery-set";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string, nextStep: BeginnerGuide["nextStep"] = "samples"): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep, productIds: [] };
}

const kitPrice = `₹${DISCOVERY_SET_PRICE}`;
const kitVolume = DISCOVERY_SET_SAMPLE_COUNT * DISCOVERY_SET_SAMPLE_SIZE_ML;

export const BEGINNER_GUIDES_BATCH_TWELVE: BeginnerGuide[] = [
  g("Are expensive perfumes worth it", "Perfume value", "An expensive perfume is worth considering when you enjoy the exact scent, expect to use it and can comfortably afford the complete price. High cost alone cannot establish better personal fit or longer wear.", [
    ["Identify what you value", "Scent, presentation, brand identity and purchase experience can matter differently to different buyers. Decide which benefits you actually want."],
    ["Test before committing", "Compare the full development rather than only the opening or reputation. A disliked dry down is not improved by a higher price."],
    ["Compare realistic alternatives", "Check exact identity and format. An inspired interpretation and a designer original are different purchases, even if they reference a similar direction."],
  ], "Write which benefits justify a premium for you before comparing the actual candidates.", "Use HUME samples as one way to explore its own fragrances, without treating a lower price as proof of equivalence to a designer original."),
  g("Cheap vs expensive perfume difference", "Perfume value", "Cheap and expensive are price descriptions, not reliable formula categories. Compare the actual fragrance, size, maker, presentation and selling terms rather than assuming one price tier always smells better.", [
    ["Match the product facts", "Different sizes, concentrations and versions cannot be compared by price alone. Save the exact listing details."],
    ["Avoid ingredient guesses", "A retail price does not disclose raw-material quantities, natural content or production costs. A notes list describes scent rather than a complete formula."],
    ["Compare wear and preference", "Record later enjoyment separately from presence. Neither cost nor intensity guarantees that you will want another wear."],
  ], "Compare two exact products using identity, volume, delivered price and your own later-scent preference.", "Read HUME's current product information and sample its fragrances without inferring formula equivalence from an inspiration name."),
  g("How much should I spend on my first perfume", "Perfume value", "Spend an amount you can comfortably afford after allowing for delivery and any exploration you actually need. There is no required first-perfume budget or reason to spend up to your maximum.", [
    ["Set the complete limit", "Choose a delivered-order ceiling before browsing. Keep optional accessories and extra bottles outside the initial plan."],
    ["Assess uncertainty", "If preferences are unfamiliar, samples may answer useful questions. If the exact favorite is already known, another discovery purchase may be unnecessary."],
    ["Choose a usable quantity", "A large bottle is not automatically wise for an occasional wearer. Buy around expected use rather than shelf appearance."],
  ], "Write your comfortable total limit, likely wearing frequency and one scent question before buying.", "Compare HUME's current bottle and discovery options according to what you already know and what you still need to learn.", "shop"),
  g("Perfume cost per ml explained", "Perfume value", "Perfume cost per millilitre is the price divided by the stated volume. It helps compare quantity within a clear product context, but it does not measure scent quality, enjoyment or the value of variety.", [
    ["Calculate the basic figure", "A hypothetical ₹1,000 bottle containing 50ml costs ₹20 per ml before any additional charges. Use the selected variant's actual volume."],
    ["Choose a consistent price basis", "Use either listed product prices or delivered totals consistently. Do not compare one discounted checkout total with another product's headline price."],
    ["Keep the limits visible", "A sample set offers multiple scents rather than one large bottle. Equal volume does not make different products interchangeable."],
  ], "Divide the complete price by stated millilitres for two comparable listings and note what that figure cannot tell you.", "HUME's discovery-set unit-price example below uses the shared kit price and total listed volume, not an assumed spray yield."),
  g("Small bottle vs large bottle perfume value", "Perfume value", "A small bottle can offer better practical value when you wear perfume occasionally or are unsure of the scent. A large bottle can make sense for a confirmed regular favorite even when both use the same formula.", [
    ["Compare real use", "Ask how often you choose the exact fragrance. Buying more of an uncertain scent increases commitment rather than certainty."],
    ["Check the size economics", "Calculate price per ml alongside the total spend. Saving on unit price still requires spending more upfront."],
    ["Verify the exact version", "Check that both sizes refer to the same maker and fragrance version before comparing them."],
  ], "Write why you expect to use the larger quantity before allowing its lower unit price to decide.", "Compare HUME's currently listed variants after sampling an unfamiliar candidate; do not assume every product has every size.", "shop"),
  g("Perfume gift set vs single bottle", "Perfume value", "Choose a gift set when its actual contents suit the recipient; choose a single bottle when the exact favorite is known. More components do not automatically make a better gift.", [
    ["Check every included item", "Count perfume volume separately from lotions or accessories. Do not treat the whole set as fragrance millilitres."],
    ["Assess recipient preference", "An agreed discovery selection can serve exploration, while a confirmed favorite can justify one bottle."],
    ["Review gift practicalities", "Confirm availability, presentation details, delivery and returns. Avoid assuming unlisted wrapping or exchanges."],
  ], "Compare what the recipient will actually use in each option rather than counting the number of items.", "HUME's selectable discovery kit offers exploration; check live bottle options when the recipient already has a confirmed HUME favorite."),
  g("Is a perfume discovery set worth buying", "Perfume value", "A discovery set can be worth buying when trying several unfamiliar fragrances answers a real preference question before a larger purchase. It may add little value if you already know the exact scent you want.", [
    ["State the learning goal", "Comparing fresh and woody directions is a useful question. Buying a kit only because it contains many items is less informative."],
    ["Check relevant variety", "Count how many included choices actually interest you. A smaller useful selection can teach more than unwanted variety."],
    ["Plan the trials", "Use samples individually and repeat favorites. Exploration need not result in a full bottle for every scent."],
  ], "List three decisions the set would help you make before comparing its cost with a known favorite.", "HUME's builder lets you select its listed discovery choices; choose them around questions you want answered."),
  g("Why are niche perfumes expensive", "Perfume value", "A niche label alone does not explain a perfume's price. Brand positioning, distribution, presentation and the maker's business choices can contribute, but the actual cost breakdown usually requires information from that producer.", [
    ["Avoid a formula-cost assumption", "Retail price does not reveal ingredient quantities or prove rare natural materials. Look for specific maker disclosures rather than guessing."],
    ["Read niche as positioning", "Specialist branding does not guarantee that every buyer will prefer the scent or experience longer wear."],
    ["Decide your own value", "Sample the exact product and assess the later character. Pay for benefits you want rather than exclusivity language alone."],
  ], "Separate verified product facts from pricing explanations a listing does not actually substantiate.", "Explore HUME's own perfumes through samples if their directions interest you, without claiming its pricing proves another maker's costs."),
  g("Budget perfume vs designer perfume", "Perfume value", "Budget and designer describe different aspects of a purchase: spending level and brand identity. Compare exact products rather than assuming either label guarantees quality, authenticity or personal preference.", [
    ["Identify what is sold", "An original designer fragrance, inspired interpretation and decant are different offers. Familiar reference names do not make them identical."],
    ["Match the comparison", "Check maker, version, size and format before comparing price. Similar scent directions can still produce different finished fragrances."],
    ["Choose from use", "Assess whether you enjoy wearing the exact candidate and whether its complete cost fits your limit."],
  ], "Write the actual maker and product type beside each candidate before comparing the price tags.", "HUME discovery samples are its own perfumes, including inspired interpretations, rather than original designer-brand decants."),
  g("Perfume discounts too good to be true", "Perfume value", "A large perfume discount is a reason to verify the exact offer, not proof by itself that the product is genuine or counterfeit. Check the seller, product identity and final terms before paying.", [
    ["Read the exact item", "Check whether the listing is a sample, partial bottle, inspired product or full original. Photos and reference names can leave important differences unclear."],
    ["Assess the seller", "Look for usable contact information, clear policies and a traceable order process. A batch code or attractive packaging alone cannot establish authenticity."],
    ["Check the final total", "Compare the selected variant and checkout price rather than a crossed-out number. Do not add unwanted items just to unlock a promotion."],
  ], "Save the exact product identity, seller details and checkout total before deciding a discount is useful.", "Review HUME's live listings and purchase policies directly; compare its own products without mistaking inspiration references for designer originals.", "shop"),
  g("Best value perfume sample set", "Perfume value", "The best-value sample set is one whose contents answer your questions at a comfortable complete cost. Total millilitres and number of scents are useful facts, but neither alone measures the value of discovery.", [
    ["Count useful choices", "Identify how many samples you actually want to try. Unwanted duplicates can reduce the practical value of a large set."],
    ["Check identity and quantity", "Separate maker, format, sample size and total volume. Designer decants and inspired fragrances are not equivalent offers."],
    ["Plan the comparison", "Choose contrasts and keep a trial log. A favorite earns value through enjoyment rather than a universal ranking."],
  ], "Divide the total cost by the number of samples you genuinely want to explore, then compare that with the learning goal.", "HUME's selectable kit can provide purposeful variety if its current choices align with the preferences you want to explore."),
  g("How to compare perfume prices", "Perfume value", "Compare perfume prices by matching exact product identity, selected size and final order total. A cheaper headline price may describe a smaller container or a different product entirely.", [
    ["Match the product", "Record maker, version, concentration label and millilitres. An inspired fragrance is not an original-brand price comparison."],
    ["Use complete totals", "Include displayed delivery and other checkout charges on the same basis. Apply only promotions for which the order actually qualifies."],
    ["Check purchase conditions", "Availability, delivery timing and returns can affect whether a lower-priced offer serves your need."],
  ], "Build a comparison row with identity, size, product price, delivery and final total for each offer.", "Use HUME's live selected variants and checkout information instead of comparing an old screenshot with another seller's current price.", "shop"),
  g("Is a bigger perfume bottle always better value", "Perfume value", "A bigger bottle is not always better value. A lower price per ml only helps if you want the exact fragrance, expect to use the quantity and can afford the larger total.", [
    ["Confirm the favorite", "An untested scent becomes a larger commitment in a bigger bottle. Resolve preference before comparing volume discounts."],
    ["Consider wearing frequency", "Occasional use can favor a smaller quantity. Do not estimate exact bottle life from a universal sprays-per-ml claim."],
    ["Compare the opportunity cost", "A larger bottle may consume money you would prefer to keep or use for purposeful exploration."],
  ], "State the reason for buying more volume without using lower price per ml as the only reason.", "Choose among HUME's available sizes after confirming the fragrance and your likely use, rather than assuming the largest variant is the default.", "shop"),
  g("Perfume sample price per ml", "Perfume value", "Calculate a sample's price per ml by dividing its price by its stated volume. For a set, divide by the combined perfume volume, then separately assess whether the variety is useful to you.", [
    ["Use stated quantities", "Add only the listed perfume millilitres. Packaging and accessories are not liquid volume."],
    ["Keep product categories clear", "An official sample, third-party decant and inspired fragrance have different identities even if their unit prices are similar."],
    ["Do not confuse arithmetic with quality", "A higher sample unit price may still be a smaller commitment than an unwanted bottle. The calculation does not measure enjoyment."],
  ], "Calculate both the sample-set unit price and the total amount you would need to spend before deciding.", "The HUME example below derives its unit price from the shared kit price and listed total volume."),
  g("Hidden delivery costs when buying perfume", "Perfume value", "To avoid unexpected delivery costs, review the final checkout total and shipping information before payment. A product-page price or free-delivery banner may depend on conditions your order must actually meet.", [
    ["Check the destination and variant", "The selected address, quantity and product can affect the displayed order. Use the real intended checkout details."],
    ["Read the applicable terms", "Verify any minimum spend and current shipping policy. Do not assume a promotion applies to all items or destinations."],
    ["Compare delivered totals", "An extra item bought to reach a threshold can cost more than the delivery charge you hoped to avoid."],
  ], "Compare the final total of the order you want with the total after any proposed threshold-chasing addition.", "Review HUME's shipping policy and final checkout total before deciding whether a bottle or discovery purchase fits your limit.", "shop"),
  g("Affordable perfume that does not smell harsh", "Perfume value", "To find an affordable perfume you do not perceive as harsh, define the impression you dislike and sample the exact candidate. Price alone cannot establish smoothness or ingredient suitability.", [
    ["Describe harshness precisely", "You might dislike a sharp opening, strong sweetness or a particular texture. Those are different preference questions."],
    ["Observe later development", "A first impression and the later scent can differ. Record both rather than deciding only from an initial spray."],
    ["Separate irritation from taste", "Disliking a scent is different from a skin reaction. Stop using a product that irritates you; a pleasant smell does not certify compatibility."],
  ], "Name the specific texture you want to avoid before comparing two affordable candidates.", "Use HUME samples to assess your own perception of the complete fragrance without treating affordability as a smoothness or safety rating."),
  g("How to build a perfume collection on a budget", "Perfume value", "Build a budget collection by giving each purchase a distinct role and confirming preferences before adding volume. One enjoyable regular fragrance can be a complete starting collection.", [
    ["Map useful roles", "Work, relaxed time and special occasions may overlap. Avoid buying a separate bottle for every label when one favorite covers several uses."],
    ["Explore with a question", "Choose samples to compare a missing texture or mood rather than accumulating popular names."],
    ["Review before expanding", "Record what you actually wear. A discounted near-duplicate can add cost without adding a useful experience."],
  ], "List each current fragrance's role and name one genuine gap before planning the next purchase.", "Build HUME discovery choices around that gap, then consider a bottle only after repeat enjoyment."),
  g("Perfume starter kit price India", "Perfume value", `Compare starter-kit prices in India by the actual contents, maker and complete order cost. HUME's listed discovery price is ${kitPrice}; verify the current checkout total and preorder details before buying.`, [
    ["Read the kit specification", "Check sample count, individual size and selected fragrances. A starter kit is not a standardized quantity across sellers."],
    ["Compare product identity", "Original-brand samples, decants and inspired perfumes are different offers. Familiar names do not remove that distinction."],
    ["Choose the useful format", "A kit serves exploration; a known favorite may call for a bottle instead. Do not assume a future purchase credit is included."],
  ], "Compare two starter kits using maker, count, ml per sample, useful choices and delivered total.", "HUME's shared offer details below show its current discovery specification and preorder status rather than a separate starter-kit range."),
  g("Perfume subscription vs discovery set", "Perfume value", "A subscription suits someone who wants an ongoing service under clear terms; a discovery set suits a defined one-time comparison. Compare actual renewal, selection and cancellation details rather than assuming either format is cheaper.", [
    ["Understand the commitment", "For a subscription, read the recurring schedule and total cost over the period you expect to use it."],
    ["Check choice and quantity", "Compare how selections are made and what each delivery contains. A one-time kit can offer a clearer fixed exploration plan."],
    ["Choose for your habits", "Regular novelty and a single preference question are different needs. Do not buy ongoing deliveries merely because the first offer looks inexpensive."],
  ], "Compare one-time cost with the planned subscription period and record the actual renewal and cancellation terms.", "HUME's discovery set is a listed kit purchase; these guides do not imply that HUME offers a perfume subscription."),
  g("How to avoid wasting money on perfume", "Perfume value", "Avoid wasting money by defining the job of the next purchase, testing uncertainty and checking the complete order. More bottles, stronger projection and bigger discounts are not automatically better value.", [
    ["Pause at an unclear brief", "If you cannot explain what a new fragrance adds, compare your existing choices before buying."],
    ["Resolve the important uncertainty", "A sample can answer whether you enjoy the scent. It cannot guarantee that every future wear or another person's experience will match."],
    ["Buy the intended order", "Check identity, size, availability and delivery. Avoid unwanted extras added only to qualify for a promotion."],
  ], "Write one sentence explaining the next purchase's purpose and one piece of evidence that it serves that purpose.", "Use HUME discovery only when it answers a useful preference question, then buy a favorite in a quantity you expect to use."),
  g("Best perfume under 500 rupees", "Bottle budgets", "Under ₹500, begin with a strict complete-order limit and verify which actual formats qualify. A smaller known fragrance may be more useful than an unverified large-bottle bargain; no universal best can be established from price alone.", [
    ["Check what the price buys", "Read maker, volume and product type. Do not assume a familiar reference name means an original designer bottle."],
    ["Keep the ceiling real", "Include delivery and optional extras. A qualifying headline price may still exceed your total limit at checkout."],
    ["Accept no suitable purchase", "If nothing verified fits your preferences and budget, waiting is a reasonable result. Do not stretch the limit because a page suggests an upgrade."],
  ], "Write a ₹500 delivered-total ceiling and reject any offer whose identity or final price remains unclear.", `HUME's current discovery kit is ${kitPrice}, so it does not qualify under ₹500. Browse current bottle variants only if their selected price and final total fit.`, "shop"),
  g("Best perfume under 1000 rupees", "Bottle budgets", "Under ₹1,000, decide whether you need one known fragrance or exploration before selecting a format. The best personal value depends on scent enjoyment and the final total, not spending as close to the ceiling as possible.", [
    ["Choose the purchase goal", "A bottle and a multi-scent kit solve different questions. Discovery is useful when preferences remain unfamiliar."],
    ["Check the margin", "A price just below the limit leaves little space for additional checkout charges. Verify the delivered amount."],
    ["Confirm the exact favorite", "Read the selected size and maker. A familiar inspiration name does not make products interchangeable."],
  ], "Compare one known-favorite option with discovery using the same ₹1,000 complete-order ceiling.", `HUME's discovery item price is ${kitPrice}; it fits below ₹1,000 before any additional charges, but it is a sample kit rather than one full bottle.`),
  g("Best perfume under 1500 rupees", "Bottle budgets", "A ₹1,500 ceiling gives you a spending boundary, not a requirement to choose a premium-looking bottle. Prioritize a tested fragrance and a useful quantity within the delivered total.", [
    ["Set the main use", "Daily wear and occasional evenings can favor different quantities. One versatile favorite may cover both."],
    ["Resolve scent uncertainty", "Sample a promising candidate before buying a larger volume if the smell is unfamiliar."],
    ["Compare final choices", "Match maker, version and selected size before deciding which offer represents value."],
  ], "Write the main use and expected wearing frequency before comparing options below ₹1,500.", "Use HUME's live bottle prices for a known favorite; consider discovery separately when a sample comparison is the actual need.", "shop"),
  g("Best perfume under 2000 rupees", "Bottle budgets", "Under ₹2,000, a fragrance you repeatedly enjoy is a stronger purchase than several uncertain bottles. Decide what useful role the purchase serves before comparing volume or promotions.", [
    ["Avoid quantity by default", "A bundle is not better just because the budget permits more items. Count fragrances you genuinely want to wear."],
    ["Test the later stage", "Judge whether you enjoy the dry down as well as the opening. Price does not resolve personal preference."],
    ["Preserve unused budget", "You can choose a lower-priced suitable option and keep the remainder. The ceiling is not a target."],
  ], "Compare one confirmed favorite with any proposed bundle by expected use rather than item count.", "Compare HUME's current individual listings and discovery offer without assuming a separate under-₹2,000 bundle exists.", "shop"),
  g("Best perfume under 2500 rupees", "Bottle budgets", "A perfume under ₹2,500 should earn its place through a clear scent preference and real use. Set aside brand prestige and evaluate the exact product, quantity and complete purchase terms.", [
    ["Define the missing texture", "If you own fragrance already, identify what a new candidate adds rather than buying a similar scent at a higher tier."],
    ["Compare identities fairly", "Designer originals, inspired perfumes and decants represent different offers even within one budget."],
    ["Check the total commitment", "Include exploration and delivery if those are part of your plan. Do not assume future credits reduce the cost."],
  ], "Name the distinct experience a ₹2,500 purchase would add before selecting a candidate.", "Explore HUME's own scent directions with discovery if needed, then compare live bottle formats rather than buying to fill the budget.", "shop"),
  g("Best perfume under 3000 rupees", "Bottle budgets", "Under ₹3,000, choose around a tested favorite and the quantity you expect to use. Higher available spend does not require a stronger perfume or a larger collection.", [
    ["Separate purpose and image", "Choose scent character for your routine instead of assuming a bottle must look expensive to be worthwhile."],
    ["Evaluate a repeat wear", "Return to the candidate on another suitable day. A memorable opening alone can be a weak basis for a larger purchase."],
    ["Compare sizes deliberately", "A lower unit price may require more upfront spending. Confirm the larger amount is useful."],
  ], "Write why the selected quantity is useful before comparing its cost per ml with smaller sizes.", "Check HUME's current variants after confirming the fragrance; no specific ₹3,000 product tier is implied.", "shop"),
  g("Best perfume under 4000 rupees", "Bottle budgets", "A ₹4,000 budget is best used by choosing a fragrance you can identify and enjoy, rather than chasing the largest apparent discount. Verify exact product type and seller terms before comparing prices.", [
    ["Inspect the listing identity", "Confirm maker, version, volume and condition. Similar names can conceal different products."],
    ["Avoid discount-led substitutions", "An alternative you dislike is not a bargain because its advertised reduction is larger."],
    ["Choose practical ownership", "Consider expected use, storage and whether an existing favorite already serves the role."],
  ], "Compare candidates first without their discount percentages, then add the complete price to the decision.", "Use HUME listings as clearly identified purchases of its own perfumes, with discovery available when preferences remain uncertain.", "shop"),
  g("Best perfume under 5000 rupees", "Bottle budgets", "Under ₹5,000, personal value still depends on the exact fragrance and how often you want to wear it. The budget does not establish a minimum quality level or guarantee performance.", [
    ["Choose your value criteria", "Scent, presentation and brand identity may matter differently to you. Decide which benefits deserve your money."],
    ["Test the full development", "Assess later enjoyment apart from projection. A lasting scent is not useful if you dislike it."],
    ["Keep options proportionate", "One lower-priced favorite may be enough. You need not spend the remainder on near-duplicates."],
  ], "List the three benefits you actually value before comparing any products below ₹5,000.", "Compare HUME's live offers with your own criteria, without treating price differences as proof of formula equivalence.", "shop"),
  g("Best perfume under 7500 rupees", "Bottle budgets", "A ₹7,500 ceiling allows choice but does not remove the need to sample unfamiliar perfume. Decide whether you want a particular fragrance experience or are mainly responding to prestige and packaging.", [
    ["Separate confirmed and assumed benefits", "Ingredient quantities and sourcing require specific evidence. Price and note names cannot establish them."],
    ["Prioritize the exact favorite", "A different size or version may wear differently or simply represent a different offer. Save the product identity."],
    ["Avoid spending by tier", "A satisfying lower-cost option can complete the decision. There is no obligation to buy near the ceiling."],
  ], "Write which verified benefits justify each price difference in your shortlist under ₹7,500.", "HUME discovery can help evaluate its own fragrances as alternatives to explore, without presenting them as identical designer products."),
  g("Best perfume under 10000 rupees", "Bottle budgets", "Under ₹10,000, choose perfume from a clear personal brief and actual wear evidence rather than a universal luxury ranking. A high ceiling does not require a large bottle or an expensive blind purchase.", [
    ["Set non-price requirements", "Describe the setting, preferred texture and dislikes. These should guide the shortlist before prestige enters the comparison."],
    ["Test before a major commitment", "Give an unfamiliar favorite another wear. No price tier guarantees attraction, duration or skin compatibility."],
    ["Review the complete order", "Confirm seller, exact item, delivery and returns. Preserve the unused budget when a less expensive choice already fits."],
  ], "Choose the lowest-commitment next step that resolves your remaining uncertainty before a purchase below ₹10,000.", "Explore HUME samples only if their scent directions interest you; a larger budget does not require buying a separate premium kit."),
  g("Perfume sample set under 500 rupees", "Sample-set budgets", "For a sample set under ₹500, verify a genuinely qualifying offer rather than assuming every discovery kit fits. Check total fragrance volume, useful variety and the complete delivered amount.", [
    ["Keep the limit strict", "Do not count a ₹999 kit as an under-₹500 option. A suggested upgrade is a separate spending decision."],
    ["Check small offers carefully", "Confirm maker, number of samples and ml per sample. A low headline price may refer to one vial rather than a set."],
    ["Accept a narrower comparison", "A few useful choices can be enough if a verified offer exists. Waiting is reasonable when nothing suitable qualifies."],
  ], "Reject any sample-set offer whose confirmed delivered total exceeds ₹500 or whose sample specification is unclear.", `HUME's current discovery kit costs ${kitPrice}, so it does not fit this limit. The kit shown alongside is a separate above-budget option.`, "shop"),
  g("Perfume sample set under 1000 rupees", "Sample-set budgets", `HUME's listed discovery item price of ${kitPrice} is below ₹1,000, but you must verify the final order total. Choose it only if the available fragrances answer your exploration questions.`, [
    ["Check the narrow margin", "A near-ceiling price leaves little room for additional charges. Confirm the delivered amount before payment."],
    ["Count useful choices", "Variety is valuable when the scents interest you. Select contrasting directions rather than filling slots without a purpose."],
    ["Review the product type", "HUME samples are its own perfumes, including inspired interpretations, not original designer decants."],
  ], "Check whether the complete discovery order stays below ₹1,000 before choosing the sample contents.", "Use the HUME builder to review current sample choices and preorder information after confirming the total fits."),
  g("Perfume sample set under 1500 rupees", "Sample-set budgets", "Under ₹1,500, compare sample sets by useful variety and exact product identity rather than assuming the set nearest the ceiling is best. Leave room for any additional order costs.", [
    ["Define the comparison", "Fresh versus woody or sweet versus dry gives the selection a purpose. Avoid collecting similar descriptions without a question."],
    ["Read the quantities", "Check count, individual size and total perfume volume. Packaging does not add liquid millilitres."],
    ["Keep the outcome open", "Learning what you dislike is useful too. A discovery purchase does not oblige you to buy full bottles."],
  ], "Assign each planned sample a reason to try it before comparing sets below ₹1,500.", `HUME's current kit item price is ${kitPrice}; verify checkout and availability rather than spending the remaining budget automatically.`),
  g("Perfume sample set under 2000 rupees", "Sample-set budgets", "A sample-set budget under ₹2,000 should support a manageable comparison, not necessarily the highest sample count. Choose a quantity of discovery you will actually work through.", [
    ["Plan the trial time", "Separate wears and repeat favorites need time. A large unused collection offers little practical learning."],
    ["Avoid duplicate learning", "Several nearly identical candidates may answer the same question. Choose useful contrasts."],
    ["Compare complete cost", "Include delivery and do not assume a future bottle credit reduces the kit's current price."],
  ], "Create a realistic trial schedule before deciding how many new samples belong in the purchase.", "HUME's selectable kit can provide one planned comparison; no separate under-₹2,000 discovery bundle is implied."),
  g("Perfume sample set under 2500 rupees", "Sample-set budgets", "For sample sets under ₹2,500, compare how selections are made and how relevant the contents are to your taste. A fixed assortment and a selectable kit solve different exploration needs.", [
    ["Choose control or surprise", "You may prefer choosing directions or exploring a maker's curated selection. Read what the actual offer permits."],
    ["Check exclusions", "Strong dislikes can make part of a fixed kit unhelpful. Count relevant samples rather than every included vial."],
    ["Keep identity clear", "Official samples, decants and inspired fragrances are different categories even within one budget."],
  ], "Compare the number of relevant choices in fixed and selectable kits before choosing an offer below ₹2,500.", "HUME's builder offers selection from listed available fragrances; review those choices before deciding the kit serves your preferences."),
  g("Perfume sample set under 3000 rupees", "Sample-set budgets", "Under ₹3,000, a sample set should answer a defined scent question before you add further spending. The unused portion of a budget does not need to become another set.", [
    ["Separate exploration and ownership", "A kit helps compare; a later bottle is another purchase. Plan both costs if that is your intention."],
    ["Check credits explicitly", "Do not assume a redemption voucher or discount exists unless the offer actually states it."],
    ["Choose from a complete trial", "Record the later character and repeat promising candidates before a follow-up purchase."],
  ], "Write the exploration cost and any optional later bottle budget separately before choosing the kit.", "Treat HUME discovery and any future bottle as separate purchases unless current published terms explicitly say otherwise."),
  g("Perfume sample set under 4000 rupees", "Sample-set budgets", "A sample-set ceiling of ₹4,000 does not make cost per ml the only useful comparison. Product identity, relevant variety and how much uncertainty the set resolves matter too.", [
    ["Calculate quantity consistently", "Use stated perfume volume and the same price basis for each option."],
    ["Assess useful diversity", "Distinct textures can teach more than extra volume of similar scents. Decide what each sample contributes."],
    ["Keep claims separate", "A higher kit price does not establish natural ingredients, stronger wear or better fit."],
  ], "Compare unit price alongside useful scent diversity rather than allowing either number to decide alone.", "Use HUME's listed kit specification to calculate quantity value, then judge whether the available selections serve your learning goal."),
  g("Perfume sample set under 5000 rupees", "Sample-set budgets", "For discovery under ₹5,000, a focused set can be more useful than several overlapping kits. Start with the preferences you want to understand and add variety only when it answers another question.", [
    ["Map the learning goals", "Separate family preference, occasion fit and later texture. One sample may help with several goals."],
    ["Avoid automatic multi-kit buying", "A comfortable budget is permission to choose, not a requirement to accumulate."],
    ["Review after the first set", "Your next choice can improve once the initial trials reveal actual likes and dislikes."],
  ], "Write the questions a second set would answer before ordering multiple discovery offers at once.", "Start with HUME discovery only if its selectable directions match the first questions you want to resolve."),
  g("Perfume sample set under 7500 rupees", "Sample-set budgets", "A ₹7,500 sample budget can cover broad exploration, but value still depends on clear identities and a manageable plan. A premium price is not a substitute for relevant contents.", [
    ["Verify the sample category", "Check whether each offer contains official samples, third-party decants or the seller's own perfumes."],
    ["Avoid reputation-only choices", "Expensive reference names do not establish that you will enjoy the actual product being sold."],
    ["Stage the exploration", "Compare one useful selection before widening the shortlist. Keep exact names in a log."],
  ], "Create a staged exploration plan that leaves room to change direction after the first comparisons.", "HUME discovery is an exploration of HUME fragrances, not a premium designer-decant collection despite familiar inspiration references."),
  g("Perfume sample set under 10000 rupees", "Sample-set budgets", "Under ₹10,000, a discovery purchase should remain proportionate to your curiosity and available trial time. You can learn a great deal from a smaller relevant set without spending the entire allowance.", [
    ["Set a clear endpoint", "Decide whether the aim is finding one favorite, learning families or enjoying occasional variety."],
    ["Plan manageable trials", "Separate unfamiliar scents and repeat favorites rather than opening everything in one sitting."],
    ["Keep the next purchase optional", "Discovery can be a complete experience. No full-bottle purchase is required to justify a kit."],
  ], "Choose a discovery endpoint and stop adding samples when the current selection can reasonably answer it.", "Use HUME's selectable kit when its directions fit your goal; there is no need to invent a higher-priced HUME tier for this ceiling."),
  g("Perfume gift set under 500 rupees", "Gift-set budgets", "For a perfume gift set under ₹500, verify an actual qualifying set and its delivered total. Do not assume a low-cost single vial or an above-budget discovery offer satisfies the request.", [
    ["Check the complete contents", "Confirm maker, item count and volume. A gift-style image may not show exactly what the selected price includes."],
    ["Keep recipient preference", "A small relevant gift can be more useful than an unknown large bottle. Do not choose only for packaging."],
    ["Respect the ceiling", "Include delivery and listed presentation charges. Waiting or choosing a different gift is reasonable if no suitable set qualifies."],
  ], "Confirm contents and a maximum ₹500 delivered total before treating any listing as a qualifying gift set.", `HUME's discovery kit is ${kitPrice}, so it is above this limit. These pages do not claim a HUME gift set under ₹500 exists.`, "shop"),
  g("Perfume gift set under 1000 rupees", "Gift-set budgets", `HUME's ${kitPrice} discovery item can be considered below a ₹1,000 product-price ceiling if the recipient wants samples. Confirm the complete total and presentation details before treating it as a qualifying gift.`, [
    ["Confirm the recipient's interest", "Discovery suits someone who wants exploration; a known exact favorite may call for a different format."],
    ["Check the narrow price margin", "Additional charges can take a near-ceiling item beyond the limit. Verify the final amount."],
    ["Review the gift deadline", "Current preorder timing matters for a birthday or event. Do not assume immediate dispatch or unlisted wrapping."],
  ], "Confirm recipient interest, delivery timing and a final total below ₹1,000 before selecting the kit.", "Review HUME's live discovery offer as an exploration gift rather than assuming a separately packaged gift-set range."),
  g("Perfume gift set under 1500 rupees", "Gift-set budgets", "For a gift set under ₹1,500, prioritize recipient-specific choices and a dependable purchase plan. The best gift need not consume the whole budget or contain the most items.", [
    ["Collect broad preferences", "Ask for two liked directions and one dislike. This is more useful than guessing from gender or age."],
    ["Check the included format", "Distinguish sample exploration from a single known favorite. Count perfume volume separately from extras."],
    ["Verify date and terms", "Review availability, delivery and returns before paying. A gift does not create automatic exchange rights."],
  ], "Write the recipient's preferences and gift date beside the complete ₹1,500 limit.", "Choose HUME discovery samples together if exploration is welcome, checking current preorder details and checkout total."),
  g("Perfume gift set under 2000 rupees", "Gift-set budgets", "Under ₹2,000, choose a perfume gift by usefulness rather than component count. A single confirmed favorite can be more appropriate than a set whose extras the recipient will not use.", [
    ["Compare gift roles", "Known-favorite replacement and discovery are different aims. Confirm which one the recipient would welcome."],
    ["Assess every item", "Avoid counting packaging or accessories as perfume volume. Read the exact selected contents."],
    ["Keep the total visible", "Add displayed delivery and presentation costs rather than comparing headline prices alone."],
  ], "Compare a known favorite and a discovery gift by likely recipient use, not the number of pieces.", "HUME discovery can serve exploration within the current offer; no separate under-₹2,000 gift bundle is implied."),
  g("Perfume gift set under 2500 rupees", "Gift-set budgets", "A perfume gift under ₹2,500 should reflect how the recipient wants to choose fragrance. Involving them in the scent selection can be more useful than preserving a complete surprise.", [
    ["Choose the surprise boundary", "You can agree on scent directions while keeping the presentation or occasion a surprise."],
    ["Verify selection control", "Check whether the actual set allows choices or contains a fixed assortment. Do not promise recipient redemption unless listed."],
    ["Check order timing", "A selectable set still needs delivery time. Review current availability before committing to an event date."],
  ], "Decide which part of the gift should be a surprise before choosing a fixed or selectable set.", "Build HUME's discovery selection with the recipient when possible; this does not imply a separate recipient-selection service after purchase."),
  g("Perfume gift set under 3000 rupees", "Gift-set budgets", "For a ₹3,000 gift ceiling, choose the format that fits the recipient rather than assembling extra bottles to reach the limit. A clear purchase and delivery plan matters as much as scent variety.", [
    ["Choose one useful purpose", "Exploration, replacing a favorite and occasional variety call for different quantities."],
    ["Avoid invented package benefits", "Check what wrapping, accessories or credits are actually listed. Do not infer them from a styled photograph."],
    ["Review final terms", "Confirm current contents, delivered total and returns. Keep the deadline realistic for preorder items."],
  ], "Write the gift's purpose before choosing any optional extras within the ₹3,000 allowance.", "Use HUME's published kit and bottle details to choose the useful format, without assuming an unlisted combined gift package."),
  g("Perfume gift set under 4000 rupees", "Gift-set budgets", "Under ₹4,000, a perfume gift should have a clear product identity and a scent direction the recipient wants. Familiar designer references do not establish that a set contains original designer perfumes.", [
    ["Read maker and product type", "Separate original-brand samples, decants and inspired interpretations. Explain the gift accurately."],
    ["Check recipient expectations", "Someone asking for an exact designer favorite may not want a different interpretation even at a lower price."],
    ["Assess the full offer", "Confirm quantities, presentation and delivery rather than judging from reference names alone."],
  ], "Write an accurate one-line description of who makes the fragrances in the proposed gift.", "HUME discovery contains its own perfumes, including inspired interpretations; choose it when that is what the recipient wants to explore."),
  g("Perfume gift set under 5000 rupees", "Gift-set budgets", "A ₹5,000 gift budget does not guarantee the recipient will prefer a more expensive set. Choose verified preferences and useful contents instead of equating price with thoughtfulness.", [
    ["Use recipient evidence", "An exact favorite or clear likes and dislikes is stronger guidance than a universal gift ranking."],
    ["Avoid quantity pressure", "Extra samples or bottles can be unwanted if they duplicate a scent the recipient already owns."],
    ["Check practical fit", "Confirm event timing, delivery and published returns. A gift should not depend on an assumed exchange promise."],
  ], "List recipient-specific reasons for the choice without using price or item count as the main justification.", "Consider HUME's selectable discovery offer only if exploration is welcome; you do not need to spend the unused gift budget."),
  g("Perfume gift set under 7500 rupees", "Gift-set budgets", "For a gift under ₹7,500, distinguish a prestige preference from a desire to explore scent. Both can be valid, but they call for different products and should not be substituted without considering the recipient.", [
    ["Confirm the intended experience", "A known brand or exact perfume may matter to the recipient. An unfamiliar discovery set is a different gift."],
    ["Verify claims", "Price and notes do not establish rare natural ingredients or performance. Use specific product disclosures."],
    ["Choose proportionately", "A lower-cost relevant gift can complete the task. Do not add unrelated products simply to reach the ceiling."],
  ], "Ask whether the recipient values an exact product, a brand experience or broad exploration before choosing.", "HUME discovery serves exploration of HUME fragrances; do not present it as a substitute for a confirmed designer request without agreement."),
  g("Perfume gift set under 10000 rupees", "Gift-set budgets", "Under ₹10,000, choose a perfume gift around confirmed recipient preferences and a clear complete-order plan. A high limit does not require a large collection or an expensive blind choice.", [
    ["Reduce the important uncertainty", "If the exact favorite is unknown, ask or choose an agreed exploration format rather than relying on demographic recommendations."],
    ["Keep identity transparent", "Read maker, version, quantities and actual presentation details before deciding what the gift promises."],
    ["Protect the occasion", "Check availability, delivery and returns early. Preorder timing matters regardless of the spending ceiling."],
  ], "Choose the gift only after confirming recipient intent, accurate contents and an achievable delivery date.", "Use HUME's current discovery specification when an exploration gift fits; the larger budget does not imply a separate premium HUME gift tier."),
];

for (const title of ["Perfume cost per ml explained", "Perfume sample price per ml"]) {
  BEGINNER_GUIDES_BATCH_TWELVE.find(guide => guide.title === title)!.chart = {
    headers: ["HUME discovery calculation", "Listed value"],
    rows: [
      ["Item price before additional charges", kitPrice],
      ["Samples and size", `${DISCOVERY_SET_SAMPLE_COUNT} × ${DISCOVERY_SET_SAMPLE_SIZE_ML}ml`],
      ["Total perfume volume", `${kitVolume}ml`],
      ["Item price per ml, rounded", `₹${(DISCOVERY_SET_PRICE / kitVolume).toFixed(2)}`],
    ],
  };
}
