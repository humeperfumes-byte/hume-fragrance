import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string, nextStep: BeginnerGuide["nextStep"] = "samples", productIds: string[] = []): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep, productIds };
}

export const BEGINNER_GUIDES_BATCH_FOUR: BeginnerGuide[] = [
  g("How to choose a rose fragrance", "Choosing a note",
    "Choose a rose fragrance by defining the floral impression you want: fresh petals, a softer powdery texture or a warmer blended character. Compare supporting notes because a rose listing does not guarantee a rose-dominant perfume.", [
      ["Name your floral reference", "Describe what you enjoy about rose rather than choosing only by the flower name. A bright flower-like association and a warm cosmetic impression create different expectations."],
      ["Read what surrounds the rose", "Iris, woods, fruit or incense can change the balance. Choose two contrasting structures instead of assuming shared rose notes make the perfumes interchangeable."],
      ["Decide through the full wear", "Record whether the later floral character stays enjoyable in your intended setting. A listed rose note does not establish natural oil content or a particular origin."],
    ], "Write two words for the rose style you want and compare them with each sample's later character.", "Compare the current HUME rose-containing candidates below, then check the builder for available samples before choosing a bottle.", "samples", ["homme-intense", "ombre-nomade"]),
  g("How to choose a jasmine fragrance", "Choosing a note",
    "Choose a jasmine fragrance around the balance you enjoy: a brighter floral-citrus direction, richer warmth or a contrasting texture. The flower name alone does not tell you how sweet, prominent or floral the complete perfume will feel.", [
      ["Choose the surrounding mood", "Decide whether you want freshness around the flower or a warmer impression. This creates a clearer brief than asking for the strongest jasmine perfume."],
      ["Compare different structures", "Read the full notes and select candidates with different supporting elements. Jasmine beside citrus can suggest a different exploration from jasmine within a leather-containing composition."],
      ["Evaluate comfort and preference", "Wear each candidate separately and note the later character. You do not need to isolate a single jasmine note to enjoy the complete fragrance."],
    ], "Describe the floral mood you want and one supporting impression you would prefer to avoid.", "Use HUME's jasmine-containing examples as contrasting compositions rather than assuming either is a single-flower perfume.", "samples", ["myself", "ombre-leather"]),
  g("How to choose a sandalwood fragrance", "Choosing a note",
    "Choose sandalwood fragrance by comparing wood texture and supporting notes. Smooth, rounded or creamy impressions are useful clues, but a sandalwood note does not establish natural oil content or promise a mild perfume.", [
      ["Describe the wood texture", "Decide whether a softer rounded impression or a drier wood direction appeals. Texture words can help explain your preference more clearly than a material name alone."],
      ["Check the other notes", "Spice, sweetness and additional woods can change how the sandalwood impression feels. A note list does not disclose how prominent that effect will be."],
      ["Keep sourcing separate", "If material origin matters, ask for specific product documentation. Do not infer extraction, region or concentration from the note listing."],
    ], "Compare two candidates using smoothness, dryness and warmth as separate observations.", "Explore HUME's current sandalwood-listed structures below and use samples to choose the balance you enjoy.", "samples", ["tom-ford-oud-wood", "eros-flame"]),
  g("How to choose a musk fragrance", "Choosing a note",
    "Choose musk fragrance by identifying whether you want a clean, powdery or warmer skin-like impression. Decide your preferred presence separately; a musky description does not automatically mean low projection or a particular ingredient source.", [
      ["Specify the association", "Laundry-like softness differs from warmer skin-like character. Use a familiar reference so the shortlist reflects your own meaning of musk."],
      ["Compare supporting directions", "Marine notes, flowers or woods can create different contexts for musk. Read the full structure rather than expecting every musk-containing perfume to smell alike."],
      ["Test presence independently", "A smooth-smelling perfume can still be noticeable. Judge comfort in your intended setting instead of treating musk as a strength category."],
    ], "Write the musk association you want and a separate sentence describing how noticeable you want the perfume to be.", "Compare HUME's musk-containing examples through wear, without assuming they use the same musk materials or have identical presence.", "samples", ["allure-sport", "acqua-di-gio-profondo"]),
  g("How to choose a bergamot fragrance", "Choosing a note",
    "Choose a bergamot fragrance by considering both citrus brightness and what follows it. A peel-like opening can lead to flowers, aromatic notes, woods or warmth, so the first impression should not decide the entire purchase.", [
      ["Define your citrus preference", "Do you enjoy brightness, a bitter-peel edge or a softer citrus association? Write the impression you want rather than expecting the fruit name to predict one exact smell."],
      ["Read the heart and base", "Choose different supporting structures for a useful comparison. Shared bergamot notes do not establish that the later fragrances will feel similar."],
      ["Return after the opening", "Decide whether you enjoy the later character as much as the citrus introduction. Freshness does not guarantee a particular duration or strength."],
    ], "For each candidate, record a citrus opening description and a separate later-wear description before choosing.", "Use the HUME bergamot-containing listings below to compare different developments, subject to current availability.", "samples", ["sauvage-noir", "myself"]),
  g("How to choose a vetiver fragrance", "Choosing a note",
    "Choose vetiver fragrance by separating the dry, earthy, woody or smoky impressions you enjoy. Different compositions can emphasize different parts of that range, and vetiver may support the perfume rather than dominate it.", [
      ["Name the quality you want", "You might enjoy dryness while disliking smoke, or prefer a subtle earthy undertone. That distinction helps choose a better test than asking only for a vetiver perfume."],
      ["Compare note contexts", "Iris and woods provide a different context from spices or leather. Use the surrounding structure to select two meaningful contrasts."],
      ["Choose by repeat enjoyment", "Return to the favorite in an ordinary suitable setting. You do not need to prefer the most intense or most obviously earthy example."],
    ], "Mark which of dryness, earthiness and smoke you want more or less of after each trial.", "Compare the current HUME vetiver-containing structures below as whole perfumes, not pure vetiver materials.", "samples", ["homme-intense", "spicebomb"]),
  g("How to choose a patchouli fragrance", "Choosing a note",
    "Choose patchouli fragrance around the complete balance of earthiness, warmth and supporting notes. A patchouli listing can appear in floral, aromatic or other structures, so one familiar stereotype should not determine the whole search.", [
      ["Start from a direction you know", "If you already like floral or citrus descriptions, explore a patchouli-containing candidate in that context. Familiar support can make the comparison easier to understand."],
      ["Observe the later impression", "Record whether you perceive earthy depth, warmth or something else. Not isolating patchouli does not mean the sample was uninformative."],
      ["Use dislikes constructively", "If a candidate feels too dense or sweet, identify that quality. Another perfume with patchouli may balance it differently, so do not judge only by shared note names."],
    ], "Describe the whole fragrance first, then note whether the patchouli listing helps explain its later character.", "Use HUME's aromatic and floral patchouli-containing examples below to choose a context you enjoy.", "samples", ["guilty-homme", "myself"]),
  g("How to choose a leather fragrance", "Choosing a note",
    "Choose leather fragrance by defining the texture you want: smooth, suede-like, dry or smoky. Leather is an accord description rather than literal leather liquid, and the surrounding notes can make it feel very different.", [
      ["Use a texture reference", "A soft suede association differs from a sharper leather-jacket impression. Give the shortlist that context rather than treating leather as one uniform smell."],
      ["Read the balancing notes", "Flowers, woods and spice can soften or emphasize different parts of the effect. A leather listing does not prove the composition will feel dark or especially strong."],
      ["Test through development", "Check whether you enjoy the later texture and would use it in your intended setting. A dramatic opening is not the only reason to choose this direction."],
    ], "Compare two leather-containing structures and write which texture makes you want to wear one again.", "Try HUME's current leather-listed examples as different compositions before committing to a full bottle.", "samples", ["ombre-leather", "homme-intense"]),
  g("EDP vs EDT perfume difference", "Formats and concentration",
    "EDP and EDT are concentration-style labels commonly used for eau de parfum and eau de toilette. EDP usually suggests a more concentrated version, but definitions overlap and two versions may also have different compositions rather than being identical scents at different strengths.", [
      ["Compare exact versions", "Read the full name and current notes for each product. A familiar bottle design does not establish that an EDT and EDP will have the same balance."],
      ["Separate lasting and projecting", "Longer perception and greater noticeability are different qualities. The concentration label alone cannot guarantee either in a finished perfume."],
      ["Choose for your own use", "Try both exact versions if possible and record enjoyment and comfort. Do not assume EDP is the quality upgrade or EDT the compulsory beginner option."],
    ], "Compare version, notes, format and your actual wear experience in separate columns rather than ranking labels alone.", "Check the exact formats on HUME product pages; the discovery kit compares available HUME fragrances and is not advertised as an EDP-versus-EDT version pack.", "shop"),
  g("Parfum vs eau de parfum", "Formats and concentration",
    "Parfum and eau de parfum are related product labels, with parfum commonly used for a more concentrated interpretation. They do not establish a universal percentage, identical recipe or a guaranteed performance order across brands.", [
      ["Check how the brand uses the names", "A parfum may be another interpretation of a fragrance rather than the same formula with less carrier. Read the exact version descriptions and available sizes."],
      ["Compare presence separately", "A more concentrated interpretation is not automatically the one that projects farther. Judge the actual fragrance instead of treating the label as a volume control."],
      ["Include preference and cost", "Compare the scent you enjoy, the format you want and the final price. A higher label category does not make an unwanted fragrance a better purchase."],
    ], "Write what each exact version changes in the product description before comparing the price.", "Use HUME's live listings to verify actual product formats instead of assuming parfum and EDP versions exist for every fragrance.", "shop"),
  g("Perfume vs body spray", "Formats and concentration",
    "Perfume and body spray describe different kinds of fragranced products, but the exact formulation and intended use matter more than the names. A deodorizing body spray is also different from a product sold mainly to add scent.", [
      ["Read the purpose on the label", "Check whether the product is a personal fragrance, deodorant or another cosmetic format. Do not assume every scented spray addresses the same need."],
      ["Compare application and cost", "Review the instructions, size and complete purchase price. A large body-spray container and a smaller perfume bottle cannot be compared only by the pictured size."],
      ["Judge the actual scent experience", "If both products interest you, compare enjoyment and presence separately. Neither label alone establishes how many hours the product will suit your routine."],
    ], "Write the purpose and directions for each product before deciding whether you are comparing equivalent needs.", "Browse HUME's listed fragrance formats for scent exploration; do not assume its perfume replaces a deodorant or an unlisted body-spray product.", "shop"),
  g("Attar vs perfume spray", "Formats and concentration",
    "Attar and perfume spray differ in presentation and may differ in carrier, composition and application. Attar is used broadly in commerce, so check the actual product rather than assuming every attar is natural, alcohol-free or identical to a spray version.", [
      ["Check what is being sold", "Read the maker's description of the formula type and application. The word attar alone does not verify extraction, ingredient origin or the absence of alcohol."],
      ["Compare the application format", "A dab or roller and a spray deliver fragrance differently. There is no universal conversion from a drop or swipe to a number of sprays."],
      ["Compare wear rather than labels", "Try the exact products you are considering. A longer-lasting or more noticeable experience cannot be guaranteed simply from the attar or spray name."],
    ], "Record carrier claims, application method and exact product identity before making the comparison.", "Use HUME's current spray-fragrance listings and samples to explore scent; no matching attar version is implied.", "shop"),
  g("Perfume oil vs alcohol perfume", "Formats and concentration",
    "Perfume oil and alcohol-based perfume use different carrier systems, but that alone does not establish quality, naturalness or duration. Compare the exact compositions, intended use and application formats rather than assuming one is automatically superior.", [
      ["Read the carrier information", "An oil-based finished perfume is not the same thing as an undiluted essential oil. Look at the actual cosmetic product description and directions."],
      ["Keep application differences visible", "A roller, dabber or spray can deliver different amounts. Equal-looking applications do not necessarily make a controlled comparison of concentration."],
      ["Judge personal fit directly", "Check scent enjoyment, presence and how the product fits your routine. An oil carrier does not prove a formula is natural or suitable for every wearer."],
    ], "Compare exact product names, stated carrier and instructions before drawing conclusions from oil versus alcohol.", "Review HUME's actual listed formats and discovery choices without assuming an oil equivalent or an alcohol-free claim.", "shop"),
  g("Body mist vs perfume", "Formats and concentration",
    "Body mist often describes a lighter fragrancing format, while perfume covers a range of concentrations and presentations. Naming is not uniform, so use the product's directions and exact description rather than expecting a fixed duration difference.", [
      ["Compare intended use", "Check where each product is designed to be applied. A body mist, hair mist and perfume may have different instructions even when their names sound related."],
      ["Read the composition cues", "A mist version and perfume version of a familiar name may not have identical note balances. Judge the exact item rather than the name shared across a range."],
      ["Choose for actual habits", "Portability, preferred presence and application style can matter as much as concentration. More frequent use of a larger mist is not automatically cheaper than another format."],
    ], "Write which format best fits your intended occasion and compare complete prices rather than bottle volume alone.", "Use HUME's shop to confirm what it currently sells; its discovery set is not presented as a body-mist collection.", "shop"),
  g("What does cologne mean", "Formats and concentration",
    "Cologne can mean eau de cologne as a product style, or it can be used casually to mean fragrance, particularly in some men's marketing. Read the full label before inferring concentration, gender or a specific citrus smell.", [
      ["Distinguish the exact term", "Eau de cologne is more specific than the casual word cologne, but concentration conventions still vary. A product name may also use Cologne as part of its identity."],
      ["Avoid a gender rule", "The word does not make a fragrance exclusively for men. Choose from the product description and your own preferences rather than interpreting the label as permission."],
      ["Check the actual format", "A splash and an atomized product need their own directions. Do not transfer an application routine solely because both products are called cologne."],
    ], "Find the full product name and application method before deciding what cologne means in a particular listing.", "HUME's catalogue describes specific fragrances and formats; use those details instead of treating cologne as a separate assumed range.", "shop"),
  g("What is extrait de parfum", "Formats and concentration",
    "Extrait de parfum is commonly used for a concentrated fragrance interpretation. It is not a guarantee of pure undiluted fragrance, a universal percentage or the strongest projection, and it may differ in composition from another version of the same name.", [
      ["Read the brand's interpretation", "Check the exact notes and format rather than assuming extrait simply means more of an identical recipe. Concentration-style terminology is not globally fixed."],
      ["Separate concentration and experience", "A concentrated product may emphasize a different texture or balance. Only an actual trial can tell you whether you prefer it to another interpretation."],
      ["Choose the commitment carefully", "Review the size and final cost and sample the exact version where available. The highest label category is not automatically the best starting purchase."],
    ], "Write what you expect extrait to improve, then check whether the actual product description supports that expectation.", "Use HUME's current product details for verified formats; no extrait version is implied by an inspiration name.", "shop"),
  g("Does higher concentration mean better perfume", "Formats and concentration",
    "Higher concentration does not automatically mean a better perfume. Quality, personal enjoyment, balance and suitability for your routine cannot be reduced to the amount of fragrance material or the label on a bottle.", [
      ["Define better before comparing", "You may want a different scent balance, longer enjoyment or a quieter presence. Those are separate goals and do not necessarily improve together as a label changes."],
      ["Compare complete versions", "EDT, EDP and parfum interpretations may change their notes as well as concentration. Read the exact products instead of assuming a simple stronger-versus-weaker hierarchy."],
      ["Let preference justify the price", "The version you repeatedly enjoy is a more useful choice than the highest concentration you can afford. Sampling is especially valuable when the price difference is meaningful."],
    ], "Rank two candidates by enjoyment and intended use before looking at their concentration labels or prices.", "Compare HUME fragrances through samples and live product information rather than treating an unverified percentage as a quality score.", "samples"),
  g("Which perfume concentration lasts longer", "Formats and concentration",
    "Concentration can influence fragrance wear, but it cannot reliably rank every perfume by duration. Composition, application, conditions and perception also matter, so compare exact products rather than assuming a universal EDT-to-extrait ladder.", [
      ["Ask what lasting means", "A faint close-range trace and a noticeable scent around you are different outcomes. Define which experience you want before comparing claims."],
      ["Compare similar conditions", "Record the exact product, application and wearing setting. A sample's spray output can differ from another atomizer, so avoid pretending equal spray counts guarantee equal amounts."],
      ["Separate preference from persistence", "The longest-lasting candidate is not automatically the one you enjoy most. Record the later character and whether you want it to stay, not only whether something remains."],
    ], "Track close-range presence and overall enjoyment separately during two ordinary wear tests.", "Use HUME samples to compare actual fragrance experiences; the kit is not a measured concentration-duration experiment.", "samples"),
  g("What is solid perfume", "Formats and concentration",
    "Solid perfume is a fragranced balm or similar solid cosmetic format applied according to its product directions. Its texture and packaging differ from a spray, but solid does not specify one universal concentration, ingredient list or wear time.", [
      ["Check the base and directions", "Read the actual product label rather than assuming every solid uses the same waxes or oils. A finished cosmetic is different from a do-it-yourself mixture."],
      ["Review application and portability", "A compact format may appeal if you prefer non-spray application. Keep the closure secure and follow storage instructions instead of assuming heat cannot affect a balm."],
      ["Check refill compatibility", "Some solids are refillable and others are not. A separate refill needs to match the case and product specified by the maker."],
    ], "Compare the listed application method, storage instructions and refill compatibility before buying a solid.", "HUME's discovery samples provide a separate spray-based exploration route; an unlisted HUME solid perfume is not implied.", "shop"),
  g("What is a perfume decant", "Formats and concentration",
    "A perfume decant is fragrance transferred from its original container into another container, usually in a smaller quantity. The seller, source fragrance and transfer process matter; a decant is not automatically an official brand sample.", [
      ["Identify the original fragrance", "Check the full name, brand and version claimed by the seller. Familiar labels on a small atomizer are not independent proof of provenance."],
      ["Distinguish sample types", "A manufacturer's sample, a third-party decant and an inspired fragrance are different products. They can all be small, which does not make their identities interchangeable."],
      ["Review seller information", "Read quantity, packaging and purchase conditions carefully. Keep the exact name in your notes so a later full-bottle order matches what you intended to test."],
    ], "Write whether each small-format listing is a brand sample, third-party decant or inspired fragrance before comparing prices.", "HUME's discovery set contains HUME fragrances, including inspired interpretations, rather than original designer-brand decants.", "samples"),
  g("What is a perfume tester bottle", "Formats and concentration",
    "A perfume tester bottle usually refers to a bottle intended for product demonstration, while some sellers also use tester for small sample formats. Read the exact listing: the word alone does not establish size, packaging, provenance or value.", [
      ["Check what tester means there", "A full demonstration bottle and a small spray sample are different offers. Look at the stated millilitres and contents rather than inferring the format from one word."],
      ["Verify identity and seller claims", "A tester label does not prove authenticity or guarantee identical packaging to a retail bottle. Review the maker, version and seller information."],
      ["Compare the complete offer", "Check closures, included packaging and order terms if those matter to you. A lower price is only useful when you understand exactly what is supplied."],
    ], "Record the listed size, maker and supplied contents before deciding whether a tester listing matches your need.", "In HUME's discovery offer, testers means the stated small HUME samples; it does not imply full designer demonstration bottles.", "samples"),
  g("Perfume refill vs new bottle", "Formats and concentration",
    "A perfume refill is intended for a compatible refillable product, while a new bottle is a complete purchase. Check the exact refill system, size and price rather than assuming any bottle can be opened or any refill will fit.", [
      ["Confirm compatibility first", "Use the maker's specific instructions for the bottle and refill. Similar product names or visible bottle parts do not establish a safe or supported refill method."],
      ["Compare the full costs", "Review refill volume, any required equipment and the price of the complete bottle. A refill is not automatically the cheaper option for your particular purchase."],
      ["Keep claims specific", "Less new packaging does not by itself quantify the environmental benefit of a product. Use actual maker documentation rather than inventing a numerical saving."],
    ], "Match the exact bottle and refill identifiers before comparing delivered prices and quantities.", "Check HUME's live catalogue or ask about a specific product; no universal refill service or compatible refill is assumed.", "shop"),
  g("Roll on perfume vs spray", "Formats and concentration",
    "Roll-on and spray describe application mechanisms, not a guaranteed concentration or carrier. A roller applies by contact and a spray disperses through an atomizer; compare the actual formulation and directions as separate details.", [
      ["Check what is inside", "Do not assume every roll-on is oil-based or alcohol-free. Read the product description and ingredient information when those characteristics matter."],
      ["Compare how you will use it", "A contact applicator and an atomizer can suit different routines. They also apply different amounts, so there is no universal swipe-to-spray conversion."],
      ["Judge the scent directly", "The same name in two formats may not guarantee an identical experience. Compare exact products and keep preference separate from the convenience of the container."],
    ], "Make separate notes for carrier, application mechanism and scent instead of treating roll-on as a complete formula description.", "Use HUME's current listings to verify actual applicators; a roll-on equivalent is not implied for its spray fragrances.", "shop"),
  g("Alcohol free perfume meaning", "Formats and concentration",
    "Alcohol-free perfume is a product claim that needs to be read with the maker's formulation information. It does not automatically mean oil-only, natural, fragrance-free or suitable for every person and use.", [
      ["Check the exact claim", "Read the label and ask the maker to clarify if you need the absence of a specific type of alcohol. Do not infer a formula from the presence of a roller or balm format."],
      ["Avoid unrelated promises", "The absence of a particular carrier does not establish lasting power, ingredient origin or personal suitability. Those questions require their own evidence."],
      ["Choose the correct intended use", "Follow the finished product's directions. A concentrated fragrance material or household scent is not interchangeable with a labelled personal perfume."],
    ], "Write the specific formulation question you need answered and check it against the maker's actual product information.", "Review HUME's product labels or ask about the exact item; this guide does not certify the catalogue as alcohol-free.", "shop"),
  g("Natural vs synthetic perfume ingredients", "Formats and concentration",
    "Perfume can use natural and synthetic fragrance materials, often together. These terms describe origin or production rather than a simple quality ranking, and naturalness alone does not establish safety, sustainability or personal preference.", [
      ["Separate note names from materials", "A rose or sandalwood note describes an intended smell and does not prove a natural extract is present. Ask for verified formulation information if sourcing matters."],
      ["Avoid chemical-free language", "Both natural and synthetic materials are chemical substances. Judge actual documentation rather than treating a marketing adjective as a complete explanation."],
      ["Choose with relevant evidence", "Ingredient requirements, scent enjoyment and environmental claims are different questions. A general origin category does not resolve all three or replace product directions."],
    ], "Turn a broad natural preference into a specific question about ingredient information or a verified claim you want to check.", "Use HUME's note lists for scent exploration and seek product-specific documentation for material-origin questions instead of inferring it from inspirations.", "shop"),
  g("Is eau de toilette only for men", "Formats and concentration",
    "Eau de toilette is not a men's-only category. It is a fragrance product descriptor used across gender marketing, so choose from the actual scent, format and your preferences rather than interpreting EDT as a gender rule.", [
      ["Read the term separately", "EDT does not tell you whether a fragrance is floral, woody, fresh or sweet. The note structure and product description provide those clues."],
      ["Use categories as navigation", "Men's, women's and unisex labels may help browsing without deciding what you enjoy. You can explore outside a category if the scent description appeals."],
      ["Compare the exact product", "Do not assume an EDT version is simply a weaker EDP or automatically the milder choice. Check the specific composition and evaluate it through wear."],
    ], "Describe the fragrance direction you want without mentioning a gender label, then compare actual listings.", "Use HUME's quiz and catalogue to explore scent preferences rather than treating EDT or an inspiration name as a gender restriction.", "quiz"),
  g("Why do perfumes contain alcohol", "Formats and concentration",
    "Alcohol, commonly ethanol in many spray perfumes, serves as part of the carrier system that helps distribute fragrance materials. Its presence does not independently establish quality, and different finished products can use different carrier systems.", [
      ["Think about the finished format", "A spray perfume needs a formulation suited to its intended application. The carrier is part of that design rather than a statement that the scent itself is inferior."],
      ["Do not judge from the first moment alone", "An initial carrier impression and the developing fragrance are different observations. Follow directions and evaluate the later scent instead of deciding solely from the immediate spray."],
      ["Use product information for exclusions", "If you need to avoid a particular ingredient, check the actual label and maker information. Bottle type or concentration terminology does not verify absence."],
    ], "Separate your first application impression from the fragrance you perceive later when comparing a spray perfume.", "Check the exact HUME product label for formulation questions and use samples to evaluate the scent rather than guessing from a carrier impression.", "shop"),
  g("What is a perfume travel atomizer", "Formats and concentration",
    "A perfume travel atomizer is a portable spray container for carrying fragrance. It may be refillable or supplied already filled; check the exact design, compatibility and contents instead of assuming every small spray works the same way.", [
      ["Distinguish container and fragrance", "An empty atomizer is an accessory, while a filled travel spray includes a product and quantity. Read the listing before comparing prices."],
      ["Follow its filling instructions", "Bottom-fill, removable-top and other systems have different requirements. Do not force a perfume bottle open or assume every nozzle fits a refill device."],
      ["Plan for carrying", "Keep it identified and securely closed. Check your carrier's current liquid rules when flying; portability does not establish that your whole bag complies."],
    ], "Record whether the item is empty or filled, its stated capacity and its specific refill method before buying.", "HUME's discovery testers are small filled samples, not a promise of a separately sold refillable travel-atomizer accessory.", "samples"),
  g("How to use eau de parfum", "Application guides",
    "Use eau de parfum according to the exact product's directions, starting with a restrained application suited to your setting. EDP is a label, not a universal spray count, and different atomizers can deliver different amounts.", [
      ["Check the intended application", "Read where the maker recommends using the product. Do not assume instructions for a body fragrance also cover hair, fabrics or another cosmetic use."],
      ["Keep the first trial simple", "Try the fragrance without layering another new scent. Note the application and later impression so you can judge the actual product rather than an uncontrolled mixture."],
      ["Reassess before adding more", "Your reduced awareness of the fragrance does not prove it has disappeared to everyone else. Consider the setting and product directions before reapplying."],
    ], "Record your application and later comfort during one ordinary wear before choosing a regular routine.", "Use HUME samples to learn a fragrance's character and consult the exact product directions rather than assigning every listing an EDP spray rule.", "samples"),
  g("How to use eau de toilette", "Application guides",
    "Use eau de toilette as directed for the particular product and wearing occasion. EDT does not mean you must apply more, top up frequently or follow a different rule based on gender.", [
      ["Read the version and format", "Make sure you have the intended fragrance and applicator. A familiar name in another concentration can have a different composition, so do not transfer assumptions from another bottle."],
      ["Choose an appropriate presence", "Start with a restrained trial in a setting where fragrance is welcome. An EDT can still be noticeable; the label does not establish a quiet application."],
      ["Judge the developing scent", "Notice whether you enjoy the later character before adding more. Keep your own awareness separate from a claim about how far the fragrance projects."],
    ], "Write whether the actual application felt appropriate at first and later, without comparing only the EDT label.", "Check HUME's live product format and instructions; its sample choices are not presented as dedicated EDT versions of every fragrance.", "shop"),
  g("How to use extrait de parfum", "Application guides",
    "Use extrait de parfum according to the exact product's application instructions and applicator. A concentrated-style label does not mean undiluted material, a fixed dose or permission to copy the routine used for another perfume.", [
      ["Identify the applicator", "An atomizer and a dab-style presentation deliver fragrance differently. Read the supplied directions instead of converting drops and sprays using an invented ratio."],
      ["Make the initial test restrained", "Give the fragrance a separate wear and judge its presence in your intended setting. Higher concentration does not automatically mean more distant projection."],
      ["Evaluate the exact interpretation", "An extrait can differ in notes from an EDP or EDT with a related name. Record the version so your later purchase or comparison matches the product tested."],
    ], "Record the exact version, applicator and later impression before deciding how it fits your routine.", "Use HUME's catalogue for verified formats and compare its available samples without assuming an extrait counterpart exists.", "shop"),
  g("How to use perfume oil", "Application guides",
    "Use a finished perfume oil according to its label and application mechanism. A cosmetic perfume oil is different from a raw fragrance material or undiluted essential oil; do not substitute one for the other based only on the word oil.", [
      ["Check the finished product", "Confirm that it is intended for personal fragrance use and read the stated application areas. A home-scent oil or formulation ingredient is not the same product."],
      ["Use the supplied mechanism", "A roller, dabber or other dispenser has its own directions. Keep the closure secure and avoid assuming a fixed number of drops equals an application from a spray bottle."],
      ["Keep comparisons clear", "Try the oil separately from other unfamiliar scents and note the later impression. Carrier type alone does not establish how quietly or how long it will wear."],
    ], "Record the labelled purpose and applicator before testing a finished perfume oil on its own.", "HUME's listed spray samples offer a separate comparison route; this page does not imply they are perfume oils or a substitute for oil-product directions.", "shop"),
  g("How to use attar", "Application guides",
    "Use attar according to the maker's specific directions because the name covers different products in commerce. Confirm the intended personal use, carrier information and applicator rather than assuming one method fits every bottle.", [
      ["Read beyond the traditional name", "Attar does not by itself verify a natural origin, concentration or absence of alcohol. Check the actual finished product before deciding it meets a particular requirement."],
      ["Follow the supplied application method", "Dabbers, rollers and other presentations are not interchangeable dosing systems. Use the product as instructed rather than copying a routine for an unrelated attar."],
      ["Keep the trial identifiable", "Write the exact product name and intended occasion. Compare the developing scent without layering several unfamiliar oils or sprays at once."],
    ], "Save the product's actual instructions and record the later character after a separate trial.", "Explore HUME's current fragrance formats if considering a spray alternative; no attar version or attar-use service is assumed.", "shop"),
  g("How to use body mist", "Application guides",
    "Use body mist on the areas and in the manner specified by its maker. The mist label does not make it a hair product, room spray or a product that should be repeatedly applied without considering the setting.", [
      ["Check what the mist is for", "Body, hair and multipurpose mists may have different directions. Read the exact item rather than transferring instructions from a similar name in the same range."],
      ["Choose a suitable occasion", "Use it where fragrance is welcome and judge the actual presence. A body mist can still be noticeable, so do not assume the format is automatically appropriate for every shared room."],
      ["Review before refreshing", "Consider the developing fragrance and your routine before adding more. A lighter marketing description does not require a scheduled top-up."],
    ], "Read the intended application areas and evaluate one trial before deciding on any refresh routine.", "Use HUME's product pages to verify available formats; a body-mist version is not implied by a fragrance's name or inspiration.", "shop"),
  g("How to use solid perfume", "Application guides",
    "Use solid perfume as directed for the specific balm or solid cosmetic, with its recommended application method. The solid format changes handling and storage, but it does not create a universal amount or make every product refillable.", [
      ["Use the intended applicator", "Read whether the maker specifies a fingertip or another method and follow the handling directions. Avoid treating every solid as the same formulation."],
      ["Choose appropriate application areas", "Use only where the product is intended to be applied. A solid perfume is not automatically a lip product, hair treatment or moisturizer."],
      ["Close and store it properly", "Secure the case and follow temperature and storage guidance. If it is refillable, use the compatible refill rather than forcing a different balm into the container."],
    ], "Note the application method, storage directions and whether the exact case supports a specified refill.", "HUME's discovery set is a spray-sample experience, so use the solid product's own instructions rather than treating HUME testers as the same format.", "shop"),
  g("How to use roll on perfume", "Application guides",
    "Use roll-on perfume according to its finished-product directions, applying with the contact roller where specified. A roller does not independently establish oil content, alcohol absence or a fixed amount delivered per swipe.", [
      ["Confirm what is inside", "Read the formulation claims separately from the applicator type. Two roll-ons can use different carriers and scent compositions despite similar containers."],
      ["Follow the contact-use instructions", "Use the intended application areas and keep the roller and closure handled as the maker directs. Do not convert another product's spray count into a swipe count."],
      ["Evaluate without layering", "Try the product on its own first so you can recognize its opening and later character. Convenience and scent preference are separate reasons to choose the format."],
    ], "Write the carrier information and application instructions as two separate facts before your first trial.", "Check HUME's currently offered applicators; its spray listings do not establish the availability or formula of a roll-on equivalent.", "shop"),
  g("How to use cologne", "Application guides",
    "Use cologne according to the exact product's directions and presentation. The word may refer to eau de cologne or be used broadly for fragrance, so identify the actual bottle before assuming a splash or spray routine.", [
      ["Read the full name", "Check whether the product says eau de cologne, uses Cologne as a name or simply describes a fragrance casually. Those usages do not establish one uniform concentration."],
      ["Identify the application mechanism", "A splash and an atomizer require different handling. Follow the maker's method rather than pouring a product because you expect all cologne to be a splash."],
      ["Choose presence for the setting", "Use a restrained first trial and judge the actual scent. Cologne is not a guarantee of low projection or a reason to ignore a workplace fragrance rule."],
    ], "Record the full label and whether the product is a splash, spray or another format before applying it.", "HUME's product details identify its actual fragrances; use those directions rather than assuming all products follow a cologne routine.", "shop"),
  g("How to use alcohol free perfume", "Application guides",
    "Use alcohol-free perfume according to its own label and applicator rather than a generic oil routine. Alcohol-free can describe different finished formulations and does not by itself determine the intended application areas or personal suitability.", [
      ["Clarify the formulation claim", "If absence of a particular alcohol matters, check the product information or ask the maker. A roller, balm or small bottle does not prove the claim on its own."],
      ["Follow the actual format", "A spray, roller and balm apply differently. Use the instructions supplied with the product instead of assuming alcohol-free means every version can be handled identically."],
      ["Judge the scent independently", "Evaluate enjoyment and presence without assuming a carrier claim predicts duration. Keep the first test separate from other unfamiliar fragranced products."],
    ], "Confirm the exact formulation claim and application method before deciding how the product fits your routine.", "Ask HUME about the specific product if alcohol content is a requirement; the discovery offer is not certified alcohol-free by this guide.", "shop"),
  g("How long does eau de parfum last", "Wear-time guides",
    "Eau de parfum does not have a reliable fixed wear time determined by its label alone. The exact fragrance, application and conditions matter, and a faint remaining scent is different from a noticeable fragrance around you.", [
      ["Define what you want to observe", "Decide whether you mean close-range scent, noticeable presence or enjoyment through your intended occasion. These are not interchangeable measures of lasting power."],
      ["Record the exact version", "EDP and another version of the same name may differ in composition. Note the product and applicator so the test refers to what you actually wore."],
      ["Use a repeat trial", "Check your experience during similar ordinary days rather than relying on one spray or a universal hours claim. Not noticing your own perfume is not proof that others cannot detect it."],
    ], "Write the product name and observation points during your normal day, with enjoyment and presence recorded separately.", "Use HUME samples for actual wear comparisons and read product-specific information instead of assigning every fragrance an EDP duration.", "samples"),
  g("How long does eau de toilette last", "Wear-time guides",
    "Eau de toilette has no universal number of lasting hours. EDT is a concentration-style descriptor, not a countdown, and some exact products may suit your routine better than a more concentrated interpretation.", [
      ["Avoid ranking labels alone", "A bright EDT and a woody perfume can have different perceptual behavior because their compositions differ. The term does not resolve that comparison by itself."],
      ["Keep the application identifiable", "Record the exact product and dispenser. Equal spray counts from different atomizers do not necessarily mean equal amounts were applied."],
      ["Check the later character", "A scent becoming quieter is different from becoming unpleasant or disappearing entirely. Record what remains and whether you still enjoy it before deciding to refresh."],
    ], "For one EDT trial, note the later character and close-range presence separately from the initial brightness.", "Check HUME's actual format descriptions and use its available samples for personal trials, not an assumed EDT wear-time chart.", "shop"),
  g("How long does extrait de parfum last", "Wear-time guides",
    "Extrait de parfum is not a guarantee of all-day or next-day wear. It commonly describes a concentrated interpretation, but the exact composition and your application matter more than an assumed fixed number of hours.", [
      ["Separate persistence and projection", "A fragrance may remain noticeable up close without creating a strong surrounding trail. Decide which outcome you are evaluating before calling it long-lasting."],
      ["Compare the actual versions", "An extrait may change the balance of notes rather than only concentration. Keep exact version names in the record so you are not comparing different products as identical formulas."],
      ["Choose for preferred wear", "A lingering character you dislike is not a benefit. Record later enjoyment alongside presence so the longest trace does not automatically decide the purchase."],
    ], "Compare the exact extrait's later scent and preferred presence rather than expecting its label to guarantee an hour total.", "Use HUME's verified listings for format questions; its inspiration references do not establish an extrait version or duration guarantee.", "shop"),
  g("How long does perfume oil last", "Wear-time guides",
    "Perfume oil has no fixed wear time from its carrier alone. The composition, amount applied and conditions affect the experience, and the time a scent remains close to you differs from how noticeable it is around others.", [
      ["Identify the finished product", "A cosmetic perfume oil is different from a raw fragrance material. Read the exact formulation description and instructions before comparing performance claims."],
      ["Avoid drop-to-spray comparisons", "A dropper or roller and an atomizer may deliver different quantities. Record the actual application rather than assuming a numerical conversion makes the test equivalent."],
      ["Check your preferred outcome", "Evaluate enjoyment and presence through your intended use. An oily carrier is not proof of better duration, greater projection or a more natural formula."],
    ], "Record the oil's actual applicator and later impression without treating a spray perfume as a directly equal dose.", "If comparing with a HUME spray fragrance, treat it as a whole-product trial rather than proof that one carrier always lasts longer.", "shop"),
  g("How long does attar last", "Wear-time guides",
    "Attar does not imply one standard wear time. Products using that name can differ in composition, carrier and application, so evaluate the exact item instead of assuming every attar lasts longer than every spray perfume.", [
      ["Read the product identity", "Check the maker's actual description rather than inferring naturalness, concentration or alcohol absence from the name. Those details do not share one automatic definition."],
      ["Separate quantity and perception", "Record the applicator and trial conditions. A concentrated first impression and a pleasant later trace are different observations, neither established by bottle size."],
      ["Test the routine you need", "Evaluate whether the fragrance stays enjoyable during the occasion you want it for. A single universal hour claim is less useful than a clear record of your own experience."],
    ], "Write the exact attar name, application method and later enjoyment before comparing it with another format.", "Use HUME's listed spray samples only as a separate fragrance comparison; no matching attar or attar-performance claim is implied.", "shop"),
  g("How long does body mist last", "Wear-time guides",
    "Body mist is often positioned as a lighter fragrancing format, but the name does not guarantee a particular number of hours. The exact product, intended application and composition determine the experience you should evaluate.", [
      ["Check what the mist is designed for", "A body mist and a hair mist can have different instructions. Performance claims for one product should not be transferred to another just because both are called mist."],
      ["Record application rather than guessing", "Follow the label and note your initial use. A large container does not tell you the concentration or how many refreshes are appropriate for your setting."],
      ["Choose the practical trade-off", "If you prefer the format but want a different wear experience, compare another exact product. Do not automatically increase application to force the mist to behave like a perfume."],
    ], "During a normal use, note enjoyment and presence before deciding whether any label-permitted refresh is needed.", "Compare HUME's actual fragrance listings if exploring a spray-perfume alternative; no HUME body-mist duration is asserted.", "shop"),
  g("How long does solid perfume last", "Wear-time guides",
    "Solid perfume wear time cannot be predicted from its balm format alone. Evaluate the finished composition and application, and distinguish lasting on the wearer from how long the product remains usable in its case.", [
      ["Clarify which lifespan you mean", "Wear duration is different from storage life or the number of applications left. For product expiry and storage, use the maker's information rather than a general wear-time article."],
      ["Record the intended application", "Follow the product's method and areas of use. A small amount of one balm is not automatically equivalent to the same-looking amount of another."],
      ["Judge close-range experience", "Some buyers choose solids for application convenience. Judge the actual scent and presence rather than assuming the format guarantees either weak or long-lasting wear."],
    ], "Keep wear observations and the maker's storage-life information as two separate entries in your notes.", "HUME's discovery sprays provide a different application experience; they are not evidence for how an unlisted solid version would last.", "shop"),
  g("How long does roll on perfume last", "Wear-time guides",
    "A roll-on applicator does not determine how long the perfume lasts. Formula, carrier, application and conditions still matter, and the word roll-on does not prove the product is oil-based or alcohol-free.", [
      ["Check the formulation separately", "Read what the maker says is in the finished product and how it should be used. A familiar roller bottle does not establish an identical recipe across products."],
      ["Keep the trial consistent", "Record the exact item and application without inventing a swipe-to-spray conversion. Compare your actual experience instead of claiming equal doses."],
      ["Separate quietness from disappearance", "A close-range scent can be a different experience from a surrounding trail. Define the outcome you want before judging whether the product lasts long enough."],
    ], "Record carrier information and later presence alongside the exact roll-on name, not just the number of swipes.", "Use HUME's listed formats for any comparison and do not infer a roll-on wear time from its spray catalogue.", "shop"),
  g("How long does cologne last", "Wear-time guides",
    "Cologne has no universal wear time because the word can mean eau de cologne or simply fragrance in casual usage. Identify the exact product and formulation-style label before evaluating how long its scent remains enjoyable.", [
      ["Resolve the meaning first", "A product called Cologne is not necessarily described the same way as a traditional eau de cologne. Read the full label and maker information before making comparisons."],
      ["Observe the actual composition", "A citrus-led opening may change noticeably while other impressions remain. Record the later character rather than equating the loss of initial brightness with total disappearance."],
      ["Use your intended occasion", "Decide whether the fragrance remains suitable for the period you actually want to wear it. Duration alone does not decide whether you enjoy the scent or prefer the format."],
    ], "Write what cologne means on the actual product label, then record the opening and later impression separately.", "Use current HUME fragrance descriptions for comparison rather than assigning the entire catalogue a generic cologne lifespan.", "shop"),
  g("How long does alcohol free perfume last", "Wear-time guides",
    "Alcohol-free does not establish a fixed duration or prove a perfume lasts longer than an alcohol-based product. The carrier claim leaves composition, application and personal experience as separate questions.", [
      ["Clarify the exact product claim", "Check the label if absence of a particular alcohol matters. A roller or balm presentation alone is not proof of the formula."],
      ["Compare complete products", "Use exact names, intended application and similar ordinary conditions. A carrier difference does not make two otherwise different fragrances a controlled test."],
      ["Avoid a performance shortcut", "Record enjoyment and perceived presence independently. Choose the product that meets your requirements and preferences rather than accepting an unsupported all-day claim."],
    ], "List formulation requirements separately from your wear-time expectations before testing any candidate.", "Ask HUME about the exact item's formulation when needed; this page makes no alcohol-free or fixed-duration claim for its discovery samples.", "shop"),
  g("Is eau de parfum good for beginners", "First formats",
    "Eau de parfum can be a good beginner choice when you enjoy the exact fragrance, understand its directions and can afford the purchase. It is neither a required upgrade nor automatically too strong for someone new to perfume.", [
      ["Choose scent before status", "An EDP label does not establish personal fit. Begin with your preferred notes, occasion and presence rather than trying to choose the most impressive concentration category."],
      ["Make the first test manageable", "Try an unfamiliar candidate separately and use restrained application according to its directions. A sample can help before committing to a larger bottle."],
      ["Compare the real alternatives", "If an EDT or parfum interpretation also interests you, read its exact description. Related versions may differ in composition rather than just turning the same scent up or down."],
    ], "Write why the exact EDP appeals beyond its label, then identify what a sample trial still needs to answer.", "Use HUME's quiz and discovery choices to learn preferences, checking the exact product format instead of assuming every recommendation is an EDP.", "quiz"),
  g("Is eau de toilette good for beginners", "First formats",
    "Eau de toilette can suit a beginner, but the right choice depends on the exact scent and intended use. EDT does not guarantee low projection, a particular number of hours or a product that is easier to enjoy than every EDP.", [
      ["Avoid the compulsory starter rule", "You do not have to begin with EDT before trying another format. Choose a fragrance you are curious about and understand what the actual listing sells."],
      ["Evaluate your normal setting", "Test enjoyment and comfort where fragrance is appropriate. A light-sounding label is not permission to ignore shared-space rules or apply without consideration."],
      ["Choose a sensible commitment", "Compare current size, price and order conditions. If the smell remains uncertain, sample the exact product where available instead of assuming the label resolves the purchase."],
    ], "Describe the setting and scent direction you want before deciding whether an EDT candidate answers that brief.", "Explore HUME's current catalogue and sample offer for actual product choices rather than expecting a mandatory EDT beginner range.", "samples"),
];

