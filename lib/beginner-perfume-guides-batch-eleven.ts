import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string, productIds: string[] = []): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep: "samples", productIds };
}

export const BEGINNER_GUIDES_BATCH_ELEVEN: BeginnerGuide[] = [
  g("Light perfumes for hot humid weather", "Light weather choices", "For hot humid weather, decide whether light means airy character, restrained sweetness or little surrounding presence. Those preferences need different comparisons, and none guarantees a fixed wear time.", [
    ["Define the lightness", "Write the quality you want before selecting notes. A citrus description alone cannot certify quiet projection."],
    ["Observe after movement", "Assess a candidate after ordinary travel and again indoors rather than only at its first spray."],
    ["Allow a quieter result", "Close-range enjoyment can be sufficient. Do not add more simply to make a light preference noticeable at a distance."],
  ], "Choose one meaning of light and score that quality after a normal humid-day journey.", "Use HUME's softer preference shortlist as a starting point, then verify actual presence with individual discovery samples."),
  g("Light perfumes for dry summer heat", "Light weather choices", "A light perfume for dry summer heat should feel enjoyable through your actual routine. Airy texture and low projection are separate qualities, so evaluate the exact product rather than its light label.", [
    ["Separate scent and climate language", "Dry air does not require a dry-smelling fragrance. Choose the texture you want to experience."],
    ["Compare the indoor transition", "Record arrival and later character if a hot journey leads to a cooler destination."],
    ["Keep application consistent", "Follow directions and note the applicator. Changing the amount between trials makes comparisons harder."],
  ], "Describe the candidate's texture and presence separately during a dry-summer routine.", "Compare HUME samples for your preferred airy impression without assuming any listed note ensures dry-heat performance."),
  g("Light perfumes for cool winter days", "Light weather choices", "Light perfume can remain a satisfying choice on cool winter days. You do not need to replace a quiet favorite with a richer fragrance merely because the calendar changes.", [
    ["Retest the existing favorite", "Check whether you still enjoy its later character before planning a seasonal purchase."],
    ["Consider shared daytime spaces", "A cool outdoor day can include close office seating. Restrained presence may still be your preferred result."],
    ["Judge satisfaction", "A scent does not need to fill a room to serve your routine. Decide whether the personal experience is enough."],
  ], "Wear your light favorite through a normal cool day and record whether you actually miss a richer texture.", "Explore a different HUME sample only if it answers a clear winter preference question your current fragrance leaves open."),
  g("Light perfumes for winter evenings", "Light weather choices", "For winter evenings, a light fragrance can suit close dining or your preference for a personal scent experience. Evening wear does not require heavy sweetness or large projection.", [
    ["Use the venue as the boundary", "Long dinner seating matters more than the cold street outside. Keep the closest setting in mind."],
    ["Choose familiar development", "Try the full scent beforehand; a gentle opening does not establish every later stage."],
    ["Avoid compensating for quietness", "Do not layer an unfamiliar stronger fragrance just to make the choice feel more appropriate for night."],
  ], "Choose a light evening candidate by later enjoyment and the distance of the planned seating.", "Use HUME discovery trials ahead of the evening to find a quieter preference rather than following a mandatory winter-night style."),
  g("Light perfumes for rainy days", "Light weather choices", "A light rainy-day fragrance can provide a preferred quiet mood, but it does not solve damp clothing or resist rain. Select for your journey and the indoor spaces you share.", [
    ["Define the desired impression", "Airy, low-sweetness and close-wearing are different goals. Choose one clear comparison question."],
    ["Check after arrival", "Describe the later scent once travel is complete. A rainy opening sniff is not the whole wearing experience."],
    ["Keep use considerate", "Avoid spraying in covered queues or shared vehicles. Normal hygiene serves a different purpose from perfume."],
  ], "Record what light means to you at arrival after a normal rainy-day journey.", "Build HUME discovery choices around a quiet preference, without treating a sample or fresh note as weatherproof."),
  g("Light perfumes for tropical holidays", "Light weather choices", "For a tropical holiday, a tested light fragrance can simplify shared travel and close dining. Choose a familiar scent you enjoy rather than assuming small size or beach imagery establishes suitability.", [
    ["Plan a useful selection", "One known favorite may cover the activities you actually expect. Exploration can happen before the trip."],
    ["Respect shared spaces", "Flights, buses and accommodation can require little fragrance or none. Follow relevant rules."],
    ["Check carrying requirements", "Review current route restrictions and storage directions. Protect the container from prolonged heat."],
  ], "Match one tested light favorite to your real itinerary before deciding what deserves luggage space.", "Try HUME samples before departure, allowing for current preorder timing and checking the listed format before packing."),
  g("Light perfumes for summer office days", "Light weather choices", "For summer office days, a light perfume should meet policy and remain considerate through travel and shared work. A soft description is a shortlist clue rather than evidence of measured low projection.", [
    ["Check permission first", "A fragrance-free office makes a work-fragrance purchase unnecessary, regardless of lightness."],
    ["Trial outside work", "Learn the exact candidate's later character and presence before introducing it during meetings."],
    ["Avoid awareness-led top-ups", "Your own reduced perception does not establish that colleagues cannot notice the scent."],
  ], "Assess a quiet office candidate against policy, arrival comfort and later presence in that order.", "Use HUME's softer quiz preference for direction and discovery samples for actual wearing evidence before workplace use."),
  g("Light perfumes for summer evenings", "Light weather choices", "A light summer-evening fragrance can suit a relaxed personal mood without needing to announce itself. Choose the later scent you enjoy and account for any close indoor portion of the plan.", [
    ["Name the evening feel", "Airy freshness and gentle warmth offer different experiences. Light does not mean only one scent family."],
    ["Consider what already remains", "If you wore perfume earlier, assess it before adding another product for the evening."],
    ["Choose ahead of time", "Test unfamiliar candidates on earlier days rather than combining several samples before leaving."],
  ], "Describe the quiet evening mood you want and choose a previously tested candidate that supports it.", "Compare HUME discovery directions before the occasion, letting later enjoyment determine your light evening favorite."),
  g("Light perfumes for outdoor summer events", "Light weather choices", "Light fragrance can be a valid outdoor-event preference even if it stays personal. You do not need to increase application until other guests can identify a scent trail.", [
    ["Define success personally", "Enjoying a close-range scent can be enough. Outdoor noticeability is not the only useful outcome."],
    ["Include enclosed transitions", "Transport, queues and sheltered seating may make a quiet preference especially practical."],
    ["Carry only when useful", "Check venue rules and follow storage guidance before taking a container. Reapplication is optional."],
  ], "Set an outdoor trial goal based on personal enjoyment rather than distant projection.", "Use a HUME sample before the event to evaluate a lighter preference without assuming notes can certify its actual presence."),
  g("Light perfumes for air conditioned environments", "Light weather choices", "Light perfume can suit air-conditioned environments when you enjoy a quieter experience. Cooler air does not require stronger application or a switch to rich fragrance.", [
    ["Identify the room's purpose", "An office, meal and private evening have different expectations. Follow any fragrance restrictions."],
    ["Observe later texture", "A quiet dry down may remain pleasant. Describe it before treating reduced opening brightness as failure."],
    ["Separate adaptation from absence", "Not noticing your perfume continuously is not proof that more is needed in the room."],
  ], "Record whether the later close-range experience satisfies your indoor preference without adding another application.", "Compare HUME samples for quieter indoor enjoyment rather than buying from an assumed air-conditioning performance rule."),
  g("Long lasting fragrances for hot humid weather", "Weather longevity", "For lasting fragrance in hot humid conditions, compare the exact product through repeated ordinary wears. A strong opening, an EDP label or an oud note cannot guarantee the duration you want.", [
    ["Define lasting for your use", "Decide whether you want later close-range enjoyment or ongoing surrounding presence. Those are different targets."],
    ["Log relevant conditions", "Record activity, travel, indoor time and the applicator. Humidity alone cannot explain every change."],
    ["Assess before topping up", "Your own fading awareness is not proof of disappearance. Extra application can obscure the original trial."],
  ], "Create a humid-day log separating later character, close-range scent and surrounding presence.", "Use individual HUME samples to compare your own wear results; discovery is a testing route rather than a guaranteed longevity rating."),
  g("Long lasting fragrances for dry summer heat", "Weather longevity", "To find lasting fragrance for dry summer heat, assess later enjoyment in your actual routine instead of choosing solely by concentration or price. No format supplies a universal number of hours.", [
    ["Check exact identity", "Save the maker, version and applicator so later comparisons refer to the same product."],
    ["Include the transition", "A hot journey followed by a cool destination creates different stages. Record each rather than one final strength score."],
    ["Repeat the favorite", "A second appropriate wear is stronger personal evidence than one unusual day or an online performance promise."],
  ], "Compare a candidate at arrival and later indoors on two ordinary dry-heat days.", "Use HUME sample notes to choose a repeat-trial favorite before buying a bottle for expected summer duration."),
  g("Long lasting fragrances for cool winter days", "Weather longevity", "Lasting winter-day fragrance should be judged by the exact scent you still enjoy later. A warm or woody description does not automatically establish longer wear than a fresh composition.", [
    ["Choose enjoyable persistence", "A remaining scent is not valuable if you dislike its later character. Track pleasure alongside detectability."],
    ["Compare the normal routine", "Include clothing, activity and indoor time as context without pretending equal sprays produce equal doses."],
    ["Avoid buying strength alone", "Your work or study setting may favor quieter presence even when you want a later trace."],
  ], "Score later enjoyment separately from how noticeable each winter-day candidate remains.", "Compare HUME structures from different directions rather than assuming the richest listed notes must win on winter longevity."),
  g("Long lasting fragrances for winter evenings", "Weather longevity", "For winter evenings, seek a tested later scent that suits the event rather than a promise of all-night projection. A fragrance can remain enjoyable while becoming less expansive.", [
    ["Set the event requirement", "A close dinner and an outdoor gathering need different presence. Duration should serve the setting."],
    ["Follow the development", "Record what replaces the opening and whether it is the texture you want through the evening."],
    ["Use a familiar routine", "Avoid unfamiliar layering or repeated top-ups when assessing persistence. They change what you are comparing."],
  ], "Run an earlier evening-length trial and note both the remaining character and your wish to wear it again.", "Use HUME discovery samples to learn the later stages before committing to a supposedly all-night fragrance."),
  g("Long lasting fragrances for rainy days", "Weather longevity", "For rainy-day longevity, compare how an exact perfume wears through your normal journey and indoor routine. Rain-proof and humidity-proof are not reliable substitutes for personal evidence.", [
    ["Record the journey", "Covered waits, damp outerwear and shared travel change the context. Do not attribute every observation to rain alone."],
    ["Keep the trial clear", "Try one unfamiliar scent at a time and note the original application. Avoid refreshing before the planned observation."],
    ["Choose a useful later result", "A quieter pleasant trace may serve your day better than strong presence in a crowded room."],
  ], "Compare the later scent after arrival and at another ordinary checkpoint during a rainy-day routine.", "Keep HUME sample identities in your log so repeated rainy-day observations can inform a specific bottle choice."),
  g("Long lasting fragrances for tropical holidays", "Weather longevity", "For a tropical holiday, choose a fragrance whose later character you have already enjoyed rather than relying on a travel durability claim. Persistent scent and comfortable shared-space presence are separate goals.", [
    ["Test before departure", "Use comparable ordinary activity where possible. Do not make the trip your first experience of the entire dry down."],
    ["Keep carrying optional", "Reapplication is not compulsory. Check current transport requirements before packing any container."],
    ["Protect the product", "Follow storage directions and avoid prolonged heat. A lasting-wear goal is not a reason to leave perfume in a hot vehicle."],
  ], "Choose a tested holiday favorite using later enjoyment, shared-space fit and practical packing needs.", "HUME discovery trials can settle a travel preference before departure if current preorder timing leaves enough comparison days."),
  g("Long lasting fragrances for summer office days", "Weather longevity", "A lasting summer-office fragrance should provide an enjoyable later scent without overriding workplace policy or colleagues' comfort. All-day loudness is not a necessary office goal.", [
    ["Set the policy filter", "Skip fragrance where required. A longevity rating cannot make an unwelcome scent appropriate."],
    ["Separate persistence and projection", "A close-range later trace can meet your needs without filling meeting rooms."],
    ["Avoid desk-side refreshes", "Your own adaptation is not an instruction to apply more. Keep any application away from shared air."],
  ], "Define the later office scent you want without using room-filling projection as the success measure.", "Evaluate HUME samples on suitable earlier days before choosing a regular work bottle from expected performance."),
  g("Long lasting fragrances for summer evenings", "Weather longevity", "For summer evenings, lasting wear means a later experience you enjoy in the planned setting. Do not assume a heavy formula or extra sprays will produce the most suitable result.", [
    ["Consider the starting point", "If daytime perfume remains, assess it before adding a second scent. Mixing makes duration harder to judge."],
    ["Trial the full character", "A bright opening and warmer dry down may feel different. Choose from both stages."],
    ["Match venue proximity", "A persistent scent still needs restraint around a dinner table or shared transport."],
  ], "Test a candidate before the evening and record whether the later character fits the closest venue on your plan.", "Use HUME samples to find an enjoyable later summer-evening scent without a fixed-hours or attraction promise."),
  g("Long lasting fragrances for outdoor summer events", "Weather longevity", "Outdoor summer longevity should be judged from relevant wear experience, not a family name or maximum spray rule. Open air does not create a requirement for constant distant noticeability.", [
    ["Define the desired result", "Distinguish personal later enjoyment from a surrounding scent trail. Decide which actually matters to you."],
    ["Use comparable activity", "Record the exact sample and ordinary conditions before the event. Do not deliberately heat the bottle."],
    ["Plan the shared transitions", "Long-lasting presence must still be considerate in shuttles, queues and covered seating."],
  ], "Record close-range and surrounding presence as separate observations during a suitable outdoor trial.", "Compare HUME discovery candidates before the event rather than inferring endurance from oud, wood or sports-style descriptions."),
  g("Long lasting fragrances for air conditioned environments", "Weather longevity", "In air-conditioned environments, judge longevity by the exact product and your routine rather than assuming cool air always extends or reduces wear. Separate a later trace from your continuous awareness of it.", [
    ["Identify the room use", "An office, restaurant and private room call for different presence. Policy remains relevant."],
    ["Keep observation intervals useful", "Check the later character at normal breaks instead of repeatedly smelling the same spot."],
    ["Avoid automatic extra application", "Reduced awareness alone does not prove the perfume has gone. Consider the people nearby before adding more."],
  ], "Create two natural indoor checkpoints and record the later scent without intervening top-ups.", "Use HUME sample wear notes to compare persistence in your actual indoor routine rather than a generic AC rating."),
  g("Perfume samples to try for hot humid weather", "Weather sample trials", "For hot humid weather, choose samples that compare distinct textures you enjoy rather than several products promising extreme strength. The trial should clarify later comfort and appropriate presence.", [
    ["Choose meaningful contrast", "Marine freshness and citrus-and-tea provide different starting questions. Keep strong dislikes outside the shortlist."],
    ["Use separate suitable days", "One unfamiliar fragrance at a time makes development easier to describe. Record heat, activity and indoor time."],
    ["Return to the favorite", "Repeat a promising candidate before choosing a bottle. One appealing opening is not the complete result."],
  ], "Select two distinct sample directions and assign each a separate ordinary humid-day trial.", "HUME's marine and citrus-and-tea listings are notes-based candidates for your discovery comparison.", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("Perfume samples to try for dry summer heat", "Weather sample trials", "For dry summer heat, a useful sample comparison covers different scent structures and your outdoor-to-indoor transition. Avoid choosing only by claimed concentration or bottle size.", [
    ["Pick contrasting structures", "Compare citrus woods with a marine direction if both interest you. Notes suggest a trial rather than predict the finished smell."],
    ["Track arrival and later wear", "Record each stage after normal travel and time indoors. Do not turn a trial into deliberate heat exposure."],
    ["Check the exact product", "Save the maker and version. An inspired perfume and a designer original are not interchangeable samples."],
  ], "Build a dry-heat trial sheet with exact identity, arrival character and later enjoyment.", "Compare HUME's citrus-and-wood and marine samples as its own fragrances using current listing details.", ["bleu-de-chanel", "acqua-di-gio-profondo"]),
  g("Perfume samples to try for cool winter days", "Weather sample trials", "For cool winter days, choose samples that reveal whether you want a different texture from your usual favorite. A winter set does not need to contain only rich or sweet scents.", [
    ["Keep a familiar reference", "Use what you already enjoy as the baseline before adding an unfamiliar direction."],
    ["Explore one useful difference", "Softer woods and floral warmth can provide contrast without assuming either is inherently longer lasting."],
    ["Choose from later enjoyment", "Record the dry down and whether you want another wear. Exploration need not end in several bottle purchases."],
  ], "Compare your known favorite with two samples that each add a different winter-day texture.", "HUME's softer wood-containing and floral-woody candidates can start a cool-day preference comparison.", ["gypsy-water", "myself"]),
  g("Perfume samples to try for winter evenings", "Weather sample trials", "A winter-evening sample comparison should explore the moods you enjoy before the occasion. Smooth wood, spice or freshness can all be candidates without a mandatory heavy-scent rule.", [
    ["Choose contrasting evening textures", "Select structures whose differences you can explain rather than several nearly identical warm descriptions."],
    ["Trial before social plans", "Observe the later development on earlier suitable days. Avoid opening the whole kit before dinner."],
    ["Match the venue", "A favorite still needs considerate presence during close seating. Nighttime is not permission for unlimited application."],
  ], "Give each evening sample a texture-based reason to try it before assigning separate trial days.", "Compare HUME's wood-and-spice and spice-led candidates without treating either as a guaranteed winter-evening winner.", ["tom-ford-oud-wood", "spicebomb"]),
  g("Perfume samples to try for rainy days", "Weather sample trials", "Rainy-day samples are useful when they compare your arrival experience after normal travel. Choose a fresh direction and a contrasting texture rather than looking for a waterproof perfume claim.", [
    ["Plan a clear question", "Decide whether you want brightness, dry texture or softer warmth after the journey."],
    ["Keep the trial separate", "Use one unfamiliar sample at a time and record the exact name. Avoid spraying around people sheltering nearby."],
    ["Assess the real outcome", "Note scent enjoyment independently from damp clothing or travel discomfort. Perfume serves a different role from hygiene."],
  ], "Assign rainy-day samples an arrival-time comparison rather than judging them only before departure.", "Use HUME discovery choices for distinct rainy-day preferences, with a second wear for any promising candidate."),
  g("Perfume samples to try for tropical holidays", "Weather sample trials", "For tropical holidays, try samples before leaving so the packed fragrance is familiar. The useful shortlist covers real activities rather than every imagined vacation mood.", [
    ["Keep the selection purposeful", "Choose a couple of contrasting directions that match known likes. Beach imagery is not a performance rating."],
    ["Allow trial time", "Observe the later scent and repeat the favorite before the departure date."],
    ["Review travel details", "Check current route restrictions, closure and storage guidance. Small samples are not automatically exempt from rules."],
  ], "Set a pre-departure sampling schedule and choose a known favorite before deciding what to pack.", "HUME's selectable discovery kit can support pre-trip exploration when current preorder timing allows.", ["lv-imagination", "allure-sport"]),
  g("Perfume samples to try for summer office days", "Weather sample trials", "For summer office days, choose samples to assess restraint and later enjoyment before workplace use. No discovery selection can override a fragrance-free policy.", [
    ["Start with the office rule", "Decide whether fragrance belongs in the workplace at all before purchasing specifically for it."],
    ["Compare away from work", "Use suitable earlier days to assess exact products. A fresh notes list does not establish quiet presence."],
    ["Evaluate a useful favorite", "One appropriate regular scent can be enough. There is no need to turn all kit contents into work bottles."],
  ], "Filter the office shortlist by policy before comparing arrival comfort and later presence.", "HUME's marine and citrus-and-wood candidates provide different sample directions without measured office-suitability claims.", ["acqua-di-gio-profondo", "bleu-de-chanel"]),
  g("Perfume samples to try for summer evenings", "Weather sample trials", "Summer-evening samples can explore a brighter or softer mood before your plans. Choose from actual later wear rather than deciding that every evening fragrance must be rich.", [
    ["Select a meaningful contrast", "Citrus-and-tea brightness and softer woods offer different questions to explore."],
    ["Trial ahead of the evening", "Give each sample its own suitable day and note its development. Avoid unfamiliar layering just before leaving."],
    ["Check the final setting", "A restaurant or shared ride can set tighter presence limits than the outdoor start of the evening."],
  ], "Choose a summer-evening favorite only after comparing both its opening and later venue-relevant character.", "Try HUME's brighter and softer wood-containing options on separate days before selecting an evening candidate.", ["lv-imagination", "gypsy-water"]),
  g("Perfume samples to try for outdoor summer events", "Weather sample trials", "For outdoor summer events, samples should help you compare scent enjoyment in relevant ordinary conditions. They are not a way to certify exact projection distance or all-day endurance.", [
    ["Choose for the itinerary", "Include the outdoor activity and enclosed transitions when deciding which directions interest you."],
    ["Record the exact applicator", "Sample sprays may differ from full-bottle sprays. Equal counts are not necessarily equal amounts."],
    ["Decide before departure", "Trial candidates beforehand and check event rules before carrying a container. Keep bottles out of prolonged heat."],
  ], "Compare two samples during suitable earlier routines, recording both personal enjoyment and shared-space presence.", "HUME's marine and citrus-aromatic structures are contrasting notes-based event candidates to evaluate yourself.", ["acqua-di-gio-profondo", "allure-sport"]),
  g("Perfume samples to try for air conditioned environments", "Weather sample trials", "For air-conditioned environments, sample around the room's actual use and your desired scent texture. Cooler air alone is not a reason to shortlist only rich fragrances.", [
    ["Define the indoor occasion", "Work, meals and private relaxation call for different presence. Check any relevant rules."],
    ["Compare complete structures", "A bright direction and smooth woods can reveal distinct preferences through their later stages."],
    ["Use natural checkpoints", "Observe during ordinary breaks rather than repeatedly smelling the same spot or automatically refreshing."],
  ], "Choose two different textures and compare their later indoor character at normal breaks.", "HUME's citrus-and-tea and wood-and-spice candidates can support an indoor texture comparison without an AC-performance rating.", ["lv-imagination", "tom-ford-oud-wood"]),
  g("How to choose perfume for hot humid weather", "Weather selection", "Choose perfume for hot humid weather by defining your preferred texture, testing during a normal routine and judging later comfort. Avoid treating humidity as a single predictor of performance.", [
    ["Write a clear brief", "Name liked directions, strong dislikes and the closest shared setting. This makes browsing more useful."],
    ["Compare realistic wears", "Record heat, activity and indoor time with the exact product. Keep one unfamiliar candidate per trial."],
    ["Choose after a repeat", "Return to the favorite before buying more. Pleasant later scent and appropriate presence matter alongside duration."],
  ], "Write a humid-weather brief with texture, proximity and later-wear goals before opening the catalogue.", "Use HUME's quiz for direction and discovery choices to resolve how shortlisted fragrances actually feel in your routine."),
  g("How to choose perfume for dry summer heat", "Weather selection", "Choose for dry summer heat by assessing your complete outdoor-to-indoor day and preferred later scent. Neither an oil format nor high concentration automatically solves a climate preference.", [
    ["Map the daily transition", "Note how long you travel and where you spend most of the day. The destination may matter more than the hottest moment."],
    ["Select a clear contrast", "Compare two genuinely different structures rather than near-duplicates with similar performance claims."],
    ["Review before buying", "Record exact identity and repeat the favorite. Follow normal product directions instead of inventing a heat-specific dose."],
  ], "Use the longest part of your dry-summer routine as the main criterion for a two-candidate comparison.", "Build HUME discovery choices around that comparison, selecting the eventual bottle from your repeat-wear notes."),
  g("How to choose perfume for cool winter days", "Weather selection", "Choose a cool-winter-day perfume by asking whether your usual favorite still satisfies you. A different season can inspire exploration without creating a requirement for another bottle.", [
    ["Identify the missing experience", "Perhaps you want smoother woods or softer warmth. Name that difference rather than simply requesting winter strength."],
    ["Keep daytime constraints", "Shared offices and classes still need considerate presence. Cool weather does not remove policy."],
    ["Compare later enjoyment", "A familiar fresh scent may remain the favorite. Let the trial outcome decide rather than the seasonal label."],
  ], "Write one reason to change texture and one reason to keep your existing cool-day favorite.", "Use HUME samples to explore the named difference without treating winter as a compulsory collection update."),
  g("How to choose perfume for winter evenings", "Weather selection", "Choose a winter-evening perfume by the venue, preferred texture and a familiar dry down. Warmth, sweetness and projection are separate preferences, not one automatic night-scent package.", [
    ["Describe the actual occasion", "A dinner, walk and crowded celebration create different proximity. Let the closest portion set the boundary."],
    ["Choose your texture", "Smooth woods, dry spice and freshness can all be considered. Avoid selecting solely from a rich-looking bottle."],
    ["Rehearse before the event", "Observe the complete scent on an earlier day, especially if the perfume is unfamiliar."],
  ], "Create an evening brief containing venue, desired texture and a tested presence level.", "Compare HUME discovery samples ahead of the occasion and choose from actual development rather than an evening stereotype."),
  g("How to choose perfume for rainy days", "Weather selection", "Choose rainy-day perfume around the journey, arrival and indoor setting you actually experience. Rainy weather does not require a waterproof scent or extra perfume to cover dampness.", [
    ["Name the desired mood", "Fresh brightness, dry woods and gentle warmth are different preference routes. Choose one question to explore."],
    ["Observe at arrival", "Assess the later scent after normal travel rather than making the entire decision before departure."],
    ["Keep the routine separate", "Wet clothing and hygiene need their own attention. Apply fragrance away from shared shelter and vehicles."],
  ], "Choose a rainy-day candidate by arrival enjoyment and indoor presence after defining the mood you want.", "Use HUME samples for a focused rainy-routine comparison, keeping product identity and later impressions in your notes."),
  g("How to choose perfume for tropical holidays", "Weather selection", "Choose tropical-holiday perfume from your actual itinerary and a tested preference. One familiar favorite can be enough; destination imagery does not establish cooling, sun protection or durability.", [
    ["List real activities", "Shared travel, indoor dining and outdoor plans require different restraint. Avoid packing for imagined occasions."],
    ["Settle the scent early", "Give unfamiliar candidates separate trials before the trip and repeat a promising favorite."],
    ["Check practical requirements", "Review current transport rules, secure closure and storage instructions. Avoid prolonged heat."],
  ], "Choose a holiday favorite only after matching it to the real itinerary and checking current packing requirements.", "Plan HUME discovery trials before departure, allowing for preorder timing rather than relying on last-minute delivery."),
  g("How to choose perfume for summer office days", "Weather selection", "Choose a summer-office fragrance by checking policy first, then assessing arrival comfort and later presence. The best personal choice may be a familiar restrained scent or no fragrance.", [
    ["Use policy as the first filter", "Do not begin with strength or note rankings if the workplace restricts fragrance."],
    ["Compare on suitable earlier days", "Learn the exact product's full character before introducing it to close meetings."],
    ["Choose a manageable routine", "Avoid desk-side spraying and top-ups driven only by reduced self-awareness. Consider colleagues' comfort."],
  ], "Write a summer-office brief in this order: permission, proximity, preferred character and budget.", "Use HUME's quiz to narrow directions, then assess a sample before choosing a regular work bottle."),
  g("How to choose perfume for summer evenings", "Weather selection", "Choose a summer-evening fragrance by the closest venue and the scent you enjoy after its opening. Time of day does not require heavy notes or a stronger application.", [
    ["Choose the intended mood", "Bright, smooth or gently warm are clearer goals than a generic seductive label."],
    ["Check existing scent", "If daytime fragrance remains, assess it before adding something new. Layering can obscure the experience."],
    ["Trial ahead of plans", "A familiar dry down helps you choose calmly instead of opening several new samples before leaving."],
  ], "Match a tested later scent to the most enclosed summer-evening setting on your plan.", "Use HUME discovery comparisons before the occasion to identify the evening character you enjoy yourself."),
  g("How to choose perfume for outdoor summer events", "Weather selection", "Choose outdoor-summer-event perfume by activity, weather-relevant experience and shared-space transitions. Maximum projection is not a universal measure of event suitability.", [
    ["Map the full day", "Include transport, queues and covered seating rather than considering only the open venue."],
    ["Evaluate normal comparable wear", "Record later enjoyment before the event. Do not heat or wet perfume to simulate conditions."],
    ["Plan storage and carrying", "Follow product guidance and check venue rules. Reapplication need not be part of the event."],
  ], "Write the event's activity, closest setting and bottle-care plan before choosing a familiar candidate.", "Compare HUME sample directions in advance, selecting from actual experience without an endurance guarantee."),
  g("How to choose perfume for air conditioned environments", "Weather selection", "Choose perfume for air-conditioned environments by the room's purpose and your preferred later character. Cooling alone does not establish a need for heavier perfume or additional sprays.", [
    ["Start with the indoor context", "A shared office and a private evening are different briefs. Check rules and seating proximity."],
    ["Compare complete textures", "Fresh, woody and warm directions can all be possibilities. Read notes to shortlist, then smell the finished fragrance."],
    ["Judge without constant refreshes", "Use normal checkpoints and separate your own awareness from the scent's presence to others."],
  ], "Build an indoor fragrance brief from room use, proximity and later enjoyment rather than the thermostat alone.", "Use HUME discovery samples to compare the textures relevant to your indoor routine before buying a larger size."),
  g("Sweet fragrances for hot humid weather", "Sweet weather choices", "Sweet fragrance can be an option in hot humid weather if you enjoy the exact composition and manage its presence. Soft vanilla warmth and sugary fruit are different preferences, not one climate category.", [
    ["Name your sweetness limit", "Describe the impression you like and the point at which it becomes tiring. A note list cannot decide that for you."],
    ["Observe after normal activity", "Check whether the later balance remains enjoyable after travel and indoors."],
    ["Keep shared-space restraint", "Sweetness does not establish projection. Apply away from others and avoid automatic top-ups."],
  ], "Rate the sweetness you enjoy at the opening and later during a normal humid-day routine.", "Compare HUME's contrasting vanilla-containing structures rather than treating sweetness as a single weather-performance rating.", ["myself", "eros-flame"]),
  g("Sweet fragrances for dry summer heat", "Sweet weather choices", "For dry summer heat, choose a sweet perfume by the balance you enjoy through the full day. Neither dry air nor a vanilla listing establishes how the finished scent will develop for you.", [
    ["Compare kinds of sweetness", "Floral warmth and spice-supported vanilla can feel different. Choose a meaningful contrast."],
    ["Include the destination", "A warm journey followed by a cool room may alter your preference for richness. Observe both stages."],
    ["Avoid intensity as the goal", "The sweetest or strongest opening is not automatically the most enjoyable later wear."],
  ], "Describe sweetness texture and later comfort separately during a dry-summer comparison.", "Try HUME's floral-woody and spice-supported vanilla-containing candidates as distinct compositions.", ["myself", "eros-flame"]),
  g("Sweet fragrances for cool winter days", "Sweet weather choices", "Sweet fragrance for cool winter days should offer a texture you want to repeat, rather than a mandatory seasonal style. Gentle warmth and prominent dessert-like sweetness are different experiences.", [
    ["Set the preferred balance", "Decide whether sweetness should support flowers, woods or spice instead of choosing from vanilla alone."],
    ["Consider daytime proximity", "Classes and offices still require restraint. Cool outdoor conditions do not make every sweet perfume suitable indoors."],
    ["Assess the later stage", "A softer remaining sweetness may be the part you enjoy most. Record it before ranking candidates."],
  ], "Choose a sweet winter-day candidate by its supporting texture and later enjoyment rather than seasonal popularity.", "Compare HUME's softer wood-and-vanilla and floral-woody directions without assuming either guarantees quiet wear.", ["gypsy-water", "myself"]),
  g("Sweet fragrances for winter evenings", "Sweet weather choices", "For winter evenings, choose sweet fragrance by the texture you enjoy and the venue's proximity. Rich sweetness can be a preference without requiring maximum strength or promised attraction.", [
    ["Choose the supporting character", "Vanilla with spice differs from softer woody warmth. Read the whole structure before sampling."],
    ["Test the development", "Observe how the sweetness changes after the opening on a prior suitable day."],
    ["Keep dining considerate", "A gourmand impression is not automatic permission for strong scent near food or close companions."],
  ], "Describe the sweet texture you want to enjoy later in the evening before comparing candidates.", "HUME's vanilla-containing structures offer different winter-evening moods to explore without an all-night performance claim.", ["eros-flame", "gypsy-water"]),
  g("Sweet fragrances for rainy days", "Sweet weather choices", "A sweet rainy-day fragrance can provide a preferred warm mood, but it does not counteract wet weather or replace normal hygiene. Choose from your arrival experience and indoor comfort.", [
    ["Define the warmth", "Soft vanilla, sugary fruit and richer sweetness are different requests. Be precise about your preference."],
    ["Check the complete journey", "Shared transport and covered waits make presence relevant even when the scent feels comforting to you."],
    ["Record later balance", "Observe supporting woods or florals rather than scoring only the opening sweetness."],
  ], "Write the sweet character you enjoy after a normal rainy journey and whether its presence fits the destination.", "Use HUME discovery choices to compare warm impressions on separate days, without treating them as rain-resistant formulas."),
  g("Sweet fragrances for tropical holidays", "Sweet weather choices", "Sweet fragrance can suit a tropical holiday if you enjoy the exact scent in relevant settings. A holiday mood is personal; coconut-like or vanilla imagery does not establish cooling or sun protection.", [
    ["Choose from known preferences", "Try the complete composition before departure rather than buying solely from a vacation description."],
    ["Account for shared activities", "Transport, dining and accommodation can require restrained presence or no fragrance."],
    ["Check travel practicality", "Review current route requirements and storage directions. Avoid prolonged heat and secure the container."],
  ], "Match a tested sweet favorite to the trip's real activities before choosing a travel format.", "Use HUME vanilla-containing sample comparisons before departure, allowing enough time for current preorder delivery and repeat trials."),
  g("Sweet fragrances for summer office days", "Sweet weather choices", "Sweet perfume for summer office days should meet policy and remain considerate at close range. A softer sweetness may interest you, but no sweet note certifies quiet office presence.", [
    ["Check the workplace rule", "A fragrance-free policy takes priority even if the perfume feels gentle to you."],
    ["Trial the exact formula", "Evaluate later sweetness and presence outside work first. A pleasant opening cannot establish a whole workday fit."],
    ["Avoid desk-side adjustments", "Do not refresh around coworkers or cover an overly sweet choice with another fragrance."],
  ], "Assess a sweet office candidate for policy fit, later balance and restrained presence before choosing it as a regular.", "HUME's floral-woody vanilla-containing candidate can be a sampling possibility, without a claim of measured office subtlety.", ["myself"]),
  g("Sweet fragrances for summer evenings", "Sweet weather choices", "For summer evenings, choose the level and texture of sweetness you enjoy through the later wear. You do not need to ban sweet notes or buy a stronger perfume simply because plans are after dark.", [
    ["Pick a balanced comparison", "A spice-supported vanilla and a floral-woody arrangement offer different routes to explore."],
    ["Check the venue", "Restaurants and shared rides may call for less presence than an outdoor start to the evening."],
    ["Use a familiar favorite", "Test before the occasion and assess existing daytime scent before adding another layer."],
  ], "Compare the later sweetness of two candidates on earlier days, then match the favorite to your evening venue.", "Try HUME's contrasting vanilla-containing structures before selecting a summer-evening preference.", ["eros-flame", "myself"]),
  g("Sweet fragrances for outdoor summer events", "Sweet weather choices", "For outdoor summer events, sweet fragrance should be selected from relevant wear experience rather than a belief that sweetness guarantees persistence. Open air does not justify an unlimited application.", [
    ["Define the sweet character", "Choose whether you want gentle warmth or a more prominent sweet texture before shortlisting."],
    ["Include enclosed portions", "Queues, shuttles and sheltered seating can be the closest parts of the event."],
    ["Test and handle sensibly", "Use a suitable prior day for comparison and follow storage guidance. Do not leave bottles in prolonged heat."],
  ], "Evaluate later sweetness and shared-space presence during an earlier routine resembling the event.", "Use HUME vanilla-containing samples to compare event preferences without inferring outdoor endurance from their notes.", ["eros-flame", "gypsy-water"]),
  g("Sweet fragrances for air conditioned environments", "Sweet weather choices", "Sweet fragrance in an air-conditioned environment should match the room's use and your preferred balance. Cool indoor air does not automatically make rich sweetness appropriate or require more application.", [
    ["Identify the indoor purpose", "Close work, dining and private relaxation involve different expectations. Check restrictions first."],
    ["Observe the supporting texture", "Woods, florals or spice can change how sweetness feels later. Judge the whole scent rather than the vanilla listing."],
    ["Keep awareness separate", "Reduced self-perception does not establish that others no longer notice the perfume. Avoid automatic top-ups."],
  ], "Describe the later balance of sweetness and supporting notes during your actual indoor routine.", "Compare HUME's softer woody and floral-woody vanilla-containing candidates for personal indoor enjoyment.", ["gypsy-water", "myself"]),
];

BEGINNER_GUIDES_BATCH_ELEVEN.find(guide => guide.title === "Long lasting fragrances for hot humid weather")!.chart = {
  headers: ["Observation", "Record", "Do not infer"],
  rows: [
    ["Opening", "Initial character and presence", "All-day duration"],
    ["Later close-range scent", "Remaining texture and enjoyment", "Room-filling projection"],
    ["Reduced self-awareness", "Your perception at that moment", "That nobody else can notice it"],
  ],
};
