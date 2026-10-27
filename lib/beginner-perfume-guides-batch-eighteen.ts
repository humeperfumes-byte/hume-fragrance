import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string, nextStep: BeginnerGuide["nextStep"] = "samples"): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep, productIds: [] };
}

export const BEGINNER_GUIDES_BATCH_EIGHTEEN: BeginnerGuide[] = [
  g("Where to spray perfume", "Application and care", "Apply perfume only as directed for the exact product, choosing an appropriate area and a considerate setting. Wrists can be useful for observing a scent, but no placement guarantees a fixed duration or projection.", [
    ["Read the intended use", "A skin spray, hair product and room fragrance are different items. Do not assume a fragranced product belongs on every surface."],
    ["Keep the mist controlled", "Avoid the face and eyes and apply away from other people. Do not spray into shared air as an application ritual."],
    ["Protect clothing separately", "Read garment care and fragrance directions before considering fabric. Delicate clothes and jewellery should not become test surfaces."],
  ], "Choose a permitted application area and an appropriate private setting before using an unfamiliar spray.", "Use HUME samples according to the actual product directions and record placement when comparing fragrances."),
  g("How many sprays of perfume should I use", "Application and care", "There is no universal spray count for perfume. Formula, atomizer, intended use and nearby people all matter, so follow the product directions and learn a restrained routine before important occasions.", [
    ["Check the actual applicator", "A sample spray and a bottle spray may deliver different amounts. Equal counts are not controlled equal doses."],
    ["Use the setting as a boundary", "Close offices, transport and meals can call for less fragrance or none. Follow any fragrance-free policy."],
    ["Avoid automatic top-ups", "Reduced self-awareness does not prove disappearance. Consider what remains and the next setting before adding more."],
  ], "Record the exact container and your tested application instead of copying a generic internet spray number.", "Treat each HUME discovery sample as its own applicator and reassess a larger bottle's behavior rather than transferring counts exactly."),
  g("Should I rub perfume after spraying", "Application and care", "There is usually no need to rub a spray perfume into the skin. Follow the product's directions and let the application settle rather than using friction as a supposed performance booster.", [
    ["Keep the application simple", "Spray products are designed for their stated application method. Rubbing is not a required extra step."],
    ["Avoid exaggerated explanations", "Do not assume rubbing literally crushes fragrance molecules or that one accidental rub ruins the bottle's scent."],
    ["Keep trials consistent", "Record how you applied the candidate and avoid changing several parts of the routine at once."],
  ], "Try the product as directed without adding a rubbing ritual and observe the later character normally.", "Use a simple consistent routine for HUME sample comparisons rather than attributing every difference to wrist-rubbing."),
  g("How far away to hold perfume bottle", "Application and care", "Use the distance recommended for the exact perfume and applicator rather than treating one centimetre figure as universal. The aim is a controlled application to the intended area without spraying the face, other people or nearby objects.", [
    ["Read the nozzle directions", "Atomizers vary in spray pattern and output. A compact sample may behave differently from a full bottle."],
    ["Check direction before use", "Orient the nozzle toward the intended application area in a suitable private setting. Avoid using shared air to test it."],
    ["Do not chase a cloud", "A large airborne mist is not required for effective personal use. Follow directions instead of adding a walk-through ritual."],
  ], "Read the applicator instructions and identify the nozzle direction before the first appropriate use.", "Check the actual HUME sample or bottle directions rather than assuming one fixed distance fits all containers."),
  g("Perfume before or after getting dressed", "Application and care", "Choose the sequence around the product's intended use and garment care. If applying a skin fragrance, doing so before dressing can avoid accidental contact with delicate clothes; do not assume every fabric is suitable for perfume.", [
    ["Separate skin and fabric use", "A perfume's directions and a garment's care instructions answer different questions. Read both when relevant."],
    ["Protect special materials", "Avoid experimenting on silk, embellishments, leather or jewellery. A longer-lasting fabric trace is not worth an unwanted mark."],
    ["Keep the routine controlled", "Apply away from other people and give the application time to settle before clothing contacts it."],
  ], "Plan the application sequence before wearing a delicate or special outfit.", "Use HUME trials on ordinary suitable days, keeping event clothing out of the experiment."),
  g("How to store perfume bottles", "Application and care", "Store perfume according to its maker's guidance, generally away from direct light, heat and repeated temperature swings, with the container properly closed. Display appeal should not decide the storage location.", [
    ["Choose a stable location", "A shaded cupboard or drawer can be more appropriate than a sunny windowsill. Check actual conditions where the bottle will sit."],
    ["Keep handling simple", "Replace the closure as intended and avoid unnecessary opening or transfer. Do not dismantle the sprayer for routine storage."],
    ["Retain identity information", "Keep the name and relevant product instructions accessible, especially if storing several similar bottles."],
  ], "Inspect the bottle's current location for direct light, heat sources and repeated temperature changes.", "Store HUME samples and bottles with their identities intact and follow any product-specific instructions."),
  g("Does perfume expire", "Application and care", "Perfume does not have one universal expiry period for every formula and storage history. Follow any maker-provided expiry or after-opening information and ask about a specific product when its condition concerns you.", [
    ["Use the actual label", "Batch information and opening dates can be useful records, but they do not supply a universal usability verdict."],
    ["Keep observations proportionate", "A colour shift alone does not necessarily establish spoilage. A change in smell, container or performance needs product-specific context."],
    ["Avoid home restoration", "Do not add water, alcohol or other materials to fix an old scent. Ask the maker if the product seems unsuitable to use."],
  ], "Record when you opened the perfume and its storage history before asking a specific condition question.", "Use HUME's actual product information and contact route for a bottle-specific concern rather than assuming a fixed shelf life from price or size."),
  g("Can I keep perfume in the bathroom", "Application and care", "A bathroom is often a poor perfume-storage choice if it exposes the bottle to repeated warmth, dampness and temperature changes. Choose a more stable shaded place when possible and follow maker guidance.", [
    ["Check the actual conditions", "A shelf near the shower differs from a stable cupboard elsewhere. Convenience does not establish suitable storage."],
    ["Keep the bottle closed", "Use the intended closure and avoid leaving it open during a routine."],
    ["Separate convenience from storage", "You can plan application without keeping the entire collection beside the shower."],
  ], "Compare the bathroom location with a shaded stable cupboard before choosing where the perfume stays.", "Keep HUME discovery samples clearly labelled in a stable location rather than scattering them around a damp bathroom."),
  g("Can I leave perfume in the car", "Application and care", "Do not use a parked car as routine perfume storage, especially where it can become hot or exposed to direct light. Carry only what you need and remove it with your belongings.", [
    ["Separate carrying and storing", "A necessary journey is different from leaving the bottle in a glove compartment for days."],
    ["Avoid deliberate heat", "Warming perfume is not a recommended way to improve its scent or projection."],
    ["Ask about specific exposure", "If a bottle was left in heat and now seems different, contact the maker with the facts rather than trying to repair it yourself."],
  ], "Remove any bottle routinely kept in the car and choose a more stable storage location.", "HUME's small sample format may reduce what you carry, but small size does not remove heat-protection needs."),
  g("How to clean a travel perfume atomizer", "Application and care", "Clean a travel atomizer only according to its model-specific instructions. Seals, materials and refill mechanisms differ, so there is no universal water, alcohol or solvent routine that is appropriate for every device.", [
    ["Identify the device", "Read the model and cleaning guidance before opening components. Some containers may not be intended for disassembly or reuse."],
    ["Avoid improvised treatments", "Do not force valves, heat the device or introduce unapproved cleaning materials. Those actions can damage seals or leave residue."],
    ["Keep scent identity clear", "A dedicated atomizer for one fragrance can avoid unnecessary mixing when a changeover method is not specified."],
  ], "Find the atomizer maker's actual cleaning instructions before attempting a scent change.", "HUME discovery samples are not assumed to be refillable travel devices; check the supplied container rather than treating it as one."),
  g("How to refill a perfume atomizer", "Application and care", "Refill only an atomizer designed for refilling and use its specified method with a compatible source bottle. Bottom-fill, screw-top and cartridge systems are different designs, not interchangeable instructions.", [
    ["Read compatibility first", "Check the device guide before removing caps or parts. Do not force a source bottle's crimped sprayer."],
    ["Follow its fill limit", "Use the maker's procedure and leave any required space. Avoid guessing from the shell's external size."],
    ["Check closure and identity", "After the approved procedure, confirm the closure and label the fragrance. Do not mix a new scent into unidentified leftovers."],
  ], "Identify the refill mechanism and compatible source before transferring any fragrance.", "Do not assume HUME sample sprayers or full bottles are designed for disassembly; ask about the actual container if unclear."),
  g("How to layer perfumes for beginners", "Application and care", "For a beginner, layering is optional exploration after you know each fragrance individually. Start with a clear scent idea and keep products in their own containers rather than mixing liquids into a new formula.", [
    ["Learn both scents first", "Notice each opening and later character separately. Two favorites do not automatically produce a favorite combination."],
    ["Keep the experiment manageable", "Use only products as directed on a suitable ordinary day. Avoid introducing several new variables before a social event."],
    ["Consider total presence", "Layering adds to the overall application. Shared spaces may call for less fragrance or none."],
  ], "Write the single impression you want a combination to add before deciding whether layering is necessary.", "Use HUME discovery to understand fragrances separately before considering an optional combination; no specific blend compatibility is guaranteed."),
  g("Customize perfume", "Application and care", "Customizing perfume can mean selecting existing scents, choosing presentation or commissioning a new formula. Clarify which service you want before treating a choose-your-own sample kit as bespoke fragrance creation.", [
    ["Define the requested change", "Selecting a kit's contents changes the assortment, while formula work changes the fragrance itself."],
    ["Read available controls", "Use only the actual options described by the provider. Do not assume blending, private labels or packaging choices are included."],
    ["Plan a useful selection", "For discovery, choose contrasting directions that answer personal preference questions."],
  ], "Finish the sentence: I want to customize the selection, presentation or formula, then check the actual service scope.", "HUME's discovery builder customizes the selection of existing available perfumes; it does not promise a newly commissioned formula."),
  g("Custom perfume vs custom sample kit", "Application and care", "A custom perfume involves work on a fragrance formula; a custom sample kit usually means choosing from existing scents. The two offers have different goals and should not be compared as the same service.", [
    ["Read what is created", "Ask whether the provider supplies a new composition or assembles a selection of already listed perfumes."],
    ["Check the commitment", "Formula projects and sample purchases can have different consultation, quantity and timing arrangements. Use actual terms rather than assumptions."],
    ["Choose for the uncertainty", "A selectable kit can help you learn preferences without requiring formula creation."],
  ], "Write what you receive and which decisions you control before choosing between bespoke work and a sample selection.", "HUME discovery lets you choose existing fragrances; it is a custom selection rather than a new personal perfume formula."),
  g("How to create a signature fragrance", "Application and care", "Creating a signature fragrance experience can simply mean choosing a perfume you repeatedly enjoy. If you mean commissioning a new formula, that is a separate service requiring an explicit provider brief.", [
    ["Choose the meaning of signature", "A personal regular favorite does not need to be unique worldwide or worn by nobody else."],
    ["Test across real routines", "Observe whether the exact scent remains enjoyable in the settings where you want it to become familiar."],
    ["Avoid forced novelty", "Layering or mixing is not required to make a favorite feel personal. A consistent known choice can be enough."],
  ], "Describe the recurring experience you want from a signature scent before deciding whether you need a new formula.", "Use HUME discovery to identify an existing fragrance you want to return to, without implying bespoke composition services."),
  g("Can I choose my own perfume samples", "Application and care", "You can choose your own samples when the seller's actual offer allows selection. Check eligible fragrances, required count and availability rather than assuming every discovery set is customizable.", [
    ["Read the selection rules", "Fixed assortments and builders serve different needs. Check what the current offer actually permits."],
    ["Choose meaningful contrast", "Use known likes and one useful alternative rather than filling all slots from popularity lists."],
    ["Review before ordering", "Confirm exact names, count and complete total so the final list matches the intended trial."],
  ], "Assign each selected sample a question it should help answer, then check the completed list.", "HUME's builder lets you choose existing available fragrances under its current kit selection rules."),
  g("Can I mix two perfumes", "Application and care", "Two perfumes can be explored as separate directed applications, but you should not assume their liquids can be combined into one bottle. A pleasing layered result is a preference question, not a guaranteed compatible formula.", [
    ["Keep containers separate", "Avoid altering a perfume with another fragrance, water or alcohol. Finished products are not a home recipe system."],
    ["Know each scent first", "Try both individually before an optional ordinary-day layering experiment. Observe the later result, not only the combined opening."],
    ["Consider overall amount", "Two applications can create more presence than expected. Follow directions and respect shared-space boundaries."],
  ], "Describe the purpose of a combination before experimenting, and leave both original liquids unchanged.", "Explore HUME samples separately first; no promise is made that a particular pair creates a stable mixed product or universally enjoyable layer."),
  g("How to pack perfume for travel", "Application and care", "Pack perfume with secure closure, protection from knocks and attention to current route requirements. Choose a familiar useful quantity rather than carrying the entire collection by default.", [
    ["Check the actual containers", "Read capacity and format, not only the remaining liquid amount. Small size does not remove packing requirements."],
    ["Review current rules", "Check your airline and departure or transfer airport guidance, including liquid presentation and any other applicable limits."],
    ["Protect the product", "Follow storage directions and avoid prolonged heat or pressure on the spray head. Do not spray around fellow passengers."],
  ], "Make a container inventory and check it against the current rules for the full route before packing.", "HUME discovery can help identify a travel favorite before departure; its samples are not automatically certified for every itinerary."),
  g("Can I take perfume samples on a plane", "Application and care", "Perfume samples may be carried when they meet your route's current security and airline requirements. Air India's published cabin guidance includes containers of 100ml or less; small samples still need to meet all other applicable rules.", [
    ["Check the whole itinerary", "Departure, transfer and airline requirements can matter. Do not treat one carrier's guidance as worldwide approval."],
    ["Use container capacity", "Check the stated capacity rather than only the liquid remaining. Review any required liquids-bag arrangement."],
    ["Separate other baggage limits", "Cabin liquid screening and airline restrictions are not the same check. Consult current official guidance before departure."],
  ], "Check each sample container and the current airline and airport guidance for every stage of the journey.", "HUME's listed sample size can inform your packing inventory, but the kit is not a guarantee of airport acceptance."),
  g("How to keep a perfume testing journal", "Application and care", "A perfume journal should record exact identity, context and how the scent changes, with a clear repeat-wear decision. Short consistent notes are more useful than forcing a complex score after every spray.", [
    ["Record the product", "Save maker, full name, version and applicator. This prevents a favorite being confused with a similar reference."],
    ["Separate observations", "Opening, later texture, close-range scent and surrounding presence can be different. Note the setting without pretending it is a laboratory test."],
    ["End with a decision", "Write whether you want another wear and what question remains. A dislike can be useful learning."],
  ], "Create a journal entry with identity, routine, opening, later character and repeat interest.", "Use the exact HUME discovery choices in your journal so later bottle decisions match the fragrance you actually enjoyed."),
  g("How to store a 3ml perfume sample", "Storing fragrance formats", "Store a 3ml sample closed as intended, labelled and protected from direct light and heat. Small quantity changes how easy it is to misplace, not the need for sensible product care.", [
    ["Keep its identity", "Save maker and exact scent name where they remain readable. Similar vials are easy to confuse."],
    ["Protect the applicator", "Avoid loose storage where objects press the spray head or damage the vial. Do not dismantle a closure just to organize it."],
    ["Choose stable conditions", "Use maker guidance and a shaded stable location rather than a hot bag or sunny shelf."],
  ], "Place the labelled sample in a stable organized location where its applicator is protected.", "Keep each HUME discovery sample matched to its selected name so storage supports accurate later comparisons."),
  g("How to store a 5ml perfume decant", "Storing fragrance formats", "For a 5ml decant, preserve the exact source label and follow the seller's container guidance as well as sensible cool, shaded storage. A transferred container should not be treated as the original manufacturer's package.", [
    ["Keep source information", "Record claimed maker, version and who supplied the decant. Do not identify it only by a shortened nickname."],
    ["Check closure instructions", "Caps and refill mechanisms differ. Avoid forcing seals or opening parts without guidance."],
    ["Separate storage and authenticity", "Good care cannot establish where the liquid came from. Keep sourcing claims and handling observations distinct."],
  ], "Save the decant's source identity and container instructions before placing it with similar vials.", "HUME discovery samples are its own fragrances, not a claim of 5ml designer-decant stock."),
  g("How to store a 10ml travel spray", "Storing fragrance formats", "A 10ml travel spray needs appropriate storage between trips, not permanent residence in a bag or car. Use the intended closure and protect it from heat, light and knocks.", [
    ["Separate travel from home storage", "Carry only when useful and return the spray to a stable location after the journey."],
    ["Read refill guidance", "Some travel devices are refillable and others are not. The size alone does not establish the mechanism."],
    ["Keep the scent named", "A reusable shell should stay linked to the actual fragrance it currently contains."],
  ], "Choose a home storage place for the travel spray and keep its current fragrance identity with it.", "HUME's discovery kit is not assumed to include a separate 10ml travel-spray line; review actual available formats."),
  g("How to store a 30ml perfume bottle", "Storing fragrance formats", "Store a 30ml bottle according to product guidance in a stable shaded location, with the closure used as intended. A compact full bottle is not exempt from heat and light care.", [
    ["Avoid display-led placement", "Check whether the attractive shelf receives direct sun or sits beside a heat source."],
    ["Protect routine handling", "Use a stable surface and keep the nozzle from being pressed by nearby objects. Do not disassemble the bottle for storage."],
    ["Retain useful information", "Keep name, directions and any supplied opening or expiry guidance accessible."],
  ], "Inspect the compact bottle's display position for actual light and temperature conditions.", "Follow HUME's supplied bottle guidance and check current listings rather than assuming every fragrance has a 30ml variant."),
  g("How to store a 50ml perfume bottle", "Storing fragrance formats", "For a 50ml perfume bottle, use a stable storage location and the maker's actual closure and care guidance. Everyday convenience should not mean keeping it permanently in a warm bathroom or vehicle.", [
    ["Plan the daily routine", "Choose a shaded accessible place that does not expose the bottle to repeated temperature swings."],
    ["Keep the package intact", "Avoid unnecessary transfers and forced opening. The intended sprayer is part of the container system."],
    ["Record the product", "Retain the exact name and relevant date information so a later concern can be described accurately."],
  ], "Separate your daily application spot from any unsuitable long-term storage habit.", "Use HUME's actual bottle instructions and keep its own product identity clear when storing several similar fragrances."),
  g("How to store a 100ml perfume bottle", "Storing fragrance formats", "A 100ml bottle should be stored where it is stable, protected and used according to maker guidance. Larger volume is not a reason to transfer liquid into another container without an appropriate method.", [
    ["Choose a secure position", "Avoid precarious display edges and direct light. Keep the bottle closed as intended between uses."],
    ["Do not create a daily carry habit", "A larger home bottle need not stay in a vehicle or travel bag simply because you use the scent often."],
    ["Plan quantity through use", "Owning more perfume does not justify extra application. A regular restrained routine can remain appropriate."],
  ], "Give the larger bottle a protected home location instead of treating it as a permanent travel item.", "Check HUME's currently available variants and their actual care directions without assuming an unlisted 100ml option."),
  g("How to store a refillable perfume atomizer", "Storing fragrance formats", "Store a refillable atomizer according to its device instructions, securely closed and labelled with the current scent. Refillable design does not remove storage needs or make every component user-serviceable.", [
    ["Check the mechanism", "Keep valves, cartridges and closures in their intended state. Do not force parts to make storage easier."],
    ["Avoid unidentified leftovers", "Know what fragrance is inside before any future refill. Do not mix contents by accident."],
    ["Protect between trips", "Use stable shaded storage and avoid prolonged heat, including in parked vehicles."],
  ], "Label the current contents and save the model-specific guide beside your refill record.", "Do not assume HUME sample vials are refillable atomizers; ask about the actual container if its design is unclear."),
  g("How to store a perfume oil roller", "Storing fragrance formats", "Store a perfume oil roller as its maker directs, with the cap secured and protection from direct light and heat. Oil-based format does not establish unlimited shelf life or universal ingredient suitability.", [
    ["Use the intended closure", "Do not remove the roller mechanism for routine storage unless the instructions permit it."],
    ["Keep application separate", "Avoid sharing direct-contact applicators and introducing other materials into the container."],
    ["Retain exact identity", "Keep the product name and actual ingredient or care information rather than relying on a scent-family nickname."],
  ], "Save the roller's product instructions and choose a stable storage location before making it a bag staple.", "HUME's listed discovery samples should not be assumed to be oil rollers; check the actual available format."),
  g("How to store a perfume discovery kit", "Storing fragrance formats", "Store a discovery kit as an organized group of labelled samples in stable conditions. Keeping the identities readable is as important for useful comparison as protecting the containers.", [
    ["Preserve the selection list", "Match each vial to its exact maker and fragrance name. Save the original selection if labels are similar."],
    ["Protect individual closures", "Avoid loose packing that presses sprayers or knocks containers together. Use the intended packaging where helpful."],
    ["Choose a suitable location", "Follow product guidance and keep the set away from direct light and prolonged heat."],
  ], "Create a simple kit inventory and check that each stored sample can be identified without guessing.", "Keep HUME's final discovery choice list with the kit so later wear notes and bottle links remain accurate."),
  g("How to store a mini perfume gift set", "Storing fragrance formats", "For a mini gift set, protect the actual containers and their identities rather than treating presentation packaging as guaranteed long-term storage protection. Read the supplied product guidance.", [
    ["Check each included format", "A set may contain different applicators or sizes. Do not assume one care method covers every item."],
    ["Separate display and care", "An attractive box can still sit in direct sunlight or heat. Choose the location deliberately."],
    ["Keep gift information", "Save exact product names and any instructions so favorites can be recognized later."],
  ], "Inspect the gift set's storage location and identify each included fragrance before separating the packaging.", "Use HUME's current discovery specification for its actual contents; do not infer additional mini gift formats from presentation imagery."),
  g("How to travel with a 3ml perfume sample", "Travelling with fragrance", "A 3ml sample can be a compact travel option, but it still needs secure handling and checks against current route rules. Small size alone does not guarantee that every sample or complete kit is accepted.", [
    ["Keep identity and capacity", "Retain the sample label and check the stated container size. Do not pack an unidentified loose vial."],
    ["Protect the applicator", "Avoid pressure on the spray head and secure the container as directed. Do not assume a small vial cannot leak."],
    ["Review the whole route", "Check current airline and airport requirements, including how liquids should be presented."],
  ], "Add the sample to a container inventory and check the current official requirements before departure.", "HUME's listed discovery sample size can inform your inventory, without promising airport acceptance or a fixed number of travel wears."),
  g("How to travel with a 5ml perfume decant", "Travelling with fragrance", "For a 5ml decant, keep exact identity and capacity information with a secure container. Travel convenience does not establish the source of the liquid or remove current baggage requirements.", [
    ["Save source details", "Record claimed maker and version so the vial does not become confused with another scent during the trip."],
    ["Check the actual container", "Use closure and handling guidance supplied by the decant seller. Avoid opening or refilling it while travelling without instructions."],
    ["Review applicable rules", "Check airline and airport guidance for the full itinerary rather than treating decant wording as an exemption."],
  ], "Label the decant accurately and confirm the current packing requirements for the actual route.", "HUME discovery is an own-fragrance sample offer, not a promise of designer decants or a separate 5ml travel range."),
  g("How to travel with a 10ml travel spray", "Travelling with fragrance", "A 10ml travel spray should be packed according to its device guidance and the route's current requirements. Travel branding does not guarantee leak resistance or permission for every itinerary.", [
    ["Check before departure", "Confirm closure and intended use at home rather than discovering the mechanism while packing at the last moment."],
    ["Carry a known scent", "Try unfamiliar contents before the trip. Portability is useful only if you want to wear the actual fragrance."],
    ["Avoid heat storage", "Do not leave the spray in a hot vehicle or exposed bag after arrival. Follow maker care directions."],
  ], "Confirm the travel spray's mechanism, capacity and current contents before checking route rules.", "Review HUME's actual available formats rather than assuming the discovery kit includes dedicated 10ml travel sprays."),
  g("How to travel with a 30ml perfume bottle", "Travelling with fragrance", "A 30ml bottle can be compact enough for a trip, but decide whether carrying the whole bottle serves your plans. Check current transport requirements and protect the container from knocks and heat.", [
    ["Choose useful quantity", "A short trip may not need all the perfume you own. Do not equate capacity with a reason for more application."],
    ["Keep the bottle intact", "Use its intended closure and avoid forcing the sprayer to transfer liquid into an improvised container."],
    ["Check route guidance", "Review official airline and airport requirements for the actual bottle and full itinerary."],
  ], "Compare taking the known compact bottle with your actual trip needs before packing extra formats.", "Check HUME's current variant availability and supplied care information without assuming every scent has a 30ml bottle."),
  g("How to travel with a 50ml perfume bottle", "Travelling with fragrance", "For a 50ml bottle, plan protection and current baggage checks rather than assuming remaining liquid alone decides eligibility. A familiar home favorite can travel only when its actual container and route requirements fit.", [
    ["Use stated capacity", "Read the container specification and keep it identifiable. Do not guess from how full it looks."],
    ["Protect against pressure", "Pack so nearby items do not press the spray head or damage the bottle. Follow closure guidance."],
    ["Choose travel storage", "Avoid prolonged heat after the journey and do not spray around passengers or in shared transport."],
  ], "Check the bottle's stated capacity and protected packing position before reviewing the airline's current rules.", "Use HUME's actual bottle details for a selected variant, not an assumption that all home bottles share travel approval."),
  g("How to travel with a 100ml perfume bottle", "Travelling with fragrance", "A bottle labelled 100ml needs careful checks against the current rules for the whole route. Do not assume that being at a commonly stated cabin-container threshold guarantees acceptance under every other requirement.", [
    ["Check capacity rather than leftovers", "A larger container does not become a smaller-capacity bottle merely because some perfume has been used."],
    ["Read all applicable requirements", "Review airline restrictions and departure or transfer security guidance, including liquid presentation."],
    ["Consider whether it is needed", "A smaller known appropriate format may be more practical, but avoid forcing a non-refillable bottle open to create one."],
  ], "Verify the actual container capacity and full-route requirements before deciding to carry a large bottle.", "Check HUME's current sizes and care information; no 100ml variant or route-specific approval is implied by this guide."),
  g("How to travel with a refillable perfume atomizer", "Travelling with fragrance", "Travel with a refillable atomizer only after confirming its contents, closure and approved refill method. Device convenience does not replace current baggage checks or sensible storage.", [
    ["Prepare at home", "Use the model-specific procedure before departure and confirm the assembled device is in its intended state."],
    ["Keep the contents known", "Label the fragrance and avoid topping up unidentified leftovers with another scent."],
    ["Check transport separately", "Review capacity and current route requirements. A refillable shell is not an exemption from liquid rules."],
  ], "Record device capacity and fragrance identity after the approved refill, then check the journey requirements.", "Do not assume HUME's sample vials are refillable travel atomizers; use the actual supplied-container information."),
  g("How to travel with a perfume oil roller", "Travelling with fragrance", "For travel with a perfume oil roller, secure the cap and check current rules for the actual product. Oil-based or alcohol-free wording does not automatically exempt a liquid from baggage requirements.", [
    ["Read the product identity", "Confirm perfume use, capacity and application directions. A room-fragrance oil is a different item."],
    ["Protect the direct-contact applicator", "Keep it capped and do not share it as an informal group tester during the trip."],
    ["Review the actual route", "Use current airline and airport information rather than assuming a roller format is outside liquid screening."],
  ], "Include the roller in your liquid-container inventory instead of excluding it because of the oil base.", "HUME discovery is not assumed to supply oil rollers; check actual listings before choosing any travel format."),
  g("How to travel with a perfume discovery kit", "Travelling with fragrance", "Before travelling with a discovery kit, decide whether you need every sample. A smaller selection of known favorites can simplify packing, while unfamiliar discovery may be easier to do before departure.", [
    ["Inventory each container", "Count individual capacities and other carried liquids when reviewing current route requirements."],
    ["Preserve labels", "Keep exact sample identities and protect closures so the trip does not mix up later fragrance notes."],
    ["Choose useful variety", "Packing the entire set is optional. More travel choices are not automatically more enjoyment."],
  ], "Select only the samples that serve the itinerary, then check the complete container inventory against official guidance.", "HUME's discovery specification helps count sample containers; the total kit volume alone does not determine baggage acceptance."),
  g("How to travel with a mini perfume gift set", "Travelling with fragrance", "A mini gift set needs both container protection and current travel-rule checks. Presentation packaging does not automatically make every included item suitable for cabin baggage or the full journey.", [
    ["Inspect actual contents", "Record individual formats and capacities, not just the outer box size or combined volume."],
    ["Plan gift presentation", "Security requirements may involve presenting items separately. Do not rely on keeping a gift permanently untouched as a packing rule."],
    ["Check the destination plan", "Protect from prolonged heat and verify any relevant route or carrier requirements before departure."],
  ], "Make a container-level inventory before deciding how to pack the mini gift and its presentation.", "Review HUME's actual discovery contents and route requirements rather than treating a gift-style box as travel certification."),
  g("How to use a 3ml perfume sample", "Using fragrance formats", "Use a 3ml sample to learn the exact scent's development rather than rushing to finish it. Follow its application directions and keep the name linked to your observations.", [
    ["Start with identity", "Save maker and exact fragrance name. Similar small vials can be confused easily."],
    ["Keep the trial readable", "Try one unfamiliar fragrance at a time on a suitable ordinary day, recording the applicator and setting."],
    ["Repeat what interests you", "A favorite deserves another wear before a bottle decision. Do not assume a fixed spray count or number of days from volume alone."],
  ], "Record opening, later character and repeat interest for one clearly named sample.", "Use HUME's discovery choices as exact journal entries so a later bottle matches the fragrance you actually enjoyed."),
  g("How to use a 5ml perfume decant", "Using fragrance formats", "Use a 5ml decant according to its container and product directions, keeping the claimed source identity clear. Transferred fragrance is not automatically an official sample of the referenced maker.", [
    ["Read the applicator", "A spray and dab vial deliver differently. Do not copy counts from another container as equal quantities."],
    ["Observe the complete scent", "Record later development and preference rather than using a first sniff to certify origin."],
    ["Match any later purchase", "Save maker and version before buying more. A similarly named interpretation is a different product."],
  ], "Write the decant's exact claimed source and applicator before beginning a wear record.", "HUME samples evaluate HUME fragrances, not a separate range of designer decants or a guaranteed 5ml format."),
  g("How to use a 10ml travel spray", "Using fragrance formats", "Use a 10ml travel spray with the same attention to directions and shared-space presence as a home bottle. A portable size does not make repeated application necessary.", [
    ["Learn the actual output", "Travel atomizers vary. Record what you use rather than assuming one spray matches another device."],
    ["Refresh deliberately", "Consider what remains and the next setting before adding more. Do not spray around fellow passengers or at a shared table."],
    ["Keep the contents clear", "If the device is refillable, follow its guide and do not mix unidentified scents."],
  ], "Choose a suitable private setting for any needed application instead of using portability as a top-up habit.", "Check HUME's actual formats; a discovery sample is not automatically a refillable 10ml travel device."),
  g("How to use a 30ml perfume bottle", "Using fragrance formats", "A 30ml bottle is a quantity choice, not a dosage category. Use the exact product as directed and learn its applicator before deciding how it fits your routine.", [
    ["Plan a first ordinary wear", "Avoid making an unfamiliar bottle's first use an important interview or celebration."],
    ["Observe later character", "Record whether the full development remains enjoyable and appropriate for your settings."],
    ["Keep volume separate", "Owning a compact bottle does not require stretching each application or finishing it quickly. Avoid exact-yield assumptions."],
  ], "Write the bottle's exact identity and intended routine before its first suitable trial.", "Check available HUME variants directly; no universal 30ml option or fixed application count is implied."),
  g("How to use a 50ml perfume bottle", "Using fragrance formats", "Use a 50ml bottle through a deliberate routine based on the product directions and your setting. Bottle capacity alone cannot determine the right number of sprays or how long the purchase will last.", [
    ["Confirm the favorite", "Match the maker and version if moving from a sample. Similar names can describe different fragrances."],
    ["Reassess the atomizer", "A full bottle may deliver differently from the trial vial. Do not assume equal spray counts are equal amounts."],
    ["Respect everyday proximity", "Offices, transport and dining can call for restrained use or none. Extra volume is not a reason for extra presence."],
  ], "Check sample-to-bottle identity and learn the selected bottle's applicator before repeating a sample routine.", "Use the exact HUME product listing and supplied directions when moving from discovery to an available bottle size."),
  g("How to use a 100ml perfume bottle", "Using fragrance formats", "A 100ml bottle provides more quantity, not a reason to apply more perfume. Use it as directed, store it appropriately and choose application around the occasion rather than the volume owned.", [
    ["Keep consumption realistic", "Universal sprays-per-ml estimates cannot give every wearer an exact bottle lifespan."],
    ["Use a familiar appropriate routine", "Reduced self-awareness is not a signal to keep adding more from a larger supply."],
    ["Avoid improvised transfer", "Do not force a sprayer open for portability. Refill or decant only through a method appropriate for the actual containers."],
  ], "Separate the reason for owning a larger quantity from the amount appropriate for one occasion.", "Check HUME's actual size availability and container information rather than assuming a 100ml line or refillable bottle."),
  g("How to use a refillable perfume atomizer", "Using fragrance formats", "Use a refillable atomizer according to its device guide and the fragrance's directions. Refilling, spraying and cleaning are different tasks that depend on the actual mechanism.", [
    ["Identify the design", "Bottom-fill, cartridge and screw-top systems require different handling. Do not follow a guessed universal procedure."],
    ["Keep the scent identified", "Label current contents and avoid adding another perfume to unknown leftovers."],
    ["Apply considerately", "A portable device is still a spray source. Keep application away from shared air and protect the closure afterward."],
  ], "Save the device instructions and record its current contents before making it part of a routine.", "Do not assume HUME sample sprayers or bottles are refillable devices; confirm the supplied container's design first."),
  g("How to use a perfume oil roller", "Using fragrance formats", "Use a perfume oil roller only for the intended personal-fragrance application and according to its maker's directions. Oil format does not guarantee low projection, unlimited wear or skin compatibility.", [
    ["Read the actual product", "Confirm ready-to-use perfume rather than assuming every scented oil belongs on skin."],
    ["Keep direct contact personal", "Avoid sharing the roller as a group tester or using it to transfer other materials into the container."],
    ["Observe without assuming gentleness", "Evaluate the scent separately from ingredient concerns. Stop using an irritating product rather than adding more to test performance."],
  ], "Confirm intended use, ingredient information and application directions before using an unfamiliar oil roller.", "HUME's discovery set should not be assumed to contain oil rollers; review actual formats and ask about specific product information."),
  g("How to use a perfume discovery kit", "Using fragrance formats", "Use a discovery kit as a planned comparison: identify every sample, try unfamiliar scents separately and return to promising favorites. The goal is learning what you enjoy, not finishing every vial or buying every bottle.", [
    ["Create the inventory", "Save maker, exact names and applicator details before the first trial."],
    ["Compare with purpose", "Give each sample a question, such as freshness preference or later wood texture. Record ordinary context."],
    ["Choose the next step freely", "A favorite may earn a bottle, or sample variety may already satisfy you. Discovery does not require a follow-up purchase."],
  ], "Set a trial schedule with separate wears, short notes and one repeat round for favorites.", "Use HUME's final builder selection as the journal inventory and return to matching live listings only when you want more."),
  g("How to use a mini perfume gift set", "Using fragrance formats", "Use a mini gift set by checking each item's identity and directions before trying the contents. A mixed presentation does not make all applicators or fragrances interchangeable.", [
    ["Read the actual inventory", "Record each scent and format. Avoid assuming the pictured assortment contains equal quantities or one application method."],
    ["Try without pressure", "Explore unfamiliar fragrances separately and keep notes on later enjoyment. A gift does not oblige you to like every sample."],
    ["Keep favorites identifiable", "Save exact names for any future purchase and follow current return terms rather than assuming preference exchanges."],
  ], "Create a named trial list from the actual gift contents before opening several fragrances at once.", "Use HUME's current discovery specification for its actual kit and treat a future bottle as an optional separate choice."),
];