const byTitle = (title: string) => BEGINNER_GUIDES_BATCH_FOUR.find(guide => guide.title === title)!;
for (const note of ["rose", "jasmine", "sandalwood", "musk", "bergamot", "vetiver", "patchouli", "leather"]) byTitle(`How to choose a ${note} fragrance`).requiredNote = note;

byTitle("EDP vs EDT perfume difference").chart = {
  headers: ["Question", "EDT", "EDP"],
  rows: [["Label meaning", "Eau de toilette", "Eau de parfum"], ["Typical interpretation", "Often a less concentrated style", "Often a more concentrated style"], ["Identical recipe?", "Not established by the label", "Not established by the label"], ["Guaranteed wear time?", "No", "No"]],
};
byTitle("Roll on perfume vs spray").chart = {
  headers: ["Detail", "Roll-on", "Spray"],
  rows: [["Application", "Contact roller", "Atomized application"], ["Carrier", "Check the actual product", "Check the actual product"], ["Amount delivered", "Depends on product and use", "Depends on atomizer and use"], ["Fixed duration", "Not established by mechanism", "Not established by mechanism"]],
};
byTitle("Perfume refill vs new bottle").chart = {
  headers: ["Check", "Refill", "New bottle"],
  rows: [["Compatibility", "Needs the specified refill system", "Complete product as listed"], ["Price comparison", "Compare exact volume and total cost", "Compare exact size and total cost"], ["Instructions", "Follow maker's refill method", "Follow product application directions"]],
};
byTitle("EDP vs EDT perfume difference").sources = [{ title: "IFRA: concentration-style terminology", url: "https://ifrafragrance.org/using-the-standards" }];
byTitle("Natural vs synthetic perfume ingredients").sources = [{ title: "IFRA: questions about fragrance", url: "https://ifrafragrance.org/about-fragrance/this-is-a-fragrance-2" }];
byTitle("What is solid perfume").sources = [{ title: "Diptyque: examples of refillable solid products", url: "https://us.diptyqueparis.com/en-us/pages/refillable-products-diptyque" }];
