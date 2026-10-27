import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string, nextStep: BeginnerGuide["nextStep"] = "samples"): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep, productIds: [] };
}

export const BEGINNER_GUIDES_BATCH_FIVE: BeginnerGuide[] = [
  g("Is extrait de parfum good for beginners", "First formats",
    "Extrait de parfum can suit a beginner who enjoys the exact fragrance and understands its application. You do not need to work through lower concentration labels first, but a concentrated interpretation is not automatically a better first purchase.", [
      ["Choose the smell before the category", "Read the actual notes and decide why the scent appeals. An extrait may differ from a related EDP rather than simply intensify an identical composition."],
      ["Check the applicator", "A dabber and an atomizer have different directions. Make the first trial restrained and appropriate to the setting instead of copying a routine from another product."],
      ["Keep the commitment sensible", "Review price and available sizes. Sampling the exact interpretation can resolve uncertainty without requiring a large bottle or an assumed performance upgrade."],
    ], "Name the scent quality you want from the extrait and one question a first trial should answer.", "Use HUME's quiz to narrow your scent direction, then verify the formats actually offered rather than expecting an extrait version.", "quiz"),
  g("Is perfume oil good for beginners", "First formats",
    "A finished perfume oil can be a beginner option if its application style and scent suit you. Oil is a carrier description rather than proof of naturalness, mildness or better lasting power.", [
      ["Check that it is a personal perfume", "Read the intended use and product directions. A raw fragrance material, essential oil or home-scent oil is not interchangeable with a finished cosmetic perfume oil."],
      ["Try the mechanism", "A roller or dabber may appeal if you prefer contact application. There is no universal conversion between a drop, a swipe and a spray."],
      ["Compare enjoyment separately", "Choose the scent you like through the wear rather than buying solely for the carrier. An oil formulation does not guarantee a quieter experience."],
    ], "Write whether the scent or the contact application is your main reason to explore perfume oil.", "If comparing spray alternatives, use HUME's available discovery fragrances as separate products rather than assumed oil equivalents.", "samples"),
  g("Is attar good for beginners", "First formats",
    "Attar can be a beginner choice when you understand the specific product, its intended use and how to apply it. The name is used broadly, so investigate the actual offer rather than assuming every attar shares one formula.", [
      ["Ask what the product is", "Check the maker's carrier and ingredient claims separately from its traditional name. Attar alone does not verify natural extraction, concentration or alcohol absence."],
      ["Use a simple first comparison", "Try one unfamiliar fragrance at a time. Record the exact name and later impression rather than layering several new attars while learning your preference."],
      ["Review purchase size", "A small bottle can still be a significant commitment if the scent is unfamiliar. Compare actual contents and total cost before deciding it is a suitable introduction."],
    ], "Save the exact attar description and application directions before planning your first trial.", "Explore HUME's current catalogue if considering a spray-based introduction; its discovery set is a different format from an attar assortment.", "shop"),
  g("Is body mist good for beginners", "First formats",
    "Body mist can suit a beginner who enjoys its scent and intended application. A lighter marketing position does not make every mist interchangeable or guarantee low presence, frequent-use suitability or a fixed wear time.", [
      ["Read the intended area", "A body mist and a hair mist may use different directions. Choose the actual product for the use you need rather than transferring instructions between similar names."],
      ["Choose a manageable routine", "Try the product as directed in a setting where fragrance is welcome. Do not assume the format needs repeated refreshing simply because it is called a mist."],
      ["Compare the complete purchase", "A larger container is not enough to establish value. Consider your enjoyment, application habits and delivered total alongside the volume."],
    ], "Write whether you want a mist's application style or just a particular scent before comparing products.", "Use HUME's quiz for preference discovery if exploring a perfume alternative, then check the live catalogue for actual formats.", "quiz"),
  g("Is solid perfume good for beginners", "First formats",
    "Solid perfume can be a useful beginner option when you prefer a balm-style application and enjoy the fragrance. Its compact case is a convenience feature rather than a guarantee of mildness, concentration or duration.", [
      ["Check the handling method", "Read how the maker wants the solid applied and where it is intended to be used. Do not treat a fragranced balm as a multipurpose cosmetic by default."],
      ["Consider storage and carrying", "A small case may be convenient, but follow temperature guidance and keep it closed. A refillable-looking package still needs a compatible maker-specified refill."],
      ["Choose scent before the case", "An attractive container can influence a first purchase. Ask whether you would still choose the fragrance in plain packaging and sample where possible."],
    ], "Compare application comfort, scent enjoyment and case practicality as three separate reasons to buy.", "HUME's discovery sprays offer another way to explore scent preferences; they are not solid-perfume versions of the catalogue.", "samples"),
  g("Is roll on perfume good for beginners", "First formats",
    "Roll-on perfume can suit a beginner who prefers a contact applicator. The mechanism does not define the carrier, concentration or smell, so read those details independently before choosing the product.", [
      ["Separate roller and formula", "Some shoppers associate rollers with oils, but the container alone does not establish what is inside. Check the actual product information."],
      ["Use its own directions", "Apply only as specified for that finished cosmetic. Do not convert a spray routine into a swipe count or assume every roller dispenses the same amount."],
      ["Evaluate the full wear", "Application convenience is useful, but the later scent still matters. Try the fragrance on its own before deciding the format makes it your preferred first perfume."],
    ], "Record one reason you like the roller mechanism and a separate reason you like the fragrance.", "Compare HUME's currently listed applicators if exploring other formats rather than expecting a roll-on counterpart for each fragrance.", "shop"),
  g("Is cologne good for beginners", "First formats",
    "Cologne can suit beginners, but first clarify whether the product means eau de cologne or uses the word broadly for fragrance. Neither usage makes it a compulsory first format or a men's-only choice.", [
      ["Read the complete label", "The full product name and description provide more information than the casual word cologne. Concentration conventions and naming can differ between makers."],
      ["Check the applicator", "A splash and an atomized product call for different handling. Follow the actual instructions instead of expecting all colognes to use one application method."],
      ["Judge your own preference", "A citrus description or lighter-style label does not guarantee that you will like the whole wear. Compare the opening and later character before choosing a bottle."],
    ], "Identify what cologne means on the exact listing, then write why that particular scent interests you.", "Use HUME's catalogue and preference quiz to find a direction without interpreting cologne as a separate required starter range.", "quiz"),
  g("Is alcohol free perfume good for beginners", "First formats",
    "Alcohol-free perfume can suit a beginner when the specific formulation and intended use meet their needs. The claim alone does not establish natural ingredients, personal suitability or an easier fragrance experience.", [
      ["Clarify the ingredient requirement", "If absence of a particular alcohol matters, ask for product-specific information. A roller, oil-like texture or balm package is not proof of the claim."],
      ["Read the application format", "Alcohol-free products can have different presentations and directions. Choose the actual format you want rather than assuming all such products follow an oil routine."],
      ["Keep preference independent", "You still need to enjoy the fragrance and its later character. A carrier requirement and a scent preference are different parts of the decision."],
    ], "List the exact formulation requirement and the scent experience you want as separate questions.", "Ask HUME about the specific item's formulation where needed; use its descriptions and samples for the separate scent choice.", "shop"),
  g("Eau de parfum for everyday wear", "Everyday formats",
    "Eau de parfum can work for everyday wear when the exact scent and its presence fit your routine. The label does not require evening use, a large application or a universal number of sprays.", [
      ["Use a normal-day brief", "Consider commuting, shared rooms and the occasions you repeat most. A fragrance you enjoy at home may need a separate comfort check in a permitted workplace."],
      ["Test a restrained application", "Follow the maker's directions and record how the scent feels later. Do not assume every EDP has the same projection or develops in the same way."],
      ["Choose for repeat enjoyment", "The candidate you want to wear again can be a stronger everyday choice than a more dramatic first impression. Keep presence and enjoyment separate in your notes."],
    ], "After an ordinary day, write whether you would choose the exact fragrance again tomorrow and why.", "Use HUME discovery choices to compare everyday scent directions, checking the actual product format rather than assuming an EDP label.", "samples"),
  g("Eau de toilette for everyday wear", "Everyday formats",
    "Eau de toilette can be an everyday option, but the actual composition matters more than its label. EDT is not automatically quiet, short-lived or a version you must reapply frequently.", [
      ["Match your routine", "Choose for the setting you use most and follow any fragrance rules. A daytime marketing description does not establish suitability for every shared room."],
      ["Notice the later character", "An EDT may differ from an EDP with a related name. Evaluate the exact product instead of imagining only a diluted version of another scent."],
      ["Keep refreshing deliberate", "Assess comfort and your intended occasion before adding more as directed. Reduced self-awareness does not establish that the fragrance has disappeared to everyone else."],
    ], "Compare the exact EDT's initial and later character during one ordinary permitted wearing occasion.", "Read HUME's current format details and compare available samples as whole fragrances, not a presumed dedicated EDT line.", "shop"),
  g("Extrait de parfum for everyday wear", "Everyday formats",
    "Extrait de parfum can be worn regularly if the specific fragrance and application suit your everyday setting. A concentrated-style label neither restricts it to special occasions nor guarantees appropriate presence for every workplace.", [
      ["Start with the actual interpretation", "An extrait may change the balance of notes from another version. Read the exact description and test that fragrance rather than assuming an identical scent turned up."],
      ["Use a manageable application", "Follow the product's applicator instructions and make a restrained first trial. Concentration and how far a scent is noticed are different questions."],
      ["Consider the practical commitment", "Price, size and frequency of wear matter alongside preference. A higher category label does not justify a bottle you will rarely choose."],
    ], "Write one ordinary occasion where the extrait works and any setting where you would choose another option.", "Use HUME's verified catalogue formats for purchase decisions; a shared inspiration name does not establish an extrait variant.", "shop"),
  g("Perfume oil for everyday wear", "Everyday formats",
    "Perfume oil can fit an everyday routine if you enjoy the fragrance and its intended contact application. Judge the finished product rather than assuming the carrier ensures quietness or longer wear than a spray.", [
      ["Check your application preference", "A roller or dabber may appeal for particular routines. Read the cosmetic's directions and intended areas instead of treating every oil as the same product."],
      ["Compare through ordinary use", "Record the opening, later scent and comfort during your typical day. Avoid layering unfamiliar products while deciding what the oil itself contributes."],
      ["Keep handling practical", "Secure the closure and follow storage guidance if carrying it. A small container does not mean it can be left in any temperature or loose in a bag."],
    ], "Record how the applicator and later scent each fit your usual day before deciding on daily use.", "If considering a spray alternative, compare HUME samples as separate fragrances instead of assumed oil-to-spray equivalents.", "samples"),
  g("Attar for everyday wear", "Everyday formats",
    "An attar can be an everyday choice when the exact product suits your preference and allowed wearing setting. The name alone does not specify carrier, strength or how many hours you should expect.", [
      ["Identify the product properly", "Read the maker's description and supplied directions. Do not infer natural origin or alcohol absence from the attar name before checking the actual claim."],
      ["Choose for common occasions", "A favorite for occasional evenings may not be your preferred daytime scent. Give the attar a separate trial during an appropriate normal routine."],
      ["Keep the record exact", "Save the name and applicator information, especially if several small bottles look similar. A later repurchase should match the product you enjoyed."],
    ], "Write the exact attar name beside the ordinary use it serves and the quality you enjoy later in the wear.", "Browse HUME's available spray choices if comparing daily alternatives, without assuming matching attar versions are offered.", "shop"),
  g("Body mist for everyday wear", "Everyday formats",
    "Body mist can fit everyday wear if its intended application and scent suit your routine. A mist label is not permission to apply without considering shared spaces or a requirement to refresh on a schedule.", [
      ["Read the intended use", "Check whether the product is for the body, hair or another specific use. Similar names do not make those formulations or directions interchangeable."],
      ["Assess actual presence", "A lighter-positioned product can still be noticeable. Judge the specific mist in a setting where fragrance is welcome instead of choosing only from the format name."],
      ["Compare value through habits", "Consider the complete cost and how you actually use it. A large container does not independently show which format provides the experience you prefer."],
    ], "Evaluate one label-directed use during a normal day before deciding whether you need any refresh routine.", "Use HUME's quiz for everyday scent preferences if exploring a perfume option, then verify the formats shown in its live shop.", "quiz"),
  g("Solid perfume for everyday wear", "Everyday formats",
    "Solid perfume can be a practical everyday format for someone who prefers a balm-style application. Choose the finished scent and handling routine, not just the compact case or an assumption of low projection.", [
      ["Check application comfort", "Read the maker's method and intended areas. A fragranced balm is not automatically a lip product, hair treatment or general-purpose skin product."],
      ["Plan where it stays", "Follow storage directions at home and while carrying. Avoid assuming a small case makes the product unaffected by heat or suitable for permanent storage in a car."],
      ["Choose your preferred whole wear", "Record the later scent alongside convenience. If you want a refill, confirm the exact case and compatible product instead of assuming every solid supports one."],
    ], "Compare how often you use the solid for its scent versus how much you simply enjoy the case's convenience.", "HUME's discovery sprays offer a separate everyday exploration experience; they are not presented as a solid-format range.", "shop"),
  g("Roll on perfume for everyday wear", "Everyday formats",
    "A roll-on can suit everyday wear when you prefer the contact applicator and enjoy the actual fragrance. The roller does not establish oil content, alcohol absence or a fixed level of presence.", [
      ["Separate formula and container", "Read the carrier claims and directions on the specific product. Two similar roller bottles can contain different formulations and scent structures."],
      ["Keep application intentional", "Use the mechanism as directed and follow handling instructions. There is no reliable generic swipe count or swipe-to-spray conversion for comparing products."],
      ["Review the later impression", "Notice whether you want to wear the fragrance repeatedly, not only whether the applicator is convenient. Those are independent reasons to choose it."],
    ], "Record your preference for the applicator and the fragrance separately after several suitable ordinary uses.", "Check HUME's current applicators and sample offer if comparing daily formats rather than expecting roller versions of each perfume.", "shop"),
  g("Cologne for everyday wear", "Everyday formats",
    "Cologne can work for everyday use, but identify the exact product first. The word may describe eau de cologne, a product name or fragrance in casual language, so it does not establish one daily routine.", [
      ["Read the full label", "Check the specific concentration-style wording and applicator. A splash and an atomized fragrance require their own directions even if both are called cologne."],
      ["Choose a complete scent", "A bright opening can change during the wear. Judge the later character before deciding that a fresh first impression is your everyday favorite."],
      ["Respect the setting", "Follow fragrance restrictions and evaluate actual presence. Cologne is not a guarantee that a product will feel subtle or suit every office."],
    ], "Write what cologne means on your chosen listing and the everyday occasion you expect it to serve.", "Use HUME's current descriptions to explore everyday fragrance directions without interpreting cologne as a separate assumed collection.", "quiz"),
  g("Alcohol free perfume for everyday wear", "Everyday formats",
    "Alcohol-free perfume can suit daily use when the exact formulation meets your requirements and you enjoy the scent. The carrier claim does not independently establish personal suitability, ingredient origin or how the perfume wears.", [
      ["Clarify the requirement first", "If you need absence of a particular alcohol, check product-specific information. A roller or balm alone does not verify that requirement."],
      ["Choose the right applicator", "Read the intended application and handling instructions. Alcohol-free products can have different presentations, so do not assign all of them an oil routine."],
      ["Test for everyday enjoyment", "Evaluate later character and presence during your own permitted routine. Keep the formulation requirement separate from whether you actually enjoy wearing the perfume."],
    ], "Record the confirmed formulation claim and your everyday scent preference in separate parts of the shortlist.", "Ask HUME about a specific product's formulation when needed, then use its notes and samples for the independent preference decision.", "shop"),
  g("Eau de parfum for hot weather", "Hot-weather choices",
    "Eau de parfum is not automatically unsuitable for hot weather. Choose the exact scent and an appropriate application for your surroundings, and test comfort through the transition from outdoor heat to indoor spaces.", [
      ["Use your actual day", "A hot commute, shaded outing and air-conditioned desk are different settings. Choose the routine you need rather than relying only on a summer label."],
      ["Judge balance and presence", "Freshness, sweetness and projection are separate observations. A fresh-sounding EDP can still be noticeable, so evaluate the complete wear with restrained label-directed application."],
      ["Protect the bottle while carrying", "Do not leave perfume in direct sun or a parked vehicle. Follow the actual storage directions rather than using the weather as a reason to treat a bottle like a permanent bag accessory."],
    ], "Compare a candidate's comfort outdoors and later indoors during a normal warm-weather day.", "Use HUME samples to compare scent directions in your routine, checking the exact product format instead of promising an EDP summer-performance result.", "samples"),
  g("Eau de toilette for hot weather", "Hot-weather choices",
    "An eau de toilette can be a hot-weather option if you like the exact fragrance, but EDT does not guarantee freshness, low projection or frequent-refresh suitability. Evaluate the scent in the conditions you actually encounter.", [
      ["Read the composition", "A citrus or marine direction may interest you, but the full structure matters. Do not assume every EDT is a lighter version of the same EDP recipe."],
      ["Avoid automatic extra application", "Follow the product's directions and check presence before adding more. Heat is not a universal instruction to increase the amount or reapply on a timer."],
      ["Keep storage separate", "Choose a suitable place for the bottle away from heat and direct light. A fragrance used in summer still needs careful storage between wears."],
    ], "Record your warm-weather trial before changing application simply because the product is called EDT.", "Explore HUME's live fresh-note descriptions and sample choices without assuming they form a dedicated EDT range.", "samples"),
  g("Extrait de parfum for hot weather", "Hot-weather choices",
    "Extrait de parfum is not categorically banned from hot-weather wear, but the exact composition and your setting matter. A concentration-style label cannot establish how comfortable or noticeable the product will feel in heat.", [
      ["Consider the whole interpretation", "Read the note balance rather than judging only the extrait label. Warm, woody and fresh impressions are independent of a simple concentration ranking."],
      ["Make the first trial restrained", "Follow the applicator's directions and test where fragrance is appropriate. Compare your outdoor and indoor comfort rather than seeking maximum projection."],
      ["Avoid improvised temperature fixes", "Follow the maker's storage directions instead of heating, freezing or otherwise altering the product to change its performance. Keep wear testing separate from product handling."],
    ], "Write the setting, application and later comfort before deciding if the exact extrait fits your summer routine.", "Verify HUME's actual product formats if exploring alternatives; an inspiration name does not establish a hot-weather extrait version.", "shop"),
  g("Perfume oil for hot weather", "Hot-weather choices",
    "Perfume oil can be evaluated for warm weather, but an oil carrier alone does not make it cooling, sun-protective or automatically suitable for your intended use. Follow the finished product's directions and choose by actual comfort.", [
      ["Check the intended application", "Use a labelled personal perfume oil rather than a raw or home-scent material. Read the specific areas and conditions of use stated by the maker."],
      ["Test texture and scent separately", "Application feel and fragrance preference are different observations. A smooth carrier does not prove the smell will remain quiet in a warm shared space."],
      ["Plan storage while out", "Secure the closure and follow storage guidance. Avoid leaving the product in direct sun or a hot vehicle while treating it as a convenient portable format."],
    ], "Record application feel, scent enjoyment and presence as separate parts of your warm-weather test.", "Use HUME spray samples as separate warm-weather comparisons if useful, without inferring an oil variant or a protective property.", "samples"),
  g("Attar for hot weather", "Hot-weather choices",
    "An attar's hot-weather suitability depends on the actual product and your preferences, not the name alone. Check its formulation claims and directions before choosing how and where to wear it.", [
      ["Read the specific attar", "Different products using the term can have different carriers and compositions. Do not infer a cooling, natural or alcohol-free property without actual product information."],
      ["Compare in an ordinary setting", "Try the candidate separately during appropriate use and note the later character. A familiar traditional name does not guarantee the same experience as another attar."],
      ["Handle the small bottle carefully", "Keep the applicator and closure secure and follow the maker's temperature guidance. Portability does not make a sample bottle suitable for a hot car."],
    ], "Save the exact attar information and record how its later scent fits your normal warm-weather occasion.", "Explore HUME's current sample options if comparing spray directions, rather than expecting matching attars with summer claims.", "shop"),
  g("Body mist for hot weather", "Hot-weather choices",
    "Body mist can be a warm-weather preference, but it is a fragrancing product rather than a substitute for sun protection, cooling or hygiene products. Use the exact product as directed and evaluate its actual presence.", [
      ["Check the intended use", "Body mist and hair mist directions may differ. Do not use a format on another area merely because both products are described as refreshing."],
      ["Choose comfortable presence", "A light-positioned mist can still be noticeable in enclosed spaces after time outdoors. Consider both parts of the routine rather than planning repeated application automatically."],
      ["Protect the product", "Follow label storage guidance and keep it away from direct heat. Do not assume a summer-marketed product can be stored indefinitely in a vehicle or sunlit bag."],
    ], "Evaluate a label-directed use through an outdoor-to-indoor transition before deciding on a refresh habit.", "Use HUME's quiz to explore fresh fragrance preferences if considering a perfume alternative, then verify the formats actually listed.", "quiz"),
  g("Solid perfume for hot weather", "Hot-weather choices",
    "For solid perfume in hot weather, consider the balm's handling and storage as well as the smell. A compact case is convenient, but the solid format does not mean the product is unaffected by heat.", [
      ["Follow the maker's temperature guidance", "Keep the product away from direct heat and store it as instructed. Do not rely on its travel-friendly appearance as evidence that it can remain in a parked car."],
      ["Choose the intended application", "Read the supplied method and areas of use. A scented balm is not automatically a moisturizer or a product for every exposed area."],
      ["Review wear and condition separately", "Judge scent comfort during appropriate use and check the product's physical condition against maker guidance. If handling questions arise, seek product-specific advice rather than improvising fixes."],
    ], "Choose a storage location and a permitted application routine before carrying a solid in warm weather.", "HUME's discovery sprays are a separate format for comparing scents, not an unlisted heat-resistant solid alternative.", "shop"),
  g("Roll on perfume for hot weather", "Hot-weather choices",
    "A roll-on's hot-weather behavior depends on its actual formula, not the roller alone. Separate the convenience of contact application from carrier claims and the scent presence you want in warm conditions.", [
      ["Verify the formula claims", "A roller is not proof of oil content or alcohol absence. Read the finished product information if those details matter for your planned use."],
      ["Test a normal routine", "Follow application directions and observe comfort outdoors and later indoors. Do not turn a swipe count into a spray equivalent when comparing another fragrance."],
      ["Carry it securely", "Keep the cap closed and follow handling and storage instructions. A pocket-sized container is not automatically protected from heat or leakage."],
    ], "Write formula information, application comfort and later presence separately in a warm-weather trial.", "Check HUME's live applicator descriptions when comparing options; no summer-specific roll-on version is implied.", "shop"),
  g("Cologne for hot weather", "Hot-weather choices",
    "Cologne can be a warm-weather option, especially when you enjoy its actual scent, but the word alone does not guarantee a citrus composition or a light presence. Identify the product and evaluate the full wear.", [
      ["Clarify the naming", "Eau de cologne, a Cologne product name and casual fragrance language do not necessarily describe identical formats. Read the full label before setting expectations."],
      ["Notice what follows freshness", "A bright opening can lead to a different later character. Check comfort during both outdoor and indoor parts of your day rather than choosing only the first impression."],
      ["Separate use and storage", "A fragrance you enjoy in heat still needs appropriate storage. Keep it closed and away from direct heat or light according to its directions."],
    ], "Describe the later scent you want after a fresh opening and compare it with an actual warm-weather trial.", "Explore HUME's current citrus and marine descriptions as scent options without assuming a separate eau-de-cologne collection.", "samples"),
  g("Alcohol free perfume for hot weather", "Hot-weather choices",
    "Alcohol-free perfume is not automatically better for hot weather or a sun-protection product. Check the exact formulation claim, intended application and your comfort with the finished scent rather than using the carrier claim as a shortcut.", [
      ["Clarify the product requirement", "If absence of a particular alcohol matters, ask for maker information. Different alcohol-free products can use different carriers and applicators."],
      ["Follow the actual directions", "Use only in the way the product specifies. A carrier claim does not independently establish suitability for every application area or warm-weather activity."],
      ["Choose storage deliberately", "Keep the product as instructed rather than assuming alcohol absence removes storage needs. A small oil or balm still requires appropriate handling."],
    ], "Separate your formulation requirement, application instructions and warm-weather scent preference before comparing candidates.", "Ask HUME about a specific item's formulation when needed; its discovery set is not certified alcohol-free or sun-protective by this guide.", "shop"),
  g("Eau de parfum sample size options", "Sample formats",
    "EDP sample options depend on the exact brand and product: look for maker-supplied samples, listed travel formats or clearly identified third-party decants. There is no universal EDP sample size, and the version matters as much as the quantity.", [
      ["Confirm the exact interpretation", "An EDP sample should match the version you want to evaluate. A related EDT or extrait may have a different note balance rather than simply a different concentration."],
      ["Read quantity and applicator", "Check stated millilitres and whether it is an atomizer or another presentation. A small picture does not identify the amount or how it is applied."],
      ["Compare the actual offer", "Review whether samples are individual or part of a kit and check the final total. An average bundle cost is not a separate sample purchase price."],
    ], "Save exact version, quantity, applicator and seller identity before choosing between sample listings.", "HUME's discovery offer states its own sample size and kit contents; verify product format separately rather than assuming it is an EDP-version sampler.", "samples"),
  g("Eau de toilette sample size options", "Sample formats",
    "EDT samples are offered in whatever sizes and presentations a maker or seller actually lists. Compare the exact eau de toilette version, quantity and applicator instead of assuming a standard size or substituting a related EDP.", [
      ["Match the name precisely", "Write the full fragrance and EDT version before shopping. Similar packaging or a shared name does not establish an identical scent across versions."],
      ["Understand the source", "An official sample, travel product and third-party decant have different identities. Check the listing rather than treating every small container as maker-supplied."],
      ["Choose a useful amount", "The appropriate purchase depends on the comparison you want to make and the actual formats available. Do not invent a spray count from the stated millilitres."],
    ], "Write which exact EDT question you want the sample to answer before comparing quantity and cost.", "Use HUME's current discovery contents for its own fragrances without assuming a dedicated EDT sample option for each inspiration.", "samples"),
  g("Extrait de parfum sample size options", "Sample formats",
    "For extrait samples, confirm the exact interpretation before comparing size. Brands and sellers choose their own sample or travel formats, and a similarly named EDP sample does not necessarily represent the extrait's composition.", [
      ["Check version identity first", "An extrait may use a different balance of notes. Save the exact product name and source so your trial matches the item you may later buy."],
      ["Identify dabber or spray", "Application mechanisms affect how you use the sample. Follow the specific directions rather than converting one format into an imagined equal dose of another."],
      ["Review the complete cost", "A small volume can still be a meaningful purchase. Compare the listed quantity, packaging and final price instead of assuming the concentration label justifies any cost."],
    ], "Record the exact extrait version and its supplied application method before deciding on the sample purchase.", "Review HUME's actual format descriptions if exploring alternatives; the discovery kit does not promise extrait versions of its inspiration references.", "shop"),
  g("Perfume oil sample size options", "Sample formats",
    "Perfume-oil sample options depend on the finished product and dispenser. Check whether a listing is a personal cosmetic perfume, its stated quantity and whether it uses a roller or dabber before comparing small bottles.", [
      ["Avoid a product-category mix-up", "A raw fragrance oil, home-scent oil or essential oil is not interchangeable with a finished perfume oil. The sample label should still make the intended use clear."],
      ["Read the unit and mechanism", "Compare the actual millilitres or other stated measure alongside the supplied applicator. Container shape alone is not a reliable quantity guide."],
      ["Choose for the planned test", "A little-known oil formula should be evaluated as its own product. An equal-volume spray sample does not guarantee an equivalent application or wear experience."],
    ], "Note intended use, stated quantity and application mechanism before comparing the prices of oil samples.", "HUME's discovery samples are a separate fragrance format; do not treat them as perfume-oil samples without matching product information.", "shop"),
  g("Attar sample size options", "Sample formats",
    "Attar sample sizes are seller- and product-specific. Check the actual quantity, carrier claims and application method instead of assuming a traditional name describes one standard sample format.", [
      ["Clarify the attar listing", "Read who makes the product and what is claimed about its composition. A small vial does not verify natural extraction, concentration or alcohol absence."],
      ["Confirm the sale unit", "Check whether the price is for one sample or an assortment and read the stated volume. Do not infer quantity from a photograph of several similar bottles."],
      ["Keep the test identifiable", "Save the exact name with your wear notes. Clear identification matters when small samples look alike and you may later want a larger amount."],
    ], "Record maker, product name, quantity and kit-versus-individual pricing before selecting an attar trial.", "Use HUME's listed discovery offer for its own fragrances if comparing spray directions, rather than expecting an attar sample assortment.", "shop"),
  g("Body mist sample size options", "Sample formats",
    "Body-mist trial options may include maker-listed small or travel products, but availability varies. Check the exact mist and intended use rather than assuming a perfume sample with a related name represents the same formulation.", [
      ["Check the type of mist", "Body, hair and other mists can use different directions. A miniature should still identify the finished product and its intended application."],
      ["Read the actual amount", "Check the stated contents and whether the item is supplied filled. A travel-size description alone does not establish a standard quantity."],
      ["Choose the relevant comparison", "If you want to try the scent in that specific mist format, a related perfume may answer a different question. Compare exact products rather than only fragrance names."],
    ], "Write whether you are testing a scent direction or the exact mist format before choosing a small-size listing.", "HUME's discovery kit helps explore its listed perfume compositions and is not presented as a body-mist trial range.", "samples"),
  g("Solid perfume sample size options", "Sample formats",
    "Solid perfume samples and small cases depend on the maker's actual offers and may be listed by weight rather than liquid volume. Compare the unit, contents and case requirements instead of translating grams into an assumed spray equivalent.", [
      ["Read grams and contents clearly", "A solid's stated weight is different from millilitres of liquid. Check whether the listing includes the scented product, a case or a refill only."],
      ["Confirm refill compatibility", "A refill may require a specific matching case and may not be a complete trial product on its own. Follow the maker's product and assembly information."],
      ["Check the experience you want", "A spray sample of a related name may not reproduce the solid formulation or handling. Choose the actual format if that application experience is the question."],
    ], "Record weight, included case and any compatibility requirement before comparing small solid-perfume offers.", "HUME's spray testers provide a different scent exploration route; their liquid volume is not a size comparison for an unlisted solid.", "shop"),
  g("Roll on perfume sample size options", "Sample formats",
    "For roll-on perfume samples, compare stated quantity and formulation separately from the roller mechanism. Similar small containers can contain different carriers and fragrances, and there is no standard number of swipes per sample.", [
      ["Verify what is inside", "A roller does not automatically establish oil content or alcohol absence. Check the actual product claims alongside the sample's intended use."],
      ["Compare the supplied applicator", "A roller trial and an atomized decant may answer different handling questions. Do not assume an equal volume means the same amount is applied each time."],
      ["Review the complete offer", "Check whether the sample is individual, part of a bundle or an empty container. Save the exact fragrance name for any later purchase."],
    ], "List formulation information, sample quantity and supplied roller as separate facts before ordering.", "Use HUME's current applicator descriptions to verify its offer rather than assuming the discovery kit contains roll-on testers.", "shop"),
  g("Cologne sample size options", "Sample formats",
    "Cologne sample options depend on what the exact product means by cologne and which formats are offered. Confirm the full fragrance name, quantity and application mechanism instead of assuming every small cologne is a splash.", [
      ["Read the full label", "Eau de cologne and a fragrance using Cologne in its name may not represent the same style. Match the specific version you want to evaluate."],
      ["Check sample identity", "A maker's trial, filled travel spray and third-party decant are different offers. Source information matters alongside the amount of liquid."],
      ["Choose a useful trial", "Decide whether the question is the opening, later scent or convenience of the exact format. Then compare actual available sizes rather than an assumed universal sample standard."],
    ], "Write the full product name and splash-versus-spray presentation before comparing small cologne listings.", "HUME's discovery set contains its own stated fragrances and sample format rather than a separate assumed eau-de-cologne assortment.", "samples"),
  g("Alcohol free perfume sample size options", "Sample formats",
    "Alcohol-free perfume samples need two separate checks: the exact formulation claim and the actual quantity or applicator supplied. A small oil-like bottle or roller is not proof that a sample meets your alcohol requirement.", [
      ["Verify the specific requirement", "Ask the maker about the exact item if absence of a particular alcohol matters. A seller's broad category description may not answer that question completely."],
      ["Read the presentation", "Sprays, balms and contact applicators can have different units and use instructions. Compare like-for-like where possible and do not invent a gram-to-spray conversion."],
      ["Keep records of the product", "Save the formulation information and exact name with your trial notes. A later similarly named purchase should not be assumed to use the same carrier."],
    ], "Confirm the exact alcohol claim before comparing sample amount, price or application convenience.", "Ask HUME about the specific item's formulation when necessary; its discovery kit is not labelled alcohol-free by this sample-size guide.", "shop"),
  g("How to store eau de parfum", "Storage guides",
    "Store eau de parfum in its properly closed bottle, away from heat and direct light, following the maker's instructions. A stable storage location is more useful than choosing a display shelf simply because the bottle looks attractive there.", [
      ["Choose a suitable home location", "Prefer a place protected from sunlight and heat sources. Keep the original packaging if it helps protect the bottle from a bright environment."],
      ["Keep the closure secure", "Close the product as designed and avoid unnecessary transfers. An atomizer assembly should not be forced open just to inspect the contents."],
      ["Separate storage from wear claims", "Proper storage does not create a guaranteed number of years or hours of wear. Use the maker's expiry and handling information for product-specific questions."],
    ], "Check whether your current EDP location is exposed to sun or heat and move it to a suitable stable place if needed.", "Store HUME's bottles and discovery samples using their product-specific guidance and keep the sample names identifiable between trials.", "shop"),
  g("How to store eau de toilette", "Storage guides",
    "Store eau de toilette closed and protected from heat, direct light and unsuitable temperature changes, as the maker directs. An EDT label does not mean it can be kept in a car or sunny bathroom window.", [
      ["Review the everyday location", "Choose a stable place rather than a surface repeatedly exposed to sunlight or heat. Convenience should not override the product's actual storage information."],
      ["Keep the original identity", "Retain the exact version name and packaging information. This helps distinguish an EDT from a related EDP and preserves useful product details."],
      ["Handle travel separately", "Carry only what you need and return the main bottle to appropriate storage. A travel routine is not a reason to leave the whole collection in a hot bag indefinitely."],
    ], "Check the location and exact version label of an EDT bottle before adding it to a daily carry routine.", "Keep HUME sample labels with the testers so storage and later favorites remain linked to the correct product.", "samples"),
  g("How to store extrait de parfum", "Storage guides",
    "Store extrait de parfum according to its maker's guidance, with the closure secure and the product protected from heat and direct light. A concentrated-style label does not remove ordinary storage needs or justify improvised temperature treatments.", [
      ["Respect the presentation", "An atomizer, stopper and dab-style bottle close differently. Keep the original assembly intact and follow the supplied handling method."],
      ["Keep transfers deliberate", "Avoid moving the perfume into an unsuitable container merely to make it easier to display or carry. If using a travel system, check compatibility and instructions."],
      ["Use actual shelf-life information", "Do not derive an expiry date from the word extrait or a generic concentration chart. Keep the product's own information available for specific questions."],
    ], "Save the exact extrait's storage instructions and check that its closure is being used as designed.", "Check HUME's actual format listings before applying advice about an extrait presentation to another type of bottle.", "shop"),
  g("How to store perfume oil", "Storage guides",
    "Store a finished perfume oil in its intended closed container and follow its label's conditions for light, temperature and shelf life. Oil-based does not mean maintenance-free, and a raw material may have different instructions from a cosmetic perfume.", [
      ["Identify the finished product", "Keep the label showing intended use and formulation details. Do not mix storage assumptions for essential oils, home fragrances and personal perfume oils."],
      ["Protect the closure and applicator", "Secure the roller, dabber or dropper as designed. Follow handling directions and avoid unnecessary contact with the dispensing parts."],
      ["Retain product-specific dates", "Use the maker's expiry or period-after-opening guidance where supplied. A generic oil category is not enough to establish how long a particular product remains usable."],
    ], "Record the exact oil's intended use, opening information and supplied storage directions in one place.", "If comparing with HUME spray samples, keep them separately identified instead of assuming oil-storage rules describe the whole HUME range.", "shop"),
  g("How to store attar", "Storage guides",
    "Store attar according to the exact maker's guidance with its container securely closed. The traditional name does not establish one carrier or shelf life, so retain the product information rather than applying one rule to every small attar bottle.", [
      ["Keep the bottle identifiable", "Save the maker, product name and any formulation information. Small bottles can look similar, making the label important for both storage and later comparisons."],
      ["Protect it from unsuitable exposure", "Follow the label's temperature and light guidance. Do not assume a dark bottle alone makes direct sun or a hot vehicle an appropriate location."],
      ["Use its supplied closure", "Dabbers and other applicators should remain assembled and closed as directed. Avoid transferring the liquid to an unlabelled decorative container."],
    ], "Check that every attar in your collection retains its name and maker's storage information.", "HUME's spray catalogue does not establish an attar-storage specification; consult the maker of the exact product you own.", "shop"),
  g("How to store body mist", "Storage guides",
    "Store body mist closed and according to its product label, away from unsuitable heat and direct light. Read the packaging type and directions rather than assuming a large mist bottle can be left wherever it is most convenient to refresh.", [
      ["Identify the package", "A pump and a pressurized container can have different handling requirements. Use the actual label rather than treating all scented sprays as identical packaging."],
      ["Choose a stable place", "Keep it away from heat sources and bright windows as directed. A summer scent description is not a storage qualification."],
      ["Keep related formats separate", "Body and hair products may have different uses and formulations. Retain the original label so a similar bottle is not mistaken for another cosmetic."],
    ], "Read the package's specific storage instructions before deciding where a daily-use mist should stay.", "Use HUME's own product information for its listed formats rather than assuming a body-mist package or storage requirement.", "shop"),
  g("How to store solid perfume", "Storage guides",
    "Store solid perfume in its securely closed case under the conditions specified by its maker. A balm or wax-like presentation needs attention to temperature and handling; compact packaging does not make it unaffected by heat.", [
      ["Avoid unsuitable heat exposure", "Choose an appropriate storage place instead of leaving the case in direct sun or a parked vehicle. Do not improvise heating or freezing to alter a changed texture."],
      ["Follow contact-handling directions", "Use the intended applicator or method and keep the case closed between uses. Treat the balm as its specified cosmetic rather than a multipurpose product."],
      ["Keep refill details", "If the case is refillable, retain compatibility information and use the specified refill. A replacement pan with a similar shape is not automatically supported."],
    ], "Check the case's closure, storage guidance and refill identifier before making it a permanent bag item.", "HUME's discovery testers are liquid samples, so use the solid maker's own instructions for a balm you own.", "shop"),
  g("How to store roll on perfume", "Storage guides",
    "Store roll-on perfume with its cap securely closed and according to the formula's actual directions. The roller describes an applicator, so it does not establish carrier, shelf life or one universal storage specification.", [
      ["Keep the label visible", "Retain the full name and formulation claims. A similar roller bottle may contain a different cosmetic product with different intended use."],
      ["Protect the contact mechanism", "Handle the applicator as directed and avoid unnecessary contact with its parts. Do not remove the roller assembly unless the maker specifically instructs it."],
      ["Choose storage before carrying", "Review temperature and light guidance and keep the closure secure in a suitable place. Portability is not a guarantee against leaks or unsuitable exposure."],
    ], "Record the carrier information and check the closure separately before choosing where a roller bottle will stay.", "Consult HUME's current applicator details for its own products rather than assuming all small testers use roller storage guidance.", "shop"),
  g("How to store cologne", "Storage guides",
    "Store cologne as directed for the exact product, closed and protected from unsuitable heat and direct light. Identify whether you own a splash, atomizer or another presentation before deciding how the closure should be handled.", [
      ["Read the full product identity", "The word cologne can be used broadly. Keep the actual label so you know the maker's format and storage information rather than relying on the category alone."],
      ["Use the designed closure", "A splash cap and spray assembly are not interchangeable. Close the bottle as supplied and avoid forcing parts open for a transfer."],
      ["Keep it away from display hazards", "A bright shelf or hot vehicle is not justified by a fresh scent style. Choose an appropriate stable location following the product's guidance."],
    ], "Identify the bottle presentation and check its storage location before treating it as an everyday carry product.", "Use HUME's exact product descriptions and handling information rather than assigning its whole catalogue a generic cologne format.", "shop"),
  g("How to store alcohol free perfume", "Storage guides",
    "Store alcohol-free perfume according to the exact formulation and packaging directions. The carrier claim does not remove storage needs or establish a universal expiry, and sprays, oils and balms may require different handling.", [
      ["Verify the exact product", "Keep the label and maker information, especially if a particular alcohol exclusion matters. The container's appearance does not confirm that claim."],
      ["Follow its closure and temperature guidance", "Use the designed cap or case and choose an appropriate location. Do not infer heat resistance or preservation properties from alcohol absence."],
      ["Keep shelf-life information separate", "Use actual product expiry or opening guidance where supplied. A broad alcohol-free category cannot determine how long every finished cosmetic should be kept."],
    ], "Save the exact formulation claim, packaging instructions and any supplied opening-life information together.", "Ask HUME about a specific item's formulation and storage if needed; this page does not label its range alcohol-free.", "shop"),
  g("How much eau de parfum should I apply", "Application amounts",
    "There is no universal EDP spray count that fits every perfume, atomizer and setting. Follow the exact product directions, start with a restrained application and evaluate comfort before deciding on a routine.", [
      ["Check what the applicator delivers", "Different sprays can apply different amounts. A sample tester and a full bottle should not be treated as identical measuring devices just because both use an atomizer."],
      ["Choose for the wearing setting", "Follow workplace or venue fragrance rules and consider close shared spaces. Maximum noticeability is not the same goal as a comfortable everyday presence."],
      ["Reassess rather than adding automatically", "Reduced awareness of your own scent does not prove it has disappeared. Record the later experience before changing application, and keep within the product's instructions."],
    ], "Record the exact bottle, intended setting and later comfort before adopting any repeated spray routine.", "Use HUME samples to learn scent preference, then follow the actual purchased product's directions instead of transferring a tester spray count mechanically.", "samples"),
  g("How much eau de toilette should I apply", "Application amounts",
    "Do not automatically apply more eau de toilette because it is labelled EDT. The appropriate routine depends on the exact fragrance, applicator, product directions and setting rather than a fixed EDT-to-EDP spray conversion.", [
      ["Separate concentration and presence", "EDT does not guarantee weak projection. Judge the actual scent during a restrained first trial instead of assuming a lighter-style label needs extra application."],
      ["Keep the first comparison consistent", "Record the product and application method without layering another new fragrance. This gives you a clearer basis for deciding whether the presence suits your occasion."],
      ["Review before refreshing", "Consider the developing scent and shared environment before adding more as directed. Not noticing the opening anymore is not enough evidence for an automatic top-up."],
    ], "Write the exact EDT and the presence you want, then evaluate an ordinary trial before altering the amount.", "Check HUME's listed formats and directions rather than assigning its fragrances a generic EDT spray formula.", "shop"),
];