const byTitle = (title: string) => BEGINNER_GUIDES_BATCH_EIGHTEEN.find(guide => guide.title === title)!;
const storageSource = { title: "Diptyque: perfume storage guidance", url: "https://customerservice.diptyqueparis.com/hc/en-us/articles/37771592643863-How-should-I-store-my-perfume-to-preserve-its-quality" };
for (const title of ["How to store perfume bottles", "Can I keep perfume in the bathroom", "Can I leave perfume in the car"]) byTitle(title).sources = [storageSource];
byTitle("Does perfume expire").sources = [{ title: "Diptyque: shelf-life guidance for its perfumes", url: "https://customerservice.diptyqueparis.com/hc/en-us/articles/37771596347799-What-is-the-shelf-life-of-a-perfume-once-opened" }];
byTitle("Should I rub perfume after spraying").sources = [{ title: "YSL Beauty: application guidance", url: "https://www.yslbeauty.com.au/beauty-guides/fragrance-guides/how-to-apply-perfume-and-make-it-last-longer.html" }];
byTitle("Perfume before or after getting dressed").sources = [{ title: "CHANEL: garment care and avoiding direct perfume application", url: "https://www.chanel.com/gb/fashion/care-instructions/ready-to-wear/" }];
const travelSources = [
  { title: "Air India: current restricted baggage guidance", url: "https://www.airindia.com/in/en/travel-information/baggage-guidelines/restricted-baggage.html" },
  { title: "IATA: passenger baggage guidance; check the actual route and airline", url: "https://www.iata.org/en/youandiata/travelers/baggage/" },
];
for (const guide of BEGINNER_GUIDES_BATCH_EIGHTEEN.filter(guide => guide.group === "Travelling with fragrance" || ["Can I take perfume samples on a plane", "How to pack perfume for travel"].includes(guide.title))) guide.sources = travelSources;
byTitle("How to keep a perfume testing journal").chart = {
  headers: ["Journal field", "Useful note"],
  rows: [
    ["Identity", "Maker, exact fragrance, version and applicator"],
    ["Context", "Ordinary setting, activity and application"],
    ["Development", "Opening and later character in separate words"],
    ["Decision", "Would I choose another wear, and why?"],
  ],
};
