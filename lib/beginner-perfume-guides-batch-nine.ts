import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string, productIds: string[] = []): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep: "samples", productIds };
}

export const BEGINNER_GUIDES_BATCH_NINE: BeginnerGuide[] = [
  g("Fresh perfume for gifting", "Fresh occasions", "Choose a fresh perfume gift by finding out which kind of freshness the recipient enjoys: citrus, marine, green or aromatic. A general liking for clean smells is a starting clue, not confirmation of a particular bottle.", [
    ["Ask for a reference", "An exact liked fragrance or a description such as citrus peel is more useful than gender or age. Ask about dislikes as well."],
    ["Choose the commitment", "A known favorite can justify a bottle; unfamiliar preferences may suit an agreed discovery selection. Fresh notes do not guarantee subtle projection."],
    ["Check the gift date", "Review availability, delivery and returns before paying. Do not assume an opened fragrance can be exchanged because the recipient dislikes it."],
  ], "Ask the recipient to name a liked fresh smell and one fresh style they would rather avoid.", "Select fresh HUME samples together when possible, checking the current discovery preorder timing before promising a gift date."),
  g("Woody perfume for office wear", "Woody occasions", "A woody office perfume should meet workplace rules and remain considerate in shared rooms. Wood notes can be dry, creamy or smoky; none automatically establishes restrained presence.", [
    ["Choose a wood texture", "Start with the dry or smooth impression you enjoy. You do not need a heavy oud direction to explore woody perfume."],
    ["Assess the complete formula", "Citrus, spice and sweetness change the composition. Read live notes, then evaluate the exact product outside work first."],
    ["Follow the office boundary", "Fragrance-free rules take priority. Avoid desk-side sprays and extra application based only on your reduced awareness."],
  ], "Compare woody candidates for texture and surrounding presence on a suitable non-work day.", "Use HUME's citrus-and-wood listing below as a notes-based candidate, without assuming it has measured low office projection.", ["bleu-de-chanel"]),
  g("Woody perfume for college", "Woody occasions", "For college, choose a woody perfume around your preferred texture, classroom proximity and budget. Woody does not have to mean mature, expensive or assertive.", [
    ["Avoid the image shortcut", "Try dry woods or softer wood-and-vanilla arrangements based on taste rather than a supposed age requirement."],
    ["Consider the timetable", "Libraries, labs and shared transport can restrict fragrance. Test presence before wearing an unfamiliar product through lectures."],
    ["Keep spending purposeful", "A sample comparison can establish whether woods interest you before a bottle purchase. Include delivery in the total."],
  ], "Write whether you prefer dry, creamy or warm woods, then compare that preference against a realistic class day.", "HUME's wood-containing candidates can introduce contrasting textures before you choose a college bottle.", ["bleu-de-chanel", "gypsy-water"]),
  g("Woody perfume for date nights", "Woody occasions", "A woody date-night fragrance can offer a dry, smooth or warmer character you enjoy. Select it for the actual venue and personal preference rather than promised attraction.", [
    ["Choose the mood precisely", "Creamy woods and smoky woods are different requests. Decide which impression you want before browsing evening recommendations."],
    ["Test the supporting character", "Spices, amber-like warmth or floral notes may become more apparent later. A wood listing alone cannot predict the experience."],
    ["Plan for closeness", "Keep presence considerate at a café table or cinema. A special evening does not require stronger application."],
  ], "Describe the woody texture you would enjoy yourself even if nobody commented on your fragrance.", "Compare HUME's smooth wood-and-spice and citrus-and-wood structures ahead of the date.", ["tom-ford-oud-wood", "bleu-de-chanel"]),
  g("Woody perfume for weddings", "Woody occasions", "Choose a woody wedding perfume after testing its full development before the event. A wood-centered fragrance can suit a celebration without needing to be the strongest scent in the room.", [
    ["Map the close moments", "Ceremonies, greetings and dining bring people together. Consider those settings alongside the venue and weather."],
    ["Explore meaningful textures", "A dry wood, creamy impression or rose-and-wood arrangement creates different associations. Let your preference guide the comparison."],
    ["Prepare early", "Allow time for delivery and repeat wears. Follow garment care instructions rather than experimenting on event clothing."],
  ], "Choose the woody candidate whose later character you want associated with the celebration, then rehearse it in advance.", "HUME's contrasting oud-listed structures can support a wedding shortlist when current preorder timing leaves room to test.", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("Woody perfume for daily commuting", "Woody occasions", "A woody commuting perfume should be enjoyable after travel and restrained in crowded vehicles. The wood family does not predict either projection or wear duration.", [
    ["Consider the journey first", "A warm crowded bus can set a tighter boundary than an open office. Do not spray during shared travel."],
    ["Compare later texture", "Notice whether the dry or smooth wood impression remains pleasant after arrival rather than demanding an unchanged opening."],
    ["Keep application measured", "Use a familiar routine according to directions. More fragrance is not a substitute for clean clothing or normal hygiene."],
  ], "Record the wood character at arrival and whether you still want that scent through the rest of your day.", "Try HUME's citrus-and-wood candidate before treating it as a regular commuting choice.", ["bleu-de-chanel"]),
  g("Woody perfume for weekend outings", "Woody occasions", "Weekend outings can be a useful time to explore woody textures beyond your usual routine. Choose for the whole itinerary, including small cafés and shared cars.", [
    ["Give exploration a question", "Compare dry aromatic woods with a softer warm arrangement. Decide what difference you are trying to discover."],
    ["Read the later scent", "A bright start may become warmer or smoother. Note whether the development suits your relaxed plans."],
    ["Keep variety intentional", "A new bottle should add a texture you want to wear. Occasional curiosity can sometimes be satisfied with samples."],
  ], "Try one woody direction on a suitable outing and write how it differs from your weekday favorite.", "HUME's aromatic and softer wood-containing samples offer two starting points for a weekend comparison.", ["guilty-homme", "gypsy-water"]),
  g("Woody perfume for formal dinners", "Woody occasions", "A woody perfume can suit a formal dinner when its actual presence leaves room for food and conversation. Formality does not require smoke, intensity or a premium price.", [
    ["Start with table distance", "Long seated meals involve prolonged proximity. Use that as the application boundary rather than the size of the venue."],
    ["Choose a known development", "A smooth opening may become spicier or warmer. Evaluate the complete scent before the dinner."],
    ["Avoid dining-room refreshes", "Do not spray at the table or introduce a new layer immediately before seating. What remains may already be enough."],
  ], "Choose a previously tested wood texture that you would enjoy beside a shared meal without dominating it.", "Sample HUME's wood-and-spice structure before considering it for dinner; a note description is not a quietness rating.", ["tom-ford-oud-wood"]),
  g("Woody perfume for outdoor events", "Woody occasions", "For outdoor events, choose a woody fragrance you enjoy in comparable weather and manage it through enclosed transitions. Open air does not justify unlimited application.", [
    ["Compare weather-relevant wear", "Dry woods and warm smoky arrangements can feel different to you in heat or cooler air. Test the candidate rather than assuming a family rule."],
    ["Include transport and shelter", "Queues, shuttle rides and covered seating may be the closest parts of the day. Keep those in the plan."],
    ["Protect the bottle", "Follow storage guidance and avoid prolonged heat in parked vehicles. Check venue rules before carrying fragrance."],
  ], "Write the outdoor conditions and enclosed transitions that your woody candidate must fit.", "Compare HUME's wood-led samples in advance, without treating oud notes as a guarantee of outdoor projection.", ["bleu-de-chanel", "tom-ford-oud-wood"]),
  g("Woody perfume for holidays", "Woody occasions", "A woody holiday perfume should fit your destination and activities rather than a generic seasonal rule. A tested versatile favorite may serve the trip better than a new large bottle.", [
    ["Plan the actual uses", "A city itinerary with dining differs from a largely outdoor break. Choose the wood texture you want in those settings."],
    ["Check luggage requirements", "Review current transport rules for the route and container. Small size is not an automatic exemption."],
    ["Keep storage practical", "Follow product guidance and avoid prolonged heat. Do not pack several unfamiliar scents merely to cover imagined occasions."],
  ], "Select one tested woody favorite after matching its later character to your holiday itinerary.", "HUME's small samples can help settle a woody travel preference before departure; check delivery and current format details."),
  g("Woody perfume for gifting", "Woody occasions", "For a woody perfume gift, learn which wood texture the recipient likes before choosing. A preference for cedar-like dryness does not necessarily extend to smoky oud or sweet woods.", [
    ["Ask about a real reference", "A liked perfume name or a clear texture description is more useful than assuming wood suits a particular gender."],
    ["Offer a meaningful contrast", "If the recipient wants exploration, compare distinct wood arrangements rather than several near-identical descriptions."],
    ["Confirm the gift conditions", "Check timing, product identity and returns. Natural wood content cannot be inferred from a fragrance's note list."],
  ], "Ask the recipient to choose between dry, creamy and smoky wood impressions before building the gift shortlist.", "Use HUME discovery choices to explore wood structures together, without promising natural oud content or universal gift appeal."),
  g("Unisex perfume for office wear", "Unisex occasions", "A unisex label means the fragrance is offered without a single-gender restriction; it does not establish office suitability. Choose by scent preference, workplace policy and actual presence.", [
    ["Translate the label into notes", "Look for the fresh, floral, woody or warm direction you enjoy. Unisex is not a scent family."],
    ["Assess shared-space fit", "A product marketed to everyone can still project strongly. Test the exact candidate away from work first."],
    ["Respect workplace expectations", "Follow fragrance-free rules and avoid spraying in shared air. Professionalism does not depend on wearing perfume."],
  ], "Remove gender wording from your shortlist and compare the remaining notes and workplace constraints.", "Explore HUME's floral-woody and softer wood-containing candidates by their live descriptions, then evaluate office presence yourself.", ["myself", "gypsy-water"]),
  g("Unisex perfume for college", "Unisex occasions", "For college, unisex fragrance is an invitation to explore beyond gender categories. Choose the smell, price and wearing experience that suit your classes and preferences.", [
    ["Start with familiar likes", "Citrus peel, flowers or dry woods are useful clues regardless of who a product is marketed to."],
    ["Keep the campus context", "Close seating and course-specific rules matter more than the unisex label. Apply away from shared spaces."],
    ["Spend on discovered preferences", "A small comparison can reveal taste before you purchase a bottle. Check the complete delivered price."],
  ], "Choose two contrasting scent directions without using gender as the reason to include or reject them.", "HUME samples let you compare live note structures and form your own college shortlist rather than buying from labels alone."),
  g("Unisex perfume for date nights", "Unisex occasions", "A unisex date-night perfume should express a scent you enjoy rather than an idea of what another gender expects. Venue, familiarity and considerate presence still matter.", [
    ["Choose your preferred character", "Floral woods and soft warmth can both be options. The unisex category does not promise one shared smell."],
    ["Avoid attraction claims", "No fragrance guarantees chemistry or compliments. Choose a favorite you feel comfortable wearing without that promise."],
    ["Match the plan", "A close café table may call for restraint. Discuss preferences if your companion dislikes or avoids fragrance."],
  ], "Describe the mood you want using scent words rather than gender expectations before choosing a date-night candidate.", "Compare HUME's floral-woody and softer wood-and-vanilla directions on separate days before the date.", ["myself", "gypsy-water"]),
  g("Unisex perfume for weddings", "Unisex occasions", "Choose a unisex wedding fragrance for personal meaning and the celebration's setting. Neither partner needs to follow a gendered fragrance tradition to find an appropriate scent.", [
    ["Consider individual preferences", "Matching fragrances are optional. Each person can enjoy a different direction without needing a coordinated purchase."],
    ["Rehearse close-contact wear", "Test the candidate before ceremonies, greetings and dining. Do not rely only on an opening sniff."],
    ["Allow enough lead time", "Check current availability and delivery before planning around a sample kit. Keep experiments away from delicate event clothing."],
  ], "Write the scent memory you want from the celebration before comparing candidates without gender restrictions.", "Use HUME discovery trials individually or together, checking preorder timing while leaving each person's preferences open."),
  g("Unisex perfume for daily commuting", "Unisex occasions", "For commuting, the useful qualities are personal enjoyment and considerate presence in shared transport. A unisex label does not predict freshness, strength or duration.", [
    ["Define the travel boundary", "Crowded trains or shared cabs matter even when the destination is spacious. Plan for the closest part of the route."],
    ["Read actual scent details", "Choose from the listed structure rather than assuming unisex means light citrus or clean musk."],
    ["Check the arrival experience", "Observe the later scent after ordinary travel. Avoid spraying around passengers or masking discomfort with extra perfume."],
  ], "Evaluate a candidate at arrival using scent enjoyment and shared-space presence as separate criteria.", "Browse HUME's live notes without gender filters when useful, then sample the exact commuting candidate."),
  g("Unisex perfume for weekend outings", "Unisex occasions", "Unisex weekend perfume can widen your choices beyond the department you normally browse. Use the outing's mood and itinerary to choose a direction you actually want to explore.", [
    ["Try a new contrast", "Compare a floral-woody structure with an aromatic or softer wood direction. Avoid assuming gender-neutral means neutral-smelling."],
    ["Keep the itinerary relevant", "A casual outing can still include a small café or shared car. Match presence to those spaces."],
    ["Record what surprised you", "Write whether a previously overlooked scent became enjoyable later. This is more useful than adopting a new marketing label."],
  ], "Sample one direction you previously skipped because of its marketing category and describe the actual result.", "Use HUME's different note structures for weekend exploration, selecting by preference rather than an assumed gender boundary."),
  g("Unisex perfume for formal dinners", "Unisex occasions", "A unisex perfume can suit a formal dinner if the exact fragrance is familiar and restrained enough for shared dining. The label itself says nothing about formality or projection.", [
    ["Choose for the table", "Consider prolonged close seating and food aromas. A grand dress code does not require a loud scent."],
    ["Evaluate texture", "Soft woods, florals or freshness may interest you. Try the finished fragrance before linking any note with elegance."],
    ["Keep preparation simple", "Use a tested application and avoid layering unfamiliar products before dinner. Omission is reasonable where fragrance is unwelcome."],
  ], "Choose your dinner candidate by later character and considerate presence after setting aside gendered labels.", "HUME's softer wood-containing and floral-woody options can begin a comparison, without a measured subtlety claim.", ["gypsy-water", "myself"]),
  g("Unisex perfume for outdoor events", "Unisex occasions", "For an outdoor event, select a unisex perfume by its actual scent and your weather-relevant experience. Gender-neutral marketing is not a performance category.", [
    ["Read the composition", "Freshness, woods and sweetness vary across unisex products. Choose a structure that interests you rather than a label alone."],
    ["Consider the whole event", "Covered seating and transport can bring people close. Open air does not remove the need for restraint."],
    ["Plan carrying and storage", "Follow product instructions and venue rules. Avoid exposing the bottle to prolonged heat during the trip."],
  ], "Compare an outdoor candidate using weather, enclosed transitions and later enjoyment instead of marketing category.", "Explore HUME's note-led options for the event, then let a suitable sample wear determine your choice."),
  g("Unisex perfume for holidays", "Unisex occasions", "A unisex holiday fragrance can be selected for one person's preference or shared only when everyone genuinely likes the exact scent. A shared label does not guarantee shared taste.", [
    ["Decide whose needs it serves", "One travel bottle can simplify packing if both wearers already enjoy it. Separate preferences are a valid reason to pack differently."],
    ["Choose for the itinerary", "Account for shared travel, meals and destination conditions. Test before leaving rather than discovering a mismatch abroad."],
    ["Review practical limits", "Check current route rules and storage directions. Do not leave fragrance in a hot vehicle or assume small formats bypass restrictions."],
  ], "If planning to share, ask each wearer to evaluate the exact fragrance independently before deciding to pack it.", "HUME sample comparisons can establish whether a shared holiday favorite exists before a larger purchase."),
  g("Unisex perfume for gifting", "Unisex occasions", "Unisex perfume can broaden a gift shortlist, but it is not a universally safe blind gift. The recipient's actual scent preferences remain the strongest guide.", [
    ["Replace assumptions with clues", "Ask about liked textures or an exact favorite. Avoid treating gender-neutral packaging as evidence that everyone will enjoy the scent."],
    ["Choose a level of certainty", "A confirmed favorite supports a bottle; uncertainty may suit a recipient-approved sample selection."],
    ["Check identity and timing", "Verify the maker, format and availability as well as delivery and returns. Similar names can describe different products."],
  ], "Write three recipient-specific reasons for the gift that do not depend on the word unisex.", "Let the recipient help select HUME discovery samples when their preferences are unfamiliar, checking current preorder information."),
  g("Perfume sample set for office wear", "Occasion sample sets", "An office-oriented sample set should help you compare enjoyable scents and appropriate presence before choosing a work bottle. It does not certify every included fragrance for every workplace.", [
    ["Build a focused comparison", "Include different fresh or woody structures and a known preference if available. Avoid choosing only from promises of strength."],
    ["Trial away from work", "Follow product directions on suitable days and record later presence. Respect fragrance-free policy rather than testing the set during meetings."],
    ["Choose one useful result", "The goal can be a single suitable favorite, or the decision to skip office fragrance. You need not turn every sample into a bottle."],
  ], "Create an office comparison sheet with policy fit, later enjoyment and presence as separate columns.", "HUME's selectable discovery builder supports a varied shortlist; assess each sample individually before workplace use."),
  g("Perfume sample set for college", "Occasion sample sets", "A college sample set is useful when it answers preference questions before a bottle purchase. Compare the exploration cost with your budget and the kinds of settings on your timetable.", [
    ["Choose meaningful variety", "Include contrasting scent directions rather than filling the kit with near-duplicates whose differences you cannot describe."],
    ["Keep a simple trial log", "Use one unfamiliar scent at a time on appropriate days. Record the later impression as well as the opening."],
    ["Spend after learning", "A favorite may justify a bottle later; enjoying occasional samples is also a complete outcome. Check delivered cost before buying."],
  ], "List three questions you want a sample set to answer before choosing its contents.", "Build HUME's discovery selection around contrasting preferences and check current preorder timing against your college plans."),
  g("Perfume sample set for date nights", "Occasion sample sets", "A date-night sample set should help you find a fragrance you like before the occasion. It is a way to explore character, not a collection of guaranteed attraction formulas.", [
    ["Select different moods", "Compare freshness, smooth woods and floral warmth if those directions interest you. Keep strong dislikes out of the shortlist."],
    ["Trial before the date", "Observe each candidate's later scent on separate suitable days. Do not open several unfamiliar samples just before leaving."],
    ["Match the final venue", "A favorite still needs considerate presence in restaurants or cinemas. Choose the tested candidate that suits the actual plan."],
  ], "Rank date-night samples by personal enjoyment and venue fit rather than promised compliments.", "Use HUME's chosen discovery samples to find a familiar favorite before the date instead of experimenting during it."),
  g("Perfume sample set for weddings", "Occasion sample sets", "A wedding sample set is most useful early enough to allow separate trials and a final decision before the event. Fixed dates make delivery and repeat testing part of the purchase decision.", [
    ["Build around the celebration", "Consider ceremony conditions, dining and close greetings. Include directions you enjoy rather than a mandatory bridal or groom category."],
    ["Compare before committing", "Give a favorite another wear and observe later development. Avoid testing directly on special clothing."],
    ["Work backwards from the date", "Review current preorder and delivery information. Do not rely on a kit arriving just before the ceremony."],
  ], "Set a sample-order deadline, trial period and final-choice date before buying a wedding discovery set.", "Choose HUME discovery samples only when current availability leaves enough time to compare and, if wanted, order a favorite bottle."),
  g("Perfume sample set for daily commuting", "Occasion sample sets", "A commuting sample set should compare how different scents feel through normal travel and after arrival. Choose for restrained shared-space use rather than maximum opening impact.", [
    ["Pick contrasting travel candidates", "Fresh, aromatic and dry woody directions can answer different preference questions. Notes alone cannot establish quietness."],
    ["Keep conditions readable", "Record the exact sample and routine used. Similar ordinary journeys make observations more useful without pretending to be laboratory tests."],
    ["Assess arrival separately", "Write later enjoyment and surrounding presence independently. Never spray samples around fellow passengers."],
  ], "Create an arrival-time comparison log for each candidate instead of ranking them immediately after application.", "HUME discovery choices can support separate commuting trials, with the favorite selected from your own later-wear notes."),
  g("Perfume sample set for weekend outings", "Occasion sample sets", "A weekend sample set can provide structured exploration when you want variety beyond a weekday favorite. Choose contents that add distinct experiences and try them on separate outings.", [
    ["Give each choice a role", "A fresh option, a dry wood and a warmer direction can reveal different preferences. Avoid adding samples only because their names are popular."],
    ["Match the outing", "Cafés and shared cars still require restraint. Choose suitable plans for an unfamiliar fragrance trial."],
    ["Review before buying more", "Record which differences you actually valued. Another bottle should add something you expect to use."],
  ], "Assign each selected sample a distinct weekend mood before placing the kit order.", "Use HUME's selectable kit to explore purposeful contrasts rather than buying several full bottles for occasional outings."),
  g("Perfume sample set for formal dinners", "Occasion sample sets", "For formal dinners, use a sample set to identify a familiar scent with considerate presence before the meal. A dinner shortlist should not be organized solely around intense evening fragrances.", [
    ["Define dining fit", "Food, close seating and long conversation favor restraint. Include the option of wearing no fragrance."],
    ["Observe later development", "Try candidates before the dinner day and note whether warmth or spice becomes more prominent."],
    ["Choose before dressing", "Avoid making the final comparison on delicate formal garments. Keep spraying away from the dining venue."],
  ], "Compare dinner candidates by later texture and presence at close conversational distance on an appropriate earlier day.", "HUME sample trials can help select a dinner favorite, without assuming every discovery choice is quiet enough for shared dining."),
  g("Perfume sample set for outdoor events", "Occasion sample sets", "An outdoor-event sample set should answer which scent you enjoy in comparable conditions. Include weather and enclosed transitions in the trial rather than ranking only by perceived strength.", [
    ["Select real contrasts", "Marine freshness, citrus woods or warmer textures may interest you. Family names do not establish outdoor duration."],
    ["Test before the event", "Record the later scent during a suitable day with similar activity. Avoid taking a whole unfamiliar kit for last-minute decisions."],
    ["Plan the carry format", "Follow storage directions, secure containers and check venue rules. A small sample can still be damaged or leak if handled poorly."],
  ], "Choose the outdoor sample trial that best resembles the event and log the enclosed parts as well.", "Use HUME discovery samples to decide before departure, taking only an appropriate familiar choice if the venue permits it."),
  g("Perfume sample set for holidays", "Occasion sample sets", "For holidays, a sample set can be useful before travel to identify a favorite. It need not become an entire on-trip testing project or a reason to pack unfamiliar fragrances for every activity.", [
    ["Separate discovery from packing", "Try candidates before leaving so the holiday choice is familiar. A smaller shortlist makes decisions easier."],
    ["Check current travel requirements", "Review route-specific carrier and security rules for all containers. Sample size alone does not establish compliance."],
    ["Allow delivery and trial time", "Preorder timing matters before a fixed departure. Follow storage instructions at the destination."],
  ], "Set a pre-trip trial schedule and choose which known favorite, if any, earns luggage space.", "Order HUME's discovery selection with time to compare before departure, checking its current preorder details."),
  g("Perfume sample set for gifting", "Occasion sample sets", "A perfume sample set can be a thoughtful gift for someone who wants to explore several scents. It works best when the recipient's preferences help shape the contents and the order fits the gift date.", [
    ["Confirm interest in exploration", "Some people want their exact favorite instead. A discovery gift should suit the recipient rather than simply offer more items."],
    ["Choose contents intentionally", "Ask for liked directions and exclusions. A selectable set lets you compare different structures without claiming universal appeal."],
    ["Verify the full offer", "Check current sample quantities, sizes, price, presentation information and returns. Do not promise a redemption credit that is not listed."],
  ], "Ask whether the recipient wants discovery or a known favorite before deciding on the gift format.", "HUME's builder lets you choose the listed discovery samples; review the live offer and preorder timing before gifting."),
  g("How to choose a fragrance for office wear", "Choosing by occasion", "Choose an office fragrance by checking policy, defining your preferred scent character and testing presence before workplace use. A professional setting does not require a particular brand or scent family.", [
    ["Set the non-negotiables", "Fragrance-free rules and close shared rooms come first. Do not buy a work bottle before understanding these constraints."],
    ["Write a preference brief", "Name two liked directions and one dislike. This gives a quiz or catalogue search a clearer purpose."],
    ["Make the final choice from wear", "Compare the complete development on suitable earlier days. Later enjoyment matters alongside restraint."],
  ], "Write a three-part office brief: policy, preferred character and acceptable presence.", "Use HUME's quiz for direction, then verify the shortlisted candidate with a sample before choosing a work size."),
  g("How to choose a fragrance for college", "Choosing by occasion", "Choose a college fragrance by combining your class routine, scent preferences and total budget. Start with a small purposeful comparison rather than a long list of popular bottles.", [
    ["Map the shared day", "Consider lectures, labs, libraries and transport. Follow course and campus restrictions."],
    ["Set a realistic ceiling", "Include delivery and compare formats you expect to use. Cost per millilitre is not the only measure of value."],
    ["Retest the favorite", "Return to the preferred candidate on another appropriate day. Choose only if the later scent remains enjoyable."],
  ], "Write your college routine and total spending ceiling before selecting two contrasting sample directions.", "HUME's discovery builder can resolve unfamiliar preferences; choose a bottle later only if a sample earns repeat use."),
  g("How to choose a fragrance for date nights", "Choosing by occasion", "Choose a date-night fragrance by the venue, your own enjoyment and familiarity with the exact product. A supposed seductive note is weaker guidance than a scent you have actually worn.", [
    ["Start with the plan", "A dinner table and an outdoor walk involve different proximity. Use the closest setting as the boundary."],
    ["Pick a personal mood", "Fresh, floral or woody can all be possibilities. You do not need to follow a gendered attraction script."],
    ["Decide ahead of time", "Use previous sample wears to choose. Avoid a new layered combination just before the date."],
  ], "Choose your date candidate using three checks: liked later scent, known presence and venue fit.", "Explore HUME sample directions before the occasion, without buying on promises of attraction or compliments."),
  g("How to choose a fragrance for weddings", "Choosing by occasion", "Choose a wedding fragrance by planning enough time to test, considering the event schedule and selecting a scent you personally want to remember. Strength alone is not a useful wedding criterion.", [
    ["Write the celebration brief", "List outdoor ceremonies, indoor meals and close greetings. Decide which parts require the most restraint."],
    ["Test and repeat", "Try the exact candidate in advance and return to the favorite. Avoid experimenting on special outfits."],
    ["Check purchase timing", "Verify availability and delivery before relying on samples or a bottle. Keep a familiar existing favorite as a practical option."],
  ], "Create a wedding fragrance decision date that leaves room for delivery and repeat trials.", "Use HUME's selectable discovery set early in preparation, checking current preorder status before making it part of the event plan."),
  g("How to choose a fragrance for daily commuting", "Choosing by occasion", "Choose a commuting fragrance around the busiest shared part of your journey and the scent you enjoy at arrival. Freshness, projection and longevity are separate questions.", [
    ["Describe your route", "A bike ride, shared cab and packed metro create different contexts. Choose with actual proximity in mind."],
    ["Compare after normal travel", "Record the later character and whether it feels pleasant through the next part of your day. Do not judge only the opening."],
    ["Keep the routine considerate", "Apply away from passengers, follow directions and avoid using more scent to mask the commute."],
  ], "Write an arrival-time preference note for each candidate before selecting a regular commuting fragrance.", "Compare HUME sample directions on separate suitable days and choose from the journey experience rather than a generic travel label."),
  g("How to choose a fragrance for weekend outings", "Choosing by occasion", "Choose a weekend fragrance by the outing's mood and actual activities. Decide whether you want a familiar favorite or a useful experiment before buying another bottle.", [
    ["Name the difference you want", "A softer texture, brighter opening or warmer development is a clearer brief than simply weekend perfume."],
    ["Account for mixed spaces", "An open-air plan may include cafés and shared cars. Keep the closest stop in mind."],
    ["Review the result", "After an appropriate trial, ask whether the candidate adds an experience your current fragrance does not provide."],
  ], "Finish the sentence: my weekend fragrance should add ___ to my existing routine.", "Use HUME discovery choices to explore that specific difference before committing to an additional bottle."),
  g("How to choose a fragrance for formal dinners", "Choosing by occasion", "Choose a formal-dinner fragrance by considering the meal, seating and a familiar later scent. Elegance does not require expensive perfume or strong surrounding presence.", [
    ["Put the table first", "Long close conversation and food aromas favor a restrained approach. Skipping perfume can also fit the occasion."],
    ["Test the development", "Evaluate any warm, fresh or woody candidate beforehand. The first spray cannot establish the whole dinner experience."],
    ["Prepare without experiments", "Keep fragrance away from the table and follow garment guidance. Do not use formal clothing as a test surface."],
  ], "Select a known dinner candidate by meal compatibility and considerate presence rather than its price or evening label.", "Try HUME samples before the formal meal so the final choice comes from familiar wear rather than a last-minute catalogue description."),
  g("How to choose a fragrance for outdoor events", "Choosing by occasion", "Choose an outdoor-event fragrance by matching your preferences to weather, activity and enclosed portions of the day. Do not equate stronger application with better outdoor suitability.", [
    ["Map the conditions", "Consider heat, movement and the event length. Look for comparable personal wear experience rather than fixed performance hours."],
    ["Plan for transitions", "Queues, transport and covered seating can determine how considerate your scent needs to be."],
    ["Handle the bottle sensibly", "Follow storage directions and venue rules. Avoid leaving fragrance in a hot parked vehicle."],
  ], "Write the event's weather, activity and closest shared space beside your fragrance shortlist.", "Use HUME samples ahead of the event to compare candidates in relevant conditions without relying on projection promises."),
  g("How to choose a fragrance for holidays", "Choosing by occasion", "Choose a holiday fragrance by the destination, itinerary and practical travel requirements. A tested favorite that covers several real activities can be enough.", [
    ["Prioritize real uses", "List your likely daily activities rather than packing a different perfume for every imagined occasion."],
    ["Settle scent before departure", "Try unfamiliar candidates at home and observe their later character. The holiday need not be the first test."],
    ["Check transport and storage", "Review current route rules and product guidance. Secure closure and protection from prolonged heat matter."],
  ], "Choose the smallest purposeful shortlist that covers your actual itinerary, then verify travel requirements.", "Use HUME discovery samples to settle preferences before travelling, allowing for the current preorder lead time."),
  g("How to choose a fragrance for gifting", "Choosing by occasion", "Choose a fragrance gift by collecting recipient-specific preferences and deciding how much uncertainty is acceptable. A known exact favorite is different from a discovery gift.", [
    ["Ask for useful information", "Confirm an exact product and version or request broad likes and dislikes. Bottle appearance and demographics are weak substitutes."],
    ["Match the gift format", "Choose a bottle when the preference is established, or an agreed sample selection when exploration is welcome."],
    ["Check the complete purchase", "Verify product identity, delivery, presentation and returns. Avoid promising unlisted exchanges or future purchase credits."],
  ], "Write the recipient's preferences, gift deadline and preferred level of surprise before selecting anything.", "Build HUME discovery choices with the recipient where possible, checking live kit details rather than assuming a separate gift service."),
  g("Affordable perfume for office wear", "Occasion budgets", "Affordable office perfume should fit a comfortable total budget and workplace expectations. A low purchase price is not good value if the fragrance is unwelcome or you avoid wearing it.", [
    ["Check whether you need one", "Fragrance-free rules may make a work purchase unnecessary. A current permitted favorite can also solve the need."],
    ["Compare complete cost", "Include delivery and choose a useful size. Larger volume is not automatically economical for restrained occasional use."],
    ["Resolve uncertainty first", "Sample unfamiliar scents on suitable non-work days. Assess later enjoyment and presence instead of selecting the strongest cheap option."],
  ], "Set an office-fragrance total budget after checking policy and whether an existing favorite already fits.", "Compare HUME's live prices and formats; use discovery only when it answers a genuine scent question before buying."),
  g("Affordable perfume for college", "Occasion budgets", "Affordable college perfume means a scent you enjoy within your available spending limit. Focus on useful wear and shared-space fit rather than buying several discounted bottles.", [
    ["Set a spending boundary", "Include shipping and avoid stretching the budget for a larger size solely because its unit price is lower."],
    ["Choose one learning step", "A small comparison can help uncertain preferences; a known favorite may not need another discovery purchase."],
    ["Check everyday relevance", "Classes, transport and campus rules determine whether the fragrance will be used. Popularity does not establish value for you."],
  ], "Write your maximum delivered spend and the number of occasions you realistically expect to wear fragrance each week.", "Use current HUME sizes and prices to compare a known favorite with discovery, choosing the route that solves your actual uncertainty."),
  g("Affordable perfume for date nights", "Occasion budgets", "An affordable date-night perfume can be a current favorite rather than a new occasion purchase. Choose for personal enjoyment and venue fit without paying for unverified attraction claims.", [
    ["Begin with what you own", "A familiar fragrance may already suit dinner or a walk. A new bottle is optional even for an important date."],
    ["Keep exploration proportionate", "If you want a different mood, compare samples before a larger purchase. Rare use may not justify the largest available size."],
    ["Assess value honestly", "Compliment promises do not belong in a budget calculation. Check complete price and how often you will want the scent again."],
  ], "Compare the cost of using a known favorite with the specific experience a new date fragrance would add.", "Try HUME discovery options for a different mood only when that comparison serves your budget and preferences."),
  g("Affordable perfume for weddings", "Occasion budgets", "An affordable wedding fragrance should fit the celebration budget without sacrificing time to test. You do not need an expensive bottle to create a personal scent association.", [
    ["Decide the actual need", "A familiar favorite can be meaningful. A dedicated wedding purchase should add something you want beyond its special-occasion packaging."],
    ["Budget the full sequence", "If sampling first, include that cost and any later bottle purchase. Do not assume a redemption credit exists."],
    ["Protect the event deadline", "Check stock, preorder timing and delivery early. A cheaper late purchase can leave no time to evaluate the scent."],
  ], "Allocate a complete fragrance budget including exploration before comparing wedding candidates.", "Review HUME's current kit and bottle prices independently, leaving time for discovery delivery and repeat wear before the wedding."),
  g("Affordable perfume for daily commuting", "Occasion budgets", "Affordable commuting fragrance should offer repeat enjoyment within your budget while remaining considerate in crowded transport. Stronger projection is not automatically better value.", [
    ["Choose for frequent use", "Compare available sizes with your real routine. Avoid claiming exact bottle life from a spray count that varies by atomizer."],
    ["Evaluate after travel", "A pleasant later scent matters more than an impressive opening you dislike by arrival."],
    ["Avoid unnecessary top-ups", "Reduced awareness is not proof that the fragrance has disappeared. More frequent use raises consumption without necessarily improving the journey."],
  ], "Assess commuting value using delivered cost, later enjoyment and a considerate routine rather than claimed projection hours.", "Use HUME's current prices alongside sample wear records to choose a regular candidate you actually want to repeat."),
  g("Affordable perfume for weekend outings", "Occasion budgets", "For weekend outings, affordability depends on how often you will use the fragrance and what it adds to your collection. A discounted bottle is not a saving if it duplicates an existing favorite.", [
    ["Identify the missing experience", "Name a texture or mood your regular fragrance does not cover. This gives a new purchase a purpose."],
    ["Compare occasional-use formats", "Smaller quantities may suit infrequent outings even if a larger bottle has a lower unit price."],
    ["Keep the whole total visible", "Include delivery and avoid adding unwanted items merely to reach an assumed offer threshold."],
  ], "Estimate your real weekend use and state the difference a new fragrance would add before comparing sizes.", "HUME discovery samples can support occasional exploration; choose a larger favorite only when repeated enjoyment makes it useful."),
  g("Affordable perfume for formal dinners", "Occasion budgets", "An affordable formal-dinner perfume should be familiar and considerate at the table. Neither a premium label nor a dedicated dinner bottle is required for formal dress.", [
    ["Check your current choices", "A restrained existing favorite may already fit. The formality of a venue does not create a need for a more expensive scent."],
    ["Match quantity to use", "If formal dinners are rare, compare smaller formats before choosing the largest bottle."],
    ["Do not buy intensity as value", "A strong perfume can be intrusive around food. Judge later enjoyment and appropriate presence instead of maximum output per rupee."],
  ], "Decide whether your current favorite fits dinner before spending on a separate formal fragrance.", "Use HUME samples to compare an unfamiliar dinner direction only when it adds a useful option within your total budget."),
  g("Affordable perfume for outdoor events", "Occasion budgets", "Affordable outdoor-event perfume should suit the event and your budget without relying on claims of extreme performance. A familiar suitable fragrance can be more useful than buying extra strength for open air.", [
    ["Use the itinerary as the brief", "Weather, queues and covered areas matter more than a universal outdoor category. Include shared transport."],
    ["Avoid performance shortcuts", "Price and concentration cannot establish exact hours or distance. Choose from relevant personal wear experience."],
    ["Consider carry practicality", "Check venue rules and storage guidance before purchasing a travel format. Protecting what you own may be enough."],
  ], "Compare a known suitable fragrance with any proposed new purchase using event fit and total cost.", "Try HUME sample candidates before the event if you need a different direction, without treating price as a guarantee of outdoor strength."),
  g("Affordable perfume for holidays", "Occasion budgets", "Affordable holiday perfume begins with deciding whether a tested favorite already covers the trip. Buying several destination-themed scents can add cost without improving the experience.", [
    ["Plan a small useful selection", "Choose for your actual activities and shared travel. One familiar option may be enough."],
    ["Include preparation costs", "Add sample exploration and delivery if needed. Allow for current preorder timing before a fixed departure."],
    ["Check packing constraints", "Review current carrier and security rules before buying a format for travel. Follow product storage directions at the destination."],
  ], "Set a total holiday-fragrance budget only after checking existing favorites and the real itinerary.", "Use HUME discovery to settle unfamiliar preferences before departure rather than adding a large untested bottle to the trip budget."),
  g("Affordable perfume for gifting", "Occasion budgets", "An affordable perfume gift should fit your budget and the recipient's preferences. Thoughtful selection matters more than bottle size, apparent discount or an expensive-looking presentation.", [
    ["Confirm what they want", "A known favorite and a desire to explore call for different gifts. Ask about preferences instead of guessing from demographics."],
    ["Set the delivered total", "Include shipping and any listed presentation costs. Do not assume complimentary extras or future purchase credits."],
    ["Check the date and terms", "Review availability, delivery and returns before paying. A gift should not depend on an unverified exchange promise."],
  ], "Choose a recipient-approved format after setting the complete gift budget and delivery deadline.", "Compare HUME's live bottle and discovery offers against the recipient's wishes, checking current preorder details for a dated gift."),
];
