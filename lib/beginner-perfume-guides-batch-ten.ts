import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string, productIds: string[] = []): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep: "samples", productIds };
}

export const BEGINNER_GUIDES_BATCH_TEN: BeginnerGuide[] = [
  g("Best perfume for Indian weather", "Weather and perfume", "There is no single best perfume for Indian weather. Choose for your actual location, season, travel and indoor routine, then compare candidates in those conditions before buying more.", [
    ["Describe your day", "A coastal commute, dry afternoon and air-conditioned desk are different settings. A country-wide recommendation cannot replace your own routine."],
    ["Compare character first", "Marine freshness and citrus woods offer useful contrasts, but neither guarantees quiet presence or lasting power."],
    ["Choose from repeat wear", "Observe the later scent on more than one suitable day. Value includes enjoyment and considerate application, not only duration."],
  ], "Write your usual outdoor conditions and longest indoor setting before shortlisting two fragrances.", "Compare HUME's marine and citrus-and-wood candidates through samples rather than relying on a universal India winner.", ["acqua-di-gio-profondo", "bleu-de-chanel"]),
  g("Summer vs winter perfume", "Weather and perfume", "Summer and winter perfume describe common preferences rather than rules. You may prefer brighter textures in warmth or richer ones in cool conditions, but your setting and actual enjoyment decide.", [
    ["Separate mood from performance", "Freshness and warmth describe scent impressions. They do not establish how long every perfume will last in a season."],
    ["Include indoor conditions", "A summer office can be cool, while a winter gathering may be crowded and warm. Choose for the full day."],
    ["Reuse a favorite when it fits", "You do not need a new bottle every season. Compare your existing fragrance before assuming a replacement is necessary."],
  ], "Wear a familiar favorite in two ordinary seasonal settings and describe the changes you actually notice.", "Use HUME discovery comparisons to explore a different seasonal mood only when your current favorite leaves a real gap."),
  g("Does humidity affect perfume", "Weather and perfume", "Humid conditions can coincide with a different wearing experience, but humidity alone does not give a reliable prediction of perfume strength or duration. Heat, activity, airflow and the exact product also matter.", [
    ["Avoid one-factor explanations", "A humid commute differs from a still indoor room in several ways. One day's result cannot isolate water vapour as the cause."],
    ["Separate the observations", "Record changing character, close-range scent and surrounding presence independently. They need not change together."],
    ["Compare ordinary repeats", "Use the same product and record your routine across suitable days. Describe the context without claiming a controlled scientific test."],
  ], "Log humidity as one condition alongside heat, activity and time indoors during a repeat wear.", "Use one HUME sample at a time to build a readable weather log instead of mixing several new scents."),
  g("Does heat make perfume stronger", "Weather and perfume", "Warmth can change evaporation and the impression of a fragrance, but it does not guarantee stronger projection throughout the wear. A prominent opening and long duration are different outcomes.", [
    ["Understand the limited inference", "Temperature affects evaporation in general; a finished perfume contains many materials. That principle cannot supply exact hours or distance for your bottle."],
    ["Observe opening and later scent", "Record whether the start feels more noticeable and what remains later. Do not treat those as one strength score."],
    ["Never heat the bottle to test it", "Use ordinary wearing conditions, following directions. Deliberately warming perfume is not a useful way to improve its performance."],
  ], "Compare the initial impression and later presence separately during normal warm-weather wear.", "Assess HUME samples through ordinary use rather than assuming heat will improve every candidate's projection."),
  g("Why does perfume smell different in summer", "Weather and perfume", "A perfume can seem different in summer because your wearing context changes: warmth, activity, application and time spent indoors may all differ. The observation does not by itself prove the bottle has changed.", [
    ["Check the routine", "Note whether you used the same exact product and applicator. Different versions or amounts complicate the comparison."],
    ["Describe the difference", "Brighter, sweeter or less noticeable are separate observations. Write what changed instead of recording only that summer ruined the scent."],
    ["Review storage separately", "Bottle care is different from wear. Follow storage guidance and avoid prolonged heat or direct light rather than diagnosing damage from one trial."],
  ], "Compare your summer routine with an earlier wear before deciding whether the fragrance itself has altered.", "Keep exact HUME sample names in your notes so weather comparisons are not accidentally comparisons of different fragrances."),
  g("How to choose perfume for monsoon", "Weather and perfume", "Choose a monsoon perfume for your rain-day routine and scent preferences rather than a supposedly waterproof family. Shared transport, damp clothing and indoor waits can matter more than a seasonal label.", [
    ["Plan for actual movement", "Consider covered queues, cabs and close seating. Apply away from shared air and keep presence considerate."],
    ["Compare a clear contrast", "Fresh aromatic and dry woody directions can reveal different preferences. Neither is guaranteed to resist rain or humidity."],
    ["Protect the container", "Secure the closure and follow storage guidance. Do not use perfume to compensate for wet clothing or normal hygiene needs."],
  ], "Describe your rainy-day journey and choose two scent directions to assess after arrival.", "HUME's selectable discovery kit can support monsoon comparisons without requiring a separate rainy-season bottle."),
  g("Perfume for dry weather", "Weather and perfume", "For dry weather, choose a perfume from your own wear experience rather than assuming a formula must be heavier or oil-based. Dry air and an individual's skin concerns are different questions.", [
    ["Describe the actual setting", "Record temperature, indoor time and activity alongside dryness. A cool dry day and a hot dry afternoon are not equivalent."],
    ["Keep skincare separate", "Follow your normal suitable skincare and product directions. Do not assume a lotion will extend every fragrance by a fixed amount."],
    ["Judge the complete wear", "Compare enjoyment, later character and presence. A quiet scent may still meet your preference."],
  ], "Record a familiar fragrance in your usual dry-weather routine before buying a replacement format.", "Try HUME candidates in the conditions you actually experience, without treating concentration or an oil label as the automatic solution."),
  g("Perfume for air conditioned offices", "Weather and perfume", "For an air-conditioned office, workplace policy and shared-space presence matter more than the outdoor forecast. Choose a familiar scent you enjoy through the commute and the indoor working day.", [
    ["Check the office boundary", "Cool air does not make strong application appropriate. Fragrance-free policies still take priority."],
    ["Compare the transition", "Record how the scent feels after arrival and later at your desk. Do not infer that air conditioning has removed perfume simply because you notice it less."],
    ["Avoid desk-side refreshes", "Apply away from coworkers and make any later use deliberate. Your own awareness is not a projection measurement."],
  ], "Create separate arrival and late-work notes for a candidate before choosing it as your office regular.", "Use HUME samples on appropriate earlier days to assess indoor presence before a work-bottle purchase."),
  g("Fresh vs sweet perfume in summer", "Weather and perfume", "Fresh and sweet perfumes can both be summer options. Compare the specific textures you enjoy and how the complete fragrance feels in your routine instead of banning an entire family.", [
    ["Define both sides", "Citrus brightness differs from marine freshness; soft vanilla warmth differs from sugary fruit. Make the comparison precise."],
    ["Observe later balance", "A fresh opening can become warm, and a sweet scent may become softer. The first impression is not the complete decision."],
    ["Match the shared setting", "Neither label guarantees restrained presence. Consider crowded transport or close dining before application."],
  ], "Compare one fresh and one sweet candidate on separate suitable days, describing later comfort as well as the opening.", "Contrast a fresh HUME structure with a vanilla-containing candidate without assuming either is a universal summer choice.", ["lv-imagination", "myself"]),
  g("Can I wear oud in hot weather", "Weather and perfume", "You can choose an oud-style perfume in hot weather if you enjoy the exact composition and manage its presence appropriately. Oud is not automatically restricted to winter or guaranteed to project strongly.", [
    ["Read the supporting structure", "Wood-and-spice and rose-and-incense arrangements can feel different. An oud listing does not disclose natural material quantity."],
    ["Trial before the occasion", "Evaluate the candidate in suitable comparable conditions. Reputation is weaker evidence than your later enjoyment."],
    ["Keep proximity relevant", "Hot weather does not remove the need for restraint in vehicles, offices or meals. Follow product directions rather than a fixed oud spray rule."],
  ], "Describe the specific oud structure you enjoy and test it before assuming the whole family is too heavy for warmth.", "HUME's contrasting oud-listed candidates let you explore the question without a natural-oud or heat-performance guarantee.", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("How to test perfume in humid weather", "Weather and perfume", "Test perfume in humid weather by recording the exact product, normal application and changing scent through a realistic day. Keep character, presence and enjoyment as separate observations.", [
    ["Keep the comparison readable", "Try one unfamiliar candidate at a time and avoid layering. Record the applicator because equal spray counts may deliver different amounts."],
    ["Note the whole context", "Include warmth, activity, travel and indoor time. Humidity is only one part of the wearing situation."],
    ["Repeat the favorite", "A second suitable wear helps distinguish a consistent preference from one unusual day. Do not deliberately heat or wet the product."],
  ], "Create a trial log with product, conditions, opening, arrival scent and later enjoyment.", "Label each HUME discovery sample in the log and use separate days to compare rather than spraying the kit at once."),
  g("Perfume for summer weddings in India", "Weather and perfume", "For a summer wedding in India, choose a tested fragrance around the event's actual heat, indoor portions and close greetings. A fixed-date celebration needs preparation more than a maximum-strength claim.", [
    ["Map the celebration", "Outdoor rituals, dining and transport may require different restraint. Plan for the closest shared setting."],
    ["Rehearse the choice", "Evaluate the exact perfume in advance and return to the favorite. Keep experiments away from delicate event clothing."],
    ["Allow order lead time", "Check current availability and delivery before relying on a discovery purchase. An existing familiar favorite is also an option."],
  ], "Set a final-choice date before the wedding and compare candidates in relevant ordinary conditions.", "Order HUME samples only when the current preorder timing leaves room for delivery and repeat trials before the celebration."),
  g("Winter evening fragrance ideas", "Weather and perfume", "Winter evenings can be a chance to explore dry woods, spice or soft sweetness if those moods appeal to you. Fresh perfume remains an option, and cool weather does not require strong application.", [
    ["Choose a texture to explore", "Compare smooth wood, dry spice and gentler warmth as distinct preferences rather than one generic winter category."],
    ["Account for the venue", "A crowded restaurant can be warm and close even when the street is cool. Let the indoor setting influence presence."],
    ["Observe the later experience", "Try the candidate before an important evening and decide whether you enjoy its quieter stages."],
  ], "Choose two contrasting evening textures and explain which setting each would serve in your routine.", "Compare HUME's wood-and-spice and vanilla-containing directions without treating either as a guaranteed winter performer.", ["tom-ford-oud-wood", "eros-flame"]),
  g("Perfume for coastal cities", "Weather and perfume", "For a coastal-city routine, choose perfume around the journey and indoor settings you actually experience. A marine scent can be a preferred mood, but living near the coast does not require aquatic notes.", [
    ["Describe your route", "Open-air movement, crowded transport and an indoor desk can create different experiences within one day."],
    ["Compare beyond a coastal image", "Try marine freshness against a dry woody or citrus direction. A salty description does not establish weather resistance."],
    ["Make arrival the checkpoint", "Record later enjoyment after normal travel. Do not use extra fragrance to mask discomfort from the journey."],
  ], "Compare one marine and one contrasting direction after your usual coastal-city commute.", "Use HUME's marine and citrus-and-wood structures as distinct preference candidates rather than city-specific performance promises.", ["acqua-di-gio-profondo", "bleu-de-chanel"]),
  g("Perfume for Delhi summer", "Weather and perfume", "For your Delhi summer routine, choose fragrance around the actual journey, time outdoors and indoor destination. A city name cannot establish one ideal perfume or spray count.", [
    ["Write your exposure pattern", "An outdoor wait followed by a cool office differs from staying outside. Choose for the whole sequence."],
    ["Assess arrival comfort", "Compare the exact scent after ordinary travel, noting whether the later freshness or warmth still appeals."],
    ["Handle the bottle carefully", "Follow storage directions and avoid leaving fragrance in a parked car. Do not deliberately heat it to simulate summer."],
  ], "Log your outdoor-to-indoor transition during a suitable trial before buying a Delhi-summer bottle.", "Explore HUME's fresh-direction samples first if those textures interest you, then judge their fit through your own routine.", ["lv-imagination", "acqua-di-gio-profondo"]),
  g("Perfume for Mumbai humidity", "Weather and perfume", "For a Mumbai routine where humidity is your concern, compare scent comfort after normal travel rather than seeking a humidity-proof perfume. The exact product and shared setting matter alongside conditions.", [
    ["Start with your commute", "Close public transport and an indoor destination set different boundaries. Keep application away from fellow passengers."],
    ["Separate smell from presence", "A fresh impression can still be assertive. Record later character and surrounding presence independently."],
    ["Repeat before deciding", "Use comparable ordinary days and note activity and indoor time. Avoid attributing every change to humidity alone."],
  ], "Build an arrival-time fragrance log around your actual Mumbai journey and destination.", "Compare HUME samples individually so the preferred candidate comes from repeat experience rather than a humid-city label."),
  g("Perfume for Chennai heat", "Weather and perfume", "When choosing for heat in your Chennai routine, focus on a scent you enjoy after travel and presence suited to the destination. No scent family guarantees cooling or all-day wear.", [
    ["Choose a desired impression", "Marine, citrus or dry wood can be different preference routes. A cooling image does not lower body temperature."],
    ["Trial the complete day", "Observe the opening and later scent separately, including any transition to indoor spaces."],
    ["Avoid compensating with quantity", "More perfume does not replace normal hygiene. Follow directions and consider people nearby before adding more."],
  ], "Compare two preferred textures after a normal warm-day routine instead of ranking only the first spray.", "Use HUME's marine and citrus-and-tea candidates as scent comparisons, without promising physical cooling or heat-proof performance.", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("Perfume for Bengaluru weather", "Weather and perfume", "Choose a Bengaluru fragrance by your actual daily conditions rather than assuming one city-wide climate brief. A versatile familiar candidate may suit changing outdoor plans and indoor routines.", [
    ["Describe the real week", "List commuting, office time and evening plans. The city name alone does not reveal which setting dominates your use."],
    ["Compare versatility", "Assess whether the later character fits both daytime work and a relaxed evening without needing a second purchase."],
    ["Keep notes across days", "Record context when a scent seems different. One change in perception does not establish a seasonal performance rule."],
  ], "Try a candidate across two ordinary Bengaluru routines and note which parts it actually serves.", "Use HUME discovery choices to compare a fresh direction and a woodier alternative before deciding if one versatile bottle is enough."),
  g("Should I change perfume with the seasons", "Weather and perfume", "Changing perfume with the seasons is optional. Keep a favorite if you still enjoy it and can wear it considerately; explore another direction only when it adds a useful experience.", [
    ["Identify a genuine gap", "A different mood, routine or preferred texture is a clearer reason than the calendar alone."],
    ["Retest what you own", "Your current fragrance may already fit the new setting. Compare later enjoyment before assuming it needs replacement."],
    ["Keep purchases proportionate", "Samples can answer seasonal curiosity without requiring several full bottles. Choose quantity around expected use."],
  ], "Write one specific thing a seasonal addition would provide that your current favorite does not.", "Use HUME discovery comparisons for that missing experience rather than treating every season as a required bottle purchase."),
  g("How to carry perfume in summer", "Weather and perfume", "Carry perfume in summer with secure closure and protection from direct light and prolonged heat, following the maker's guidance. A smaller container helps portability but does not remove storage needs.", [
    ["Decide whether carrying is needed", "A familiar application before leaving may be enough. Reapplication is optional and should fit the next setting."],
    ["Protect the container", "Avoid leaving fragrance in parked vehicles or direct sun. Keep it securely packed rather than loose beside items that can damage it."],
    ["Follow transport requirements", "Check current carrier and venue rules for your route. Do not assume every mini or sample is automatically permitted."],
  ], "Choose a secure shaded carry location and a reason to carry the perfume before packing it.", "Check HUME's current sample format if portability matters, while treating small size and storage protection as separate requirements."),
  g("Best perfume for hot humid weather", "Weather shortlists", "The best perfume for hot humid weather is one you enjoy in comparable conditions with considerate presence. Fresh directions can start a shortlist, but no family guarantees humidity resistance.", [
    ["Define the desired feel", "Choose between marine freshness, citrus brightness or another texture you already enjoy."],
    ["Test after activity", "Record the later scent after ordinary travel instead of judging only an indoor opening."],
    ["Compare separate outcomes", "Enjoyment, projection and duration are different criteria. A strong start does not win all three."],
  ], "Rank two candidates by later enjoyment and setting fit during similar humid-day routines.", "The marine and citrus-and-tea HUME examples below are notes-based candidates, not measured hot-weather winners.", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("Best perfume for dry summer heat", "Weather shortlists", "For dry summer heat, select from realistic wear trials rather than assuming the richest formula will last best. Your preferred later scent and shared-space presence are useful decision criteria.", [
    ["Include indoor time", "A hot journey may lead to a cool destination. Evaluate the transition rather than only the forecast."],
    ["Compare distinct textures", "Citrus woods and marine freshness offer different starting points. Neither carries a guaranteed dry-weather duration."],
    ["Check repeat use", "Return to a favorite on another suitable day before choosing a large bottle."],
  ], "Compare arrival and later indoor notes for each dry-heat candidate before selecting a favorite.", "Use HUME samples to compare fresh structures through your actual dry-summer routine.", ["bleu-de-chanel", "acqua-di-gio-profondo"]),
  g("Best perfume for cool winter days", "Weather shortlists", "A good cool-day perfume matches your preferred texture and daily setting. Warm woods or soft sweetness may interest you, but fresh fragrance remains a valid winter choice.", [
    ["Choose by mood", "Decide whether you want brightness, smooth warmth or dry texture rather than buying a winter label."],
    ["Consider close indoor use", "Cool outdoor air does not justify strong scent in a classroom or office."],
    ["Judge the later character", "Wear a candidate through an ordinary day and ask whether you want to repeat it."],
  ], "Compare one familiar fresh favorite with one warmer candidate before deciding winter needs a different bottle.", "HUME's softer wood-containing and vanilla-containing structures can add contrast to a cool-day comparison.", ["gypsy-water", "myself"]),
  g("Best perfume for winter evenings", "Weather shortlists", "The best winter-evening fragrance fits the venue and a mood you enjoy. Smooth woods, spice or freshness are possibilities rather than a ranking determined by season.", [
    ["Name the evening setting", "A close meal and an outdoor gathering create different presence boundaries."],
    ["Test the chosen texture", "Observe whether the later spice or warmth remains enjoyable instead of buying from opening impact."],
    ["Avoid a strength contest", "More projection is not automatically better for a social evening. Respect the people sharing the space."],
  ], "Select an evening candidate by later texture and actual venue fit after a prior trial.", "Compare HUME's woody and spice-containing candidates without treating their notes as fixed winter-performance ratings.", ["tom-ford-oud-wood", "spicebomb"]),
  g("Best perfume for rainy days", "Weather shortlists", "For rainy days, choose a fragrance you enjoy after your normal journey and in the indoor spaces where you wait or work. There is no universal rain-proof perfume category.", [
    ["Start with the route", "Covered queues and shared vehicles can matter more than the open-air portion."],
    ["Choose a useful contrast", "A fresh direction and a dry woody structure can help establish preference in the same type of routine."],
    ["Keep scent and hygiene separate", "Perfume does not solve wet clothing. Avoid compensating with repeated sprays."],
  ], "Record the scent at arrival on a normal rainy-day journey before choosing a regular candidate.", "Use HUME discovery choices to compare rainy-day preferences rather than seeking a waterproof fragrance promise."),
  g("Best perfume for tropical holidays", "Weather shortlists", "For a tropical holiday, choose a tested favorite suited to your activities and shared travel. A tropical image does not establish sun protection, cooling or guaranteed longevity.", [
    ["Use the actual itinerary", "City dining, outdoor walks and transport require different restraint. One familiar choice may cover enough."],
    ["Settle preferences before leaving", "Try candidates at home before making them the trip's only option."],
    ["Review carrying and storage", "Check current travel requirements and avoid prolonged heat. Small format alone is not an exemption."],
  ], "Match one tested candidate to the trip's real activities and verify the current packing requirements.", "HUME fresh-direction samples can support pre-trip discovery if current preorder timing leaves enough time to compare."),
  g("Best perfume for summer office days", "Weather shortlists", "For a summer office day, choose around workplace policy and close seating as well as the commute. A fresh label does not guarantee unobtrusive wear.", [
    ["Set the office constraint", "Fragrance-free requirements take priority over seasonal preferences."],
    ["Evaluate the arrival scent", "Notice the transition from travel to the desk and whether you enjoy the later character."],
    ["Keep application familiar", "Avoid new experiments during meetings and do not refresh in shared air."],
  ], "Compare office candidates against policy, arrival comfort and later presence before choosing a summer regular.", "Try HUME's marine and citrus-and-wood candidates on appropriate non-work days before considering office use.", ["acqua-di-gio-profondo", "bleu-de-chanel"]),
  g("Best perfume for summer evenings", "Weather shortlists", "A summer-evening perfume should fit the venue and the texture you enjoy as it develops. Warm evenings do not require either a fresh-only rule or an assertive night fragrance.", [
    ["Choose the mood", "Compare citrus-and-tea brightness with a smoother wood direction if both appeal to you."],
    ["Consider the closest setting", "A café table can require more restraint than an outdoor walk, regardless of time."],
    ["Use a prior trial", "A familiar later scent is more useful than a last-minute promise of evening appeal."],
  ], "Pick a summer-evening candidate whose later character suits the closest part of your plan.", "HUME's fresh and smoother wood-containing structures provide contrasting evening directions to sample.", ["lv-imagination", "gypsy-water"]),
  g("Best perfume for outdoor summer events", "Weather shortlists", "For outdoor summer events, choose from comparable wear experience and the event's enclosed transitions. Strong application is not a substitute for choosing a scent you enjoy in warmth.", [
    ["Map the whole event", "Include transport, queues and sheltered seating as well as the main outdoor space."],
    ["Evaluate weather-relevant comfort", "Try a candidate on a suitable earlier day with similar activity. Do not deliberately heat the perfume."],
    ["Plan bottle handling", "Follow storage directions and check venue rules before carrying a container."],
  ], "Write the event's activity and closest shared space beside the weather conditions before choosing a candidate.", "Compare HUME's fresh-direction options in advance without assuming a sports-style name establishes outdoor durability.", ["allure-sport", "acqua-di-gio-profondo"]),
  g("Best perfume for air conditioned environments", "Weather shortlists", "Choose fragrance for an air-conditioned environment by the room's use, proximity and your own enjoyment. Cooling alone does not establish how strong a perfume will seem to everyone nearby.", [
    ["Identify the shared setting", "An office, restaurant and hotel room have different expectations. Follow any fragrance restrictions."],
    ["Judge the complete scent", "A warmer texture can be an option, but it is not automatically required because the room is cool."],
    ["Avoid awareness-based top-ups", "Your own adaptation cannot establish that others no longer notice the scent."],
  ], "Choose a candidate around the room's purpose and closest seating rather than air-conditioning alone.", "Use HUME samples to assess indoor preferences before buying a bottle for a broadly defined AC category."),
  g("Fresh fragrances for hot humid weather", "Fresh weather choices", "For hot humid conditions, begin by choosing the kind of freshness you enjoy. Marine, citrus and aromatic impressions differ, and none guarantees low projection or weather resistance.", [
    ["Compare fresh textures", "A marine direction and a tea-and-citrus structure offer a clearer contrast than two generic fresh labels."],
    ["Observe after normal travel", "Check the later character and comfort instead of ranking only immediate brightness."],
    ["Keep shared-space restraint", "A fresh-smelling product can still be noticeable. Apply away from other people."],
  ], "Describe each candidate's freshness in three words at the opening and again after arrival.", "HUME's marine and citrus-and-tea candidates support a distinct-texture comparison in your humid-weather routine.", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("Fresh fragrances for dry summer heat", "Fresh weather choices", "Fresh perfume in dry summer heat should be selected for enjoyable development rather than a promise that brightness will remain unchanged. The later scent may be the more useful deciding factor.", [
    ["Choose a preferred opening", "Citrus peel, marine character and aromatic herbs are different starting interests."],
    ["Look beyond the opening", "Woods or warmth may become more apparent later. Decide whether that transition appeals to you."],
    ["Compare ordinary repeats", "Record actual conditions and application before attributing every difference to dry air."],
  ], "Choose a fresh candidate by the transition you enjoy from first impression to later character.", "Compare HUME's fresh structures through samples rather than expecting their opening brightness to define the entire wear.", ["lv-imagination", "allure-sport"]),
  g("Fresh fragrances for cool winter days", "Fresh weather choices", "Fresh fragrance can suit cool winter days if you enjoy its character. You do not need to replace citrus or marine preferences with rich sweetness just because the season changes.", [
    ["Keep the preference personal", "Brightness can be the experience you want in winter. Avoid choosing a warmer bottle only to follow a seasonal rule."],
    ["Assess indoor suitability", "Shared workspaces still call for restraint. Cool outdoor conditions do not remove workplace policy."],
    ["Check later enjoyment", "Observe whether the quieter development is satisfying without demanding maximum projection."],
  ], "Retest your fresh favorite through an ordinary cool day before deciding it needs a seasonal substitute.", "HUME's fresh-direction samples can help compare a different kind of brightness while keeping the choice preference-led.", ["bleu-de-chanel", "lv-imagination"]),
  g("Fresh fragrances for winter evenings", "Fresh weather choices", "A fresh winter-evening perfume is a valid alternative when you prefer brightness to rich warmth. Choose the complete scent and venue fit rather than assuming freshness belongs only to daytime.", [
    ["Choose the evening texture", "Citrus with woods or tea can create different impressions after the opening. Read the whole notes list."],
    ["Consider indoor closeness", "Dinner and cinema seating can matter more than the outdoor temperature."],
    ["Keep the choice familiar", "Test on an earlier day and avoid layering an unfamiliar warmer scent to make it feel more seasonal."],
  ], "Describe what you enjoy about a fresh candidate's later scent before choosing it for a winter evening.", "Try HUME's citrus-and-wood and citrus-and-tea structures as contrasting fresh evening candidates.", ["bleu-de-chanel", "lv-imagination"]),
  g("Fresh fragrances for rainy days", "Fresh weather choices", "For rainy days, a fresh fragrance can be a preferred mood rather than a solution to damp weather. Choose for travel and indoor comfort without expecting a waterproof scent.", [
    ["Define clean-smelling precisely", "Marine freshness and citrus brightness are different effects. Neither replaces clean clothing or hygiene."],
    ["Check the arrival character", "Observe the scent once normal travel is complete, including any indoor waiting time."],
    ["Keep carrying sensible", "Secure the container and follow storage guidance. Avoid opening several samples in a shared waiting area."],
  ], "Record which fresh texture you enjoy after a normal rainy journey instead of treating freshness as odour coverage.", "Compare HUME fresh-direction samples individually before choosing a rainy-day preference.", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("Fresh fragrances for tropical holidays", "Fresh weather choices", "Fresh holiday fragrance should match your destination activities and existing preferences. Marine or citrus notes can supply a mood, but they do not provide cooling or sun protection.", [
    ["Test before the trip", "Choose a familiar later scent rather than relying on beach-themed packaging."],
    ["Plan for shared travel", "Crowded transport and dining can require restraint even on an outdoor-focused holiday."],
    ["Check the format", "Review current route restrictions and storage instructions. Protect containers from prolonged heat."],
  ], "Choose one tested fresh travel favorite after listing the holiday's actual shared and outdoor settings.", "HUME discovery samples can help settle a fresh preference before departure, allowing for the current preorder timing."),
  g("Fresh fragrances for summer office days", "Fresh weather choices", "Fresh office fragrance in summer should fit both the commute and workplace rules. Freshness describes the smell, not a guarantee that colleagues will find its presence subtle.", [
    ["Check policy before buying", "A fragrance-free workplace makes a dedicated office purchase unnecessary."],
    ["Compare restrained wear", "Evaluate the exact candidate on suitable earlier days. Do not infer presence from notes alone."],
    ["Separate arrival and desk experience", "Write how the character changes indoors without assuming you need an immediate top-up."],
  ], "Assess a fresh office candidate at arrival and later indoors, with policy as the first filter.", "HUME's marine and citrus-and-wood listings offer fresh directions to test before making a workplace choice.", ["acqua-di-gio-profondo", "bleu-de-chanel"]),
  g("Fresh fragrances for summer evenings", "Fresh weather choices", "Fresh summer-evening perfume can be chosen for brightness and a later scent you enjoy. An evening label is unnecessary when a familiar fresh favorite already fits your plans.", [
    ["Compare the supporting notes", "Citrus-and-tea and marine-aromatic structures can develop differently. The broad fresh label is only the beginning."],
    ["Match the venue", "Open-air plans may end in a small restaurant. Let the closest shared portion guide restraint."],
    ["Avoid the instant refresh habit", "Assess what remains from daytime wear before adding another fragrance for the evening."],
  ], "Choose a fresh evening candidate by its later character and the most enclosed stop in your plan.", "Use HUME's contrasting fresh samples before the evening rather than discovering their development at the venue.", ["lv-imagination", "allure-sport"]),
  g("Fresh fragrances for outdoor summer events", "Fresh weather choices", "For an outdoor summer event, fresh notes can be a starting preference, not proof of lasting power. Select a familiar candidate that also fits queues, transport and sheltered spaces.", [
    ["Choose a specific fresh impression", "Decide whether you want marine character, citrus or aromatic brightness before browsing."],
    ["Compare relevant wear", "Evaluate the exact sample in normal comparable conditions. Do not increase application until a scent trail appears."],
    ["Protect the container", "Check venue rules and keep fragrance away from prolonged heat while travelling."],
  ], "Record the fresh texture you prefer during a suitable trial and whether it remains enjoyable later.", "Compare HUME's marine and citrus-aromatic candidates without equating their fresh notes with measured outdoor endurance.", ["acqua-di-gio-profondo", "allure-sport"]),
  g("Fresh fragrances for air conditioned environments", "Fresh weather choices", "Fresh perfume can suit an air-conditioned environment if you enjoy its full structure and manage presence for the room. Cooler indoor air does not make freshness inappropriate or require stronger scent.", [
    ["Define the indoor use", "Work, dining and relaxation create different expectations. Check policy and proximity."],
    ["Follow the complete development", "A bright opening may reveal woods or warmth. Judge whether that later stage suits your time indoors."],
    ["Keep self-awareness in perspective", "Not noticing a familiar scent continuously is not proof that the room needs more fragrance."],
  ], "Describe your fresh candidate's later indoor character before deciding whether another application is useful.", "Use HUME fresh-direction samples to compare indoor preferences, choosing by actual wear rather than the AC label.", ["lv-imagination", "bleu-de-chanel"]),
  g("Woody scents for hot humid weather", "Woody weather choices", "Woody fragrance can be an option in hot humid weather when you enjoy the particular texture and manage presence considerately. Woods are not one uniformly heavy or long-lasting category.", [
    ["Choose a clear texture", "Dry citrus woods and smooth spice-supported woods can offer different experiences."],
    ["Evaluate the full routine", "Observe later enjoyment after normal movement and indoor transitions. Do not judge from oud or cedar reputation."],
    ["Keep proximity central", "Shared transport and close rooms still require restraint. A suitable trial matters more than a family rule."],
  ], "Compare a dry woody structure with a smoother one during separate suitable humid-day trials.", "HUME's citrus-and-wood and oud-listed structures provide contrasting textures without a humidity-performance promise.", ["bleu-de-chanel", "tom-ford-oud-wood"]),
  g("Woody scents for dry summer heat", "Woody weather choices", "For dry summer heat, choose woody perfume by texture and your own later-wear experience. Dry air does not make every woody formula last longer or feel lighter.", [
    ["Separate air and scent language", "Dry woods describes an impression, not proof that a perfume is optimized for dry climate."],
    ["Compare supporting notes", "Citrus, incense and sweetness change the finished character. Read beyond the wood name."],
    ["Retest in your routine", "Include indoor time and normal activity before deciding whether a candidate suits the heat."],
  ], "Write the wood texture and supporting character separately during a dry-summer trial.", "Try HUME's citrus-wood and softer wood-containing candidates as different structures, not climate-certified formulas.", ["bleu-de-chanel", "gypsy-water"]),
  g("Woody scents for cool winter days", "Woody weather choices", "Cool winter days can be a useful setting to explore woody textures you enjoy. Choose dry, creamy or warmer structures individually rather than assuming every wood-listed perfume serves the same role.", [
    ["Choose the texture first", "A smooth sandalwood-like impression differs from smoky or dry woods. Define your preference before buying."],
    ["Keep daytime spaces relevant", "Workplaces and classrooms remain shared spaces even when outdoors is cool. Follow rules and manage presence."],
    ["Observe the quieter stage", "Later close-range enjoyment may be enough. Winter does not create a requirement for large projection."],
  ], "Compare two wood textures on ordinary cool days and choose by repeated enjoyment rather than seasonal reputation.", "HUME's smoother wood-and-spice and softer wood-containing samples can help clarify a winter-day texture preference.", ["tom-ford-oud-wood", "gypsy-water"]),
  g("Woody scents for winter evenings", "Woody weather choices", "For winter evenings, a woody perfume should offer a texture you enjoy through the actual event. A cold-weather image does not make strong application necessary at a close dinner.", [
    ["Choose your woody mood", "Smooth spice-supported woods and richer rose-and-incense arrangements provide different starting points."],
    ["Rehearse the development", "Wear a candidate before the evening and observe the later balance instead of choosing only a dramatic opening."],
    ["Consider the room", "Indoor warmth and seating proximity can matter more than the outdoor temperature."],
  ], "Select a woody evening favorite after describing its later texture and the venue's closest seating.", "Compare HUME's contrasting oud-listed structures without inferring natural oud content or fixed winter longevity.", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("Woody scents for rainy days", "Woody weather choices", "Woody perfume on a rainy day can provide a preferred dry or smooth scent impression. That language does not mean the product keeps clothing dry or resists weather.", [
    ["Pick the desired contrast", "You may enjoy dry woods against a rainy-day mood or prefer a softer warm structure. Both are personal choices."],
    ["Check after the journey", "Record the complete scent once you arrive rather than attributing every change to rain."],
    ["Keep use considerate", "Covered queues and shared vehicles call for restraint. Extra perfume does not solve damp clothing."],
  ], "Describe which woody texture you enjoy at arrival during an ordinary rainy routine.", "Use HUME's different wood-containing samples to explore a rain-day preference without expecting weatherproof wear.", ["bleu-de-chanel", "gypsy-water"]),
  g("Woody scents for tropical holidays", "Woody weather choices", "A woody fragrance can suit a tropical holiday if you enjoy the exact scent in relevant conditions. You do not need to abandon woods for a marine label or buy stronger perfume for outdoor plans.", [
    ["Choose a known structure", "A tested favorite can be easier to manage than a new holiday-only bottle. Check its later character before departure."],
    ["Include shared spaces", "Transport, accommodation and dining require consideration even on an outdoor-focused trip."],
    ["Check travel practicality", "Review route rules and storage directions. Protect the container from prolonged heat."],
  ], "Match a tested woody favorite to the trip's real activities before deciding whether another travel scent is needed.", "HUME woody sample comparisons can settle a pre-trip preference if current delivery timing allows enough trial days."),
  g("Woody scents for summer office days", "Woody weather choices", "A woody summer-office fragrance should fit workplace expectations and your preferred later character. Wood notes neither disqualify a perfume for summer nor establish quiet office wear.", [
    ["Choose by actual texture", "A citrus-and-wood direction may interest you differently from smoky or sweeter woods. Read the complete structure."],
    ["Test outside work first", "Assess the exact product on a suitable earlier day before introducing it to close meetings."],
    ["Respect policy and feedback", "Skip fragrance where required and avoid desk-side application. Your own adaptation does not justify a top-up."],
  ], "Compare a woody candidate's arrival scent and later presence against the office's actual constraints.", "HUME's citrus-and-wood listing is a starting point for sampling, without a claim of measured summer-office subtlety.", ["bleu-de-chanel"]),
  g("Woody scents for summer evenings", "Woody weather choices", "Woody summer-evening perfume can work as a preferred mood when the exact structure remains enjoyable and fits the venue. There is no rule that woods belong only in cold weather.", [
    ["Select the kind of wood", "Dry citrus woods and softer warm woods create different impressions. Start with the texture you want."],
    ["Observe the later balance", "Supporting sweetness or spice may become more apparent. A prior wear gives a clearer basis than a notes-only choice."],
    ["Plan for proximity", "An outdoor walk may lead to close dining. Keep presence appropriate throughout the evening."],
  ], "Choose a woody evening candidate by its later texture after identifying the most enclosed part of your plans.", "Compare HUME's citrus-wood and softer wood-containing options ahead of the evening.", ["bleu-de-chanel", "gypsy-water"]),
  g("Woody scents for outdoor summer events", "Woody weather choices", "For an outdoor summer event, choose woody perfume from relevant wear experience rather than expected endurance from a wood note. Open air and heat do not create a universal projection target.", [
    ["Choose a preferred structure", "Dry woods with citrus and smoother spice-supported woods can offer useful contrast."],
    ["Map enclosed transitions", "Transport, queues and covered seating can set the practical boundary for scent presence."],
    ["Handle fragrance appropriately", "Check venue rules and follow storage guidance. Do not leave bottles in prolonged heat."],
  ], "Assess one woody candidate during a suitable earlier outdoor routine, including its later shared-space presence.", "Use HUME woody samples for an event-specific comparison without treating wood or oud wording as an endurance guarantee.", ["bleu-de-chanel", "tom-ford-oud-wood"]),
  g("Woody scents for air conditioned environments", "Woody weather choices", "Woody scents in air-conditioned environments should be chosen for texture, room use and considerate presence. A cooler room does not automatically call for richer perfume or extra application.", [
    ["Define the indoor occasion", "A shared office and a relaxed private evening create different boundaries. Follow policies where applicable."],
    ["Explore complete structures", "Compare dry citrus woods with smoother warm woods rather than treating the family as one scent."],
    ["Assess later enjoyment", "A quieter wood impression can be satisfying. Reduced self-awareness is not proof that the fragrance has vanished."],
  ], "Record which woody texture you enjoy later indoors before choosing a bottle for a cool-room routine.", "Compare HUME's contrasting wood structures through samples, with actual indoor wear deciding the fit.", ["bleu-de-chanel", "tom-ford-oud-wood"]),
];

const byTitle = (title: string) => BEGINNER_GUIDES_BATCH_TEN.find(guide => guide.title === title)!;
byTitle("Does heat make perfume stronger").sources = [{ title: "American Chemical Society: temperature and evaporation (general principle)", url: "https://www.acs.org/education/whatischemistry/adventures-in-chemistry/experiments/evaporation-sensation.html" }];
for (const title of ["How to carry perfume in summer", "Why does perfume smell different in summer"]) {
  byTitle(title).sources = [{ title: "Diptyque: perfume storage guidance", url: "https://customerservice.diptyqueparis.com/hc/en-us/articles/37771592643863-How-should-I-store-my-perfume-to-preserve-its-quality" }];
}
byTitle("Summer vs winter perfume").chart = {
  headers: ["Question", "Warm-weather trial", "Cool-weather trial"],
  rows: [
    ["Which setting matters?", "Commute and indoor transitions", "Outdoor plans and shared indoor rooms"],
    ["What should I compare?", "Opening, later character and comfort", "Preferred texture and later enjoyment"],
    ["Do I need another bottle?", "Only if it adds a useful experience", "Retest the existing favorite first"],
  ],
};