const byTitle = (title: string) => BEGINNER_GUIDES_BATCH_FIVE.find(guide => guide.title === title)!;
byTitle("Eau de parfum sample size options").chart = {
  headers: ["Offer type", "Check before choosing", "What not to infer"],
  rows: [["Maker sample", "Exact version, quantity and applicator", "A universal sample volume"], ["Travel product", "Filled contents and actual format", "Same formulation from a shared name"], ["Third-party decant", "Seller and source product information", "Official brand-supplied packaging"], ["HUME discovery sample", "Current builder contents and stated size", "An EDP version of every inspiration"]],
};
byTitle("How much eau de parfum should I apply").chart = {
  headers: ["Question", "Why it matters"],
  rows: [["What do the directions say?", "The product's actual instructions come first"], ["Which applicator am I using?", "Spray output varies"], ["Where will I wear it?", "Shared-space rules and comfort differ"], ["What happens later?", "Self-awareness is not a projection measurement"]],
};
byTitle("How to store eau de parfum").sources = [{ title: "CHANEL: fragrance storage guidance", url: "https://www.chanel.com/us/faq/fragrance-beauty/" }];
byTitle("How to store eau de toilette").sources = [{ title: "Diptyque: storing perfume", url: "https://customerservice.diptyqueparis.com/hc/en-us/articles/37771592643863-How-should-I-store-my-perfume-to-preserve-its-quality" }];
