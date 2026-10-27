import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep: "samples", productIds: [] };
}

export const BEGINNER_GUIDES_BATCH_NINETEEN: BeginnerGuide[] = [
  g("How long will a 3ml perfume sample last", "Planning fragrance quantity", "A 3ml sample's usable quantity depends on the applicator, amount used and frequency of wear. That is separate from how long the scent remains noticeable after one application or how long the product can be stored.", [
    ["Choose the meaning of last", "Days of use, wear duration and shelf life are different questions. A stated volume cannot answer all three."],
    ["Record actual trials", "Note use dates and the exact applicator instead of assuming a fixed number of sprays per ml."],
    ["Keep the comparison purposeful", "Use unfamiliar scents separately and save a promising candidate for a repeat wear rather than rushing to empty it."],
  ], "Track the sample's actual use dates and repeat-wear decisions without assigning a universal spray yield.", "HUME's listed discovery sample size provides a quantity fact, not a guarantee of days or hours for every wearer."),
  g("How long will a 5ml perfume decant last", "Planning fragrance quantity", "A 5ml decant does not have one fixed lifespan in wears. The actual container and your application routine determine consumption, while the exact fragrance determines the scent experience you assess.", [
    ["Record the applicator", "Spray and dab formats deliver differently. Equal counts from two containers are not necessarily equal amounts."],
    ["Keep source identity", "Save claimed maker and version so usage notes remain linked to the correct decant."],
    ["Separate storage concerns", "Follow the supplier's container guidance rather than using an estimated wear count as an expiry date."],
  ], "Record the decant's identity, applicator and actual wearing frequency before estimating whether more is needed.", "HUME discovery contains its own fragrances, not a guaranteed 5ml designer-decant format or fixed wear yield."),
  g("How long will a 10ml travel spray last", "Planning fragrance quantity", "A 10ml travel spray's length of use depends on its output and how often you apply it. Travel size does not establish a universal trip length, fixed spray count or shelf life.", [
    ["Plan the real itinerary", "A short trip may involve occasional use rather than daily top-ups. Choose quantity around actual plans."],
    ["Learn the device", "Different atomizers can use different amounts. Do not transfer a home-bottle count as an exact dose."],
    ["Keep reapplication optional", "Portability does not mean more perfume is needed. Consider what remains and the next setting."],
  ], "Estimate travel need from your actual routine and device experience rather than a generic 10ml-days claim.", "Check HUME's actual available formats; its discovery kit does not imply a separate 10ml travel-spray range."),
  g("How long will a 30ml perfume bottle last", "Planning fragrance quantity", "A 30ml bottle's time in use depends on frequency and amount per application. Volume alone cannot give an exact finish date or tell you how long the fragrance projects on a particular day.", [
    ["Use real frequency", "An occasional favorite and a daily regular use the same capacity at different rates."],
    ["Avoid assumed spray yields", "Atomizer output varies. Record your own pattern without pretending an internet spray estimate is a measurement."],
    ["Choose a practical quantity", "A compact bottle can suit uncertain or occasional use even when a larger variant has a lower unit price."],
  ], "Write how often you actually select the fragrance before deciding whether 30ml is a useful commitment.", "Review HUME's currently listed sizes rather than assuming every fragrance offers a 30ml variant."),
  g("How long will a 50ml perfume bottle last", "Planning fragrance quantity", "A 50ml perfume bottle has no universal number of months of use. Wearing frequency, atomizer output and application habits matter, so estimate from your routine rather than capacity alone.", [
    ["Separate regular and occasional use", "A work favorite may be chosen more often than an event scent. Actual use is the relevant starting point."],
    ["Keep amount appropriate", "Do not add extra sprays simply to follow a bottle-life calculation or because you stop noticing the scent."],
    ["Track before reordering", "Use your actual experience of the bottle to plan the next purchase, checking availability separately."],
  ], "Keep a short frequency record for the exact bottle before making a replacement plan.", "Use HUME's live selected size and your own wear history rather than a promised 50ml lifespan."),
  g("How long will a 100ml perfume bottle last", "Planning fragrance quantity", "A 100ml bottle provides more quantity, not a guaranteed number of wears or years. Its practical value depends on how often you want the exact fragrance and whether you store it as directed.", [
    ["Confirm repeated preference", "A larger bottle of an uncertain scent is a larger commitment. Size does not make you enjoy it more."],
    ["Keep consumption separate from care", "An expected finish date is not a shelf-life assessment. Follow the actual product's storage and date guidance."],
    ["Avoid buying by unit price alone", "Lower cost per ml helps only when the additional quantity serves real use."],
  ], "Explain why you expect to use the larger amount before estimating its value from unit price.", "Check HUME's current variants rather than assuming a 100ml option or a fixed bottle-life claim."),
  g("How long will a refillable perfume atomizer last", "Planning fragrance quantity", "For a refillable atomizer, distinguish the liquid remaining from the device's service life. Neither can be predicted from refillable wording alone; model guidance and actual condition matter.", [
    ["Check the device specification", "Capacity, approved refill method and care instructions belong to the specific model."],
    ["Observe actual performance", "A damaged closure, persistent leak or malfunction needs the maker's advice rather than an invented repair or lifespan promise."],
    ["Keep refill records", "Label the current fragrance and record changes so liquid use is not confused with device durability."],
  ], "Create separate notes for current liquid quantity and the atomizer's actual condition.", "HUME sample containers are not assumed to be refillable devices with a specified service life."),
  g("How long will a perfume oil roller last", "Planning fragrance quantity", "An oil roller's time in use depends on stated volume, applicator and wearing habits. Oil format does not supply an automatic wear duration, unlimited shelf life or universal skin compatibility.", [
    ["Read the actual product", "Confirm ready-to-use perfume and its directions rather than treating every scented oil as the same format."],
    ["Track your pattern", "Direct-contact application does not translate into spray counts. Use ordinary usage records instead."],
    ["Follow care and date guidance", "Keep the cap secured and consult maker information about condition or storage rather than guessing from the oil base."],
  ], "Record volume, application method and real frequency before estimating an oil roller's useful quantity.", "Review HUME's actual listings rather than assuming its discovery samples are oil rollers."),
  g("How long will a perfume discovery kit last", "Planning fragrance quantity", "A discovery kit's time in use depends on how you schedule trials and which favorites you repeat. Combined millilitres do not translate into one fixed number of days or one uniform scent duration.", [
    ["Plan exploration rather than depletion", "Separate unfamiliar scents and revisit promising ones. Finishing every vial quickly is not the goal."],
    ["Count actual choices", "A kit may contain different fragrances or sizes. Read the specification before comparing total quantity."],
    ["Keep the outcome open", "You can enjoy occasional sample variety without needing a full bottle or an exact kit-finish date."],
  ], "Make a trial schedule with first wears, repeat favorites and a review point rather than a fixed depletion target.", "HUME's listed sample count and size describe quantity; use your own trial plan to decide how the discovery experience unfolds."),
  g("How long will a mini perfume gift set last", "Planning fragrance quantity", "A mini gift set has no single lifespan because its contents and use can differ. Check each item's actual quantity and format rather than treating the outer box as one standardized perfume supply.", [
    ["Inventory the real contents", "Separate fragrances from any explicitly included accessories or other products."],
    ["Respect individual use", "The recipient may prefer some scents more often than others. Equal quantities do not mean equal finish dates."],
    ["Keep care information", "Preserve directions and exact names so condition questions or future purchases can be matched accurately."],
  ], "List the actual gift contents and let usage follow preference instead of imposing a finish-by schedule.", "Use HUME's published discovery specification for its actual kit rather than assuming an unlisted mini-gift range or fixed number of wears."),
  g("How to label a 3ml perfume sample", "Labelling fragrance formats", "Label a 3ml sample so its exact identity remains readable without covering the applicator or existing product information. A personal reference tag supports your notes; it does not replace the maker's label.", [
    ["Keep the essential identity", "Record maker and full fragrance name, adding version information where supplied."],
    ["Use a linked record if space is tight", "A simple sample number can connect the vial to a journal entry without crowding the container."],
    ["Protect existing information", "Avoid covering directions or capacity markings, and do not dismantle the closure to attach a tag."],
  ], "Give the sample a readable identity or journal code and confirm you can match it without guessing.", "Match each HUME discovery sample to the final builder selection so similarly shaped vials do not confuse later bottle decisions."),
  g("How to label a 5ml perfume decant", "Labelling fragrance formats", "For a 5ml decant, retain the claimed maker, exact version and supplying seller as part of the personal record. A clear label helps identification but cannot authenticate the source liquid.", [
    ["Separate source and supplier", "The claimed fragrance maker and the person who transferred it are different facts."],
    ["Keep capacity information", "Preserve the actual container or volume details rather than replacing them with a nickname."],
    ["Use an external journal link", "A short identifier can connect a small vial to the full source description and order record."],
  ], "Record maker claim, exact fragrance, supplier and personal vial code in one decant entry.", "HUME discovery samples are its own fragrances; do not label them as decants of a designer inspiration."),
  g("How to label a 10ml travel spray", "Labelling fragrance formats", "A travel spray's personal label should identify its current fragrance and leave capacity and device information readable. This is especially useful when a reusable shell can hold different scents over time.", [
    ["Use the current contents", "Update the personal record only after a change made according to the device instructions. Do not guess from an old shell colour."],
    ["Preserve device details", "Keep model and capacity information accessible for future refill and route checks."],
    ["Avoid mechanism interference", "Do not attach material across nozzles, valves or closures. Use a separate tag or record if needed."],
  ], "Check that the travel spray's personal name record matches its actual current contents.", "HUME discovery does not imply a dedicated 10ml refillable travel line; review the actual container supplied."),
  g("How to label a 30ml perfume bottle", "Labelling fragrance formats", "For a 30ml bottle, preserve the manufacturer's identity and add personal notes separately where possible. A collection label should make the bottle easier to find without hiding product information.", [
    ["Keep the exact version", "Similar bottle designs can contain different concentrations or fragrances. Use the complete supplied name."],
    ["Link a journal entry", "Record opening date or preference notes in a separate inventory rather than overcrowding the bottle."],
    ["Avoid altering the package", "Do not remove labels, force closures or add adhesives without considering the container's materials and instructions."],
  ], "Create a collection entry that identifies the compact bottle while leaving its supplied label intact.", "Use HUME's exact own-product name and selected variant in personal records rather than the inspiration name alone."),
  g("How to label a 50ml perfume bottle", "Labelling fragrance formats", "A 50ml bottle's personal label or inventory entry should retain exact maker, fragrance and version. Use it to support everyday selection and purchase matching rather than replace the original product details.", [
    ["Record the selected variant", "Volume and concentration label help distinguish similar purchases. Use what is actually stated."],
    ["Keep observations separate", "Opening dates and wear notes are useful personal records, not newly invented expiry information."],
    ["Preserve readability", "Do not cover directions or other supplied markings when adding a code or collection tag."],
  ], "Match the bottle to its live product or order record and keep personal dates in the journal.", "Use the exact HUME fragrance identity when moving from discovery notes to an available full-bottle variant."),
  g("How to label a 100ml perfume bottle", "Labelling fragrance formats", "For a larger bottle, keep personal organization information separate from the original label and capacity markings. The most useful record explains exactly what you own without altering its stated identity.", [
    ["Distinguish similar bottles", "Record full name and version rather than relying on colour or a broad family label."],
    ["Save useful purchase facts", "Order date and seller details can support later questions, while an opening date remains a personal record."],
    ["Keep capacity visible", "Do not obscure actual container information with a smaller-volume personal sticker."],
  ], "Build a full identity entry for the large bottle without changing or covering the supplied capacity information.", "Check HUME's current available sizes; a personal inventory should not invent a 100ml variant that was not supplied."),
  g("How to label a refillable perfume atomizer", "Labelling fragrance formats", "Label a refillable atomizer with the current fragrance and keep a separate record of its model and refill history. A reusable shell can otherwise retain a misleading identity after a scent change.", [
    ["Record actual contents", "Only update after a change completed under the device's instructions. Avoid topping up unidentified leftovers."],
    ["Protect working parts", "Keep tags and labels clear of refill ports, nozzles, cartridges and closures."],
    ["Keep device guidance accessible", "Model details matter for future cleaning and refilling; the fragrance name does not describe the mechanism."],
  ], "Create a current-contents record and check it whenever the atomizer is refilled as permitted.", "Do not treat HUME sample vials as refillable atomizers unless the supplied-container information explicitly supports it."),
  g("How to label a perfume oil roller", "Labelling fragrance formats", "For a perfume oil roller, retain actual product identity and ingredient or direction information, with personal notes kept separately if space is limited. Oil wording is not enough to identify the fragrance.", [
    ["Use the full product name", "Record maker and version where supplied instead of only a generic note such as musk."],
    ["Preserve application information", "Do not cover directions or obstruct the roller and cap with added material."],
    ["Avoid assumed formula labels", "Do not add natural, alcohol-free or compatibility claims unless they are actually supported by the maker."],
  ], "Link the roller to an exact product record without replacing its supplied ingredient or direction details.", "HUME discovery samples should retain their actual format identity rather than being relabelled as oil rollers."),
  g("How to label a perfume discovery kit", "Labelling fragrance formats", "Label a discovery kit through a clear inventory that connects each sample to its exact identity. The outer collection name alone is not enough when several vials look alike.", [
    ["Create a numbered list", "Use simple identifiers linked to maker and full fragrance names without covering existing product labels."],
    ["Match notes to samples", "Keep each trial and repeat-wear decision attached to the same identifier."],
    ["Preserve the order selection", "Save the original chosen list so a favorite can be matched to the correct later product page."],
  ], "Check every vial against the kit inventory before recording the first trial.", "Use HUME's final builder selection as the starting inventory rather than identifying samples from inspiration references alone."),
  g("How to label a mini perfume gift set", "Labelling fragrance formats", "For a mini gift set, create a personal contents record while preserving the supplied presentation and product labels. Individual scents and formats should remain identifiable after the outer packaging is separated.", [
    ["Read actual contents", "Record each name, maker and stated size. Do not assume every miniature contains the same quantity."],
    ["Keep recipient notes personal", "A liked or disliked impression can go in a journal without changing the product's identity."],
    ["Retain useful instructions", "Save care and purchase information where available for later questions or favorite matching."],
  ], "Make a contents list before separating miniatures from the gift packaging.", "Use HUME's published discovery contents for its actual kit and avoid inventing additional gift formats in the labels."),
  g("How to prevent leaks from a 3ml perfume sample", "Container care", "Reduce accidental leakage risk by using a 3ml sample's intended closure, protecting it from knocks and following its container guidance. No handling method can guarantee that a damaged vial will not leak.", [
    ["Check before carrying", "Look for an obvious damaged container or closure issue without forcing parts open."],
    ["Protect the applicator", "Avoid loose storage where objects press the spray head. Use the intended holder or suitable secondary protection."],
    ["Do not improvise repairs", "Persistent leakage needs supplier guidance rather than glue, heat or forced tightening of an unfamiliar mechanism."],
  ], "Inspect the sample and choose a protected position before placing it with other belongings.", "For a HUME delivery leakage concern, keep the order details and use its current published support and return process."),
  g("How to prevent leaks from a 5ml perfume decant", "Container care", "For a decant, leakage prevention depends on the actual vial and closure, not the stated 5ml volume alone. Follow supplier guidance and protect the container without forcing its components.", [
    ["Identify the closure", "A screw cap, crimped sprayer and other designs need different handling. Do not assume every vial should be tightened by twisting."],
    ["Check the supplied condition", "Keep order and container details if a new decant arrives with a discrepancy."],
    ["Pack with separation", "Suitable secondary containment can limit effects on belongings, but it does not repair a faulty seal."],
  ], "Confirm the decant's closure method with the supplier before attempting any adjustment.", "HUME's own sample containers are not automatically equivalent to third-party decant vials or repair procedures."),
  g("How to prevent leaks from a 10ml travel spray", "Container care", "For a travel spray, reduce leak risk by following the device's closure and refill instructions and checking its condition before a trip. Travel branding is not a leak-proof guarantee.", [
    ["Check assembly as directed", "Use the intended cap, cartridge or locking mechanism without guessing how another model works."],
    ["Avoid pressure and overfilling", "Follow any stated fill limit and keep other objects from pressing the spray head."],
    ["Use support for faults", "A persistent leak or damaged part needs maker advice rather than an improvised solvent or adhesive treatment."],
  ], "Review the actual device guide and closure before making it part of the travel bag.", "HUME discovery does not imply a separate leak-proof 10ml travel device; check the actual product format."),
  g("How to prevent leaks from a 30ml perfume bottle", "Container care", "For a 30ml bottle, protect the original closure and prevent accidental nozzle pressure rather than treating compact size as leak protection. Follow maker directions and avoid unnecessary disassembly.", [
    ["Keep the bottle intact", "Do not twist or remove a fixed sprayer in an attempt to tighten an unfamiliar assembly."],
    ["Choose stable storage", "Avoid loose contact with objects that can knock the bottle or press the applicator."],
    ["Respond to a new leak", "Save product and order information and ask the supplier about a persistent problem instead of trying to repair the seal."],
  ], "Check the compact bottle's closure and storage position before carrying it away from home.", "Use HUME's actual container guidance and current support route rather than a universal small-bottle fix."),
  g("How to prevent leaks from a 50ml perfume bottle", "Container care", "To reduce accidental leaks from a 50ml bottle, use its intended closure and protect it during handling. Bottle capacity does not determine whether the sprayer can be removed or tightened.", [
    ["Read the mechanism", "Some tops are fixed assemblies. Do not force a crimped or unfamiliar part as a routine maintenance step."],
    ["Prevent accidental actuation", "Keep other objects from pressing the nozzle and use appropriate protective packaging when carrying."],
    ["Seek product-specific help", "Persistent leakage is a condition question for the maker or supplier. Secondary containment protects belongings but does not cure the fault."],
  ], "Identify the intended closure and remove unnecessary pressure on the applicator in storage or packing.", "Contact HUME with exact order and product details for a leakage concern, using its current published process."),
  g("How to prevent leaks from a 100ml perfume bottle", "Container care", "A larger perfume bottle needs stable handling and closure protection, not extra force on the sprayer. A 100ml label cannot tell you how the container should be serviced.", [
    ["Avoid improvised transfer", "Do not force the bottle open to move liquid into a smaller container without an appropriate method."],
    ["Protect against knocks", "Choose a secure location and suitable packing so the heavier bottle is not loose among hard objects."],
    ["Treat damage separately", "Do not keep carrying a visibly compromised container as though packing alone restores the seal. Ask the supplier for guidance."],
  ], "Choose a protected position for the larger bottle without changing its original closure assembly.", "Check HUME's actual size and container information rather than assuming an available 100ml bottle or a refillable top."),
  g("How to prevent leaks from a refillable perfume atomizer", "Container care", "For a refillable atomizer, correct assembly, compatible filling and the maker's fill limit are the relevant starting checks. Different refill mechanisms cannot be repaired with one universal tightening or cleaning method.", [
    ["Use the specified refill system", "Bottom-fill, cartridge and screw-top designs need their own instructions. Avoid incompatible source bottles."],
    ["Inspect the intended closure", "After an approved refill, check that components are in their intended state without forcing valves or seals."],
    ["Stop guessing at repairs", "A persistent leak should go to the device maker's support process. Do not use glue, heat or unapproved solvents."],
  ], "Read the model's fill and closure guide before adjusting a leaking refillable device.", "HUME samples are not assumed to be serviceable refillable atomizers; confirm the supplied-container design first."),
  g("How to prevent leaks from a perfume oil roller", "Container care", "Reduce leakage risk from an oil roller by using its intended cap and protecting the container, with model-specific guidance for any fault. Oil base does not make every roller closure identical.", [
    ["Keep the mechanism intact", "Do not remove the roller insert or force the neck for routine maintenance unless the maker directs it."],
    ["Avoid improvised thinning", "Adding alcohol, water or another material is not an appropriate way to fix flow or seal issues."],
    ["Protect surrounding items", "Suitable secondary containment can limit contact with belongings while you obtain guidance about a persistent leak."],
  ], "Check the actual roller instructions and cap condition before attempting any change to the insert.", "HUME's discovery format is not assumed to be an oil roller or to share another maker's closure instructions."),
  g("How to prevent leaks from a perfume discovery kit", "Container care", "For a discovery kit, protect every individual sample rather than assuming the outer box makes the entire set leak-proof. Check closures and keep containers separated from accidental pressure.", [
    ["Inspect the actual contents", "Read each format and supplied care information. Mixed containers may not use one mechanism."],
    ["Use organized protection", "Keep samples in an appropriate holder or intended packaging instead of loose in a crowded bag."],
    ["Report delivery issues accurately", "Keep the order selection and available evidence for a new leakage problem. Follow the seller's current reporting process."],
  ], "Check the kit vial by vial before packing or storing it as a group.", "Use HUME's final discovery inventory and current policy when describing any delivery leakage, rather than assuming trial format removes support eligibility."),
  g("How to prevent leaks from a mini perfume gift set", "Container care", "For a mini gift set, reduce risk by checking each container and protecting its closure. Presentation packaging may help organize items but does not certify every included seal.", [
    ["Read individual formats", "A mixed set can contain sprays, dabbers or other items. Do not apply one guessed adjustment to all of them."],
    ["Avoid packaging assumptions", "Keep objects from pressing nozzles and do not rely only on an attractive outer sleeve for protection."],
    ["Use the supplier's process", "For a new damaged or leaking gift, retain product and order information and seek guidance instead of attempting cosmetic repairs."],
  ], "Inspect closures against each product's directions before repacking the mini gift contents.", "Review HUME's actual discovery specification and support terms rather than assuming an unlisted leak-proof gift edition."),
  g("How to organize a 3ml perfume sample", "Organizing fragrance formats", "Organize a 3ml sample by exact identity and its next trial step. A small accessible holder and linked journal record can be more useful than sorting tiny vials only by appearance.", [
    ["Keep a stable identifier", "Match the sample to maker and full name so similar containers do not swap identities."],
    ["Use a simple trial status", "First wear, repeat candidate and finished comparison are useful personal categories without declaring a universal ranking."],
    ["Choose suitable storage", "An organized display still needs protection from light, heat and accidental nozzle pressure."],
  ], "Assign the sample a journal code and one clear next action before adding more trials.", "Use HUME's final builder names as the inventory for discovery sample organization."),
  g("How to organize a 5ml perfume decant", "Organizing fragrance formats", "Organize decants with source and supplier information as well as scent preference. A 5ml vial's visual similarity to another container is not enough to keep its identity reliable.", [
    ["Preserve the source claim", "Record claimed maker and exact version separately from the seller who transferred it."],
    ["Link the order record", "Keep volume, applicator and purchase information available for later questions."],
    ["Sort for useful comparison", "Choose trial status or personal texture categories while keeping identity visible. Do not turn a family label into provenance evidence."],
  ], "Create a decant inventory with source claim, supplier and next trial step for each vial.", "Keep HUME's own fragrance samples distinct from any designer decants in your collection records."),
  g("How to organize a 10ml travel spray", "Organizing fragrance formats", "Organize a travel spray by current contents and the trip or routine it actually serves. Portable bottles should not become a pile of unidentified scents permanently stored in a bag.", [
    ["Record the active fragrance", "Reusable shells need a current-contents record rather than identification by shell colour alone."],
    ["Keep device information", "Save model and capacity for approved refilling, cleaning and route checks."],
    ["Choose a home location", "Return the spray to stable storage after travel and keep its closure protected."],
  ], "Give the spray a named home position and current-contents record before the next trip.", "HUME discovery does not imply a dedicated 10ml travel line; organize the actual supplied format accurately."),
  g("How to organize a 30ml perfume bottle", "Organizing fragrance formats", "Organize a compact perfume bottle around its actual wearing role and clear product identity. A smaller bottle can still become an unused duplicate if organization focuses only on collecting more.", [
    ["Give it a real role", "Daily wear or occasional texture exploration is more useful than an arbitrary prestige tier."],
    ["Keep the version clear", "Similar names or bottle designs should stay linked to exact product records."],
    ["Protect the storage position", "Use a stable shaded location rather than a display spot chosen only for appearance."],
  ], "Write the compact bottle's actual role and whether it adds something distinct to the collection.", "Use HUME's listed names and current variants rather than assuming a 30ml format for every fragrance."),
  g("How to organize a 50ml perfume bottle", "Organizing fragrance formats", "For a frequently used 50ml bottle, organize around access, actual use and a clear journal link. Convenience should not put the bottle in direct sun or beside repeated heat changes.", [
    ["Keep regular choices accessible", "A useful arrangement makes the bottle easy to identify without moving several fragile items."],
    ["Record actual preference", "A favorite label should reflect your wear history rather than another person's ranking."],
    ["Separate backup decisions", "Do not buy a duplicate simply because the shelf has space. Check real consumption and current need."],
  ], "Choose a stable daily-access location and review whether a backup bottle is actually necessary.", "Match HUME discovery favorites to exact bottle identities and let actual use guide later replacement."),
  g("How to organize a 100ml perfume bottle", "Organizing fragrance formats", "Organize a larger bottle in a protected home position with clear identity and realistic use notes. Shelf space and lower unit price are not reasons to turn more volume into more application.", [
    ["Choose stable placement", "Avoid crowded edges and locations where heavy bottles can knock smaller samples."],
    ["Keep use visible", "Record whether the fragrance is a regular favorite or an occasional choice. Volume does not define its role."],
    ["Separate travel planning", "A large home bottle need not be the default carry format. Check route and container requirements independently."],
  ], "Assign the larger bottle a secure home location and an honest wearing role before planning another purchase.", "Review HUME's actual available sizes rather than organizing around an assumed 100ml product range."),
  g("How to organize a refillable perfume atomizer", "Organizing fragrance formats", "Organize refillable atomizers by device model, current fragrance and approved care instructions. The shell and the liquid have separate identities that both matter for future use.", [
    ["Keep device and scent records", "A model name tells you the mechanism; a fragrance name tells you what is inside. Neither replaces the other."],
    ["Track permitted changes", "Record refills or scent changes only when completed under the actual instructions."],
    ["Prevent mixed-part confusion", "Keep compatible components identified and do not swap unknown cartridges or seals between devices."],
  ], "Create one record linking the atomizer model, capacity, current contents and saved guide.", "Do not add HUME sample vials to a refillable-device inventory unless the actual design supports that description."),
  g("How to organize a perfume oil roller", "Organizing fragrance formats", "Organize an oil roller with its exact product information and a protected personal-use location. A broad label such as oil or musk is not enough to distinguish contents or directions.", [
    ["Retain product-specific details", "Keep maker, full name and relevant ingredient or application information accessible."],
    ["Respect direct contact", "Do not arrange rollers as shared informal testers or remove inserts to make storage easier."],
    ["Use appropriate conditions", "Follow care guidance rather than treating an oil base as immune to heat or age."],
  ], "Give the roller an exact identity and personal-use position separate from unidentified scented oils.", "HUME discovery samples should remain organized under their actual listed format, not an assumed oil-roller category."),
  g("How to organize a perfume discovery kit", "Organizing fragrance formats", "Organize a discovery kit with an inventory, separate trial stages and short notes. Useful discovery comes from readable comparisons rather than arranging samples only by popularity or packaging.", [
    ["Start with exact names", "Match every vial to maker and fragrance identity before the first wear."],
    ["Use trial stages", "First comparison, repeat favorite and completed exploration can keep the next step clear."],
    ["Keep purchases optional", "A positive sample does not have to become a full bottle. Record what role, if any, more quantity would serve."],
  ], "Create a kit list with identity, trial status and next decision for every sample.", "Use HUME's final builder selection to organize trials and match only confirmed favorites to later bottle listings."),
  g("How to organize a mini perfume gift set", "Organizing fragrance formats", "Organize a mini gift set by the actual contents and the recipient's own preferences, without pressure to enjoy every fragrance equally. Preserve product information when separating the outer packaging.", [
    ["Make the inventory", "Record each exact name, maker and format before mixed miniatures lose context."],
    ["Choose a simple personal grouping", "Liked, undecided and not for me can guide later trials without turning preference into a quality verdict."],
    ["Keep the storage suitable", "Presentation packaging should still live in stable conditions, with individual closures protected."],
  ], "List the mini gift contents and choose which unfamiliar fragrance deserves the next ordinary trial.", "Use HUME's actual discovery specification if it is the gift received; no separate miniature gift range is assumed."),
  g("How to pack a 3ml perfume sample safely", "Packing fragrance formats", "Pack a 3ml sample with a known identity, protected closure and suitable secondary containment. Small size can make packing easier, but it does not guarantee against breakage, leaks or route restrictions.", [
    ["Inspect the container", "Do not pack a visibly damaged vial as though extra wrapping repairs it. Ask the supplier about a concern."],
    ["Avoid applicator pressure", "Keep hard objects from pressing the nozzle and preserve the intended cap or closure."],
    ["Check the journey", "Review current carrier and airport requirements when flying; the full container inventory matters."],
  ], "Identify the sample and choose a protected packing position before checking the route's current requirements.", "Use HUME's listed sample capacity in the travel inventory, without treating the discovery format as airport certification."),
  g("How to pack a 5ml perfume decant safely", "Packing fragrance formats", "For a 5ml decant, preserve source identity and protect the actual vial and closure. A decanted format needs its own supplier information rather than assumed original-bottle handling rules.", [
    ["Keep the label readable", "Save maker claim, exact version and supplier separately if the vial's label is small."],
    ["Use appropriate separation", "Protect from knocks and accidental actuation; secondary containment can limit effects on belongings without fixing a seal."],
    ["Review official route guidance", "Check actual capacity and current baggage requirements before departure."],
  ], "Pack the decant only after its identity, closure and container capacity are clear.", "HUME discovery is its own perfume sample offer, not a supplied 5ml designer-decant line."),
  g("How to pack a 10ml travel spray safely", "Packing fragrance formats", "A travel spray should be packed according to its actual device guide with the applicator protected. The word travel is not a promise of leak resistance or universal baggage acceptance.", [
    ["Prepare the device first", "Check the intended assembly and closure at home rather than forcing unfamiliar components while travelling."],
    ["Keep current contents known", "Label the fragrance and avoid last-minute mixing or unapproved refilling."],
    ["Choose a suitable location", "Protect from knocks and prolonged heat, and review current route requirements separately."],
  ], "Check model guidance, closure and current contents before placing the spray in the bag.", "Review HUME's actual sample or bottle format rather than assuming a separate 10ml travel-device range."),
  g("How to pack a 30ml perfume bottle safely", "Packing fragrance formats", "Pack a compact bottle so its original closure remains protected from pressure and impact. Decide whether the whole bottle is useful for the trip before carrying more fragrance than needed.", [
    ["Keep the container intact", "Do not force a fixed sprayer off for an improvised transfer. Use only an appropriate refill or transfer method."],
    ["Protect surrounding belongings", "Suitable secondary containment and separation can limit consequences of an unexpected leak without guaranteeing prevention."],
    ["Check actual route rules", "Use stated capacity and official current guidance rather than judging eligibility from remaining liquid."],
  ], "Choose a protected bottle position and confirm that taking the whole compact bottle serves the itinerary.", "Check HUME's current available variants and supplied care information instead of assuming every scent has a 30ml option."),
  g("How to pack a 50ml perfume bottle safely", "Packing fragrance formats", "For a 50ml bottle, protect the nozzle and container while keeping actual capacity information accessible. Familiar daily use does not make a home bottle automatically suitable for every travel plan.", [
    ["Check closure and condition", "Use the intended cap and do not pack an obviously compromised container without supplier guidance."],
    ["Avoid pressure and knocks", "Keep the bottle separated from hard objects that could press the sprayer or damage it."],
    ["Review the whole itinerary", "Airline and departure or transfer airport guidance can all matter. Check current requirements before packing."],
  ], "Inspect the bottle and record its stated capacity before choosing the final travel arrangement.", "Use HUME's selected bottle information for the actual variant, without treating bottle size alone as transport approval."),
  g("How to pack a 100ml perfume bottle safely", "Packing fragrance formats", "A 100ml perfume bottle needs protected packing and full-route checks, not an assumption that a commonly stated container threshold guarantees acceptance. Consider whether a larger bottle is necessary for the trip.", [
    ["Use actual container capacity", "A larger bottle with less remaining perfume does not become a smaller-capacity container."],
    ["Protect the original assembly", "Avoid forcing parts or making an improvised transfer solely to fit the bag."],
    ["Check all applicable guidance", "Review airline and airport rules, required liquid presentation and other restrictions for the itinerary."],
  ], "Verify the bottle's actual capacity and official route requirements before deciding to carry the larger quantity.", "HUME's currently listed formats should be checked directly; no 100ml range or airport acceptance is promised here."),
  g("How to pack a refillable perfume atomizer safely", "Packing fragrance formats", "Pack a refillable atomizer only after the approved refill procedure is complete and its closure and contents are clear. A refillable device is not automatically leak-proof or exempt from travel checks.", [
    ["Use model-specific preparation", "Bottom-fill, cartridge and screw-top designs require different handling. Do not improvise based on another device."],
    ["Protect the working parts", "Keep objects from pressing spray heads or refill valves and avoid mixing unidentified leftover fragrance."],
    ["Check current requirements", "Use the actual container capacity when reviewing official guidance for the route."],
  ], "Confirm model, capacity, current scent and intended closed state before packing the atomizer.", "Do not assume HUME's sample containers are refillable travel devices; use the actual supplied-container instructions."),
  g("How to pack a perfume oil roller safely", "Packing fragrance formats", "For an oil roller, secure the intended cap, protect the container and include it in relevant liquid checks. Oil-based or alcohol-free wording does not automatically exempt a product from baggage requirements.", [
    ["Read product and closure guidance", "Do not remove or force the roller insert to prepare it for travel unless the maker directs that action."],
    ["Protect nearby items", "Use suitable secondary containment and avoid contact with objects that can damage the closure."],
    ["Check the actual route", "Review current official guidance for the specific product and capacity rather than relying on roller format alone."],
  ], "Add the roller's actual capacity to the travel inventory and check its intended closure before packing.", "HUME discovery is not assumed to include oil rollers; review actual listings before planning a specific format."),
  g("How to pack a perfume discovery kit safely", "Packing fragrance formats", "Pack a discovery kit at container level: keep identities readable, protect each closure and decide whether every sample needs to travel. Combined kit volume alone is not the whole packing or baggage question.", [
    ["Choose useful contents", "A few familiar favorites may serve the itinerary better than the full unfamiliar set."],
    ["Protect the individual samples", "Use intended holders where helpful and avoid loose packing that presses nozzles or knocks vials together."],
    ["Inventory the complete liquids", "Check current carrier and airport guidance for all actual containers, not only the outer box."],
  ], "Make a named container inventory before deciding which discovery samples belong in the travel bag.", "Use HUME's final builder list and shared sample specification for the inventory without implying travel certification for the kit."),
  g("How to pack a mini perfume gift set safely", "Packing fragrance formats", "For a mini perfume gift set, protect the actual containers and retain their identities while checking the journey's current requirements. Gift presentation does not replace closure protection or container-level packing checks.", [
    ["Read the actual inventory", "Record each included format and stated capacity rather than treating the outer box as one perfume container."],
    ["Plan presentation realistically", "A gift may need to be presented differently for security checks. Do not rely on keeping a package permanently untouched."],
    ["Protect during the journey", "Avoid pressure on applicators, hard-object contact and prolonged heat. Follow the actual maker guidance."],
  ], "Create an individual-container packing list before arranging the gift presentation for travel.", "Review HUME's actual discovery contents and current route guidance rather than assuming a special travel-approved mini gift edition."),
];

