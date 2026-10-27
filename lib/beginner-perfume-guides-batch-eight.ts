import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string, productIds: string[] = []): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep: "samples", productIds };
}

export const BEGINNER_GUIDES_BATCH_EIGHT: BeginnerGuide[] = [
  g("How to tell if woody perfumes suit my skin", "Scent fit", "A woody perfume suits your scent preferences when you enjoy its changing wood character during ordinary wear. That judgment is separate from whether the ingredients are suitable for your skin.", [
    ["Choose a wood texture", "Compare dry cedar-like character with creamy sandalwood or smoky woods. Disliking one texture does not rule out the whole woody family."],
    ["Follow the supporting notes", "Spice, citrus and sweetness can change your experience of the wood. Record the complete later scent rather than judging a single listed ingredient."],
    ["Separate comfort from preference", "A pleasant smell cannot establish ingredient compatibility. Stop using a product that causes irritation; persistent or recurrent symptoms warrant qualified advice."],
  ], "Describe the wood texture at the start and later, then decide whether you would wear it again.", "Compare HUME's citrus-and-wood and oud-listed structures as different woody directions before choosing a bottle.", ["bleu-de-chanel", "tom-ford-oud-wood"]),
  g("How to tell if sweet perfumes suit my skin", "Scent fit", "Evaluate a sweet perfume by the kind of sweetness you enjoy and whether it remains comfortable to smell later. Skin irritation is a separate issue that a vanilla or gourmand label cannot resolve.", [
    ["Name your sweetness limit", "Distinguish soft vanilla warmth from sugary fruit or dessert-like richness. Write which impression you enjoy and which becomes tiring."],
    ["Try a realistic setting", "A relaxed evening and a warm commute can produce different preferences. Evaluate your intended use rather than only the first spray."],
    ["Do not diagnose from notes", "A notes list is a scent description, not a complete ingredient assessment. Stop if irritation occurs and seek advice for persistent symptoms."],
  ], "Rate enjoyment of the sweetness at the opening and later in the setting where you plan to wear it.", "HUME's vanilla-containing options offer contrasting compositions; sample the whole fragrance rather than buying from vanilla alone.", ["myself", "eros-flame"]),
  g("How to tell if floral perfumes suit my skin", "Scent fit", "To judge a floral perfume, compare the flower impression and its later supporting character. Enjoying rose or jasmine does not establish that a particular formula agrees with your skin.", [
    ["Distinguish floral styles", "Fresh petals, powdery iris and richer jasmine impressions can feel very different. Start with a style you can describe rather than a gender label."],
    ["Notice the later balance", "Woods, sweetness or musk may become more apparent after the opening. Decide whether that development is part of what you want."],
    ["Check the actual product", "Consult ingredient information when relevant. Discontinue an irritating product; recurring or severe skin symptoms need qualified assessment."],
  ], "Write your preferred floral texture and one supporting note impression you would like to compare.", "Use the live HUME notes below to compare a floral-and-woody direction with an iris-led structure.", ["myself", "homme-intense"]),
  g("How to tell if oud perfumes suit my skin", "Scent fit", "An oud-style fragrance suits your taste if you enjoy its full woody, warm or smoky development at your preferred presence. Oud wording alone establishes neither natural material content nor skin suitability.", [
    ["Choose a manageable contrast", "Compare a wood-and-spice composition with a rose-and-incense direction. There is no single oud smell shared by every finished perfume."],
    ["Judge it beyond reputation", "An expensive or intense image is not a reason to tolerate a scent you dislike. Check whether you want to wear the later character again."],
    ["Keep ingredient questions separate", "Do not use wear duration to infer purity or compatibility. Stop if irritation develops and discuss recurrent symptoms with a qualified professional."],
  ], "Compare two oud-listed structures on separate suitable days and name the supporting character you prefer.", "HUME's two oud-listed candidates below let you explore contrasting arrangements without a natural-oud or longevity guarantee.", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("How to tell if budget perfumes suit my skin", "Scent fit", "Budget is a spending category, not a skin type or fragrance formula. Judge the exact perfume's smell, product information and your experience rather than assuming its price determines compatibility.", [
    ["Identify what you are buying", "Check maker, format and version. A small bottle, inspired fragrance and designer original represent different offers even at a similar price."],
    ["Separate value from intensity", "A fragrance you comfortably enjoy and use can be better value than a stronger one you avoid. Include delivery in your spending decision."],
    ["Use ingredient information", "Neither low price nor premium pricing certifies a formula for your skin. Discontinue irritation and seek help for persistent or recurrent symptoms."],
  ], "Compare exact identity, delivered price and repeat-wear enjoyment before deciding which candidate offers value.", "Review HUME's current prices and samples to resolve scent uncertainty within your own spending limit."),
  g("How to tell if perfume samples suit my skin", "Scent fit", "A sample helps you evaluate a particular fragrance before buying more. Small size does not make a formula safer, and liking the scent is separate from assessing ingredient-related concerns.", [
    ["Save the sample identity", "Record maker, fragrance, version and applicator. Another product with a similar name may not be the same formula."],
    ["Keep the comparison readable", "Follow the product directions and avoid layering several unfamiliar fragrances. Give a favorite another ordinary wear before choosing a larger size."],
    ["Understand the limits", "A home scent trial is not a clinical allergy test. Stop using anything that irritates you and seek qualified advice if symptoms persist."],
  ], "Keep a sample log with exact name, later scent impression and whether you want another wear.", "Label each chosen HUME discovery sample in your notes so the eventual bottle matches the fragrance you actually enjoyed."),
  g("How to tell if oil perfumes suit my skin", "Scent fit", "Evaluate the specific oil perfume's scent and application instructions. An oil base or alcohol-free claim does not automatically establish skin compatibility or gentle wear.", [
    ["Read the complete product details", "Check intended use, carrier information and ingredients supplied by the maker. Do not assume all scented oils are ready-to-use perfumes."],
    ["Assess the wearing experience", "Observe whether you enjoy the texture, applicator and later scent. Application behavior differs from a spray, so equal application counts are not equal quantities."],
    ["Avoid safety shortcuts", "Natural and alcohol-free descriptions do not rule out irritation. Discontinue a reaction and seek professional advice when symptoms are persistent or recurrent."],
  ], "List the oil's identity, intended use and application directions before evaluating scent preference.", "HUME's discovery set explores its listed sample format; check each listing rather than assuming it supplies oil alternatives."),
  g("How to tell if light perfumes suit my skin", "Scent fit", "A light perfume suits your taste when its quieter impression remains enjoyable in your routine. Perceived lightness describes scent presence, not the ingredient suitability of a formula.", [
    ["Define what light means to you", "You might mean airy texture, restrained sweetness or little surrounding presence. Those are different requests and should guide separate comparisons."],
    ["Allow a quiet result", "A fragrance does not need to fill a room to be useful. Decide whether the later close-range experience is enough instead of chasing stronger projection."],
    ["Do not equate quiet with non-irritating", "A softly perceived product can still contain ingredients unsuitable for an individual. Stop if irritation occurs and seek advice for ongoing symptoms."],
  ], "Finish the sentence: I want light to mean ___, then assess that exact quality during wear.", "Use HUME's softer preference options to build a shortlist, then verify actual presence with samples rather than treating a quiz result as certification."),
  g("Daytime vs evening perfume", "Occasions and etiquette", "Daytime and evening perfume are flexible uses rather than fixed fragrance categories. Choose for the temperature, setting and people around you before deciding whether you want a brighter or richer scent.", [
    ["Start with the room", "An evening train can require more restraint than an outdoor afternoon. Time on the clock does not tell you how much presence is appropriate."],
    ["Compare the mood", "Citrus or marine notes can be a daytime starting point; woods or warmth may interest you after dark. Neither direction is restricted to that time."],
    ["Check the transition", "If you go straight from work to dinner, assess your existing scent before adding another. Layering unfamiliar products makes the result less predictable."],
  ], "Describe one daytime and one evening setting by enclosure, heat and desired scent presence.", "Compare a fresh HUME sample and a woodier candidate to learn which changes you actually want between occasions.", ["acqua-di-gio-profondo", "tom-ford-oud-wood"]),
  g("Office perfume etiquette", "Occasions and etiquette", "Office perfume etiquette starts with workplace policy and consideration for colleagues in shared spaces. Keep scent restrained, apply away from others and respect requests to reduce or avoid fragrance.", [
    ["Check the workplace rule", "A fragrance-free policy takes priority over your preferred scent. Meeting rooms and shared desks also call for attention to proximity."],
    ["Apply before arriving", "Avoid spraying at a desk, in a lift or in a shared washroom. Your own reduced awareness is not evidence that everyone else can no longer smell it."],
    ["Respond without debate", "If a colleague raises discomfort, reduce or omit the fragrance. A fresh description or high price does not override another person's experience."],
  ], "Check the office policy and identify the closest shared part of your working day before planning application.", "Use HUME samples on suitable non-work days first, so an unfamiliar fragrance is not introduced during a crowded meeting."),
  g("Perfume for first job", "Occasions and etiquette", "For a first job, learn the workplace's fragrance expectations before buying a work perfume. A familiar, restrained scent is easier to manage than a new fragrance chosen to make a strong impression.", [
    ["Observe your new routine", "Customer contact, shared desks and a long commute create different constraints. Ask about policy rather than guessing from office dress."],
    ["Choose comfort over status", "You do not need a premium label to look professional. Select a fragrance you enjoy without making it the main thing people notice."],
    ["Test before the first week", "Use an appropriate day outside work to evaluate the later scent. Leave time to change your mind before an important introduction."],
  ], "Write your commute, workspace and fragrance policy beside a realistic first-job perfume budget.", "Start with HUME's quiz to define a restrained direction, then sample before making a work-bottle purchase."),
  g("Perfume for college beginners", "Occasions and etiquette", "A college beginner's perfume should fit classes, shared transport and a student budget. Prioritize a scent you enjoy at restrained presence rather than trying to announce yourself across a lecture hall.", [
    ["Plan for shared spaces", "Libraries, labs and classrooms may have rules or close seating. Avoid applying fragrance around other students."],
    ["Buy for actual use", "A manageable size can make more sense than several untested bottles. Compare total cost and available formats rather than bottle appearance alone."],
    ["Keep exploration simple", "Try one unfamiliar candidate at a time on a suitable day. Note whether the later scent still interests you after the initial novelty."],
  ], "Choose a college-day budget and two scent directions that suit your usual classes and travel.", "HUME's selectable discovery kit can help explore contrasting directions; check the current preorder timing against your needs."),
  g("How to choose a wedding perfume", "Occasions and etiquette", "Choose a wedding perfume well before the event and test it in conditions resembling the ceremony and reception. Personal meaning, close contact and enjoyment matter more than maximum projection.", [
    ["Map the celebration", "Outdoor rituals, indoor dining and dancing create different settings. Select for the closest shared portion rather than the largest venue alone."],
    ["Rehearse the choice", "Wear the exact candidate on a suitable earlier day. Check the later character and avoid introducing an unfamiliar perfume on the wedding morning."],
    ["Protect the outfit", "Follow garment and product guidance; do not experiment on silk, embroidery or jewellery. A fragrance should not put special clothing at risk."],
  ], "Record the event schedule and select a tested fragrance that remains enjoyable through its different settings.", "Order HUME samples with enough time for delivery and repeat trials; the discovery set's current preorder status matters for a fixed date."),
  g("Perfume for a first date", "Occasions and etiquette", "For a first date, wear a fragrance you already enjoy at a considerate presence. No scent guarantees attraction, and an unfamiliar strong application can distract from the time together.", [
    ["Match the plan", "A café table, cinema and outdoor walk create different distances. Let the most enclosed setting guide restraint."],
    ["Choose familiarity", "A fragrance you have worn before removes one uncertainty. You do not need to buy a supposedly seductive category for a single meeting."],
    ["Leave room for feedback", "Avoid topping up simply because you stop noticing the scent. Respect the other person's preferences if they mention sensitivity or dislike."],
  ], "Choose one already-tested candidate and note the closest setting in the date plan.", "Use HUME samples ahead of the occasion to find a fragrance you enjoy yourself, without relying on attraction claims."),
  g("Everyday perfume vs special occasion perfume", "Occasions and etiquette", "An everyday perfume fits your repeated routine; a special occasion perfume serves a particular mood or event. One fragrance can do both if you enjoy it and manage its presence appropriately.", [
    ["Define the everyday job", "Regular work, transport and casual errands should determine whether a fragrance earns frequent use. A dramatic first impression is not essential."],
    ["Give the second scent a purpose", "Choose a different texture or association rather than a near-duplicate bought only because the occasion sounds important."],
    ["Choose quantities sensibly", "An occasional favorite may not justify the largest bottle. Compare current sizes and likely use without assuming a fixed spray yield."],
  ], "Write the specific experience a second fragrance would add before expanding your collection.", "Compare HUME discovery samples for routine and celebration roles before choosing which favorites deserve bottles."),
  g("One fragrance for work and evenings", "Occasions and etiquette", "For one fragrance across work and evenings, select around your more restrictive setting and a later scent you still enjoy. Versatility comes from fit, not from a universal day-to-night label.", [
    ["Use work as the boundary", "Check office policy and shared seating first. A fragrance that demands large projection may not serve both roles well."],
    ["Assess the later character", "Wear the candidate through an ordinary permitted day. Ask whether the quieter later scent feels suitable for your evening plans."],
    ["Avoid an automatic reset", "Before adding more for dinner, consider what remains and the venue. Extra application is optional rather than a required transition ritual."],
  ], "Keep one wear record spanning your normal daytime routine and a comparable evening activity.", "HUME's citrus-and-wood candidates provide starting points for a versatile shortlist, with actual wear deciding the fit.", ["bleu-de-chanel", "lv-imagination"]),
  g("Perfume for people who commute daily", "Occasions and etiquette", "Daily commuters should choose fragrance around crowded transport and arrival at their destination. Heat and close seating make restraint more useful than trying to overpower the journey.", [
    ["Consider the tightest space", "A packed bus or shared cab matters even if the office is spacious. Avoid spraying during the journey."],
    ["Keep hygiene separate", "Perfume is not a substitute for washing or managing sweaty clothing. Adding scent over discomfort does not solve the underlying problem."],
    ["Observe the arrival scent", "Record how the perfume feels after normal travel. Choose from that experience rather than only a cool indoor first impression."],
  ], "Evaluate one candidate after your usual travel conditions without applying it around fellow passengers.", "Compare a marine and a citrus-and-tea HUME sample on suitable days to find your preferred commuting character.", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("Perfume for close indoor spaces", "Occasions and etiquette", "In close indoor spaces, choose minimal scent presence or omit perfume when policy or others' comfort requires it. An airy notes list does not guarantee that a product stays close to you.", [
    ["Identify prolonged proximity", "Shared cars, treatment rooms and small meeting rooms leave little distance. Consider how long people must remain beside you."],
    ["Test presence beforehand", "Evaluate the exact product away from the shared setting. Your own nose becoming accustomed to it does not establish low projection."],
    ["Keep application private", "Do not spray into shared air. Follow requests for less fragrance without trying to replace one strong scent with another immediately."],
  ], "Identify one situation where skipping fragrance would be more considerate than choosing a different scent.", "Use HUME samples to assess presence before a shared-space occasion; a soft quiz preference only helps create a shortlist."),
  g("How to choose a gym fragrance", "Occasions and etiquette", "Check gym policy first and consider leaving fragrance out of a workout. Close equipment spacing and heavy breathing make strong scent an unnecessary addition to shared exercise space.", [
    ["Do not mask workout odour", "Clean clothing and normal hygiene serve a different purpose from perfume. More fragrance does not make a workout fresher for everyone nearby."],
    ["Avoid shared-air application", "Do not spray in changing rooms or beside equipment. Respect a fragrance-free gym even if your perfume is marketed as sporty."],
    ["Consider after the workout", "If you want scent for later plans, apply according to directions after your usual wash and away from others. Choose for that later setting."],
  ], "Separate the workout itself from your after-gym plans and decide whether fragrance has a useful role in either.", "Explore HUME's fresh directions for suitable post-workout occasions, rather than treating a sports-style fragrance as a gym requirement."),
  g("Perfume for interviews", "Occasions and etiquette", "For an interview, omitting perfume is a reasonable choice, especially when you do not know the setting. If you wear it, use a familiar restrained fragrance and follow any workplace rules.", [
    ["Reduce unknowns", "You may meet several people in a small room. This is a poor moment to discover how an unfamiliar fragrance projects."],
    ["Prepare the routine", "Allow travel time and normal grooming instead of relying on extra scent after a stressful commute. Avoid spraying in reception or lifts."],
    ["Keep the focus on conversation", "There is no fragrance that guarantees professional credibility. Choose a routine that lets you concentrate on the interview itself."],
  ], "Decide your interview grooming routine in advance and leave untested samples for another day.", "HUME exploration can wait until after the interview; use samples on ordinary days to identify future workplace candidates."),
  g("Perfume gift for someone new to fragrances", "Occasions and etiquette", "For someone new to fragrances, a gift that supports exploration may be easier to enjoy than a large bottle chosen without their preferences. Check their interest in perfume before making scent the gift.", [
    ["Ask about broad preferences", "Find out whether they enjoy fresh, floral, woody or sweeter smells and whether they avoid fragrance. Personal taste outweighs demographic labels."],
    ["Choose how much surprise", "You can choose samples together while keeping the presentation a surprise. Do not assume an unwanted opened perfume can be returned."],
    ["Check the practical details", "Review current contents, delivery timing and gift presentation information. Do not invent a voucher or recipient-selection service that the seller does not offer."],
  ], "Ask the recipient for two liked scent directions and one dislike before selecting the gift format.", "Build HUME's selectable sample kit together if the recipient wants exploration, checking current availability and preorder timing."),
  g("How to choose a birthday perfume gift", "Occasions and etiquette", "A birthday perfume gift works best when you know the recipient's preferences and can meet the date. Confirm the exact favorite or choose an agreed exploration format instead of guessing from packaging.", [
    ["Use specific clues", "An exact fragrance and version is stronger evidence than a vague memory of a bottle colour. Ask discreetly when the choice matters."],
    ["Work backwards from the birthday", "Allow for current order lead times and delivery. Preorder products need particular attention when the date is fixed."],
    ["Respect gift limitations", "Check returns, packaging and size before purchase. A birthday does not create an automatic exchange entitlement for scent preference."],
  ], "Write the birthday deadline, confirmed preferences and delivery allowance beside the shortlist.", "Choose a HUME discovery gift only when its current preorder information fits the date and the recipient wants to try several scents."),
  g("Perfume for restaurant visits", "Occasions and etiquette", "For restaurants, keep fragrance restrained so it does not compete with food or nearby diners. The right choice may be a familiar quiet scent or no perfume for a close tasting experience.", [
    ["Think beyond your own table", "Small dining rooms and closely spaced seats extend the impact of a strong scent. Consider the venue rather than only your outfit."],
    ["Avoid fragrance at the table", "Do not spray or open several samples during a meal. Applying more immediately before sitting down can make the opening especially noticeable."],
    ["Choose with food in mind", "A perfume described as gourmand is not automatically suited to dinner. Judge actual presence and your companions' preferences."],
  ], "Before dining, assess the scent already present rather than adding a restaurant top-up by habit.", "Test HUME samples before the dining day and reserve the quieter suitable favorite for close restaurant seating."),
  g("Perfume for outdoor events", "Occasions and etiquette", "For outdoor events, choose according to weather, crowding and any indoor portions. Open air does not justify unlimited application or guarantee how far a fragrance will carry.", [
    ["Read the whole itinerary", "Queues, shuttles and covered seating can be much closer than the main outdoor area. Plan for those transitions too."],
    ["Keep storage sensible", "Do not leave a bottle baking in a parked vehicle. Follow the maker's storage instructions while travelling to the event."],
    ["Evaluate enjoyment in context", "Choose a scent you like in comparable weather. Avoid inferring sun protection or outdoor suitability from citrus or natural wording."],
  ], "Map the open-air and enclosed parts of your event before choosing the fragrance and carry format.", "Try HUME candidates ahead of the event, using live product details and weather-relevant wear experience rather than a projection promise."),
  g("How to avoid overpowering perfume at work", "Occasions and etiquette", "To avoid overpowering perfume at work, follow policy, use a familiar restrained application and avoid automatic top-ups. Your own fading awareness is not a reliable measure of what colleagues notice.", [
    ["Change the routine first", "Apply away from the workplace and keep unfamiliar products for suitable off-duty trials. Switching scent families alone may not reduce presence."],
    ["Assess without creating a burden", "A willing person's feedback outside work can help describe presence. Do not repeatedly ask coworkers to smell you during the day."],
    ["Act on concerns", "If someone is uncomfortable, reduce or skip fragrance. Do not add a second product to cover the first or argue that fresh notes must be unobtrusive."],
  ], "Remove desk-side reapplication from your routine and review whether fragrance is permitted at all.", "Use HUME sample trials to identify your restrained preference before selecting a regular work fragrance."),
  g("Perfume for a long working day", "Occasions and etiquette", "For a long working day, prioritize an enjoyable later scent and considerate presence over an all-day strength claim. A perfume can remain useful even when it becomes quieter.", [
    ["Define the day", "Travel, meetings and an evening errand are different stages. Decide where scent matters and where less presence is preferable."],
    ["Keep a wear record", "Note the opening, later character and your wish to wear it again. Separate close-range enjoyment from surrounding projection."],
    ["Make reapplication optional", "Check policy, the product directions and the next setting before adding more. A midday loss of awareness does not itself justify another application."],
  ], "Record three normal points in your working day and what you actually want from fragrance at each.", "Use individual HUME samples for full-routine comparisons before choosing a bottle based on assumed hours."),
  g("How many sprays for an office", "Occasions and etiquette", "There is no universal office spray count: atomizers, formulas, room size and workplace rules differ. Check policy first, then use a previously tested restrained application or omit fragrance.", [
    ["Avoid false precision", "One spray from one bottle is not necessarily the same quantity as one from another. A concentration label also cannot predict office presence."],
    ["Start outside the office", "Learn the exact product's behavior on an appropriate earlier day, following its directions. Do not experiment during a meeting."],
    ["Review before adding", "Consider close seating and requests from colleagues. Your own inability to smell the fragrance does not establish that another spray is needed."],
  ], "Record the exact bottle and your tested application instead of copying an internet spray number.", "Treat each HUME sample atomizer as its own applicator; confirm a larger bottle's behavior before repeating a sample spray count."),
  g("How to choose perfume for a formal event", "Occasions and etiquette", "Choose a formal-event perfume for the venue, close contact and your own comfort. Formal clothing does not require a heavy fragrance or an expensive bottle.", [
    ["Consider the event structure", "A seated dinner, ceremony and reception can involve prolonged proximity. Let that guide restraint even in a grand venue."],
    ["Rehearse the complete choice", "Wear the candidate before the event and observe its later development. Familiarity helps prevent a distracting scent surprise."],
    ["Keep clothing care separate", "Follow fabric and product instructions rather than spraying an outfit to extend wear. Delicate garments deserve particular care."],
  ], "Describe the event's seating and schedule, then choose a fragrance already tested for that context.", "Compare HUME samples in advance for the formal mood you want, without treating leather, oud or any price tier as compulsory."),
  g("Best perfume for office wear", "Occasion shortlists", "The best office perfume is one permitted by your workplace that you enjoy without imposing strong scent on shared spaces. There is no universal bottle that meets every office's requirements.", [
    ["Set the selection criteria", "Policy, proximity and your preferred character come before a bestseller list. Include an option to wear no fragrance."],
    ["Shortlist by contrast", "A marine direction and a citrus-and-wood structure offer different starting points. Notes help choose candidates but cannot certify quiet projection."],
    ["Choose after a suitable trial", "Compare later enjoyment and presence away from the office first. Keep only the candidate that fits your actual routine."],
  ], "Score office candidates for policy fit, restrained presence and later enjoyment before comparing price.", "The HUME cards below are notes-based starting points for sampling, not measured office-performance winners.", ["acqua-di-gio-profondo", "bleu-de-chanel"]),
  g("Best perfume for college", "Occasion shortlists", "The best college perfume fits your classes, transport and total budget while remaining considerate in shared rooms. Choose repeat-wear enjoyment rather than popularity alone.", [
    ["Define student value", "Set a total spending limit including delivery. Buying a larger bottle is not saving if you avoid wearing its scent."],
    ["Compare different directions", "A bright citrus direction and a floral-woody composition can reveal preferences more clearly than several near-duplicates."],
    ["Check campus constraints", "Labs, libraries and close classrooms may restrict fragrance. Do not treat a youthful marketing label as permission to spray freely."],
  ], "Compare two samples against your class timetable and budget, then choose only if one earns repeated use.", "Use current HUME prices with the contrasting sample candidates below to make a college shortlist grounded in your routine.", ["lv-imagination", "myself"]),
  g("Best perfume for date nights", "Occasion shortlists", "The best date-night perfume is a tested fragrance you enjoy at a presence suited to the venue. Attraction and compliments cannot be guaranteed by a note, brand or concentration.", [
    ["Choose the atmosphere", "A warm woody impression and a softer floral direction can express different moods. Pick your preference rather than an alleged attraction formula."],
    ["Plan for closeness", "A small table or cinema needs restraint even if the evening begins outdoors. Respect a companion's fragrance preferences."],
    ["Keep familiarity valuable", "Select after observing the later scent on a previous day. A special purchase is optional when a current favorite already fits."],
  ], "Choose the candidate you would enjoy without promised compliments and verify it suits the planned venue.", "HUME's woody and floral-containing examples can start a date-night comparison before you commit to a bottle.", ["tom-ford-oud-wood", "myself"]),
  g("Best perfume for weddings", "Occasion shortlists", "The best wedding perfume is personally meaningful, tested in advance and considerate during ceremonies and meals. A wedding label cannot guarantee suitability across climates and venues.", [
    ["Choose your own mood", "Floral, woody and fresh directions can all belong at a wedding. There is no requirement to select by gender or dress colour."],
    ["Trial the whole experience", "Check the later scent and your comfort before the day. Avoid experimenting on delicate event clothing."],
    ["Confirm timing", "Order early enough for delivery and repeat wears. Current availability is more useful than an ideal shortlist that misses the date."],
  ], "Rank wedding candidates by personal enjoyment, setting fit and arrival time rather than projected attention.", "HUME discovery trials can help compare floral and warm woody directions if current preorder timing allows.", ["homme-intense", "tom-ford-oud-wood"]),
  g("Best perfume for daily commuting", "Occasion shortlists", "The best commuting perfume is comfortable for you and restrained around fellow passengers. A fresh-smelling composition is a candidate to test, not proof of suitability for crowded travel.", [
    ["Account for travel conditions", "Heat, enclosed vehicles and close seating can matter more than the destination. Choose with the busiest part of the journey in mind."],
    ["Compare after arrival", "Record whether the later scent is still enjoyable once you reach your destination. Avoid judging only immediately after application."],
    ["Keep the routine considerate", "Do not spray on public transport or use perfume to replace hygiene. Skip fragrance where rules or circumstances require it."],
  ], "Compare two candidates after similar ordinary journeys and record comfort alongside scent preference.", "Marine and citrus-and-tea HUME samples provide distinct commuting comparison directions without a guaranteed freshness duration.", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("Best perfume for weekend outings", "Occasion shortlists", "The best weekend-outing perfume matches what you actually plan to do. A casual day can include shops, cafés and shared cars, so flexibility and enjoyment matter more than maximum strength.", [
    ["Start with the itinerary", "Choose for the closest part of the outing rather than assuming weekends mean unrestricted application."],
    ["Explore a different mood", "If work limits your fragrance choices, a suitable weekend can be a chance to compare a new woody or warmer direction."],
    ["Buy only a useful addition", "A weekend bottle should add something you want to wear. Sampling may be enough if outings are infrequent."],
  ], "Write one way your ideal weekend scent differs from your regular fragrance before adding another bottle.", "Try HUME's aromatic-woody and softer wood-containing structures to compare relaxed weekend moods.", ["guilty-homme", "gypsy-water"]),
  g("Best perfume for formal dinners", "Occasion shortlists", "The best formal-dinner perfume complements your own experience without dominating a shared meal. Quiet presence and familiarity are more useful criteria than a dramatic evening reputation.", [
    ["Respect the dining room", "Food aromas and closely seated guests are reasons for restraint. No family, including gourmand, is automatically ideal for dining."],
    ["Choose a familiar texture", "A floral-woody or smooth woody candidate may interest you, but assess the exact product rather than assigning formality to a note."],
    ["Avoid last-minute experiments", "Use a previous wear to evaluate development. Do not spray at the table or on formal clothing without appropriate guidance."],
  ], "Select a tested candidate whose presence you would be comfortable sharing across a small dinner table.", "Use the HUME examples below as different textures to sample before a formal meal, not as guaranteed quiet products.", ["homme-intense", "tom-ford-oud-wood"]),
  g("Best perfume for outdoor events", "Occasion shortlists", "The best outdoor-event perfume is one you enjoy in comparable weather and can wear considerately through queues, transport and covered spaces. Outdoor air does not create a universal performance winner.", [
    ["Choose for weather and movement", "Consider the activity and likely heat rather than copying a fixed summer spray count."],
    ["Compare the complete scent", "A marine opening and a citrus-and-wood composition may develop differently. Record the later character you actually prefer."],
    ["Plan the bottle's journey", "Keep it according to storage directions and avoid hot parked cars. Check event rules before carrying a container."],
  ], "Match your shortlist to the event itinerary, storage plan and closest seating before choosing a favorite.", "HUME's fresh-direction candidates below offer comparison possibilities; actual weather-relevant trials determine your choice.", ["allure-sport", "bleu-de-chanel"]),
  g("Best perfume for holidays", "Occasion shortlists", "The best holiday perfume suits your destination, activities and luggage constraints. A tested versatile favorite can be more useful than buying an unfamiliar vacation bottle.", [
    ["Plan for the actual trip", "City transport, beaches and evening dining are different uses. Select for the settings you will really encounter."],
    ["Check travel requirements", "Review current carrier and security rules for your route. A small bottle is convenient but not an automatic exemption from restrictions."],
    ["Protect the fragrance", "Follow storage instructions and keep it away from prolonged heat. Do not assume scent provides protection from sunlight."],
  ], "Choose a tested travel favorite after listing your destination conditions and checking the current baggage rules.", "HUME's small discovery samples may help compare travel candidates; verify format, secure closure and current transport requirements."),
  g("Best perfume for gifting", "Occasion shortlists", "The best perfume gift follows the recipient's tastes rather than the buyer's favorite ranking. An exact known favorite or an agreed sample selection reduces guessing.", [
    ["Get useful evidence", "Ask for the exact product or broad likes and dislikes. Demographic recommendations cannot establish individual preference."],
    ["Choose the right commitment", "A full bottle suits a confirmed favorite; discovery suits someone who wants exploration. Neither is automatically the more thoughtful option."],
    ["Check the purchase conditions", "Confirm delivery timing, current contents and returns before paying. Do not promise exchange rights or presentation extras without checking."],
  ], "Write the recipient's preferences in their words before deciding between a bottle and a discovery gift.", "Let the recipient help choose HUME discovery samples when possible, and check the current preorder status against the gift date."),
  g("Subtle fragrance for office wear", "Subtle occasions", "A subtle office fragrance should remain considerate during close work, but workplace policy comes first. Subtlety must be evaluated from the exact product and application rather than a soft-sounding note name.", [
    ["Define the office boundary", "Shared desks and long meetings make surrounding presence particularly relevant. Some workplaces require no fragrance."],
    ["Trial the quiet preference", "On a suitable earlier day, assess later enjoyment and presence. Your own adaptation is not proof of subtlety."],
    ["Keep top-ups deliberate", "Do not refresh at your desk or because a familiar scent becomes less obvious to you. Respect feedback from coworkers."],
  ], "Set an office presence goal that prioritizes close seating and policy over how strongly you smell yourself.", "Choose a softer direction in HUME's quiz, then use samples to verify how the shortlisted products actually wear."),
  g("Subtle fragrance for college", "Subtle occasions", "For college, subtle fragrance means a scent you enjoy without making shared lectures or libraries uncomfortable. A quiet preference does not require a particular gender label or expensive format.", [
    ["Consider the timetable", "A long lab or tightly seated lecture calls for different restraint from an outdoor break. Follow campus rules."],
    ["Avoid spraying between seats", "Keep application away from other students and resist adding more during class because you no longer notice it."],
    ["Choose a manageable purchase", "Test one candidate at a time before spending on a full bottle. Compare delivered cost and repeated enjoyment."],
  ], "Identify your closest classroom setting and use it as the boundary for a subtle-scent shortlist.", "HUME discovery choices can help explore a quiet college preference without committing to several untested bottles."),
  g("Subtle fragrance for date nights", "Subtle occasions", "A subtle date-night fragrance offers a personal scent experience without trying to fill the venue. Choose a familiar candidate and let the plan and your companion's preferences guide restraint.", [
    ["Think about distance", "A quiet café and a walk allow different proximity. Plan around the closest part of the evening."],
    ["Choose the character you enjoy", "Softness need not mean sweetness or florals. Find the texture you like instead of following attraction stereotypes."],
    ["Keep the choice tested", "Assess the fragrance on a prior day and avoid an unfamiliar last-minute combination. No perfume guarantees romantic chemistry."],
  ], "Choose a previously worn scent whose later character you like without needing other people to comment on it.", "Use HUME's softer shortlist as a discovery starting point, then assess a favorite before the date."),
  g("Subtle fragrance for weddings", "Subtle occasions", "A subtle wedding fragrance can create a personal association while remaining considerate during ceremonies, greetings and dining. Select it in advance rather than chasing attention on the day.", [
    ["Consider the close moments", "Hugs, seated ceremonies and photographs bring people close even in a large venue."],
    ["Practise the choice", "Wear the exact candidate beforehand and record its development. A quiet opening alone does not establish the whole wear."],
    ["Preserve special garments", "Avoid using bridal or formal clothing as an experiment. Follow garment care and fragrance directions."],
  ], "Add a fragrance rehearsal to your event preparation, focusing on close-contact comfort and later enjoyment.", "Choose HUME samples early enough for repeat wears and check preorder delivery before relying on them for a wedding."),
  g("Subtle fragrance for daily commuting", "Subtle occasions", "A subtle commuting fragrance should be considerate in the smallest shared part of the journey. A packed carriage or cab is a reason to reduce scent presence rather than add more for endurance.", [
    ["Plan before departure", "Apply only in an appropriate private setting and follow product directions. Do not spray around fellow passengers."],
    ["Check after travel", "Notice whether you enjoy the scent at arrival, without treating reduced self-awareness as proof it disappeared."],
    ["Keep freshness separate", "Clean clothing and hygiene serve a different role. Extra perfume should not be used to cover the commute."],
  ], "Use your most crowded regular journey as the reference when evaluating a subtle candidate.", "Try HUME's softer preference directions on suitable days, choosing from actual wear rather than an assumed commuting spray count."),
  g("Subtle fragrance for weekend outings", "Subtle occasions", "Subtle weekend fragrance suits relaxed plans that still involve cafés, shops and shared transport. Choose for the experience you want without assuming an outing requires a stronger signature.", [
    ["Read the whole plan", "An outdoor market may be followed by a small café. The enclosed stop should influence your application decision."],
    ["Explore texture quietly", "Compare airy, dry or gently warm impressions as preferences. None of those words guarantees restrained projection."],
    ["Keep a simple shortlist", "One new candidate per appropriate outing is easier to judge than layering several samples before leaving."],
  ], "Write the mood you want for the outing and the enclosed stop that sets your scent boundary.", "Select contrasting HUME samples for separate relaxed days, keeping the quiet favorite only after actual comparison."),
  g("Subtle fragrance for formal dinners", "Subtle occasions", "For a formal dinner, subtle fragrance should leave room for the meal and people nearby. A small enjoyable presence can be enough; an impressive venue does not require an assertive scent.", [
    ["Consider the table", "Long seated conversations make restraint valuable. Think about the nearest guest rather than the room's size."],
    ["Choose familiar development", "Use a candidate you have already worn through its later stages. Avoid discovering a richer-than-expected dry down during dinner."],
    ["Skip dining-room refreshes", "Do not spray at the table or return with a newly intense application. Assess what remains before deciding anything is needed."],
  ], "Choose a tested perfume whose later presence you would welcome beside your own dinner plate.", "Explore HUME's softer options before the dinner, using the sample trial to assess presence rather than the formal styling of a bottle."),
  g("Subtle fragrance for outdoor events", "Subtle occasions", "A subtle outdoor fragrance can be a personal preference even when open air disperses scent. You do not need to increase application until other guests notice it.", [
    ["Accept a personal experience", "Close-range enjoyment can be a valid result. Outdoor performance does not need to be measured by a scent trail."],
    ["Allow for enclosed transitions", "Transport, queues and sheltered seating can make a quiet preference especially practical."],
    ["Store and carry carefully", "Follow storage directions and avoid prolonged heat. A compact bottle still needs secure handling."],
  ], "Define a successful outdoor wear by your own enjoyment rather than an expectation of distant noticeability.", "Use a HUME sample to assess a quieter event preference before deciding whether a larger bottle serves your routine."),
  g("Subtle fragrance for holidays", "Subtle occasions", "A subtle holiday fragrance can simplify shared travel, meals and accommodation. Choose a tested favorite and account for the people and spaces you will share throughout the trip.", [
    ["Think about shared travel", "Flights, buses and small rooms may call for no fragrance or very restrained presence. Respect relevant rules."],
    ["Pack a purposeful choice", "You may only need one known favorite rather than several untested options. Check current transport requirements for your containers."],
    ["Protect it on the trip", "Follow the maker's storage advice and avoid leaving fragrance in hot vehicles or direct heat."],
  ], "Plan a simple scent routine for shared travel and your destination instead of packing for imagined occasions.", "HUME's small sample format may suit exploration before departure; check the current listing and route requirements before packing."),
  g("Subtle fragrance for gifting", "Subtle occasions", "For a subtle-fragrance gift, find out what the recipient means by subtle before choosing. They may want airy character, less sweetness or low surrounding presence, and those are different preferences.", [
    ["Ask a precise question", "Request an example of a liked fragrance or a description of the desired experience. Do not translate subtle automatically into floral or feminine."],
    ["Avoid unverified promises", "A notes list cannot guarantee quiet projection. Let the recipient evaluate a sample if the exact product is unfamiliar."],
    ["Check gift practicalities", "Confirm date, current contents and return terms. Recipient involvement may be more useful than a completely blind surprise."],
  ], "Ask the recipient to explain subtle in their own words before choosing the sample selection.", "Build a HUME discovery selection together for a softer preference, without promising every chosen sample will have measured low projection."),
  g("Fresh perfume for office wear", "Fresh occasions", "Fresh office perfume can begin with citrus, marine or aromatic directions, but fresh does not automatically mean quiet. Select for workplace rules and close seating as well as your scent preference.", [
    ["Pick a kind of freshness", "Compare marine character with citrus-and-wood structure. Those descriptions narrow a shortlist without predicting the complete smell."],
    ["Verify actual presence", "Test the exact product on a suitable non-work day before relying on a fresh label in meetings."],
    ["Respect office boundaries", "Avoid shared-air spraying and automatic refreshes. A fragrance-free policy still applies to fresh perfumes."],
  ], "Compare two fresh directions for later enjoyment and restrained presence before choosing an office candidate.", "The marine and citrus-and-wood HUME examples below are notes-based candidates for this comparison.", ["acqua-di-gio-profondo", "bleu-de-chanel"]),
  g("Fresh perfume for college", "Fresh occasions", "A fresh college perfume should fit your taste, class routine and budget. Citrus or marine notes can help begin the search, but they do not establish low projection or campus suitability.", [
    ["Choose a clear contrast", "Compare citrus-and-tea freshness with a marine direction. Two different candidates teach more than several similar descriptions."],
    ["Check the daily setting", "Close lectures, libraries and transport require restraint. Follow any rules for labs and other shared areas."],
    ["Buy after repeat enjoyment", "Choose the scent you want to wear again after its opening. Keep the complete price within a comfortable limit."],
  ], "Write which kind of freshness you prefer after wearing each candidate on a separate appropriate day.", "Try HUME's citrus-and-tea and marine samples as distinct fresh college shortlist options.", ["lv-imagination", "acqua-di-gio-profondo"]),
  g("Fresh perfume for date nights", "Fresh occasions", "Fresh perfume can suit a date night if you enjoy its complete development and manage its presence for the venue. Evening wear is not restricted to sweet, smoky or heavy fragrances.", [
    ["Choose your mood", "Bright citrus and aromatic freshness can feel as personally appropriate as warmer notes. There is no attraction rule attached to either."],
    ["Check the later scent", "Some fresh openings develop into woods or warmth. Test that transition before choosing for the evening."],
    ["Keep proximity in mind", "Restaurants and cinemas can involve close seating. Avoid topping up just to make freshness more noticeable."],
  ], "Pick a fresh candidate whose later character you like, then match its tested presence to the date venue.", "Compare HUME's citrus-and-tea and citrus-and-wood structures ahead of the evening rather than buying a promised compliment scent.", ["lv-imagination", "bleu-de-chanel"]),
  g("Fresh perfume for weddings", "Fresh occasions", "A fresh wedding perfume can suit your preferences across daytime ceremonies or evening celebrations. Choose from actual trials and the event setting rather than assuming formal occasions require rich fragrance.", [
    ["Match the celebration", "Consider heat, close greetings and indoor meals. A bright scent direction still needs considerate application."],
    ["Rehearse the development", "Test the opening and later scent before the event. A fresh first impression is only one stage of the experience."],
    ["Allow preparation time", "Check availability and delivery early, and avoid experimenting on wedding garments."],
  ], "Choose a tested fresh candidate after noting the ceremony, dining and close-contact parts of the celebration.", "Explore HUME's fresh-direction samples well before the wedding and confirm current preorder timing.", ["allure-sport", "lv-imagination"]),
  g("Fresh perfume for daily commuting", "Fresh occasions", "For daily commuting, a fresh perfume should remain considerate in shared transport and enjoyable after arrival. Fresh notes describe character; they do not replace hygiene or guarantee quiet wear.", [
    ["Choose the fresh texture", "Marine, citrus and aromatic impressions offer different starting points. Select one you actually enjoy rather than a generic clean label."],
    ["Test the arrival experience", "Record how the later scent feels after your usual travel. Do not demand that the opening remain unchanged."],
    ["Avoid travel top-ups", "Never spray around passengers. Consider your destination and what remains before adding more later."],
  ], "Compare marine and citrus directions after similar travel conditions, recording preference rather than assumed cleanliness.", "Use HUME's marine and citrus-and-tea candidates to build a commuting comparison from live notes and your own wear.", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("Fresh perfume for weekend outings", "Fresh occasions", "Fresh weekend perfume can suit relaxed outings without needing to dominate them. Choose the style of freshness you enjoy and account for cafés, shops and transport in the plan.", [
    ["Start with an activity", "An outdoor stroll and an indoor cinema create different scent expectations. Plan around the closest shared space."],
    ["Compare beyond the opening", "Citrus brightness can develop into woods, musk or warmth. Decide whether that later experience matches your weekend mood."],
    ["Keep exploration useful", "Try one new fragrance on an appropriate outing rather than layering several fresh samples together."],
  ], "Describe the fresh opening and later character separately during a relaxed trial before choosing your weekend favorite.", "HUME's marine-aromatic and citrus-and-wood candidates provide different fresh routes for weekend sampling.", ["allure-sport", "bleu-de-chanel"]),
  g("Fresh perfume for formal dinners", "Fresh occasions", "A fresh fragrance can suit a formal dinner when its actual presence is restrained and you enjoy the later scent. Formality does not require a rich perfume, and freshness does not excuse a strong application.", [
    ["Prioritize the meal", "Close seating and food aromas make restraint useful regardless of scent family. Consider opting out for a particularly close dining experience."],
    ["Try the complete structure", "A citrus-and-tea or citrus-and-wood candidate can develop differently after the opening. Evaluate before the dinner day."],
    ["Keep application away from dining", "Do not spray at the table or add a fresh layer just before greeting seated guests."],
  ], "Select a familiar fresh candidate after evaluating its later presence at a distance comparable to dinner seating.", "The HUME fresh-direction examples below are starting points to test, without a claim that either is automatically quiet at dinner.", ["lv-imagination", "bleu-de-chanel"]),
  g("Fresh perfume for outdoor events", "Fresh occasions", "Fresh perfume for an outdoor event should match your taste and the weather without relying on a fixed performance promise. Account for covered areas and transport as well as the open-air venue.", [
    ["Choose a fresh direction", "Marine and citrus-aromatic notes offer different impressions. A description helps shortlist rather than predicts exact behavior outdoors."],
    ["Avoid compensating for open air", "You do not need to increase application until everyone can notice it. Keep close-contact portions of the event in mind."],
    ["Plan storage", "Follow product guidance and avoid prolonged heat in a parked car. Check event rules before bringing fragrance."],
  ], "Evaluate your preferred fresh direction in comparable conditions and plan for the event's enclosed transitions.", "Compare HUME's marine and citrus-aromatic sample candidates before the event instead of expecting a universal outdoor winner.", ["acqua-di-gio-profondo", "allure-sport"]),
  g("Fresh perfume for holidays", "Fresh occasions", "A fresh holiday perfume should suit the destination and your actual itinerary. A familiar citrus or marine favorite can be useful, but fresh wording does not imply sun protection or unrestricted use in shared travel.", [
    ["Choose for the destination", "Consider city walks, indoor dining and local weather. Your normal favorite may already cover the trip."],
    ["Check before packing", "Review current transport rules and the product's storage directions. Small containers still need secure closure and appropriate handling."],
    ["Keep the routine flexible", "Shared accommodation and crowded transport may call for less fragrance or none. Do not leave a bottle in prolonged heat."],
  ], "Match one tested fresh favorite to the trip's main activities before adding extra travel fragrances.", "Try HUME's fresh samples before departure to identify a favorite, checking delivery timing and the current format details.", ["lv-imagination", "acqua-di-gio-profondo"]),
];

for (const guide of BEGINNER_GUIDES_BATCH_EIGHT.filter(guide => guide.group === "Scent fit")) {
  guide.sources = [
    { title: "NHS: contact dermatitis and cosmetic triggers", url: "https://www.nhs.uk/conditions/contact-dermatitis/causes/" },
    { title: "NHS: contact dermatitis symptoms and when to seek advice", url: "https://www.nhs.uk/conditions/contact-dermatitis/" },
  ];
}

BEGINNER_GUIDES_BATCH_EIGHT.find(guide => guide.title === "Daytime vs evening perfume")!.chart = {
  headers: ["Setting", "Selection priority", "Check before wearing"],
  rows: [
    ["Shared daytime workspace", "Policy and restrained presence", "Close seating and meeting rooms"],
    ["Evening restaurant", "Enjoyable scent with little intrusion", "Food and neighbouring diners"],
    ["Outdoor celebration", "Weather and personal preference", "Transport and enclosed portions"],
  ],
};
