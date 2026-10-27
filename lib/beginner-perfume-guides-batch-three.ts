import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string, nextStep: BeginnerGuide["nextStep"] = "samples", productIds: string[] = []): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep, productIds };
}

export const BEGINNER_GUIDES_BATCH_THREE: BeginnerGuide[] = [
  g("Fragrance starter kits for college students", "Starter kits",
    "A college fragrance starter kit should teach you which scents you enjoy without turning curiosity into several bottle purchases. Check the complete cost, choose contrasts and plan trials around occasions where fragrance is permitted.", [
      ["Use your timetable as the brief", "Choose for commuting, relaxed outings and permitted classroom use rather than only parties. A sample assigned to a real occasion is easier to evaluate than an assortment chosen just for familiar names."],
      ["Budget for the kit itself", "The kit total is the purchase cost, even if you mainly want one tester. Do not plan on a future bottle discount or individual sample sale unless the offer actually includes it."],
      ["Keep a learning record", "Write one like and one dislike after each trial. Revisit favorites before selecting a larger bottle, and remember the kit can be the complete purchase while you learn."],
    ], "Assign each selected sample to an ordinary use or a new direction you want to understand.", "Use HUME's customizable discovery set as the starter experience if the current kit price fits your college budget.", "samples"),
  g("Fragrance starter kits for office workers", "Starter kits",
    "For office workers, a starter kit can help distinguish enjoyable scents from suitable workplace choices. Establish the workplace rules first, then select candidates for your actual environment and a separate off-duty alternative if useful.", [
      ["Start with the room you share", "Follow fragrance restrictions and consider desk proximity. A promising note list does not automatically establish suitability for meeting rooms or customer-facing work."],
      ["Compare presence and preference separately", "You might enjoy a candidate but want less presence for work. Record both observations instead of choosing entirely by a claim about longevity or strength."],
      ["Give evening samples their own role", "A more noticeable evening option can be part of the exploration without becoming your office default. Choose a bottle only when its intended use is clear."],
    ], "Mark your kit list with work candidate, off-duty candidate or exploration only before the first trial.", "Build a HUME discovery selection around those roles rather than expecting a fixed office starter bundle.", "samples"),
  g("Fragrance starter kits for teenagers", "Starter kits",
    "A teenage fragrance starter kit is an opportunity to learn preference words and compare smells. Keep the purchase modest, check intended use and involve a parent or guardian where appropriate; a sample format does not certify age suitability.", [
      ["Make curiosity the goal", "Fresh, floral, woody and sweet are directions to explore, not identities to adopt. There is no need to choose a permanent signature or buy every sample as a bottle."],
      ["Check permission and directions", "Review school and household rules alongside the product's instructions. A starter label does not mean a product is designed specifically for teenagers."],
      ["Agree on a simple limit", "Set a comfortable total cost and a few allowed testing occasions. Let the wearer express likes and dislikes without pressure to prefer what an adult or influencer recommends."],
    ], "Agree on the spending limit, allowed occasions and two scent directions to explore before choosing the kit.", "HUME's discovery builder can support a shared selection; it is not a dedicated teenage product or suitability assessment.", "samples"),
  g("Fragrance starter kits for people who like mild scents", "Starter kits",
    "For a mild-scent starter kit, define whether you want quiet presence, less sweetness or a softer impression. Use the samples to investigate those preferences rather than assuming a small container holds a weaker perfume.", [
      ["Write the comfort requirement", "A soft smell and low projection are different ideas. Name which matters so you can understand why a candidate succeeds or feels too prominent."],
      ["Select with useful contrasts", "Read descriptions before choosing and compare different structures. Fresh and floral labels alone do not establish mildness, so leave room for your actual experience."],
      ["Keep exploration pressure-free", "If none of the trials feels comfortable, use that information to refine the brief. Buying a starter set does not create an obligation to select a full bottle."],
    ], "For each test, record enjoyment, presence and comfort as separate observations rather than one overall score.", "Start with a soft sillage preference in HUME's quiz, then choose available discovery samples to evaluate personally.", "quiz"),
  g("Fragrance starter kits for people who dislike sweet scents", "Starter kits",
    "A starter kit for a low-sweetness preference should compare different scent structures, not simply exclude one ingredient. Focus on the sweet impressions you dislike and check how the candidates develop later.", [
      ["Use a specific dislike", "Describe syrupy fruit, dessert warmth or another quality that bothers you. This is more informative than assuming all perfumes containing vanilla or amber will feel the same."],
      ["Build a contrasting selection", "Compare marine, aromatic or woody directions that interest you. Check the full note lists because a fresh opening can lead to a warmer impression."],
      ["Record the later balance", "Try candidates separately and return to favorites. A starter kit helps you learn your own threshold; it cannot supply an objective guarantee that a fragrance will smell unsweet to you."],
    ], "Write your sweetness deal-breaker next to every sample and revisit it after the opening changes.", "Use HUME's discovery builder to compare available drier-sounding directions while treating the notes as selection clues.", "samples"),
  g("Fragrance starter kits for people who like fresh scents", "Starter kits",
    "A fresh fragrance starter kit can compare citrus, marine and aromatic ideas instead of repeating one bright opening. Give each sample a purpose and evaluate the complete wear before choosing your favorite direction.", [
      ["Make freshness specific", "Compare the idea of citrus peel, sea air or herbs. Those reference points help organize a selection even when several product descriptions use the same word fresh."],
      ["Include different supporting notes", "Read the heart and base alongside the opening. Woods, flowers or warmer notes can make two fresh perfumes feel different later in the day."],
      ["Keep learning distinct from performance", "A fresh impression does not specify strength or duration. Judge scent enjoyment, presence and willingness to wear again as separate parts of the experience."],
    ], "Label each chosen sample by its type of freshness and one later note you want to investigate.", "Build a HUME starter experience from available marine, citrus and aromatic options rather than assuming a fixed fresh-only pack.", "samples", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("Fragrance starter kits for people buying online", "Starter kits",
    "An online fragrance starter kit should clearly state what arrives and help turn descriptions into personal experience. Verify the maker, sizes and selection method before treating the set as a route to a larger purchase.", [
      ["Read the actual contents", "Check whether the kit contains samples, bottles or accessories and whether the assortment is fixed. Familiar inspiration names do not make inspired fragrances original designer decants."],
      ["Review order conditions", "Check availability, pre-order status, delivery information and final total. A starter name does not imply a voucher, subscription or later redemption benefit."],
      ["Keep identification simple", "Save the chosen sample names with the order details. Link your wear notes to the exact products so a later bottle purchase matches the fragrance you tested."],
    ], "Save a list of what the kit contains and the question you want each selected sample to answer.", "HUME's discovery builder lets online shoppers choose available fragrances; review the completed selection before checkout.", "samples"),
  g("Fragrance starter kits for people buying on a budget", "Starter kits",
    "A budget starter kit makes sense when its complete cost is comfortable and the samples resolve uncertainty you actually have. More items do not automatically provide better value if you will not use or learn from them.", [
      ["Define the learning need", "If you are unsure about scent families, comparison can be useful. If you already know your exact favorite, buying another assortment may not improve the decision."],
      ["Compare complete prices", "Include checkout charges and remember that a bundle's total is what you pay. An average cost per sample is not an offer to buy one sample separately."],
      ["Avoid an automatic upgrade", "The kit can remain the complete purchase. Choose a larger bottle only when a favorite earns that commitment, without assuming an unlisted credit or future promotion."],
    ], "Write the final affordable total and one clear thing you expect to learn before deciding on a kit.", "Compare HUME's current discovery offer with that limit rather than treating the starter experience as a required first step.", "samples"),
  g("Perfume scent families explained", "Understanding perfume",
    "Scent families group perfumes by an overall impression, such as floral, woody, fresh or amber. They are a browsing map rather than strict boxes: a fragrance can combine several directions and different classification systems use different boundaries.", [
      ["Use the overall impression", "A perfume listing one rose note need not feel mainly floral. Consider the full smell and supporting notes before assigning it to the category that seems most useful to you."],
      ["Look for neighboring directions", "A citrus-woody perfume can connect freshness with a drier later character. Mixed descriptions help explain those transitions without requiring you to choose one permanent family."],
      ["Choose contrasts to learn", "Compare clearly different directions before exploring many similar products. Your preferences may cross family labels, and a family does not determine gender, quality or performance."],
    ], "Compare one fresh, one floral and one woody description and write which overall direction you want to try first.", "Use HUME's quiz to choose a broad direction and the discovery builder to compare actual fragrances within and across families.", "quiz"),
  g("Top middle and base notes meaning", "Understanding perfume",
    "Top, middle and base notes describe a perfume's perceived development: its opening, central character and later impression. The stages overlap and are not a timetable showing when individual ingredients switch on or disappear.", [
      ["Top notes describe the opening", "These are the impressions emphasized at first, often including bright citrus or aromatic effects. They introduce the fragrance but do not describe every part of its later wear."],
      ["Middle notes describe the heart", "The heart gives a way to describe the fragrance's developing character. Floral or spicy impressions may appear here, but note placement is descriptive rather than a strict separation of materials."],
      ["Base notes describe later character", "Woods, musks or warmer effects are often listed at the base. Their presence does not guarantee a specific duration, and you may perceive them before the opening has faded."],
    ], "Record an opening impression and a later impression without trying to force every listed note into a fixed minute.", "Read the top, heart and base lists on HUME product pages, then compare those descriptions with separate sample wears.", "shop", ["myself"]),
  g("What does perfume dry down mean", "Understanding perfume",
    "Dry-down is the later character of a perfume as the opening changes and the composition settles in your perception. It describes the developing smell, not simply the moment liquid stops feeling wet.", [
      ["Separate drying from development", "A spray can dry while its scent continues changing. When buyers mention loving the dry-down, they usually mean the later fragrance rather than the first impression."],
      ["Return instead of smelling constantly", "Give a sample space between observations. Note what becomes more noticeable and whether you enjoy the overall impression, rather than trying to detect a change every few seconds."],
      ["Use it in the purchase decision", "An opening you love may lead to a later scent you do not want to wear. Consider both before buying a bottle, without expecting all perfumes to develop dramatically."],
    ], "Write two descriptions for one sample: first impression and the character you notice later in your normal day.", "Use HUME discovery samples to evaluate the full development before choosing a favorite from its opening notes alone.", "samples"),
  g("How to read a perfume notes list", "Understanding perfume",
    "Read a perfume notes list as a description of intended scent impressions, not a complete recipe or a list of ingredient quantities. It helps you choose what to try, but it cannot reproduce the finished smell.", [
      ["Look for the complete structure", "Read the heart and base as well as the top notes. A citrus opening may lead to woods or warmth, so a single appealing word is not the whole purchase brief."],
      ["Distinguish notes from ingredients", "Leather, marine and amber can describe constructed effects. A rose or sandalwood note alone does not establish natural extraction, sourcing or the amount used."],
      ["Use likes and exclusions", "Mark notes you enjoy and possible deal-breakers, then sample the composition. Two perfumes can share many listed notes yet smell different because balance and materials matter."],
    ], "Highlight one appealing opening note, one later note and one uncertainty in a product's note list.", "HUME product cards show current catalogue notes; use them to build a test list rather than treating them as an ingredient declaration.", "shop"),
  g("Fresh vs sweet perfume", "Understanding perfume",
    "Fresh describes impressions such as citrus, green or marine brightness; sweet describes a sugary, dessert-like or warm impression. They are not opposites that exclude each other: one perfume can feel fresh and sweet at different moments or together.", [
      ["Describe the effect you enjoy", "Do you prefer citrus peel, watery brightness or vanilla-like warmth? Those references give more information than choosing a side based only on a broad adjective."],
      ["Check the later balance", "A fresh opening may develop into a sweeter impression. Compare both stages so you choose a complete fragrance rather than deciding from the first spray."],
      ["Keep strength separate", "Sweet does not automatically mean strong, and fresh does not establish low projection. Evaluate presence and duration independently from the scent description."],
    ], "Record freshness and sweetness separately at the opening and later; both can be present in the same sample.", "Choose contrasting HUME sample descriptions, then use your own observations to decide which balance suits you.", "samples", ["acqua-di-gio-profondo", "eros-flame"]),
  g("Woody vs spicy perfume", "Understanding perfume",
    "Woody perfumes emphasize impressions associated with woods, while spicy perfumes emphasize effects reminiscent of spices. The two often overlap: woods can support a spicy structure and spice can add contrast to a woody perfume.", [
      ["Recognize a woody direction", "Descriptions may suggest dry timber, smooth wood or earthy depth. Cedar, sandalwood and vetiver point toward different possibilities rather than one uniform woody smell."],
      ["Recognize a spicy direction", "Pepper, cardamom or cinnamon suggest different kinds of lift or warmth. A spice note is a clue to the impression, not proof that the product contains a kitchen ingredient."],
      ["Compare emphasis rather than presence", "A perfume with both wood and spice notes may emphasize either or neither in your perception. Test the overall balance and whether you like it through the wear."],
    ], "Describe one candidate using texture words and another using spice references, then note where they overlap.", "Compare the current HUME wood-led and spice-containing note structures below as possible exploration candidates.", "samples", ["tom-ford-oud-wood", "spicebomb"]),
  g("Floral vs fruity perfume", "Understanding perfume",
    "Floral describes flower-like impressions; fruity describes impressions associated with fruits. A perfume can combine both, and neither label establishes sweetness, gender or how noticeable the fragrance will be.", [
      ["Choose familiar reference points", "Rose and jasmine suggest different floral ideas, just as crisp apple and dark berries suggest different fruit impressions. Start with specific references instead of assuming each category has one smell."],
      ["Notice the supporting structure", "Woods, musks or warm notes can change how flowers and fruit feel. Read the whole description before expecting a perfume to smell like a single blossom or piece of fruit."],
      ["Test your preferred balance", "A floral-fruity blend may feel more balanced to you than a clearly one-sided description. Use a contrast trial to discover whether the floral or fruity part matters most."],
    ], "Write whether you enjoy flower-like, fruit-like or combined impressions, then compare two different structures.", "Explore HUME's current floral and fruit-containing notes rather than treating the family label as a complete prediction.", "samples", ["myself", "creed-aventus"]),
  g("What does gourmand mean in perfume", "Understanding perfume",
    "Gourmand describes perfume impressions reminiscent of edible treats, such as dessert, cocoa, caramel or vanilla-like warmth. It is a scent description, not a statement that perfume is edible or made from food ingredients.", [
      ["Think of an impression, not a recipe", "A dessert association can be constructed from different materials. A listed vanilla or coffee note does not disclose the product's formula or mean a food extract was added."],
      ["Separate sweetness from weight", "Gourmand perfumes can vary in sweetness and texture. Some may feel airy, others dense or warm; the label alone does not establish projection or how you will enjoy them."],
      ["Choose a useful contrast", "Compare a dessert-like direction with a woody or fresher candidate to learn whether you enjoy the overall warmth or only a particular note."],
    ], "Describe the food-like association you enjoy and the level of sweetness you would prefer to avoid.", "Use the HUME catalogue to find dessert-like note descriptions, then test the complete composition instead of buying from one ingredient word.", "shop", ["eros-flame"]),
  g("What does aquatic perfume smell like", "Understanding perfume",
    "Aquatic perfume suggests watery, marine or airy impressions rather than a single literal smell of water. Some compositions evoke a sea breeze or mineral freshness; others combine the effect with citrus, flowers or woods.", [
      ["Read the type of watery impression", "Marine, mineral and airy descriptions can point in different directions. An aquatic label does not necessarily mean a perfume will smell salty or exactly like the sea."],
      ["Notice what surrounds it", "Supporting aromatic or woody notes can give the fragrance a different later character. Read the whole structure rather than assuming every aquatic perfume is interchangeable."],
      ["Keep expectations separate", "Aquatic does not guarantee mildness, lasting power or summer suitability for every wearer. Compare the scent and its presence in your own routine."],
    ], "When testing an aquatic candidate, describe whether its freshness feels marine, airy, mineral or something else to you.", "HUME's marine-note listing below is a concrete starting point for an aquatic comparison, subject to current availability.", "samples", ["acqua-di-gio-profondo"]),
  g("What does amber smell like in perfume", "Understanding perfume",
    "Amber in perfume commonly describes a warm, resinous, sometimes sweet impression built as an accord. It is not a promise that a fragrance contains fossilized amber, and it is distinct from ambergris.", [
      ["Recognize the warm impression", "Amber descriptions often suggest a rounded, balsamic character. The sweetness and texture vary with the composition, so amber is a direction rather than one exact smell."],
      ["Do not confuse related names", "Amber, ambergris and modern amberwood descriptions are not interchangeable ingredient declarations. Read the seller's specific explanation before assuming the same effect or source."],
      ["Test the balance", "Woods, flowers or spices may change how an amber impression feels. Compare a candidate later in the wear, especially if warmth or sweetness is a deal-breaker for you."],
    ], "Record whether a sample's warmth feels sweet, resinous, woody or a mixture instead of writing only amber.", "Use HUME's current note lists to choose an amber-containing comparison without assuming natural resin content or a particular formula.", "shop", ["allure-sport"]),
  g("What is a green fragrance", "Understanding perfume",
    "A green fragrance evokes impressions such as leaves, stems, grass or crisp plant-like freshness. It is a way of describing smell, not proof that the perfume is natural, environmentally certified or free of synthetic materials.", [
      ["Use familiar plant references", "Think about crushed leaves or a fresh stem rather than only flowers. Different green impressions can feel sharp, leafy, bitter or soft depending on the surrounding composition."],
      ["Separate green from citrus", "Both can contribute freshness, but a leafy impression differs from citrus peel. A perfume may include both, which is why the full description is more useful than a single adjective."],
      ["Choose by impression, not certification", "A green note does not establish sourcing, sustainability or ingredient safety. Look for actual product documentation if those claims matter to your purchase."],
    ], "Compare the words leafy, grassy and citrus-bright and choose which impression you want to explore first.", "Read HUME's aromatic and fresh note structures as exploration clues, without interpreting them as environmental claims.", "shop"),
  g("What is a powdery perfume", "Understanding perfume",
    "Powdery describes a soft, cosmetic or dry-textured impression that can recall face powder or similar associations. It is not the presence of loose powder in the bottle and does not define one particular ingredient.", [
      ["Describe the association", "Some people perceive powder as delicate and smooth; others associate it with familiar cosmetics. Your reference may differ from someone else's, so describe what the word means to you."],
      ["Read the surrounding notes", "Iris, violet or musky descriptions can be useful clues, but none guarantees the same powdery result. The whole composition determines how the impression is perceived."],
      ["Avoid automatic assumptions", "Powdery does not mean old-fashioned, feminine or weak by definition. Compare the actual scent and its presence rather than accepting those stereotypes as product facts."],
    ], "For a candidate, record whether the powder-like texture feels soft, dry, cosmetic or unlike those references.", "Explore the HUME iris-and-violet note structure below as a candidate, not a guarantee that you will perceive powderiness.", "samples", ["homme-intense"]),
  g("What is a skin scent", "Understanding perfume",
    "Skin scent usually means a fragrance perceived close to the wearer, or a style described as skin-like. It is not a standardized strength rating and does not mean the perfume contains no scent or is suitable for every shared space.", [
      ["Distinguish style from distance", "A skin-like smell and a fragrance noticed mainly at close range are related descriptions, but not the same measurement. Ask which meaning a review or product description intends."],
      ["Do not judge only by self-perception", "Not noticing your own perfume is not proof that others cannot detect it. Avoid repeated application simply because your awareness of the scent has changed."],
      ["Check the intended setting", "Workplace rules and personal comfort still apply. Sample candidates with a close-range brief rather than assuming every musky or minimal description will fit it."],
    ], "Write whether you want a skin-like character, a quieter presence or both before choosing a candidate.", "Select a soft presence preference in HUME's quiz, then evaluate its suggestions through wear rather than treating them as certified skin scents.", "quiz"),
  g("What makes a perfume smell clean", "Understanding perfume",
    "Clean in perfume describes an association such as fresh laundry, soap, airy flowers or crisp citrus. It is separate from the regulatory or marketing use of clean to describe ingredients, and it does not establish a safety claim.", [
      ["Name your clean reference", "Laundry-like softness, soapy brightness and citrus freshness can feel different. Use the familiar smell you want rather than assuming clean describes one universal fragrance."],
      ["Consider the complete structure", "Musky, floral and citrus effects can contribute to a clean impression in different combinations. A single listed note cannot guarantee that you will perceive the finished scent that way."],
      ["Separate smell and product claims", "A clean-smelling perfume is not automatically natural, hypoallergenic or free of a particular material. Check actual labels and verified documentation for ingredient questions."],
    ], "Finish the sentence: by clean, I mean it reminds me of ____, rather than ____.", "Use those specific words to review HUME's current fresh and musky descriptions, then compare actual samples.", "shop", ["allure-sport", "myself"]),
  g("Why does perfume smell different after an hour", "Understanding perfume",
    "A perfume can smell different later because the balance of what you perceive changes as it develops, and your awareness of it can change too. An hour is an observation point, not a universal boundary between fixed note stages.", [
      ["Expect overlapping impressions", "The opening, heart and base are a descriptive model. Materials and effects overlap rather than waiting for a timer, so development may be gradual instead of a clear switch."],
      ["Record the same trial", "Note the product, application and setting, then return to it later. Avoid adding another perfume during the test if you want to understand the original fragrance's character."],
      ["Do not diagnose from one change", "A different later impression alone does not prove a defect, poor quality or a counterfeit. Compare with reliable product information and another ordinary trial before drawing conclusions."],
    ], "Write an opening and later description from the same wear, including what became more or less noticeable.", "Use HUME discovery testers to compare development instead of making a full-bottle decision from the first spray.", "samples"),
  g("Can perfume notes predict the smell", "Understanding perfume",
    "Perfume notes can suggest a direction, but they cannot fully predict the finished smell. Balance, materials and the surrounding composition can make two perfumes with similar lists feel different.", [
      ["Use notes to form questions", "A listed citrus opening or woody base tells you something worth investigating. It does not reveal the exact formula, intensity or how dominant that effect will be."],
      ["Avoid counting shared notes as a match", "Two fragrances may list several ingredients or impressions in common and still emphasize different qualities. A short shared list is not proof of a dupe or identical experience."],
      ["Verify the overall impression", "Sample the candidate and describe it before checking the list again. This helps distinguish what you actually perceived from what you expected to find."],
    ], "Predict three qualities from a note list, then compare those predictions with a sample without forcing a match.", "Use HUME's catalogue notes as a shortlist tool and the discovery kit as the next step when the smell remains uncertain.", "samples"),
  g("What is a fragrance accord", "Understanding perfume",
    "A fragrance accord is a combination of materials that creates a recognizable overall effect. Leather or amber can be described as accords, while a note is a perceived element and a family is a broader classification.", [
      ["Think of a combined impression", "Different materials can be arranged so you perceive one effect rather than identifying every component. The accord name describes that result, not a requirement for one particular natural ingredient."],
      ["Keep the vocabulary separate", "A perfume can use an amber-like accord, list other notes and still belong to a mixed family. These words describe different levels of the composition rather than competing definitions."],
      ["Use accords to compare character", "If you enjoy a leather-like effect, compare its softness, smoke or dryness across candidates. Shared accord names do not mean the perfumes use identical recipes or will smell the same."],
    ], "Describe one combined effect you notice before trying to name individual notes within it.", "Explore HUME's leather and warm note structures as complete compositions rather than assuming each descriptive word names an extracted ingredient.", "samples", ["ombre-leather"]),
  g("How to find perfumes with similar notes", "Understanding perfume",
    "To find perfumes with similar notes, begin with the quality you want to repeat and use shared notes as clues. Compare the full structure and overall impression rather than treating a list overlap as proof of similarity.", [
      ["Identify what you actually enjoy", "You may like a citrus opening, dry woods or a musky later character rather than the entire note list. Choosing that target gives the search a clearer purpose."],
      ["Compare the surrounding composition", "A jasmine note paired with citrus can feel different from jasmine paired with leather or warm notes. Read supporting notes before deciding the candidates are close matches."],
      ["Test the difference deliberately", "Wear candidates separately and note which qualities remain familiar and which change. The closest list is not automatically the closest experience or your preferred alternative."],
    ], "Choose one favorite quality and compare two HUME listings that share it but use different supporting notes.", "Use current HUME note lists and sample options to compare related directions without promising identical designer performance or smell.", "shop"),
  g("How to identify perfume notes", "Understanding perfume",
    "Start identifying perfume notes by describing broad impressions and familiar references before naming precise materials. You do not need to recognize every listed note, and smelling a finished perfume cannot reliably reveal its complete formula.", [
      ["Describe before checking the list", "Write fresh, woody, floral, warm or another first impression. Add familiar comparisons such as citrus peel or dry wood without treating the association as an ingredient analysis."],
      ["Compare one contrast at a time", "Use two clearly different perfumes instead of smelling many in quick succession. Give yourself breaks and return later so the exercise remains a comparison rather than a memory test."],
      ["Use labels as a learning aid", "After recording your own words, read the notes and see which descriptions help explain the impression. It is fine if you do not perceive every listed element."],
    ], "Write three descriptive words before reading the notes, then add one useful new word after comparing the list.", "HUME's labelled discovery choices and catalogue note lists can support this exercise; they do not turn a wear test into formula identification.", "samples"),
  g("Perfume notes chart for beginners", "Understanding perfume",
    "A beginner perfume notes chart translates common note names into useful scent references. It is a vocabulary guide rather than a prediction engine: the surrounding composition changes how each note is perceived.", [
      ["Use the chart to choose a direction", "Start with familiar impressions and select a few notes you want to explore. Avoid treating one disliked example as proof that every perfume listing that note will be unsuitable."],
      ["Read beyond the reference word", "A creamy sandalwood or earthy patchouli description is a starting association. It does not disclose ingredient sourcing or guarantee the note will dominate a fragrance."],
      ["Turn the chart into a record", "Add your own words after testing a sample. The useful vocabulary is the language that helps you describe preferences consistently, not the number of technical terms you memorize."],
    ], "Choose two notes from the chart, predict their contrast and compare your own words after separate sample wears.", "Use HUME's current note lists to locate compositions for the chart exercise, then choose available discovery samples to test.", "samples"),
  g("What does vanilla smell like in perfume", "Scent notes",
    "Vanilla in perfume often suggests sweetness and rounded warmth, sometimes recalling desserts. Its character can also feel dry, woody or spicy in a blend, so a vanilla note does not mean every perfume will smell like cake.", [
      ["Separate the note from the dessert", "A food association is one possible impression. Surrounding woods, flowers or spice can shift attention away from sweetness and change how the vanilla effect feels."],
      ["Read the whole composition", "Check whether vanilla is mentioned beside fruit, amber, woods or other effects. The note list does not state how much is used or establish natural vanilla content."],
      ["Compare your own sweetness threshold", "Try candidates separately and note whether the warmth remains enjoyable later. A single very sweet example should not define every fragrance listing vanilla."],
    ], "Write whether a vanilla-containing sample feels dessert-like, woody, spicy or mainly part of another impression.", "Compare available HUME vanilla-containing structures below without assuming vanilla is the main character in either.", "samples", ["myself", "eros-flame"]),
  g("What does oud smell like in perfume", "Scent notes",
    "Oud in perfume points toward a woody direction that may feel dark, resinous, smoky or otherwise complex. Oud styles vary widely, and the word in a note list does not prove that a perfume contains natural agarwood oil.", [
      ["Expect different interpretations", "A smooth wood-led perfume can present oud differently from a rose-and-incense composition. Do not assume one strong example represents every fragrance using the name."],
      ["Separate sourcing from smell", "A note describes the intended impression. Natural material content, origin or extraction needs specific documentation rather than an assumption based on the oud label."],
      ["Test the surrounding character", "Record whether you enjoy the woods, smoke, warmth or floral support. What feels appealing may be the full structure rather than oud considered on its own."],
    ], "Compare a wood-and-spice direction with a rose-and-incense direction and note what you perceive as oud-like.", "HUME's oud-listed options below provide contrasting compositions to explore, not a claim about natural oud concentration or origin.", "samples", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("What does rose smell like in perfume", "Scent notes",
    "Rose in perfume can suggest fresh petals, a richer floral impression or powdery and fruit-like nuances. There is no single rose effect across every composition, and the listed note does not establish natural rose oil content.", [
      ["Use a particular rose reference", "A fresh flower, a cosmetic association and a warm floral impression can all suggest different expectations. Describe which one appeals instead of asking for rose as though it were one fixed smell."],
      ["Notice the supporting notes", "Woods, spices, fruit or musks can change the overall character. A perfume listing rose may not feel rose-dominant, especially when other effects are emphasized."],
      ["Avoid gender assumptions", "A rose-containing fragrance can suit anyone who enjoys its balance. Judge the finished scent and your comfort rather than treating the flower name as a gender rule."],
    ], "For a rose-listed sample, write the floral quality you notice and the supporting impression that changes it.", "Compare HUME's rose-containing structures below while checking the live notes; neither is presented as a pure rose soliflore.", "samples", ["homme-intense", "ombre-nomade"]),
  g("What does jasmine smell like in perfume", "Scent notes",
    "Jasmine in perfume often suggests a rich floral impression, but it can be interpreted with green, sweet or musky facets. Its surrounding composition matters, and a jasmine note alone does not reveal extraction, species or material quantity.", [
      ["Leave room for different floral effects", "A fresh floral composition can present jasmine differently from one with warmer or leathery surroundings. Your perception of the complete perfume may be broader than one recognizable flower."],
      ["Read the note wording carefully", "A specific jasmine name can describe a desired character, but it is not a complete sourcing declaration. Use verified product information for questions about natural extracts."],
      ["Compare balance through the wear", "Note whether you enjoy the floral impression alongside its supporting notes. Richness does not automatically mean high projection, and floral does not establish sweetness."],
    ], "Describe whether a jasmine-listed sample feels floral-fresh, warm, green or part of a different overall character.", "HUME's current floral-citrus and leather-containing listings offer different contexts for a jasmine note where available.", "samples", ["myself", "ombre-leather"]),
  g("What does sandalwood smell like in perfume", "Scent notes",
    "Sandalwood in perfume often evokes smooth, rounded wood with a creamy impression. It can support many scent styles, and the note name does not establish the presence, origin or proportion of natural sandalwood oil.", [
      ["Understand the texture word", "Creamy describes an impression of softness and roundness, not dairy content. Some compositions feel drier or more obviously woody depending on their supporting notes."],
      ["Compare wood structures", "Sandalwood alongside spice can feel different from wood with citrus or sweetness. Read the full list rather than expecting every sandalwood-containing perfume to resemble a single reference."],
      ["Keep sourcing claims separate", "If natural origin matters to you, look for specific verified documentation. A catalogue note is a scent clue rather than proof of geography, extraction or sustainability."],
    ], "Describe the wood texture you notice: smooth, dry, warm or another impression, without assuming an ingredient source.", "Use HUME's sandalwood-listed compositions below as contrasting examples, not verified natural-oil claims.", "samples", ["tom-ford-oud-wood", "eros-flame"]),
  g("What does musk smell like in perfume", "Scent notes",
    "Musk in perfume can suggest soft, clean, powdery or warmer skin-like impressions depending on the materials and composition. It is a broad descriptive area, not one exact smell or a guarantee of quiet projection.", [
      ["Expect more than one musk style", "A laundry-like association differs from a warmer, skin-like one. Ask which impression a description means instead of assuming all musky perfumes share the same texture."],
      ["Do not infer animal origin", "A musk note does not establish a particular material source. Claims about animal-derived or synthetic ingredients need actual product documentation rather than interpretation of a note list."],
      ["Evaluate presence separately", "A soft-smelling composition can still be noticeable. Use the sample experience to decide comfort rather than treating musk as a synonym for weak or fragrance-free."],
    ], "Write whether a musky impression reminds you of laundry, powder, skin-like warmth or something different.", "Compare HUME's current musk-containing structures without assuming a particular musk material or strength rating.", "samples", ["allure-sport", "acqua-di-gio-profondo"]),
  g("What does bergamot smell like in perfume", "Scent notes",
    "Bergamot in perfume suggests a bright citrus direction with a possible peel-like, bitter or aromatic edge. It is useful for describing an opening, but the complete perfume can develop far beyond that first citrus impression.", [
      ["Distinguish citrus references", "Lemon, orange and bergamot descriptions can overlap in brightness while suggesting different nuances. Use a familiar peel-like reference without expecting every composition to reproduce the fruit literally."],
      ["Read what follows the opening", "Flowers, woods or warmer effects may become more noticeable later. Enjoying the initial citrus does not establish that you will enjoy the entire perfume."],
      ["Keep the note descriptive", "A bergamot listing does not disclose the extraction or source. It also does not guarantee freshness duration, projection or suitability for a particular climate."],
    ], "Record the opening citrus impression and the later character as two separate descriptions.", "Use the HUME bergamot-containing examples below to compare how different supporting notes change a citrus opening.", "samples", ["sauvage-noir", "myself"]),
  g("What does vetiver smell like in perfume", "Scent notes",
    "Vetiver in perfume is often associated with dry, earthy, woody or grassy impressions, sometimes with a smoky edge. The balance varies, so a vetiver note does not predict one identical smell across every fragrance.", [
      ["Use an earthy reference carefully", "Think of dry roots, wood or grass-like nuances as possible associations rather than a literal formula. A finished perfume may emphasize only part of that range."],
      ["Compare the surrounding direction", "Vetiver listed with iris and woods can sit in a different structure from vetiver beside spice or leather. The note may support the fragrance rather than dominate it."],
      ["Choose by personal texture preference", "You might enjoy dryness but dislike smoke, or prefer an earthy undertone to a stronger impression. Record those differences instead of accepting or rejecting all vetiver fragrances at once."],
    ], "Separate the dryness, earthiness and any smoky impression in your own sample notes.", "Compare the listed HUME vetiver contexts below and judge the overall scent rather than assuming they are dedicated vetiver perfumes.", "samples", ["homme-intense", "spicebomb"]),
  g("What does patchouli smell like in perfume", "Scent notes",
    "Patchouli in perfume can suggest earthy, woody, warm or slightly sweet depth. Its expression depends on the composition, so it should not be reduced to one stereotype or treated as a guaranteed dominant note.", [
      ["Separate association from the whole perfume", "You may connect patchouli with a familiar earthy smell, but floral, citrus or sweeter surroundings can create a different overall effect. Read the structure before predicting the result."],
      ["Listen for depth rather than a solo note", "A perfume may use a patchouli impression as part of its later character. Not identifying it separately does not mean your experience is wrong or the listing is defective."],
      ["Avoid material assumptions", "A listed patchouli note does not disclose natural oil content, processing or origin. Use specific documentation for those questions rather than relying on the descriptive name."],
    ], "Compare a patchouli-listed fragrance before and after its opening changes, noting whether the later character feels earthy or warm.", "Use HUME's current patchouli-containing floral and aromatic structures as different contexts for exploration.", "samples", ["guilty-homme", "myself"]),
  g("What does leather smell like in perfume", "Scent notes",
    "Leather in perfume describes a constructed impression that may feel dry, smoky, smooth or suede-like. It does not mean leather material is dissolved in the bottle, and different leather accords can feel very different.", [
      ["Choose a texture reference", "A soft suede association differs from smoke or a sharper leather-jacket impression. Describing the texture helps narrow what you want to try."],
      ["Notice the supporting notes", "Flowers, spice and woods can soften or emphasize parts of the effect. A leather note does not establish that the fragrance will feel entirely dark, loud or masculine."],
      ["Judge the complete composition", "Try a sample through the later wear and record which part appeals. Do not treat an accord name as an ingredient source or a prediction of personal fit."],
    ], "Describe whether the leather-like effect feels smooth, smoky, dry or another texture before reading the note list again.", "HUME's leather-listed examples below offer different structures for comparison without claiming natural leather extraction.", "samples", ["ombre-leather", "homme-intense"]),
  g("Vanilla perfume for beginners", "Exploring a note",
    "For a first vanilla perfume, decide whether you want dessert-like sweetness, gentle warmth or a woody balance. Compare compositions instead of assuming every fragrance listing vanilla is a similar gourmand.", [
      ["Set a sweetness preference", "Write whether you enjoy sugary associations or want a less dessert-like impression. That distinction is more useful than searching only for the strongest vanilla name."],
      ["Compare different supporting notes", "Flowers, woods or spices can change how a vanilla impression feels. Look beyond the note itself to understand which combination you are actually choosing."],
      ["Retest the later warmth", "A candidate can feel different after a fresh opening changes. Use a repeat wear to decide whether you want that later character in a bottle."],
    ], "Compare one vanilla-listed composition with another and record which supporting impression changes your enjoyment.", "Choose available HUME vanilla-containing samples below as whole-fragrance comparisons, not pure vanilla extracts.", "samples", ["myself", "eros-flame"]),
  g("Oud perfume for beginners", "Exploring a note",
    "Beginners can approach oud by comparing two different woody structures rather than assuming oud must be extremely strong or challenging. Start with the texture you enjoy and keep sourcing claims separate from the scent description.", [
      ["Choose your starting texture", "A smoother wood-and-spice description and a rose-and-incense structure give different routes into the category. Neither represents every interpretation of oud."],
      ["Keep the comparison manageable", "Wear one unfamiliar candidate at a time and note the balance of wood, warmth and other impressions. Do not layer several new fragrances while trying to understand the direction."],
      ["Check the actual offer", "An oud-listed sample does not establish natural agarwood oil content. Review the maker and current product details before deciding whether the composition fits your preference."],
    ], "Write which part of each oud-listed candidate you enjoy rather than scoring how intense you expect oud to be.", "Compare HUME's available wood-and-spice and rose-and-incense options below before committing to a full bottle.", "samples", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("Rose perfume for beginners", "Exploring a note",
    "Start exploring rose perfume by deciding whether you want a fresh floral impression, a softer texture or a warmer blended structure. Rose is not restricted to one gender or one style, and it may be a supporting note rather than the main character.", [
      ["Choose a familiar floral reference", "Describe the rose impression you have in mind instead of relying on the flower name alone. A cosmetic association and a fresh-petal idea create different expectations."],
      ["Read the supporting structure", "Iris, woods or incense can change the character of a rose-containing composition. A listed rose note does not guarantee an isolated flower-like experience."],
      ["Learn from contrasts", "If one candidate does not suit you, identify whether the issue is sweetness, texture or the surrounding notes. Avoid rejecting every rose perfume based on one blend."],
    ], "Describe the rose style you want in two words and compare it with what you perceive later in a sample.", "Use the available HUME rose-containing examples to explore different structures; they are not presented as single-note rose products.", "samples", ["homme-intense", "ombre-nomade"]),
  g("Jasmine perfume for beginners", "Exploring a note",
    "A beginner jasmine search should compare floral character and supporting notes rather than assume all jasmine perfumes are equally sweet or strong. Try different contexts to learn which balance you enjoy.", [
      ["Define the floral experience", "You may want a brighter floral-citrus direction or a warmer impression. Write that preference so the jasmine label becomes a starting point rather than the entire brief."],
      ["Compare different contexts", "A jasmine note with citrus can feel different from one within a leather-containing structure. Use the overall composition to decide what you want to sample."],
      ["Let personal enjoyment lead", "You do not need to identify jasmine separately to enjoy the fragrance. Record whether the floral impression remains comfortable and appealing later in the wear."],
    ], "Compare a floral-citrus and a contrasting jasmine-listed structure, noting the difference rather than hunting one isolated note.", "HUME's current jasmine-containing listings below offer distinct contexts for your first comparison.", "samples", ["myself", "ombre-leather"]),
  g("Sandalwood perfume for beginners", "Exploring a note",
    "Explore sandalwood perfumes by comparing wood texture and surrounding notes. Smooth or creamy impressions may appeal, but the listed note does not guarantee one exact smell, a mild fragrance or natural sandalwood oil.", [
      ["Choose the texture you want", "Decide whether you are curious about soft rounded wood, a drier impression or wood with warmth. Those preferences give you a practical first comparison."],
      ["Read the complete base", "Other woods, amber-like effects or sweet notes may influence the later character. Sandalwood can be part of the support rather than the most noticeable element."],
      ["Compare on separate days", "Record what you enjoy about each composition rather than assuming a product with more woody names is a better introduction. A note list does not show quantities."],
    ], "Use smooth, dry and warm as separate comparison words when trying two sandalwood-listed candidates.", "Explore HUME's available sandalwood-containing options as complete perfumes, without inferring their material origin.", "samples", ["tom-ford-oud-wood", "eros-flame"]),
  g("Musk perfume for beginners", "Exploring a note",
    "For a first musk perfume, choose whether you are curious about clean, powdery or skin-like impressions and test actual presence separately. Musk is a broad descriptive area rather than a single quiet scent.", [
      ["Describe your reference", "Laundry-like softness and warmer skin-like associations can mean different things to you. Name the one you enjoy instead of assuming every musky perfume will provide it."],
      ["Avoid using musk as a strength label", "A smooth impression can still be noticeable. Follow product directions and evaluate comfort without automatically adding more when you stop noticing the scent yourself."],
      ["Compare different compositions", "A musk note with marine freshness can feel different from one with woods or sweetness. The supporting structure matters more than finding the largest number of musk references."],
    ], "Write the musk association you expected and the overall impression you actually noticed in the trial.", "Compare the available HUME musk-containing candidates below, using them as examples rather than measured low-projection recommendations.", "samples", ["allure-sport", "acqua-di-gio-profondo"]),
  g("Bergamot perfume for beginners", "Exploring a note",
    "A first bergamot-led exploration starts with citrus brightness but should include the later scent. Choose the supporting structure you enjoy rather than buying a bottle solely for its opening note.", [
      ["Use a citrus reference", "Think about whether you enjoy peel-like brightness, bitterness or a softer citrus impression. The finished fragrance may suggest only part of that reference."],
      ["Compare what follows", "Flowers, aromatic notes and woods can lead a citrus opening in different directions. Read the heart and base before selecting your tests."],
      ["Keep the opening in perspective", "An enjoyable first spray is useful information, but your purchase includes the whole composition. Return later and decide whether you still want to wear it."],
    ], "Give each candidate an opening description and a later description, then judge which pair you enjoy most.", "Try HUME's contrasting bergamot-containing structures below to learn which supporting direction suits your preference.", "samples", ["sauvage-noir", "myself"]),
  g("Vetiver perfume for beginners", "Exploring a note",
    "Beginners exploring vetiver can start with dry, earthy or woody impressions and compare how they sit in different blends. You do not need to prefer smoke or recognize a raw material to enjoy a vetiver-containing perfume.", [
      ["Choose a particular quality", "Decide whether dryness, earthiness or a grass-like impression sounds appealing. This makes your first test clearer than asking whether vetiver as a whole is for you."],
      ["Read its supporting role", "A vetiver listing alongside iris and wood suggests a different context from spice and leather. Neither guarantees the note will dominate your perception."],
      ["Use an ordinary wearing occasion", "Try a candidate in an appropriate routine and note whether its texture remains enjoyable. Do not buy a bottle merely to learn to tolerate a style you find uncomfortable."],
    ], "Record the dry, earthy and other qualities you enjoy separately before deciding on the next vetiver test.", "Use the available HUME vetiver-containing listings below for contrast rather than expecting single-note vetiver products.", "samples", ["homme-intense", "spicebomb"]),
  g("Patchouli perfume for beginners", "Exploring a note",
    "For a first patchouli perfume, compare the earthy or warm impression within the whole composition. A floral or aromatic blend can give a different introduction from the stereotype you may associate with patchouli alone.", [
      ["Start with a known preference", "If you enjoy floral or citrus directions, inspect a patchouli-containing example in that context. It can be easier to understand a new note beside familiar supporting impressions."],
      ["Observe the later character", "Record whether the fragrance becomes warmer, earthier or simply more rounded to you. There is no requirement to name patchouli separately for the trial to be useful."],
      ["Choose from actual experience", "If a candidate does not suit you, identify the quality that bothered you. That is more useful than deciding every patchouli listing will smell identical."],
    ], "Describe the full sample first, then note whether the patchouli listing helps explain any part of your later impression.", "Compare HUME's current aromatic and floral patchouli-containing options below as complete fragrances.", "samples", ["guilty-homme", "myself"]),
  g("Leather perfume for beginners", "Exploring a note",
    "A beginner leather exploration should compare texture rather than assume the category is always loud or smoky. Smooth, dry and suede-like associations can appear in different combinations with flowers, woods or spice.", [
      ["Name the leather reference", "Think about whether a soft suede idea or a drier leather-jacket impression appeals. Those are comparison words, not ingredient claims about the product."],
      ["Try a contrasting support", "A leather note with iris can feel different from one beside jasmine or warm effects. Read the complete structure before choosing your first sample."],
      ["Check the whole wear", "Note how the balance develops and whether you want to wear it again in your intended setting. A dramatic first impression is not a requirement for a successful introduction."],
    ], "Use texture words to compare two leather-listed candidates instead of ranking them only by intensity.", "Explore HUME's available leather-containing structures below without assuming either contains literal leather material.", "samples", ["ombre-leather", "homme-intense"]),
  g("Best vanilla perfume samples", "Note-led samples",
    "The best vanilla perfume samples for you are the ones that help distinguish your preferred sweetness and supporting notes. Compare contrasting compositions rather than treating the word vanilla or a popularity ranking as a personal-fit guarantee.", [
      ["Build a purposeful comparison", "Select one vanilla-containing structure with floral support and another with woody or spicy elements if available. The point is to compare balance, not count how many vanilla products you can collect."],
      ["Judge later warmth", "Record whether the later sweetness feels enjoyable, too dessert-like or well balanced. Compare on separate wears so you can remember each candidate's character."],
      ["Check what is actually sold", "A perfume may list vanilla without being vanilla-dominant. Review sample eligibility and whether testers are sold in a kit before treating a suggested product as an individual sample offer."],
    ], "Choose two different vanilla-containing note structures and write the specific uncertainty each trial should resolve.", "The HUME products below are composition examples, not independent award winners. Check the discovery builder for their current sample availability.", "samples", ["myself", "eros-flame"]),
  g("Best oud perfume samples", "Note-led samples",
    "Useful oud perfume samples compare different woody structures and help you decide what you enjoy. Best is personal here: no sample list can guarantee preference, natural oud content or a fixed performance result.", [
      ["Compare styles rather than reputation", "A wood-and-spice direction and a rose-and-incense direction can reveal different preferences. Start with that contrast instead of choosing only the most intense description."],
      ["Use one trial at a time", "Note the wood texture, warmth and any smoky or floral support. Return to the stronger favorite before committing to a bottle, without assuming stronger projection makes it better."],
      ["Verify identity and availability", "Check who makes the samples and whether an oud claim is a note description or a documented material statement. Review current builder choices rather than assuming every listed bottle is sampleable."],
    ], "Write which oud-style candidate you want to wear again and identify the supporting impression responsible.", "Compare the available HUME oud-listed compositions below, then confirm sample choices in the discovery builder.", "samples", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("Best rose perfume samples", "Note-led samples",
    "Good rose perfume samples should help you compare floral texture and supporting notes. A rose listing does not establish a pure rose fragrance, and the best choice depends on what kind of floral experience you enjoy.", [
      ["Choose different contexts", "Compare a softer iris-containing structure with a warmer rose-and-incense direction if those interest you. This reveals more than selecting several nearly identical descriptions."],
      ["Record the actual floral impression", "Write whether rose seems prominent, blended into the composition or difficult to isolate. You can enjoy the complete fragrance even if the listed rose is not obvious to you."],
      ["Keep recommendations accurate", "Product examples should be presented as note-containing candidates rather than guaranteed rose-dominant perfumes. Verify the current kit choices and order format before paying."],
    ], "Describe the floral texture and the surrounding character of each sample before selecting your favorite.", "Use the HUME rose-containing examples below for comparison and check their current eligibility in the discovery builder.", "samples", ["homme-intense", "ombre-nomade"]),
];

const byTitle = (title: string) => BEGINNER_GUIDES_BATCH_THREE.find(guide => guide.title === title)!;

byTitle("Perfume scent families explained").chart = {
  headers: ["Direction", "Useful starting references", "Remember"],
  rows: [["Fresh", "Citrus, green, marine or aromatic impressions", "Fresh does not establish strength"], ["Floral", "Flower-like character", "Can overlap with fruit, woods or warmth"], ["Woody", "Dry or smooth wood-like textures", "Different woods suggest different effects"], ["Amber", "Warm, resinous or rounded impressions", "A descriptive direction, not fossilized amber"]],
};
byTitle("Top middle and base notes meaning").chart = {
  headers: ["Description", "What it helps describe", "What it does not establish"],
  rows: [["Top / opening", "The initial impression", "The full later experience"], ["Middle / heart", "Developing central character", "An isolated timed ingredient stage"], ["Base / later character", "The later impression and support", "Guaranteed hours of wear"]],
};
byTitle("Perfume notes chart for beginners").chart = {
  headers: ["Note", "Possible scent references", "Useful contrast to explore"],
  rows: [["Vanilla", "Sweetness or rounded warmth", "Dessert-like vs woody"], ["Oud", "Dark or resinous woods", "Smooth woods vs incense support"], ["Rose", "Floral, sometimes powdery or fruit-like", "Fresh petals vs warmer blend"], ["Jasmine", "Rich floral with varying facets", "Citrus support vs warmer structure"], ["Sandalwood", "Smooth or creamy wood", "Rounded vs drier texture"], ["Musk", "Clean, powdery or skin-like", "Laundry-like vs warm"], ["Bergamot", "Bright, peel-like citrus", "Opening brightness vs later warmth"], ["Vetiver", "Dry, earthy or grassy wood", "Dryness vs smoky impression"], ["Patchouli", "Earthy, woody or warm depth", "Floral support vs earthiness"], ["Leather", "Smooth, dry, smoky or suede-like", "Soft texture vs sharper edge"]],
};

byTitle("Perfume scent families explained").sources = [{ title: "Michael Edwards: fragrance wheel", url: "https://www.fragrancesoftheworld.com/fragrancewheel/" }];
byTitle("What does amber smell like in perfume").sources = [{ title: "The Perfume Society: amber", url: "https://perfumesociety.org/ingredients-post/amber/" }];
const noteSources = { vanilla: "vanilla", oud: "agarwood", rose: "rose", jasmine: "jasmine-2", sandalwood: "sandalwood", musk: "musk", bergamot: "bergamot", vetiver: "vetiveria", patchouli: "patchouli", leather: "leather" };
for (const [note, slug] of Object.entries(noteSources)) {
  const title = `What does ${note} smell like in perfume`;
  byTitle(title).sources = [{ title: `The Perfume Society: ${note}`, url: `https://perfumesociety.org/ingredients-post/${slug}/` }];
  for (const item of BEGINNER_GUIDES_BATCH_THREE) {
    if (item.title === title || item.title === `${note[0].toUpperCase()}${note.slice(1)} perfume for beginners` || item.title === `Best ${note} perfume samples`) item.requiredNote = note;
  }
}