const byTitle = (title: string) => BEGINNER_GUIDES_BATCH_NINETEEN.find(guide => guide.title === title)!;
byTitle("How long will a 3ml perfume sample last").chart = {
  headers: ["Meaning of last", "What affects it", "What volume alone cannot tell you"],
  rows: [
    ["Quantity in use", "Applicator output, amount and frequency", "Exact number of sprays or days"],
    ["Scent after application", "Exact fragrance, context and perception", "Guaranteed hours or projection"],
    ["Condition in storage", "Maker guidance and storage history", "One universal expiry date"],
  ],
};
byTitle("How to organize a perfume discovery kit").chart = {
  headers: ["Inventory field", "Personal record"],
  rows: [
    ["Identity", "Maker, exact name and version"],
    ["Format", "Stated size and applicator"],
    ["Trial stage", "First wear, repeat candidate or completed comparison"],
    ["Next step", "Question remaining; optional later purchase"],
  ],
};
const travelSources = [
  { title: "Air India: current restricted baggage guidance", url: "https://www.airindia.com/in/en/travel-information/baggage-guidelines/restricted-baggage.html" },
  { title: "IATA: passenger baggage guidance; confirm the actual route", url: "https://www.iata.org/en/youandiata/travelers/baggage/" },
];
for (const guide of BEGINNER_GUIDES_BATCH_NINETEEN.filter(guide => guide.group === "Packing fragrance formats")) guide.sources = travelSources;
