import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string, nextStep: BeginnerGuide["nextStep"] = "samples", productIds: string[] = []): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep, productIds };
}

export const BEGINNER_GUIDES_BATCH_SIX: BeginnerGuide[] = [
  g("How much extrait de parfum should I apply", "Application amounts",
    "Use the exact extrait's directions and a restrained first application rather than a universal drop or spray count. A concentrated-style label does not reveal what its applicator delivers or how noticeable the finished fragrance will be.", [
      ["Check the presentation", "A dabber and an atomizer are different application systems. Do not use an invented drop-to-spray conversion or copy the amount used for a related EDP."],
      ["Choose for your setting", "Consider shared-space rules and the presence you want. More concentration does not make maximum application a better way to experience the perfume."],
      ["Evaluate before changing", "Record the later scent and comfort before adding more as directed. A quieter experience is different from the fragrance being completely absent."],
    ], "Write the exact version, applicator and desired setting before evaluating the first restrained trial.", "Check HUME's actual format listings and product directions rather than assuming an extrait counterpart or a matching application count.", "shop"),
  g("How much perfume oil should I apply", "Application amounts",
    "The appropriate amount of perfume oil depends on the finished product and its dispenser. Follow its personal-use directions rather than applying a universal number of drops or treating raw fragrance material as ready-to-use perfume.", [
      ["Identify the cosmetic", "Check intended use and application areas. A home-scent oil, essential oil and finished perfume oil are different products even when their bottles look similar."],
      ["Use its dispenser deliberately", "A roller, dabber or dropper can deliver different amounts. Start within the maker's directions instead of converting another perfume's sprays into drops."],
      ["Keep the first wear separate", "Avoid combining several unfamiliar scents while judging the amount. Record enjoyment and presence before deciding how the product fits your routine."],
    ], "Record the stated use and supplied dispenser, then assess the later comfort of a label-directed trial.", "If comparing with HUME spray samples, treat each as a whole product rather than an equal-dose test of oil versus spray.", "samples"),
  g("How much attar should I apply", "Application amounts",
    "Follow the directions of the specific attar rather than a generic drop count. Attar is used for different products in commerce, so the name alone does not establish concentration, carrier or the amount its applicator delivers.", [
      ["Read the actual product", "Check the maker and intended use before applying. Do not infer natural origin or alcohol absence from the attar name or a small vial."],
      ["Keep the application identifiable", "Use the supplied method and note what you did. A dab-style product and another roller cannot be assumed to apply equal amounts."],
      ["Choose comfortable presence", "Evaluate the fragrance in an appropriate setting before making changes. A strong first impression is not a reason to ignore product instructions or shared-space comfort."],
    ], "Save the attar's exact directions and note the later impression from one separate application.", "Explore HUME's listed spray products as alternatives only where useful; they do not establish an application rule for an attar you own.", "shop"),
  g("How much body mist should I apply", "Application amounts",
    "Use body mist as its maker directs, with the amount and application areas appropriate to that exact product. A mist label does not mean unlimited application or an automatic refresh schedule.", [
      ["Check the intended areas", "Body and hair mists may have different directions. Read the actual item rather than transferring the instructions from a related fragrance range."],
      ["Judge the real presence", "A light-positioned product can still be noticeable around others. Consider the room and wearing occasion instead of assuming more application is always needed."],
      ["Review before refreshing", "Observe the developing scent and your comfort before applying more as directed. Reduced awareness of the opening is not a complete performance measurement."],
    ], "Record your label-directed application and intended occasion before deciding whether any later refresh is useful.", "Use HUME's current shop to verify offered formats rather than applying body-mist assumptions to its perfume samples.", "shop"),
  g("How much solid perfume should I apply", "Application amounts",
    "Use the amount and method specified for the exact solid perfume. Balm texture, composition and applicator differ, so neither a universal swipe nor a gram-to-spray conversion gives a reliable routine for every product.", [
      ["Follow the intended method", "Read whether the maker specifies a fingertip or another applicator and which areas the cosmetic is intended for. A scented balm is not automatically multipurpose."],
      ["Evaluate a restrained trial", "Keep the scent separate from other unfamiliar products and observe its later character. Application convenience does not establish a fixed level of projection."],
      ["Keep handling appropriate", "Close the case and follow storage directions between uses. Applying more is not a solution to a handling or product-condition question."],
    ], "Note the maker's method and assess a first label-directed use before setting a regular amount.", "HUME's liquid discovery testers are a separate format and do not provide a dosing rule for a solid perfume.", "shop"),
  g("How much roll on perfume should I apply", "Application amounts",
    "Follow the exact roll-on's directions rather than a universal swipe count. A roller is an application mechanism, not a statement of concentration, carrier or how much fragrance reaches the application area.", [
      ["Read the formula claims separately", "A roll-on is not automatically oil-based or alcohol-free. Check those details independently if they matter to your choice."],
      ["Use the intended contact method", "Apply where specified and handle the dispenser as directed. Do not convert spray counts from another fragrance into an assumed equivalent roller routine."],
      ["Revisit the actual experience", "Record later enjoyment and presence before changing application. A convenient small container should not become a reason to add more without consideration."],
    ], "Write the exact roll-on and intended setting, then judge the actual result rather than counting swipes alone.", "Check HUME's actual applicator details when comparing formats instead of expecting its spray fragrances to have roller equivalents.", "shop"),
  g("How much cologne should I apply", "Application amounts",
    "First identify what cologne means on the product, then follow its directions. A splash, eau de cologne and fragrance casually called cologne do not share one universal amount or application routine.", [
      ["Read the full label", "Check the exact concentration-style wording and presentation. The casual term does not establish a men's-only product or a guaranteed low-strength formula."],
      ["Use its own mechanism", "A splash cap and an atomizer dispense differently. Avoid pouring or increasing application just because you expect all cologne to work that way."],
      ["Choose for the occasion", "Evaluate comfort where fragrance is permitted and review the later character. A fresh opening does not justify an automatic top-up."],
    ], "Record the full name and splash-versus-spray format before assessing how the application suits your day.", "Use HUME's product-specific information rather than assigning its whole fragrance catalogue a generic cologne amount.", "shop"),
  g("How much alcohol free perfume should I apply", "Application amounts",
    "Alcohol-free perfume needs its own product directions, not one universal amount. The claim can apply to different carriers and applicators, so verify the formula requirement and method separately.", [
      ["Confirm the exact claim", "If absence of a particular alcohol matters, consult the label or maker. A roller or balm container does not independently prove the formulation."],
      ["Follow the supplied format", "Sprays, contact applicators and solids apply differently. Do not infer a quantity from alcohol absence or copy a routine for another product."],
      ["Evaluate personal preference", "A carrier claim does not guarantee mildness or duration. Note scent enjoyment and presence before choosing your regular label-directed routine."],
    ], "Write the confirmed formula requirement and the product's actual application method as separate entries.", "Ask HUME about a specific item if formulation matters; its sample offer is not certified alcohol-free by this amount guide.", "shop"),
  g("Long lasting perfume meaning", "Performance basics",
    "Long-lasting usually describes how long a perfume remains perceptible, but the phrase is incomplete without context. A close-range trace, a noticeable presence and an enjoyable later scent are different outcomes rather than one interchangeable performance score.", [
      ["Ask what the claim measures", "Check whether a description refers to skin, a permitted fabric use or perception around the wearer. Those observations are not directly equivalent."],
      ["Keep conditions visible", "The exact product, application and setting matter. A duration reported without those details is harder to compare with your own routine."],
      ["Choose the experience you want", "Persistence alone does not make a fragrance preferable. Consider whether you enjoy the later character and whether its presence fits your occasion."],
    ], "Write what long-lasting means for your purchase: a close trace, noticeable presence or enjoyment through a particular occasion.", "Use HUME samples to assess your preferred wear experience instead of treating a broad lasting claim as a personal guarantee.", "samples"),
  g("Projection vs longevity perfume", "Performance basics",
    "Projection describes how noticeable a perfume is around the wearer; longevity describes how long it remains perceptible. A perfume can become quieter while remaining present up close, so a longer wear does not automatically mean a stronger surrounding scent.", [
      ["Use separate observations", "Record presence around you and the later close-range impression independently. Combining them into one strong-versus-weak score can hide what changed."],
      ["Compare with context", "Application, room conditions and the observer influence a comparison. Equal spray counts from different atomizers are not necessarily equal quantities."],
      ["Decide which suits the setting", "A quieter later phase may be appropriate for some occasions. Choose the balance you enjoy rather than assuming the highest projection is always better."],
    ], "Create separate notes for surrounding presence and later detectability during the same trial.", "Compare HUME discovery candidates using those two observations so your bottle choice reflects the experience you actually want.", "samples"),
  g("Sillage meaning in perfume", "Performance basics",
    "Sillage describes the scent trail a fragrance leaves as the wearer moves. It is related to projection and persistence but does not mean the same thing as either a fixed distance around the wearer or total wear duration.", [
      ["Think about movement", "A trail noticed after someone passes differs from smelling perfume close to a stationary person. That distinction helps interpret reviews using the word sillage."],
      ["Avoid a universal trail standard", "Different environments and application methods affect what another person notices. A statement about a trail is more useful when the setting is described."],
      ["Choose considerate presence", "A prominent trail is not automatically desirable in shared spaces. Follow local fragrance rules and consider the actual occasion rather than seeking maximum noticeability."],
    ], "Write whether a review describes a moving trail, surrounding presence or later close-range scent before using it to compare products.", "Use HUME's sillage preference in the quiz as a shortlisting aid, then evaluate the actual fragrance in appropriate use.", "quiz"),
  g("Why can I not smell my own perfume", "Performance basics",
    "Reduced awareness of your own perfume can reflect changing perception as well as a changing fragrance. It does not by itself prove the perfume has disappeared, and a single wearing observation cannot establish one exact cause.", [
      ["Notice the limits of self-checking", "Repeatedly checking the same scent is not a neutral measurement. Take ordinary breaks from deliberate smelling rather than assuming every quieter impression requires more perfume."],
      ["Compare observations carefully", "If useful and welcome, ask a willing person whether the scent is noticeable in an appropriate setting. Their response is another observation, not a universal performance measurement."],
      ["Keep the test simple", "Record the exact product and application without adding another fragrance. A repeat trial gives clearer information than several immediate top-ups."],
    ], "Write what you and a willing observer notice separately before deciding that a perfume is absent.", "Use one HUME discovery sample at a time to reduce confusion between a changing scent and repeated mixed-fragrance exposure.", "samples"),
  g("Nose blindness vs weak perfume", "Performance basics",
    "Nose blindness is a casual term for reduced awareness of an odor, while weak perfume is an imprecise performance judgment. Neither can be established simply because you stop noticing your own fragrance during one wear.", [
      ["Separate perception and product", "A scent may become quieter, your awareness may change or both may occur. Do not turn one self-observation into proof of a formula defect."],
      ["Use a repeatable record", "Keep the exact item, application and setting clear and avoid mixing unfamiliar scents. Compare another ordinary trial instead of immediately increasing the amount."],
      ["Use outside feedback carefully", "A willing observer can describe noticeability in that setting. Ask about presence rather than soliciting a compliment, and respect fragrance rules while testing."],
    ], "Record the application, your later perception and any independent observation as separate facts.", "Compare HUME samples through separate wears rather than using multiple simultaneous fragrances to decide whether one is weak.", "samples"),
  g("Why does perfume fade quickly on me", "Performance basics",
    "A quick-fading impression can involve the fragrance's development, application, conditions and your perception. Before assigning one cause, distinguish the loss of a bright opening from the absence of every later scent.", [
      ["Identify what changed", "Write whether the opening became quieter, the surrounding presence reduced or no close-range impression remained. Those are different observations."],
      ["Check the actual application", "Note the product and dispenser and follow its directions. A different atomizer or a partial application can complicate a comparison with another wear."],
      ["Repeat without improvisation", "Try the same candidate in similar ordinary conditions before changing several things at once. Avoid heating, diluting or otherwise altering the product to chase a claim."],
    ], "Describe exactly what you mean by fading and record that same observation during another appropriate trial.", "Use HUME discovery testers to compare later character and presence before committing to a bottle based only on an opening.", "samples"),
  g("How to test perfume longevity", "Performance basics",
    "Test longevity by recording a label-directed application and checking the same fragrance at chosen points during an ordinary day. Keep later detectability, surrounding presence and enjoyment separate, and repeat before treating one result as reliable.", [
      ["Record the starting conditions", "Save the exact version, applicator, wearing setting and application details. Avoid another unfamiliar fragrance during the trial so the later impression remains identifiable."],
      ["Choose observations in advance", "Use points that fit your routine, such as after a commute or later at home. These are a testing plan, not a claim about how many hours the product should last."],
      ["Repeat and compare", "Record what remains and whether you enjoy it. A casual wear test is useful personal evidence but not a controlled laboratory rating for every buyer."],
    ], "Create a log with application details, observation time, close-range scent, surrounding presence and enjoyment.", "Use the exact names in your HUME discovery selection to keep repeat trials and any later bottle purchase matched correctly.", "samples"),
  g("How to test perfume projection", "Performance basics",
    "Test projection by observing noticeability around the wearer under described conditions, ideally with a willing observer. Keep the product and application consistent and avoid converting one room's result into a guaranteed radius.", [
      ["Define the setting", "Choose an appropriate place where fragrance is welcome. Airflow, movement and room use can change the experience, so note the context."],
      ["Use clear feedback", "Ask a consenting observer whether they notice the fragrance at a normal interaction distance. Do not ask them to keep approaching until a desired claim appears."],
      ["Repeat the observation", "Check at comparable points during another trial and separate projection from the later close-range trace. One observation is not a permanent product specification."],
    ], "Record the setting, application and a willing observer's description without assigning an unsupported meter rating.", "Compare HUME candidates using the same observation method instead of assuming listed notes predict projection.", "samples"),
  g("Does perfume last longer on clothes or skin", "Performance basics",
    "There is no universal clothes-versus-skin winner for every perfume and fabric. Perceived persistence and scent development can differ, but only apply a product to a material when its directions permit that use.", [
      ["Check intended use first", "A personal fragrance is not automatically suitable for every garment, accessory or surface. Follow product and fabric-care guidance rather than treating clothing as an unrestricted application area."],
      ["Compare like observations", "A faint trace in a garment and a perfume's presence around you are different outcomes. Define what you want to compare before drawing conclusions."],
      ["Keep preference in view", "The later smell may feel different from your usual skin experience. Choose appropriate use and enjoyment rather than chasing the longest detectable trace."],
    ], "Read the permitted application areas before making any skin-versus-material comparison.", "Use HUME's product-specific directions for application; a discovery sample does not establish compatibility with every fabric.", "shop"),
  g("Does expensive perfume last longer", "Performance basics",
    "Price alone does not establish perfume longevity. Composition, application and conditions matter, and a more expensive bottle can offer a different style without guaranteeing longer noticeable wear for you.", [
      ["Compare exact products", "Check the version and format rather than treating price bands as formulas. A fresh opening and a warm later character may be perceived differently regardless of cost."],
      ["Define the outcome", "A close-range trace and a surrounding presence are different measures. Reviews are more useful when they explain which experience lasted and under what conditions."],
      ["Choose personal value", "Include enjoyment, actual use and total cost alongside wear observations. Paying more for a scent you dislike is not a performance upgrade that solves your preference."],
    ], "Compare one lower-cost and one higher-cost candidate using the same wear log before revealing price as a deciding factor.", "Use HUME samples and current prices to assess your own value rather than assuming either lower or higher prices guarantee performance.", "samples"),
  g("How long should perfume last", "Performance basics",
    "Perfume has no universal required wear duration across all compositions and formats. Decide what your intended occasion needs, then compare the exact product's later character and presence rather than imposing a fixed hour total on every scent.", [
      ["Clarify the kind of lasting", "Do you mean noticeable around you, detectable up close or enjoyable throughout an event? A claim is easier to interpret once that outcome is clear."],
      ["Use actual product information", "Read the maker's description without turning a concentration label or note family into a guarantee. Related versions can have different compositions."],
      ["Evaluate the occasion", "A fragrance may suit a short outing without covering a full workday. Choose for your repeated needs rather than demanding every product solve every situation."],
    ], "Write the occasion you want covered and the kind of presence you want at its later stage.", "Use HUME discovery trials to learn which candidate fits that brief before selecting a full bottle.", "samples"),
  g("Why does perfume last longer on my friend", "Performance basics",
    "A friend's different experience can involve application, setting, product version and perception rather than one proven explanation about your skin. Make sure you are comparing the exact same fragrance and a similar kind of observation.", [
      ["Check the starting facts", "Confirm version, dispenser and application method. Equal spray counts from different bottles are not automatically equal amounts."],
      ["Separate observer roles", "Smelling your own scent and noticing someone else's are different experiences. Record who noticed what rather than assuming both reports measure the same outcome."],
      ["Repeat without blame", "Use another ordinary trial before deciding the perfume is defective or that one person is unsuitable for it. Personal comfort and enjoyment still matter more than winning a duration comparison."],
    ], "Compare exact version, application and observer before interpreting a friend's report as a product benchmark.", "Keep the names of HUME samples and any full bottles clear so a comparison does not accidentally involve different fragrances.", "samples"),
  g("Does perfume get stronger with age", "Performance basics",
    "Perfume does not reliably become stronger or better just because time passes. A stored fragrance can change, but aging a purchased bottle is not a guaranteed way to improve its projection or fix a disappointing preference.", [
      ["Separate production and home storage", "A maker's formulation or production process is not the same as leaving a finished bottle at home. Do not assume a universal waiting ritual applies to every purchase."],
      ["Store as directed", "Keep the product closed and protected from unsuitable heat and light. Avoid deliberately exposing it to air or heat in an attempt to manufacture a stronger result."],
      ["Use product-specific help", "If the item appears damaged or differs from what you ordered, keep the details and contact the seller. A promise that every issue disappears with age is not a useful explanation."],
    ], "Record the original product details and appropriate storage conditions rather than setting an unsupported aging deadline.", "Ask HUME about the exact order or product if there is an issue instead of assuming its perfumes need a home-aging procedure.", "shop"),
  g("Does perfume performance change after delivery", "Performance basics",
    "An initial post-delivery impression is not enough to establish a permanent performance change. Check the correct item, packaging and application, then evaluate it under appropriate ordinary conditions without assuming a universal settling period.", [
      ["Inspect the order first", "Confirm the name, size and product condition. Keep order details and report leakage, damage or an incorrect item through the seller's actual support process."],
      ["Separate conditions from conclusions", "Your first trial may differ from a previous experience in application or setting. Follow handling directions and use a clear repeat record before assigning a cause."],
      ["Avoid magic waiting claims", "Do not assume every bottle improves after a fixed number of days or that deliberate airing is required. Seek product-specific information instead of improvising a treatment."],
    ], "Record the received item, condition and first trial separately so an order issue is not confused with a scent preference.", "Use HUME's order and contact information for delivery questions, keeping the exact product and evidence available.", "shop"),
  g("How far should perfume project", "Performance basics",
    "Perfume has no universal required projection distance. Appropriate noticeability depends on the product, application, environment and occasion, and a larger surrounding presence is not automatically better.", [
      ["Choose the social setting", "Follow fragrance-free policies and consider shared rooms. A scent intended for personal enjoyment does not need to be noticed across a room to be successful."],
      ["Describe rather than invent meters", "An observation at normal interaction distance is useful context, but not a fixed product radius. Airflow and movement make simple distance claims difficult to generalize."],
      ["Keep duration separate", "Projection can become quieter while a scent remains up close. Decide whether that later experience fits your purpose rather than treating it as automatic failure."],
    ], "Describe your desired presence using your real setting before comparing product claims about strength.", "Use HUME's sillage preference as a browsing aid, then sample candidates for comfort instead of expecting guaranteed projection distances.", "quiz"),
  g("Perfume that lasts all day", "Performance basics",
    "To choose perfume for an all-day routine, define the period and presence you actually want and test exact candidates. All-day is not a standardized guarantee, and a faint later trace differs from strong projection throughout the day.", [
      ["Describe the day", "A workday with commuting and indoor time differs from an evening event. Choose observations relevant to your own schedule instead of a vague maximum-hours target."],
      ["Compare later enjoyment", "Record whether you still enjoy the scent when it becomes quieter. The longest remaining trace is not automatically the fragrance you want to wear repeatedly."],
      ["Check before buying quantity", "Do not buy a large bottle solely on an unsupported duration headline. Samples can help establish whether the exact candidate meets your personal brief."],
    ], "Create observation points for your real day and record enjoyment and presence separately at each.", "Use HUME's discovery set to compare candidates through your own routine; no universal all-day result is promised.", "samples"),
  g("How to make perfume last longer", "Performance basics",
    "Start with correct storage, the product's intended application and a realistic wear comparison. Improving your routine is more useful than adding unlimited perfume or trying unverified heat, air or mixing tricks to change the formula.", [
      ["Check basic handling", "Keep the bottle closed and stored as the maker directs. Protecting the product between wears is separate from increasing how noticeable one application feels."],
      ["Follow the intended method", "Use permitted application areas and the supplied directions. Do not assume every perfume is designed for hair, fabrics or layering with unrelated products."],
      ["Choose a better-fitting composition", "If repeated appropriate trials do not meet your preferred experience, compare another candidate. More application is not always the right response to a different later scent."],
    ], "Review storage, exact product directions and a repeat wear log before changing several application habits.", "Compare HUME candidates through samples so you can choose a later character and presence you enjoy rather than forcing one perfume to fit every need.", "samples"),
  g("Does rubbing wrists affect perfume", "Performance basics",
    "Rubbing wrists is not necessary for a useful perfume trial. Follow the product's application directions and let the fragrance develop without adding an extra handling step, especially when you want to compare candidates consistently.", [
      ["Keep the method consistent", "Rubbing spreads the application and changes how you handle the product. Avoid changing that variable between trials and then attributing every difference to the formula."],
      ["Avoid dramatic chemical claims", "Do not assume an everyday application gesture proves that perfume molecules were destroyed or a fragrance was ruined. Record the experience rather than repeating an unsupported explanation."],
      ["Use the exact directions", "A spray, roller and balm have different application methods. Do not turn advice for one format into an instruction for every finished product."],
    ], "Use the maker's method consistently during a comparison rather than adding an unrecorded rubbing step.", "Follow the actual HUME product directions when moving from a discovery tester to a bottle; applicators can differ.", "shop"),
  g("How many hours should an EDP last", "Performance basics",
    "An EDP label does not establish a required number of hours. Eau de parfum is a concentration-style descriptor rather than a wear-time certification, so judge the exact fragrance and the kind of presence you need.", [
      ["Identify the exact version", "An EDP can differ in composition from a related EDT or parfum. Version names and conditions matter more than comparing generic label categories."],
      ["Define the endpoint", "A close-range scent, surrounding presence and enjoyable later character have different endpoints. Decide which you want to observe before counting elapsed time."],
      ["Repeat the relevant trial", "Use similar appropriate conditions and record the actual application. One person's result or one unusually long trace is not a universal expectation for every buyer."],
    ], "Write the EDP's exact name and the observable endpoint you care about before comparing any hours claim.", "Check HUME's actual format information and use available samples to evaluate your own wear needs without assigning a blanket EDP duration.", "samples"),
  g("Why is my perfume strong at first then gone", "Performance basics",
    "A strong opening followed by a quieter impression can involve normal development, reduced surrounding presence or changed awareness. It does not automatically mean that every part of the perfume has disappeared or that the bottle is faulty.", [
      ["Describe what seems gone", "Distinguish lost opening brightness from absent close-range scent. The notes emphasized later may feel different enough that a familiar opening is no longer recognizable."],
      ["Pause constant checking", "Repeated deliberate smelling is not a neutral measurement. Take ordinary breaks and keep your observations separate from any willing observer's feedback."],
      ["Avoid immediate top-ups", "Follow directions and assess the actual setting before adding more. A repeat trial provides clearer information than combining several new applications at once."],
    ], "Record the opening, later character and close-range impression before concluding that the fragrance is entirely gone.", "Use one HUME sample per trial to follow its development without confusion from several unfamiliar scents.", "samples"),
  g("How long do fresh perfumes last on skin", "Wear-time comparisons",
    "Fresh perfumes do not share one fixed skin-wear duration. Fresh can describe citrus, marine, green or aromatic impressions, so compare the complete composition and distinguish opening brightness from what remains later.", [
      ["Make fresh specific", "Write which kind of freshness you enjoy before comparing. A marine direction and a citrus-woody structure can develop differently even when both descriptions sound bright."],
      ["Record the later character", "A quieter or woodier phase may still be part of the fragrance. Note what changed instead of counting the end of freshness as the end of every scent."],
      ["Compare your repeated routine", "Use similar appropriate occasions and the same observation method. A family adjective does not establish a guaranteed hour result for all products."],
    ], "Record the type of freshness and the later close-range impression during two separate ordinary wears.", "Compare the current HUME marine and citrus-containing candidates as different complete structures, then check sample availability.", "samples", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("How long do citrus perfumes last on skin", "Wear-time comparisons",
    "A citrus opening and the complete perfume can have different perceived durations. A fragrance may become less citrus-bright while its supporting notes remain noticeable, so do not assign the whole category one skin-wear timer.", [
      ["Track citrus separately", "Write which peel-like or bright impression you notice first. This gives you a specific quality to revisit rather than an undefined strong-versus-gone judgment."],
      ["Read supporting notes", "Woods, florals or warmer effects can shape the later experience. Two citrus-listed perfumes may not preserve the same balance through the wear."],
      ["Choose the later experience", "Decide whether you still enjoy the fragrance after the opening changes. Longer citrus brightness and longer overall detectability are not automatically the same goal."],
    ], "Make two entries at each observation: citrus brightness and the remaining overall scent.", "Use HUME's citrus-containing note structures for a comparison and judge the whole wear rather than only the opening.", "samples", ["sauvage-noir", "lv-imagination"]),
  g("How long do woody perfumes last on skin", "Wear-time comparisons",
    "Woody perfumes cannot be assigned one skin-wear duration from the family name. Dry, smooth, smoky and mixed woody structures can feel different, and perceived persistence depends on the exact product and trial.", [
      ["Name the wood texture", "Describe whether the candidate feels rounded, dry or otherwise wood-like. A list containing several woods does not reveal material quantities or guarantee a stronger result."],
      ["Separate texture and presence", "You may still perceive a woody character up close after surrounding presence changes. Record both rather than describing the perfume as simply weak or strong."],
      ["Repeat the useful setting", "Test in an ordinary appropriate routine and note the exact product and application. Your record is personal evidence rather than a family-wide specification."],
    ], "Track wood texture, close-range presence and enjoyment separately during a repeat trial.", "Compare HUME's available woody note structures below without assuming every wood-containing fragrance has equal duration.", "samples", ["tom-ford-oud-wood", "bleu-de-chanel"]),
  g("How long do sweet perfumes last on skin", "Wear-time comparisons",
    "Sweetness is an impression rather than a duration rating. A sweet perfume may change in warmth or texture during wear, and the exact composition matters more than assuming every dessert-like fragrance lasts a fixed number of hours.", [
      ["Describe the sweetness", "Vanilla-like warmth, sugary fruit and other associations can feel different. Identify the quality you want to track rather than treating sweet as one material."],
      ["Record later enjoyment", "A remaining sweet trace is not automatically a benefit if you dislike the later balance. Preference should be logged alongside detectability."],
      ["Avoid a strength shortcut", "A prominent opening does not prove long-lasting surrounding presence. Compare the later close-range impression and projection as separate observations."],
    ], "At each observation, record sweetness balance and whether you still want to wear the scent.", "Use HUME's vanilla-containing options as different compositions to explore, not as measured winners in a sweetness-duration ranking.", "samples", ["myself", "eros-flame"]),
  g("How long do floral perfumes last on skin", "Wear-time comparisons",
    "Floral perfumes vary too much to have one skin-wear duration. A rose-containing woody blend and a jasmine-containing citrus structure can offer different developments, even when both include flower-like notes.", [
      ["Choose the floral reference", "Write which impression you enjoy: fresh petals, a richer floral character or a softer texture. Not every listed flower will remain separately identifiable throughout wear."],
      ["Observe the full composition", "Supporting woods, musks or warm notes may become more noticeable. The floral opening becoming quieter is not proof that every part of the fragrance has disappeared."],
      ["Keep trials separate", "Compare exact candidates on different suitable occasions rather than layering new florals together. Record later comfort and enjoyment as well as presence."],
    ], "Note the floral character and supporting later impression in separate parts of your wear log.", "Compare HUME's current floral-containing structures rather than assuming a floral label gives a uniform duration.", "samples", ["myself", "homme-intense"]),
  g("How long do oud perfumes last on skin", "Wear-time comparisons",
    "An oud note does not guarantee a fixed duration, all-day projection or natural agarwood content. Judge the exact oud-listed perfume and its supporting structure rather than using the note's reputation as a performance certificate.", [
      ["Compare the interpretation", "Wood-and-spice and rose-and-incense structures can present different overall impressions. A note name does not disclose how much of a particular material is used."],
      ["Define the lasting outcome", "A lingering close-range woody trace differs from noticeable presence around you. Record which one you mean when judging whether the perfume lasts."],
      ["Choose from repeated enjoyment", "Try the favorite again in your intended setting. Longer persistence is not automatically preferable if the later character is not something you want to wear."],
    ], "Record exact composition context and later presence before comparing any oud-duration claim.", "Explore HUME's available oud-listed options below as contrasting fragrances without natural-content or fixed-hour assumptions.", "samples", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("How long do budget perfumes last on skin", "Wear-time comparisons",
    "Budget perfume is a price description, not one formula or duration class. Compare exact products and your preferred later experience rather than assuming a lower price determines how long a scent remains perceptible.", [
      ["Keep product identity clear", "Read maker, version, size and format before comparing prices. A sample, inspired fragrance and original designer bottle are different offers."],
      ["Use the same personal record", "Track application, setting and later observations for each candidate. The result is more useful than treating a price band as a prediction."],
      ["Assess value through actual use", "Include enjoyment and final payable cost alongside persistence. A long-lasting fragrance you avoid wearing can be worse personal value than one that fits your routine."],
    ], "Compare two affordable candidates with price hidden from the scent notes until after evaluating the wear.", "Use HUME's current prices and discovery trials to judge value without claiming that affordability guarantees or prevents longevity.", "samples"),
  g("How long do perfume samples last on skin", "Wear-time comparisons",
    "A perfume sample has no separate duration category simply because its container is small. The fragrance and application matter, and a sample atomizer may deliver a different amount from a full bottle.", [
      ["Confirm the exact fragrance", "Match sample name, version and maker with the product you may buy later. A decant or similarly named interpretation should not be assumed identical."],
      ["Record the applicator", "Equal spray counts from different containers do not prove equal quantities. Keep the test described honestly rather than claiming laboratory-equivalent dosing."],
      ["Retest the favorite", "A separate second wear can show whether your later enjoyment is consistent. Use samples to learn preference, not to assign a universal performance result to every bottle."],
    ], "Save the sample's exact name and application details beside every later-wear observation.", "Keep HUME's discovery selection list with the testers so a favorite and its later full-bottle listing remain correctly matched.", "samples"),
  g("How long do oil perfumes last on skin", "Wear-time comparisons",
    "An oil carrier does not establish a fixed skin-wear duration. Finished oil perfumes differ in composition and application, and their close-range experience should be evaluated separately from how noticeable they are around others.", [
      ["Read the finished product", "A personal perfume oil is different from a raw fragrance or home-scent material. Use only the intended product and its actual directions for a wearing trial."],
      ["Avoid equal-dose assumptions", "Rollers, dabbers and sprays deliver fragrance differently. An equal number of applications is not a controlled comparison across mechanisms."],
      ["Record the outcome you want", "You may prefer the applicator, the later smell or a quieter experience. None of those preferences requires assuming oil always lasts longer than alcohol-based perfume."],
    ], "Record carrier and applicator alongside later enjoyment so an oil-format preference is not confused with a duration claim.", "Compare HUME spray candidates as separate complete products if useful; the catalogue does not establish matching oil versions.", "shop"),
  g("How long do light perfumes last on skin", "Wear-time comparisons",
    "Light can mean an airy scent, a quieter presence or a lighter-positioned format. None supplies one fixed skin-wear duration, so clarify which meaning you want before comparing products.", [
      ["Define light precisely", "A delicate-smelling composition can remain noticeable, while a quietly worn fragrance may still have a warm character. Style and presence are different observations."],
      ["Check what remains later", "A perfume can become less noticeable around you while retaining a close-range trace. Decide whether that suits the occasion instead of treating all quietness as disappearance."],
      ["Use exact candidates", "A broad adjective is not a product specification. Keep the version, application and setting recorded so another trial can be compared meaningfully."],
    ], "Write whether light means scent texture, surrounding presence or format in your shortlist.", "Use HUME's soft sillage preference to find starting ideas, then verify candidates personally rather than assuming a lightness-duration formula.", "quiz"),
  g("How to compare the projection of fresh perfumes", "Projection comparisons",
    "Compare fresh perfumes by defining the type of freshness and observing noticeability under similar conditions. A bright opening can feel vivid without establishing greater surrounding presence throughout the wear.", [
      ["Choose distinct but relevant candidates", "A marine and a citrus-aromatic direction can provide a useful comparison. Record their exact names and do not assume the shared fresh label means similar behavior."],
      ["Keep the observation consistent", "Use separate suitable trials, similar settings and label-directed application. Ask a willing observer about noticeability rather than seeking a compliment."],
      ["Revisit after the opening", "Record whether surrounding presence and scent character change independently. Do not turn one room's result into a guaranteed projection radius."],
    ], "Compare fresh character and surrounding presence in separate columns at similar points of two trials.", "Use HUME's current marine and fresh-note candidates as contrasting examples, then check availability in the discovery builder.", "samples", ["acqua-di-gio-profondo", "allure-sport"]),
  g("How to compare the projection of citrus perfumes", "Projection comparisons",
    "For citrus projection comparisons, separate how bright the opening smells to you from how noticeable the perfume is around the wearer. Use exact candidates, comparable occasions and another observation later in the wear.", [
      ["Identify the citrus context", "Citrus with aromatic or woody support can develop differently. Read the whole structure rather than choosing only by the word bergamot or lemon."],
      ["Avoid side-by-side overload", "Separate trials help keep the perfumes identifiable. If using outside feedback, ask a willing observer in a suitable setting using the same kind of description."],
      ["Track later presence", "The citrus impression becoming quieter does not establish that every supporting scent is absent. Record the full later character separately from projection."],
    ], "Ask whether the opening is bright and whether the whole scent is noticeable as two different questions.", "Compare HUME's citrus-containing structures through separate samples instead of assuming shared top notes predict the same projection.", "samples", ["sauvage-noir", "lv-imagination"]),
  g("How to compare the projection of woody perfumes", "Projection comparisons",
    "Compare woody perfumes through actual noticeability rather than counting wood notes or assuming dryness means quietness. Use a clear setting and keep surrounding presence separate from a lingering woody trace.", [
      ["Describe the wood style", "Smooth, dry and smoky textures are different scent impressions. They help identify the candidates but do not independently measure projection."],
      ["Record product and application", "Keep exact names and applicators clear. A tester spray and another bottle's spray should not be described as equal quantities without evidence."],
      ["Use contextual feedback", "A willing observer can describe presence during a normal interaction. Record the setting and time rather than converting the observation into a universal distance."],
    ], "Keep wood texture, close-range trace and surrounding noticeability as three separate observations.", "Use HUME's woody structures below for a personal comparison without treating them as a ranked projection test.", "samples", ["tom-ford-oud-wood", "bleu-de-chanel"]),
  g("How to compare the projection of sweet perfumes", "Projection comparisons",
    "Compare sweet perfume projection by separating perceived sweetness from surrounding noticeability. A rich or dessert-like smell can feel prominent to the wearer without proving how it is perceived at normal interaction distance.", [
      ["Define the sweet direction", "Vanilla-like warmth and sugary fruit are different references. Record which character is being compared so sweetness is not mistaken for a single formula."],
      ["Use separate trials", "Avoid layering several unfamiliar sweet fragrances and then assigning the combined presence to one product. Keep application and setting documented."],
      ["Ask for useful feedback", "Where appropriate, ask a willing observer whether the fragrance is noticeable, not whether it is impressive. Later enjoyment and projection should remain separate."],
    ], "Record sweetness intensity and outside noticeability as independent observations during each test.", "Compare HUME's vanilla-containing examples as different compositions, without assuming sweetness guarantees strong projection.", "samples", ["myself", "eros-flame"]),
  g("How to compare the projection of floral perfumes", "Projection comparisons",
    "A floral projection comparison should focus on exact fragrances rather than assuming flowers mean delicate presence. A floral-citrus and a floral-woody structure can smell and behave differently.", [
      ["Identify the full floral structure", "Read supporting woods, musks or warmer notes. A listed jasmine or rose is a selection clue, not a projection measurement."],
      ["Compare in appropriate conditions", "Use separate trials and a similar setting where fragrance is welcome. Keep the observer and kind of feedback consistent where practical."],
      ["Track the later balance", "A floral impression becoming less distinct can coexist with remaining surrounding presence. Record what changed instead of reducing both to one intensity score."],
    ], "Write the floral character you perceive and the contextual noticeability report separately for each candidate.", "Use HUME's current floral-containing options for contrast, checking the full notes rather than expecting identical performance from a flower name.", "samples", ["myself", "homme-intense"]),
  g("How to compare the projection of oud perfumes", "Projection comparisons",
    "Compare oud-listed perfumes by observing their actual presence and supporting composition. Oud reputation, claimed natural origin and a dark scent impression do not independently establish a stronger projection result.", [
      ["Choose contrasting interpretations", "Wood-and-spice and rose-and-incense structures can emphasize different qualities. Exact product identity matters more than treating oud as one uniform material in every listing."],
      ["Use restrained suitable trials", "Follow directions and shared-space rules. Ask a willing observer about actual noticeability without treating maximum distance as the goal."],
      ["Separate trail and persistence", "A lingering woody trace, a moving scent trail and surrounding presence are different observations. Keep them distinct in the comparison."],
    ], "Record oud-style character, contextual projection and later trace independently rather than assigning one power score.", "Compare HUME's available oud-listed compositions below without asserting natural agarwood content or guaranteed projection distances.", "samples", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("How to compare the projection of budget perfumes", "Projection comparisons",
    "Compare budget perfume projection by hiding price from the scent observations and using the same contextual method. Price does not establish a projection class, and a lower-cost fragrance should not be judged by a different standard.", [
      ["Check equivalent product facts", "Record maker, exact version and applicator. Samples, inspired fragrances and designer originals are different offers even when a familiar reference appears in their descriptions."],
      ["Use a consistent observation", "Choose similar appropriate settings and describe noticeability with a willing observer where useful. Do not equate spray counts across different atomizers with exact matched doses."],
      ["Add price after the trial", "Review enjoyment, suitable presence and delivered cost together. A stronger result is not automatically better value if it does not fit your intended use."],
    ], "Complete the presence notes first and compare prices only when assessing the final purchase decision.", "Use HUME's live prices and sample trials to evaluate personal value without assuming its price point determines projection.", "samples"),
  g("How to compare the projection of perfume samples", "Projection comparisons",
    "When comparing sample projection, keep fragrance identity and applicator differences visible. Small testers can use different atomizers, so the same spray count does not guarantee an equal amount of product.", [
      ["Save exact sample names", "Match each tester with its maker and version. A similarly named decant or inspired interpretation should not be treated as the same composition."],
      ["Use separate wearing trials", "Avoid mixing new samples while judging which one is noticeable. Record the setting and application honestly rather than claiming a controlled laboratory test."],
      ["Use results for a shortlist", "Contextual feedback can help choose which fragrance to explore further. Do not assume the result transfers numerically to every full-bottle atomizer."],
    ], "Keep the tester name and application details beside every presence observation and later favorite.", "Retain HUME's discovery selection list so each trial stays linked to the right fragrance and full-size product page.", "samples"),
  g("How to compare the projection of oil perfumes", "Projection comparisons",
    "Compare oil perfume projection through the exact finished product and application rather than assuming the carrier guarantees a quiet or powerful result. Contact application and atomized application are different mechanisms, not automatically equal doses.", [
      ["Confirm intended personal use", "Read the actual cosmetic's directions. A raw fragrance material or home-scent oil is not interchangeable with a finished perfume oil for a wearing trial."],
      ["Describe the application honestly", "Record roller, dabber or other supplied mechanism. Avoid inventing a drop-to-spray conversion when comparing another format."],
      ["Use contextual noticeability", "Ask a willing observer in an appropriate setting if useful, and record their description separately from your own later close-range impression."],
    ], "Compare the exact products as whole experiences while noting that their application amounts may not be equivalent.", "Use HUME's spray fragrances as separate candidates if relevant, without assuming oil equivalents or a universal carrier-based projection ranking.", "shop"),
  g("How to compare the projection of light perfumes", "Projection comparisons",
    "For light perfumes, first distinguish airy scent texture from low projection. A delicate-smelling fragrance can still be noticeable, so compare actual presence rather than treating the adjective light as a measured specification.", [
      ["Define the label in each listing", "Light may describe freshness, a quieter style or another interpretation of a name. Read the actual product and format before comparing."],
      ["Choose a relevant setting", "Use appropriate shared-space rules and a consistent type of observation. A close-range brief differs from wanting a noticeable trail at an event."],
      ["Evaluate comfort as well", "The goal is the presence you enjoy and can use considerately. A quieter later phase can be a good fit rather than a lower score."],
    ], "Write whether you mean airy texture or quiet presence before selecting candidates for a projection trial.", "Use HUME's soft sillage quiz preference to find starting ideas, then verify them personally rather than accepting a light-label guarantee.", "quiz"),
  g("Why do fresh perfumes fade quickly", "Understanding fading",
    "A fresh perfume may seem to fade when its bright opening changes, but that is not proof that all fresh fragrances vanish quickly. Fresh covers different structures, and the later scent may be quieter or simply different from what you first noticed.", [
      ["Identify the fresh impression", "Citrus, marine and green references can behave differently within their compositions. Write which quality seems reduced instead of blaming the family as a whole."],
      ["Check for a later character", "Notice whether wood, warmth or another impression remains. Keep surrounding presence and close-range detectability separate while observing the change."],
      ["Compare another ordinary trial", "Avoid immediate layering or repeated top-ups when trying to understand the result. Record application and conditions so the comparison remains useful."],
    ], "Describe the opening quality that changed and the later impression that remains before calling the perfume gone.", "Compare HUME's different fresh-note structures through separate samples to learn which development you enjoy.", "samples", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("Why do citrus perfumes fade quickly", "Understanding fading",
    "A citrus perfume can seem shorter-lived when the opening brightness becomes less prominent. The complete fragrance may still have supporting notes, so distinguish the duration of the citrus impression from the duration of every part of the composition.", [
      ["Track the opening specifically", "Write whether lemon-like, bergamot-like or another bright character is what you miss later. That gives the observation more meaning than a single weak-perfume label."],
      ["Read what supports the citrus", "Woods, flowers or warmer effects can shape the later scent. Similar citrus top notes do not establish identical development across products."],
      ["Choose the experience you prefer", "If you mainly enjoy the opening, another composition may fit better. Increasing application is not automatically the right way to preserve one impression indefinitely."],
    ], "Record citrus brightness and overall remaining scent as separate parts of a repeat wearing trial.", "Use HUME's citrus-containing examples below to compare different supporting structures instead of expecting a fixed citrus-duration guarantee.", "samples", ["sauvage-noir", "lv-imagination"]),
];

const byTitle = (title: string) => BEGINNER_GUIDES_BATCH_SIX.find(guide => guide.title === title)!;
byTitle("Projection vs longevity perfume").chart = {
  headers: ["Term", "Useful meaning", "Separate question"],
  rows: [["Projection", "Noticeability around the wearer", "How long a close trace remains"], ["Longevity", "How long scent stays perceptible", "How far it is noticed"], ["Sillage", "Trail associated with movement", "A fixed surrounding radius"]],
};
byTitle("How to test perfume longevity").chart = {
  headers: ["Record", "What to enter"],
  rows: [["Product", "Exact maker, name and version"], ["Application", "Applicator and label-directed use"], ["Setting", "Ordinary conditions and occasion"], ["Observation", "Your chosen time and what remains"], ["Preference", "Later enjoyment and wish to wear again"]],
};
byTitle("Nose blindness vs weak perfume").sources = [{ title: "Human odor desensitization research: perception and recovery", url: "https://pubmed.ncbi.nlm.nih.gov/24293565/" }];
byTitle("Does perfume get stronger with age").sources = [{ title: "CHANEL: fragrance storage guidance", url: "https://www.chanel.com/us/faq/fragrance-beauty/" }];

for (const guide of BEGINNER_GUIDES_BATCH_SIX) {
  if (guide.title.includes("oud perfumes")) guide.requiredNote = "oud";
  if (guide.title.includes("sweet perfumes")) guide.requiredNote = "vanilla";
}
