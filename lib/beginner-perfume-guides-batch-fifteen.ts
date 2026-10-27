import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";
import { DISCOVERY_SET_PRICE, DISCOVERY_SET_SAMPLE_COUNT, DISCOVERY_SET_SAMPLE_SIZE_ML } from "@/lib/discovery-set";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep: "samples", productIds: [] };
}

export const BEGINNER_GUIDES_BATCH_FIFTEEN: BeginnerGuide[] = [
  g("Perfume samples for first time buyers", "First sample purchases", "For a first sample purchase, begin with a few scent directions you can describe and a clear spending limit. Samples help you learn preferences without needing a large first bottle or specialist vocabulary.", [
    ["Use everyday descriptions", "Citrus peel, fresh flowers, dry wood and soft sweetness are useful starting clues. You do not need to identify individual ingredients."],
    ["Read who makes the scent", "Official samples, decants and inspired fragrances are different products. Save the maker and exact name."],
    ["Keep a first-wear note", "Record the opening, later character and desire to try it again. An exciting first spray is only one stage."],
  ], "Choose one familiar liked direction and one contrast for your first sample comparison.", "Use HUME's quiz and live notes to shortlist its own discovery fragrances before selecting the kit."),
  g("Fragrance sample packs for first time buyers", "First sample purchases", "A first fragrance pack should provide useful contrast without making the comparison confusing. Count distinct questions the contents can answer rather than choosing only the largest vial count.", [
    ["Check selection control", "A fixed pack invites the maker's assortment; a selectable pack can avoid known dislikes. Decide which approach helps you start."],
    ["Read the actual quantities", "Confirm sample count, ml per sample and applicator. The photograph is not a substitute for specifications."],
    ["Plan manageable trials", "Use unfamiliar scents separately on suitable days. Keep promising favorites for another wear before buying more."],
  ], "Write a different learning question beside each fragrance you expect to try in the first pack.", "HUME's builder lets you choose listed fragrances, so use the selection to create meaningful contrasts rather than near-duplicates."),
  g("Perfume discovery sets for first time buyers", "First sample purchases", "For a first-time buyer, a discovery set can be an introduction to scent preference rather than a compulsory path to a full bottle. Choose it with a clear goal and an affordable complete total.", [
    ["Choose a discovery endpoint", "Finding one daily favorite and enjoying occasional variety are both valid goals. Decide which interests you now."],
    ["Check what is included", "Read count, size, selection method and current availability. Do not assume bottle credits or membership benefits."],
    ["Let results guide the next step", "Learning a dislike is useful. You do not have to convert every pleasant sample into another purchase."],
  ], "Define successful first discovery without requiring yourself to buy a full bottle afterward.", "HUME's selectable kit can support that introduction, with its current specification and preorder status shown alongside."),
  g("Mini perfume testers for first time buyers", "First sample purchases", "For a first mini tester, check the actual container and fragrance identity before buying. Mini may mean a trial vial or a miniature-style bottle, not a standardized size or weaker formula.", [
    ["Choose a usable applicator", "Read whether the item sprays or dabs and follow its directions. Do not assume every pictured mini is a spray."],
    ["Use stated millilitres", "Images can make containers look larger. Compare quantities rather than the bottle's apparent height."],
    ["Avoid exact-yield promises", "A universal number of sprays or wears cannot be inferred from size alone. Decide whether the amount suits your trial purpose."],
  ], "Write format, millilitres and maker beside your first mini option before comparing price.", "Read HUME's discovery sample specification directly; these guides do not imply a separate decorative miniature-bottle line."),
  g("Perfume trial kits for first time buyers", "First sample purchases", "A first trial kit should help answer a simple question, such as whether you prefer freshness or warmer woods. Trial describes a comparison format, not an automatic refund or free bottle program.", [
    ["Set one main question", "A small clear brief makes the contents easier to judge than trying to find every possible occasion scent at once."],
    ["Choose ordinary trial days", "Learn an unfamiliar fragrance before interviews, weddings or dates. Separate samples so impressions remain readable."],
    ["Review the purchase commitment", "Check delivery, returns and any explicitly included benefits before ordering. Do not assume dislike qualifies for an exchange."],
  ], "Write one trial question, a few suitable wear days and a review point before your first kit purchase.", "Select HUME discovery choices around that question and check current preorder timing before planning the trials."),
  g("Travel perfume sets for first time buyers", "First sample purchases", "If your first fragrance purchase is for travel, separate learning the scent from packing it. A set marketed for travel still needs familiar contents, secure handling and checks against current route requirements.", [
    ["Start with the actual trip", "One tested favorite may cover your plans. You do not need a new scent for every imagined holiday activity."],
    ["Try before departure", "Observe later development at home rather than discovering a mismatch once travelling."],
    ["Check practical requirements", "Review container details, current carrier and security rules, and storage directions. Small size alone does not provide permission."],
  ], "List the trip's real fragrance needs before choosing a multi-scent travel purchase.", "HUME discovery samples can support pre-trip learning; check its current format and delivery timing separately from transport rules."),
  g("Customizable perfume kits for first time buyers", "First sample purchases", "For a first customizable kit, confirm whether you are selecting existing fragrances or commissioning a formula. Choosing the samples can be helpful without making the contents a personal bespoke perfume.", [
    ["Read the scope of choice", "Check which fragrances, count and formats the actual builder permits. Do not infer unlisted blending services."],
    ["Build a simple contrast", "Choose familiar liked directions and one useful alternative rather than filling all choices with popular reference names."],
    ["Review before payment", "Check exact selected names, required count, availability and complete total. Selection control still needs careful use."],
  ], "Give every chosen scent a comparison role before confirming your first custom selection.", "HUME's builder customizes the selection of existing available fragrances; it does not create or edit a formula for you."),
  g("Luxury fragrance samples for first time buyers", "First sample purchases", "A first luxury-labelled sample should be chosen for the exact scent you want to explore, with product identity clearly understood. Prestige wording does not guarantee your preference or a particular ingredient standard.", [
    ["Identify the sample category", "Official brand samples, third-party decants and inspired fragrances are different offers. Read the actual maker."],
    ["Avoid price as a smell guide", "A high retail reference cannot tell you whether the later scent will appeal. Use personal texture preferences."],
    ["Choose a comfortable commitment", "Exploration should fit your total budget. A smaller useful comparison can be enough for a first step."],
  ], "Write the maker and a personal scent reason for trying each premium-labelled sample.", "Explore HUME samples as its own fragrances, including inspired interpretations, rather than original luxury-brand decants."),
  g("Perfume tester boxes for first time buyers", "First sample purchases", "For a first tester box, read the contents before judging the presentation. A well-photographed package does not establish the amount, variety or product type you will receive.", [
    ["Confirm the inventory", "Check names, count, individual volumes and applicators. Count accessories separately from perfume."],
    ["Choose useful variety", "A box should help compare preferences rather than simply look full. Exclude known dislikes when selection is possible."],
    ["Check the actual variant", "The selected price may refer to a different size or assortment from the main image. Review the final order."],
  ], "Rewrite the tester-box offer as an inventory before deciding whether its presentation adds value.", "Use HUME's published discovery specification, without assuming unlisted accessories or separate tester-box editions."),
  g("Perfume sampler gifts for first time buyers", "First sample purchases", "For someone buying or receiving a first perfume sampler gift, confirm that exploration is welcome. A broad assortment is not automatically better than an exact requested favorite or another kind of gift.", [
    ["Ask for useful preferences", "Two liked directions and one dislike help more than assumptions based on age or gender."],
    ["Choose the surprise boundary", "Selecting scents together can reduce uncertainty while keeping the gifting occasion special."],
    ["Review the gift plan", "Check current contents, delivery timing, presentation and returns. Do not promise exchanges or extras that are not listed."],
  ], "Confirm whether the recipient wants discovery before comparing sampler count or gift-box appearance.", "Build HUME discovery choices together if helpful, checking preorder timing against the occasion."),
  g("Perfume samples with online delivery", "Ordering sample formats", "For perfume samples ordered online, verify the exact selected product and final delivery terms before payment. Online availability alone does not establish immediate dispatch or service to every destination.", [
    ["Check the product identity", "Save maker, fragrance version, millilitres and applicator. Similar reference names may describe different perfumes."],
    ["Read the delivery information", "Review current availability, preorder status and checkout details for the intended address. Do not assume a banner applies to every order."],
    ["Keep the order record", "Save confirmation and use the seller's contact process if the delivered contents do not match the selection."],
  ], "Review exact sample identity, address details and final total before confirming an online order.", "Order HUME discovery through its builder, reviewing the current shipping policy and preorder information rather than assuming dispatch dates."),
  g("Fragrance sample packs with online delivery", "Ordering sample formats", "When ordering a sample pack online, confirm the actual assortment and whether substitutions are described. The pack name or photograph may not fully specify the selected contents.", [
    ["Save the assortment", "Record fragrance names, sample count and individual volumes. This gives you a clear reference when the pack arrives."],
    ["Check availability rules", "Read current selection and fulfilment information. Do not assume unavailable scents will be replaced to your preference."],
    ["Compare complete totals", "Use delivered cost and relevant variety together. An inexpensive pack can be unhelpful if most choices do not interest you."],
  ], "Save a plain list of the pack contents and expected quantities before payment.", "Review the selected HUME builder choices in the order flow and use current contact information for any clarification."),
  g("Perfume discovery sets with online delivery", "Ordering sample formats", "An online discovery-set order should fit both your exploration goal and the seller's current fulfilment information. A kit for a fixed event needs more planning than an open-ended personal trial.", [
    ["Set the deadline", "Leave time for delivery and separate wear trials before any occasion that depends on the result."],
    ["Read the offer", "Check count, sample size and selection method. Preorder and ready-to-dispatch are different availability states."],
    ["Review purchase terms", "Check complete cost and returns without assuming a discovery credit or satisfaction refund."],
  ], "Work backwards from your first planned trial date before choosing an online discovery offer.", "HUME's current discovery preorder status and shipping information should guide the order plan; no specific arrival date is promised here."),
  g("Mini perfume testers with online delivery", "Ordering sample formats", "For mini testers delivered online, use written dimensions of the offer—especially millilitres and applicator—rather than estimating from images. Mini does not standardize the package you receive.", [
    ["Verify the selected size", "Check whether the price buys a vial, miniature bottle or an assortment. Main photographs may show multiple options."],
    ["Read identity and condition", "Confirm maker, exact fragrance and any stated packaging details. Tester wording does not certify original-brand contents."],
    ["Review on arrival", "Match the delivery to the saved order and follow the seller's contact process for discrepancies."],
  ], "Record format and stated ml before comparing two online mini-tester offers.", "Check HUME's current discovery sample format directly; no separate miniature collection or exact spray yield is implied."),
  g("Perfume trial kits with online delivery", "Ordering sample formats", "An online trial kit is a purchase under the seller's actual terms, not automatically a try-and-return service. Read the trial commitment and delivery details before scheduling comparisons.", [
    ["Check what trial includes", "A sample assortment, a redeemable program and a returnable service are different offers. Use the published description."],
    ["Allow realistic trial time", "Separate unfamiliar scents and repeat favorites after delivery. Avoid planning the entire comparison just before an important event."],
    ["Keep costs distinct", "Include the delivered kit cost and any optional later bottle separately. Do not infer unlisted credits."],
  ], "Write what the online trial offer explicitly includes and what would require another purchase.", "Use HUME discovery as its listed sample-kit purchase, reviewing shipping and returns without assuming a bottle-redemption scheme."),
  g("Travel perfume sets with online delivery", "Ordering sample formats", "For an online travel-set purchase, plan delivery and scent testing before departure. A travel label does not guarantee arrival in time or approval for your particular route.", [
    ["Work backwards from travel", "Allow time to receive and check the containers and learn any unfamiliar scents."],
    ["Verify packing needs", "Review listed volumes, applicators and closure information, then check current carrier and security requirements."],
    ["Avoid unnecessary variety", "One known favorite may cover the trip. Do not let a delivery deadline push you into untested extras."],
  ], "Set an order deadline that leaves room for receiving, checking and trying the travel selection.", "Check HUME's current discovery preorder information before relying on samples for a trip; transport requirements remain a separate check."),
  g("Customizable perfume kits with online delivery", "Ordering sample formats", "For a customizable kit ordered online, review the exact selection before paying and save it with the order. Choosing existing fragrances does not imply formula development or unrestricted customization.", [
    ["Check selection rules", "Read required count, eligible fragrances and available quantities. Use only the builder options currently offered."],
    ["Verify names carefully", "Similar references can be easy to confuse. Check each selected fragrance against the intended comparison."],
    ["Confirm fulfilment details", "Review preorder status, delivery information and final total for the completed selection."],
  ], "Read the final fragrance list aloud against your planned choices before submitting the order.", "HUME's builder selects existing available perfumes; keep the final choice list as a reference for delivery and later wear notes."),
  g("Luxury fragrance samples with online delivery", "Ordering sample formats", "When ordering luxury-labelled samples online, establish product identity before delivery convenience. A premium image or famous reference name does not show whether the contents are official samples, decants or inspired fragrances.", [
    ["Read the actual maker", "The seller should clearly describe what is being supplied. Avoid comparing different categories as though identical."],
    ["Assess seller information", "Look for usable contact details, clear order terms and exact quantities rather than relying only on packaging or codes."],
    ["Check the complete purchase", "Review selected size, availability, final cost and returns before payment."],
  ], "Write one accurate product-type sentence for the offer before considering its delivery speed or premium styling.", "HUME discovery contains its own perfumes, including inspired interpretations, rather than original luxury-brand sample deliveries."),
  g("Perfume tester boxes with online delivery", "Ordering sample formats", "For a tester box delivered online, verify the inventory and selected presentation details separately. Styled images can show props or options that are not part of the actual order.", [
    ["Confirm included items", "Check fragrance names, sample sizes, count and explicitly listed accessories. Do not infer extras."],
    ["Review the selected variant", "A headline price may refer to a smaller box or different assortment. Compare the exact cart contents."],
    ["Plan for the intended use", "A gift deadline requires current availability and delivery information, not only an attractive product page."],
  ], "Create a final-order inventory before buying a tester box for delivery.", "Review HUME's published discovery specification and preorder details instead of assuming a separate gift-box delivery service."),
  g("Perfume sampler gifts with online delivery", "Ordering sample formats", "For a sampler gift sent by online delivery, confirm recipient preference, address details and timing before payment. A gift order does not automatically include wrapping, a note or preference-based exchanges.", [
    ["Agree the scent direction", "Use actual likes and dislikes or select samples together if exploration is welcome."],
    ["Check gift options explicitly", "Use only presentation and message services actually offered in the order flow. Do not promise unlisted extras."],
    ["Review the delivery plan", "Confirm intended recipient details and current availability. Leave enough time for preorder items."],
  ], "Check the recipient, fragrance selection, listed gift options and achievable date as four separate decisions.", "Use HUME discovery as an exploration gift when its current choices and preorder timing fit, with shipping terms reviewed before ordering."),
  g("Compare prices of perfume samples", "Comparing sample prices", "Compare sample prices using exact identity, stated volume and a consistent complete-cost basis. A lower price per ml does not make two differently made fragrances the same product.", [
    ["Match the category", "Official brand samples, decants and inspired interpretations are different offers. Record maker and version first."],
    ["Calculate consistently", "Divide price by stated ml and use either item prices or delivered totals on the same basis."],
    ["Keep commitment visible", "A higher unit price can still mean a smaller total commitment than an unwanted bottle."],
  ], "Compare maker, version, ml, item price, delivery and total for each sample before ranking cost.", "Use HUME's current kit specification for quantity arithmetic while keeping its own fragrance identity clear."),
  g("Compare prices of fragrance sample packs", "Comparing sample prices", "For sample-pack prices, compare both total perfume volume and the number of choices you actually want to try. A pack can be cheap by vial count but poor value for your preferences.", [
    ["Read every quantity", "Multiply count by size only when all samples have that size. Check mixed-volume packs item by item."],
    ["Count useful contents", "Known dislikes and near-duplicates may add less learning than a smaller relevant assortment."],
    ["Include order costs", "Use the same delivered-price basis across packs rather than mixing a headline price with a final checkout total."],
  ], "Compare cost per useful sample alongside total volume for two clearly identified packs.", "HUME's selectable pack can reduce unwanted choices when the live catalogue aligns with your interests."),
  g("Compare prices of perfume discovery sets", "Comparing sample prices", "Discovery-set price comparisons should include useful variety, stated volume and actual included benefits. Do not deduct an assumed bottle credit or treat packaging as additional perfume quantity.", [
    ["Compare the specification", "Record count, ml per sample and whether choices are fixed or selectable."],
    ["Read follow-up benefits", "Use only redemption or discount terms explicitly included in the current offer. Separate optional later spending."],
    ["Value the learning goal", "Finding one regular favorite and collecting variety can justify different sets. Choose by the questions answered."],
  ], "Compare discovery cost before any optional bottle purchase, then list verified benefits separately.", "The HUME calculation in this guide uses its shared item price and volume without assuming a future purchase credit."),
  g("Compare prices of mini perfume testers", "Comparing sample prices", "Compare mini-tester prices by actual ml, product identity and applicator rather than visual bottle size. A decorative miniature and a trial vial may offer different benefits even at the same volume.", [
    ["Read format details", "Check spray or dab application and the selected quantity. Mini is not a standardized size."],
    ["Separate presentation value", "Collectible packaging may interest you, but it is distinct from fragrance volume and trial usefulness."],
    ["Avoid spray-count economics", "Different applicators make universal price-per-spray estimates unreliable. Use stated quantity for basic arithmetic."],
  ], "Compare mini offers in a table with ml, format and presentation as separate fields.", "Use HUME's listed discovery sample size for comparison rather than inferring an unlisted miniature format."),
  g("Compare prices of perfume trial kits", "Comparing sample prices", "Compare trial-kit prices by the complete commitment, including delivery and any later optional purchase. A kit called trial does not automatically include reimbursement, exchanges or bottle redemption.", [
    ["Read the actual program", "A one-time sample purchase differs from a credited trial or recurring service. Compare only published terms."],
    ["Budget the stages", "Keep trial cost and a possible later bottle as separate decisions rather than treating the second as inevitable."],
    ["Check practical learning value", "Relevant contents and time for repeat wears matter more than a nominally large assortment."],
  ], "Write the total cost if you stop after the trial and the separate cost if you later choose a bottle.", "HUME discovery is a listed kit purchase; no unlisted credit or subscription is used to reduce its comparison price."),
  g("Compare prices of travel perfume sets", "Comparing sample prices", "For travel-set prices, compare practical portability and known scent usefulness alongside quantity. A convenient-looking pack is not good value if it fails your actual packing needs or contains unwanted scents.", [
    ["Check the actual containers", "Record volumes, applicators and closure information. Portability is more than a small product image."],
    ["Avoid assumed travel approval", "Check current route requirements separately. A travel label is not universal permission."],
    ["Compare existing options", "You may already own a suitable format. Buying another set is optional when the itinerary is covered."],
  ], "Compare a proposed set's complete cost with the specific packing gap it solves.", "Use HUME samples for relevant exploration before travel, without adding unverified travel certification to their price value."),
  g("Compare prices of customizable perfume kits", "Comparing sample prices", "Compare customizable-kit prices by the real selection control offered and the contents you want. Choosing existing scents, changing presentation and commissioning a formula are different services.", [
    ["Define the customization", "Read which choices the builder actually permits. Do not compare a selectable sample kit with bespoke perfumery as though identical."],
    ["Value avoided waste", "Selection control can matter if it removes known dislikes from a fixed assortment."],
    ["Review the completed total", "Check selected count, eligible options and final price. Do not assume every customization is included or available."],
  ], "Count how many unwanted samples selection control avoids before comparing customizable-kit prices.", "HUME's builder changes the selection of existing fragrances, not their formulas; compare its price on that basis."),
  g("Compare prices of luxury fragrance samples", "Comparing sample prices", "For luxury-labelled sample prices, first establish the exact maker and product type. Price differences between an official sample, decant and inspired interpretation do not measure the same offer.", [
    ["Confirm the actual product", "Save name, version, source description and ml. Familiar references do not establish original-brand contents."],
    ["Separate prestige and quantity", "Brand positioning or presentation can be valued separately from liquid volume. Neither proves preference or longevity."],
    ["Compare within your brief", "Choose samples that answer personal scent questions rather than treating a high reference price as a recommendation."],
  ], "Group sample offers by actual product identity before calculating any price differences.", "Compare HUME as its own fragrance option rather than a cheaper container of an identical designer formula."),
  g("Compare prices of perfume tester boxes", "Comparing sample prices", "Compare tester-box prices by actual fragrance inventory, relevant variety and the presentation you want. More pictured pieces or a larger box do not automatically mean more perfume.", [
    ["Separate contents and props", "Check selected sample count, sizes and explicitly included accessories. Styled images are not a full inventory."],
    ["Assess useful assortment", "An unwanted fixed selection can reduce practical value despite an attractive price."],
    ["Use complete purchase totals", "Include displayed delivery and presentation costs on a consistent basis across offers."],
  ], "Score liquid quantity, useful variety and presentation independently before comparing tester-box totals.", "Use HUME's current discovery specification and checkout total without inventing extra box contents or gift services."),
  g("Compare prices of perfume sampler gifts", "Comparing sample prices", "For sampler-gift prices, compare recipient relevance and achievable delivery as well as contents. The cheapest pack or the largest assortment is not automatically the most useful gift.", [
    ["Check recipient intent", "Discovery suits someone who wants exploration. A confirmed favorite may make a bottle a better use of the budget."],
    ["Verify gift extras", "Use only wrapping, messages or accessories actually offered. Do not assume they are included in a headline price."],
    ["Include timing and terms", "Check availability, delivery and returns before treating an offer as suitable for the occasion."],
  ], "Compare gift candidates by useful contents, final total and delivery fit before ranking presentation.", "Review HUME discovery as an exploration gift with its current preorder status, not as an unlisted dedicated gift package."),
  g("Perfume samples for men and women", "Preference-led samples", "Choose perfume samples for men and women by individual scent preferences rather than treating gender as a smell or performance category. Fresh, floral, woody and sweet directions can interest any wearer.", [
    ["Use liked textures", "Ask each person for familiar smells they enjoy and clear dislikes. This creates a more useful shortlist than demographics."],
    ["Evaluate separately", "Two people can prefer different stages of the same fragrance. Record individual impressions before agreeing on a favorite."],
    ["Keep identity clear", "Save maker and exact version so later orders match the actual sample tried."],
  ], "Create a separate likes-and-dislikes brief for each intended wearer before choosing samples.", "Use HUME's live notes to explore beyond gender categories, letting each wearer choose from actual sample experience."),
  g("Fragrance sample packs for men and women", "Preference-led samples", "A sample pack for several wearers should provide relevant contrast without assuming everyone wants the same assortment. Gender labels cannot establish shared preference or a fair division of the contents.", [
    ["Map individual interests", "List which directions each person wants to explore and which they avoid."],
    ["Choose useful overlap", "Shared interest in a sample can support comparison, while different choices can respect individual taste."],
    ["Plan the quantity", "Consider how the listed amounts serve the intended trials. Do not assume one vial provides a fixed number of wears for everyone."],
  ], "Mark each sample as individually relevant or jointly interesting before choosing a pack for multiple people.", "Build a HUME discovery selection around actual wearer interests rather than assuming a preset men's-and-women's split."),
  g("Perfume discovery sets for men and women", "Preference-led samples", "A discovery set can support individual exploration for any wearer without prescribing masculine or feminine results. Choose a goal and assess the exact fragrances independently.", [
    ["Define each discovery goal", "One person may want a daily favorite while another enjoys comparing families. Those aims can guide different selections."],
    ["Avoid identical-result expectations", "Shared samples do not guarantee shared enjoyment or matching perceived duration."],
    ["Let the next step differ", "One wearer may choose a bottle while another stops with samples. Discovery does not require everyone to buy more."],
  ], "Write each wearer's own successful-discovery outcome before selecting the set.", "Use HUME's selectable kit for preference-led exploration without implying separate fixed gender bundles."),
  g("Mini perfume testers for men and women", "Preference-led samples", "Mini testers should be chosen by scent preference and usable format regardless of gender. Container size does not determine which wearer should enjoy a fragrance.", [
    ["Check the applicator", "Spray and dab formats create different handling experiences. Confirm the actual listing before buying."],
    ["Compare the exact smell", "A small bottle can contain any style of fragrance. Read notes as clues rather than gender rules."],
    ["Keep personal notes", "Record who liked which later character instead of assigning the samples from their packaging."],
  ], "Select mini candidates by texture and applicator, then ask each wearer for an independent verdict.", "HUME's discovery samples explore its listed fragrances; there is no separate mini formula determined by the wearer's gender."),
  g("Perfume trial kits for men and women", "Preference-led samples", "A trial kit for any wearer should answer individual questions about scent and routine. Gendered marketing is less useful than knowing the setting, desired character and dislikes.", [
    ["Build a personal trial brief", "Describe where the fragrance will be worn and what experience is wanted. Avoid assuming all wearers seek the same presence."],
    ["Use separate suitable trials", "One unfamiliar scent at a time helps each person describe the development without mixing impressions."],
    ["Respect differing outcomes", "A shared trial can end with different favorites. Do not force a common bottle just because the kit was purchased together."],
  ], "Assign one personal preference question to each intended trial before dividing the kit choices.", "Use HUME discovery for separate wearer briefs rather than treating the kit as a universal-fit package."),
  g("Travel perfume sets for men and women", "Preference-led samples", "A travel set can serve any wearer when the scents are familiar and the format suits the trip. Sharing one set only makes sense if the intended users genuinely want its actual contents.", [
    ["Separate shared and personal needs", "A jointly liked fragrance can simplify packing; differing preferences are a valid reason to choose separately."],
    ["Plan for shared travel spaces", "Transport and accommodation may require restrained fragrance or none, regardless of product marketing."],
    ["Check route details", "Review current transport requirements and product storage guidance for the actual containers."],
  ], "Ask each wearer to confirm the exact travel favorite independently before planning to share it.", "HUME sample comparisons can help identify a common preference before departure, without guaranteeing every wearer will like the same fragrance."),
  g("Customizable perfume kits for men and women", "Preference-led samples", "A selectable kit can let wearers choose different scent directions without following fixed gender categories. The useful customization is matching existing fragrances to actual interests.", [
    ["Collect individual preferences", "Ask for liked textures and exclusions before opening the builder. Avoid assigning samples solely by packaging or names."],
    ["Use the available choices", "Check what is currently eligible and the required selection count. Selection control is not unlimited formula design."],
    ["Review the final list", "Confirm that each planned comparison is represented before ordering."],
  ], "Map each selected fragrance to an actual wearer's interest rather than a men's-or-women's label.", "HUME's builder customizes the choice of existing available perfumes; it does not blend gender-specific formulas for each order."),
  g("Luxury fragrance samples for men and women", "Preference-led samples", "Luxury-labelled samples should be chosen by individual interest in the exact scent, not gender expectations or prestige alone. Confirm actual product identity before comparing the experience.", [
    ["Read beyond the reference", "Official samples, decants and inspired fragrances remain different offers even when they mention familiar luxury names."],
    ["Choose a relevant texture", "Anyone can explore flowers, woods, freshness or sweetness. Price does not establish which person will enjoy them."],
    ["Assess the complete wear", "Ask each wearer about later character and repeat interest rather than relying on a shared first-spray ranking."],
  ], "Remove price and gender wording from the preference discussion, then describe the actual scent texture each person wants.", "Explore HUME's own fragrances on their merits, without using luxury inspiration references to imply designer-original contents."),
  g("Perfume tester boxes for men and women", "Preference-led samples", "A tester box for men and women should offer relevant contents for the intended users rather than a presumed gender split. Presentation and individual scent preference are separate reasons to choose it.", [
    ["Inspect the actual assortment", "Check names, sizes and selection rules. Do not assume half the box will automatically suit each person."],
    ["Assess useful variety", "Different preferences may call for a selectable selection rather than a fixed assortment."],
    ["Keep presentation honest", "Use only included box and accessory details when evaluating gift appeal."],
  ], "Count the contents each intended wearer genuinely wants to try before judging the box's value.", "Use HUME's current discovery specification and selectable choices rather than assuming fixed male-and-female tester editions."),
  g("Perfume sampler gifts for men and women", "Preference-led samples", "A sampler gift should follow the individual recipient's wishes rather than gender-based gift rules. First confirm whether they want discovery, an exact favorite or no fragrance gift.", [
    ["Ask specific preference questions", "Two liked directions and one dislike are stronger clues than a demographic recommendation."],
    ["Choose the surprise carefully", "Selecting samples together can reduce uncertainty while preserving the celebration."],
    ["Review practical gift details", "Check availability, delivery and any explicitly included presentation. Do not promise automatic preference exchanges."],
  ], "Write the recipient's actual scent wishes before choosing a sampler gift for any wearer.", "Build HUME discovery choices with the recipient when useful, checking current preorder details for the intended gift date."),
  g("Perfume samples before buying a full bottle", "From samples to bottles", "Before buying a full bottle, use a sample to assess the exact fragrance's later character and whether you want another wear. A single impressive opening is incomplete evidence for a larger commitment.", [
    ["Match the exact product", "Save maker, name and version. A similar reference or different concentration can describe another offer."],
    ["Repeat the favorite", "Use suitable ordinary days and note the development without layering unfamiliar scents."],
    ["Choose useful quantity", "After confirming preference, compare available bottle sizes and complete cost. The largest bottle is optional."],
  ], "Buy more only after you can identify the exact sample and explain why you want its later scent again.", "Use HUME discovery names in your notes and return to the matching live product listing when a favorite earns a bottle purchase."),
  g("Fragrance sample packs before buying a full bottle", "From samples to bottles", "A sample pack can help narrow several candidates before buying one bottle. Its purpose is comparison, so choose relevant contrasts and avoid treating every pleasant sample as a future full-size purchase.", [
    ["Make a shortlist after the first round", "Record likes and dislikes, then focus repeat trials on the most promising few rather than reopening everything."],
    ["Keep identity records", "Names and versions can be easy to confuse across packs. Match each observation to the actual sample."],
    ["Choose one useful result", "A regular favorite can be enough. You can retain occasional variety in sample form."],
  ], "Reduce the pack to a repeat-trial shortlist before comparing any full-bottle sizes.", "Use HUME's selectable discovery pack for purposeful contrasts, then revisit the exact favorites rather than buying the whole assortment in bottles."),
  g("Perfume discovery sets before buying a full bottle", "From samples to bottles", "A discovery set can make a bottle decision better informed when the set contains fragrances you genuinely want to compare. It does not obligate a follow-up purchase or guarantee that a favorite will emerge.", [
    ["Define the bottle role", "Decide whether you want daily wear, an occasional mood or a different texture from what you own."],
    ["Compare beyond the opening", "Give candidates separate trials and repeat promising later characters."],
    ["Check the next purchase independently", "Review the bottle's exact identity, size, availability and price without assuming a discovery credit."],
  ], "Write the job a full bottle would serve before choosing the discovery set contents.", "Use HUME's kit to compare its own available perfumes, treating any later bottle as a separate optional order."),
  g("Mini perfume testers before buying a full bottle", "From samples to bottles", "A mini tester can help assess a scent before buying a bottle, but check that both refer to the exact same fragrance. Atomizer differences also mean sample spray counts may not transfer directly.", [
    ["Match identity and version", "Save maker, exact name and format. An inspired mini is not a sample of an original designer formula."],
    ["Record the applicator", "Spray and dab application can deliver different amounts. Use directions rather than assuming equal counts are equal doses."],
    ["Review the bottle choice", "Confirm the selected variant and current price after repeat enjoyment of the mini."],
  ], "Match the mini's identity to the intended bottle and treat application behavior as a separate check.", "Keep the exact HUME sample name and review the matching bottle listing before buying more of a favorite."),
  g("Perfume trial kits before buying a full bottle", "From samples to bottles", "A trial kit should help answer whether a bottle serves your needs, not create pressure to purchase one afterward. Plan the comparison and the optional follow-up as separate decisions.", [
    ["Set the trial question", "Choose a role or texture you want to evaluate. Relevant contents matter more than a large assortment."],
    ["Repeat before committing", "A favorite should remain enjoyable through its later stages on another suitable wear."],
    ["Read follow-up terms", "Do not assume the kit cost becomes bottle credit or that opened perfume can be returned for preference."],
  ], "Write the evidence you need from the trial before authorizing yourself to buy a larger quantity.", "Use HUME discovery as a planned comparison, with its published policies reviewed separately from any future bottle choice."),
  g("Travel perfume sets before buying a full bottle", "From samples to bottles", "A travel set can reveal whether a scent is enjoyable enough for a larger bottle, but it may primarily solve portability. Decide whether you are comparing fragrance or buying a known favorite in a convenient format.", [
    ["Separate the two purposes", "Travel usefulness does not necessarily mean you want the same scent in a large bottle at home."],
    ["Observe familiar and new settings", "Record what you enjoy without attributing every change to a different destination."],
    ["Choose quantity after the trip", "Use real preference and future use to select a bottle size rather than assuming travel enjoyment requires an upgrade."],
  ], "Write whether the travel format or the scent itself is the benefit you want to repeat.", "HUME discovery can support preference trials before a trip; small samples do not imply a dedicated travel line or required bottle purchase."),
  g("Customizable perfume kits before buying a full bottle", "From samples to bottles", "A selectable kit can make a bottle comparison more focused by removing irrelevant samples. Use the choice control to test a clear shortlist rather than assuming customization creates a personal formula.", [
    ["Build around a bottle brief", "Choose existing fragrances that could serve the same intended role, with enough contrast to make the comparison meaningful."],
    ["Keep the exact selection", "Save names and versions before trials so the preferred candidate can be matched accurately later."],
    ["Decide from repeat wear", "Confirm the favorite's later character before choosing quantity. Selection control alone does not guarantee fit."],
  ], "Assign each selected scent a specific reason it could earn the intended bottle role.", "HUME's builder selects existing available perfumes; use the completed list to guide exact sample-to-bottle matching."),
  g("Luxury fragrance samples before buying a full bottle", "From samples to bottles", "For a luxury-labelled bottle decision, a sample is useful only when its actual identity matches the product you intend to buy. An inspired sample cannot establish the exact wear of an original designer perfume.", [
    ["Verify the matching category", "Read maker, version and source description. Official samples, decants and inspired interpretations need accurate labels."],
    ["Assess personal value", "Record later enjoyment and the benefits you actually want rather than relying on prestige alone."],
    ["Choose a proportionate commitment", "A smaller confirmed quantity can be enough even when a larger premium bottle is affordable."],
  ], "Confirm the sample and intended bottle share the exact product identity before using the trial to justify the purchase.", "Use HUME samples to evaluate HUME bottles, not as a claim of identical experience with a referenced designer original."),
  g("Perfume tester boxes before buying a full bottle", "From samples to bottles", "A tester box can organize exploration before a bottle purchase when the contents are relevant and clearly identified. The presentation should not substitute for a readable trial plan.", [
    ["Inventory the samples", "Record exact names, count and individual sizes before comparing. Keep packaging benefits separate."],
    ["Narrow after discovery", "Move promising candidates into repeat trials rather than treating every vial as a bottle commitment."],
    ["Verify the selected bottle", "Check maker, version, size and current availability. Do not order a similar name from memory alone."],
  ], "Create a tester-box shortlist with exact product links before considering any larger purchase.", "Use HUME's discovery choices as named trial candidates and return to the matching live listings when a favorite emerges."),
  g("Perfume sampler gifts before buying a full bottle", "From samples to bottles", "A sampler gift can let the recipient explore before deciding whether they want a bottle. It should not create an obligation to choose one or imply an unlisted voucher or redemption service.", [
    ["Confirm exploration is welcome", "Someone requesting an exact favorite may prefer that bottle rather than another trial selection."],
    ["Leave the outcome with the recipient", "They may find a favorite, learn dislikes or simply enjoy the samples. Those are all valid results."],
    ["Keep future spending separate", "Check any explicitly included credits before promising a later bottle purchase or exchange."],
  ], "Give a sampler with a preference-led purpose rather than a requirement for the recipient to pick a full bottle.", "Choose HUME discovery as an agreed exploration gift, treating any future HUME bottle as an optional separate decision."),
];

BEGINNER_GUIDES_BATCH_FIFTEEN.find(guide => guide.title === "Compare prices of perfume discovery sets")!.chart = {
  headers: ["HUME discovery comparison", "Current listed basis"],
  rows: [
    ["Item price before additional charges", `₹${DISCOVERY_SET_PRICE}`],
    ["Samples and individual volume", `${DISCOVERY_SET_SAMPLE_COUNT} × ${DISCOVERY_SET_SAMPLE_SIZE_ML}ml`],
    ["Total perfume volume", `${DISCOVERY_SET_SAMPLE_COUNT * DISCOVERY_SET_SAMPLE_SIZE_ML}ml`],
    ["Item price per ml, rounded", `₹${(DISCOVERY_SET_PRICE / (DISCOVERY_SET_SAMPLE_COUNT * DISCOVERY_SET_SAMPLE_SIZE_ML)).toFixed(2)}`],
    ["Follow-up bottle", "Optional separate purchase; no unlisted credit assumed"],
  ],
};
