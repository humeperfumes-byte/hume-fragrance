import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string, nextStep: BeginnerGuide["nextStep"] = "samples", productIds: string[] = []): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep, productIds };
}

export const BEGINNER_GUIDES_BATCH_SEVEN: BeginnerGuide[] = [
  g("Why do woody perfumes fade quickly", "Understanding fading",
    "A woody perfume can seem to fade when its surrounding presence becomes quieter or your perception changes. The woody label does not guarantee a particular duration, so describe what remains before concluding that the entire scent has gone.", [
      ["Identify the wood impression", "Dry, smooth and smoky textures are different references. Write which quality became less noticeable rather than treating every wood-containing composition as the same formula."],
      ["Check close range separately", "A later woody trace is different from projection around you. Record both outcomes so a quieter phase is not automatically scored as complete disappearance."],
      ["Repeat a clear trial", "Keep the exact product and application recorded and avoid adding another new fragrance. Similar ordinary conditions make your next observation more useful."],
    ], "Record wood texture, surrounding presence and later close-range scent as three separate observations.", "Compare HUME's woody note structures below through individual samples instead of assuming the family name guarantees longevity.", "samples", ["tom-ford-oud-wood", "bleu-de-chanel"]),
  g("Why do sweet perfumes fade quickly", "Understanding fading",
    "A sweet opening can feel prominent without establishing lasting projection. If a sweet perfume seems to fade, distinguish the loss of its initial sweetness from a quieter later scent or reduced awareness of the fragrance.", [
      ["Name the sweet character", "Vanilla-like warmth and sugary fruit are different impressions. Record the particular quality you miss later rather than assigning one behavior to all sweet perfumes."],
      ["Track enjoyment and presence", "You may still enjoy a warmer trace even when the opening changes. Conversely, a remaining sweet impression is not useful if you no longer like it."],
      ["Avoid automatic extra application", "Follow product directions and consider the setting before adding more. A repeat wear provides clearer evidence than several immediate top-ups."],
    ], "Write what became quieter and whether another enjoyable impression remains after the opening.", "Use HUME's vanilla-containing compositions as different comparison candidates, without treating sweetness as a fixed performance rating.", "samples", ["myself", "eros-flame"]),
  g("Why do floral perfumes fade quickly", "Understanding fading",
    "A floral perfume may seem shorter-lived when the flower-like impression becomes less distinct. Supporting notes can remain, and different floral compositions do not share one duration simply because they list rose or jasmine.", [
      ["Follow the whole structure", "Read the supporting woods, musks or warm notes. The perfume can develop away from an obvious floral opening without becoming entirely absent."],
      ["Describe the flower impression", "Fresh petals, richer flowers and softer powdery textures are different references. Write which one changed so another trial can answer the same question."],
      ["Keep observations separate", "Record your own later impression apart from any willing observer's description of presence. Those reports are useful context rather than identical measurements."],
    ], "Note the changing floral character and the remaining overall scent during a repeat appropriate wear.", "Compare HUME's floral-containing options below as complete structures rather than expecting one shared flower note to determine duration.", "samples", ["myself", "homme-intense"]),
  g("Why do oud perfumes fade quickly", "Understanding fading",
    "An oud listing does not guarantee powerful or all-day wear. A quieter later experience can involve the complete composition, application and perception rather than prove that the product lacks oud or is defective.", [
      ["Separate note and material claims", "A listed oud impression does not disclose natural agarwood quantity. Duration alone cannot verify ingredient sourcing or authenticity."],
      ["Compare the later wood character", "Record whether a woody, smoky or warmer trace remains up close. That is different from a strong surrounding presence throughout the day."],
      ["Check the exact candidate", "A wood-and-spice structure may feel different from rose and incense. Save the name and version instead of treating all oud-style products as interchangeable."],
    ], "Describe the remaining character before using an oud reputation or expected strength as the verdict.", "Try HUME's contrasting oud-listed compositions below without inferring natural content or guaranteed hours.", "samples", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("Why do budget perfumes fade quickly", "Understanding fading",
    "Budget perfumes do not all fade quickly, because price is not a formula category. If a particular candidate disappoints, evaluate its exact identity, application and later character before attributing the result to cost alone.", [
      ["Check the product facts", "Compare maker, version, size and applicator. A small sample, inspired perfume and designer original are different offers even when familiar references appear in their descriptions."],
      ["Describe the observed change", "A fading opening and reduced surrounding presence are different from no close-range scent. Write the outcome rather than recording only a price-based judgment."],
      ["Assess personal value", "Include how often you want to wear the scent and the delivered cost. A more expensive product is not automatically the solution to every performance preference."],
    ], "Complete a wear record before adding price as an explanation for the result.", "Use HUME's live prices and discovery comparisons to assess value without assuming its price point predicts how a fragrance wears.", "samples"),
  g("Why do perfume samples fade quickly", "Understanding fading",
    "Samples do not have a special weak-fragrance category simply because they are small. Check the exact product and application: a tester atomizer can deliver a different amount from a full bottle, and related names may describe different fragrances.", [
      ["Match the identity", "Save maker, fragrance and version. A third-party decant and an inspired interpretation should not be assumed identical to an official sample of a designer product."],
      ["Record the applicator", "Equal spray counts from two containers do not prove equal quantities. Describe what you used rather than claiming a controlled equal-dose test."],
      ["Retest the favorite", "Give the candidate a separate second wear without mixing new samples. Check what remains later and whether you still enjoy it before deciding on a bottle."],
    ], "Keep the exact sample name and application details beside each later-wear observation.", "Retain HUME's discovery selection list so a tester and its full-size listing remain correctly matched.", "samples"),
  g("Why do oil perfumes fade quickly", "Understanding fading",
    "An oil carrier does not guarantee long wear or explain every fading impression. Evaluate the finished perfume, application and perception rather than assuming an oil product must outperform every alcohol-based fragrance.", [
      ["Identify the finished cosmetic", "Read intended use and directions. A raw fragrance material or home-scent oil is different from a personal perfume oil and should not be substituted in a wearing trial."],
      ["Separate quietness and absence", "A closer-range experience is not the same as complete disappearance. Record the later scent and any contextual noticeability observation separately."],
      ["Avoid carrier-only conclusions", "A roller or dabber can deliver different amounts from a spray. Compare complete experiences without inventing a drop-to-spray conversion."],
    ], "Record the oil's exact applicator and later close-range impression before attributing fading to the carrier.", "If useful, compare HUME spray samples as separate candidates rather than implied oil equivalents with a shared performance promise.", "shop"),
  g("Why do light perfumes fade quickly", "Understanding fading",
    "Light can mean airy texture, quiet presence or a lighter-positioned format, so a fading claim needs clarification. A delicate-smelling perfume may remain detectable even after its surrounding presence becomes quieter.", [
      ["Define light in the listing", "Read whether the word describes scent character or a specific product interpretation. It does not independently establish concentration or a required duration."],
      ["Record the actual endpoint", "Decide whether you mean loss of freshness, reduced projection or no close-range trace. Use the same observation during a repeat trial."],
      ["Choose for the intended use", "A quiet later phase can suit a close shared setting. The goal is a comfortable experience you enjoy rather than maximum noticeability in every situation."],
    ], "Write what light means to you and what exactly seems to fade before selecting another candidate.", "Use HUME's soft sillage preference as a shortlisting aid, then evaluate the actual fragrance rather than expecting a light-label duration.", "quiz"),
  g("How to test fresh perfumes through the day", "Day-long trials",
    "Test a fresh perfume through the day by recording its type of freshness, later character and presence at points that fit your routine. Keep the exact product and application clear so the record describes one identifiable fragrance.", [
      ["Name the fresh direction", "Marine, citrus and green impressions are different starting references. Write what you actually notice rather than using fresh as the entire description."],
      ["Use ordinary observation points", "Choose moments such as after commuting or later at home. They form your test plan, not a promise about how long the product should remain bright."],
      ["Review the complete experience", "Note what replaces or supports the opening and whether you want to wear it again. Separate surrounding presence from close-range scent."],
    ], "Use columns for observation point, fresh character, later notes, presence and enjoyment.", "Compare HUME's available marine and citrus-containing candidates on separate days using the same simple log.", "samples", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("How to test citrus perfumes through the day", "Day-long trials",
    "For a day-long citrus trial, track the bright opening separately from the perfume's full later character. This helps you decide whether you enjoy the complete scent rather than measuring only how long a citrus impression remains obvious.", [
      ["Describe the opening specifically", "Write whether the first impression feels peel-like, softer or otherwise citrus-bright. Do not assume the listed top note will match every detail of your perception."],
      ["Return to supporting notes", "Check for flowers, woods or warmer effects later. A quieter citrus opening can coexist with another noticeable and enjoyable part of the composition."],
      ["Repeat the useful setting", "Use similar appropriate occasions and record the actual applicator. Avoid adding a second unfamiliar perfume while following the development."],
    ], "Keep separate entries for citrus brightness and the remaining complete scent at each observation.", "Use HUME's citrus-containing note structures to compare different developments rather than expecting identical citrus persistence.", "samples", ["sauvage-noir", "lv-imagination"]),
  g("How to test woody perfumes through the day", "Day-long trials",
    "Test woody perfumes by following texture, later presence and enjoyment rather than assuming all woods behave alike. A smooth or dry close-range character is a different observation from a noticeable scent around the wearer.", [
      ["Choose texture words", "Start with smooth, dry, smoky or another impression you notice. A list of wood notes is not a measurement of their quantities."],
      ["Keep the trial identifiable", "Use one candidate at a time and save the exact name and application method. Avoid turning equal spray counts from different atomizers into an equal-dose claim."],
      ["Assess the later balance", "Record whether the wood character remains enjoyable and suits your occasion. A long trace is not automatically preferable to a quieter experience."],
    ], "Record wood texture and later comfort during an ordinary repeat wear before comparing another woody candidate.", "Try HUME's current woody structures below as different complete fragrances, checking live availability before selecting samples.", "samples", ["tom-ford-oud-wood", "bleu-de-chanel"]),
  g("How to test sweet perfumes through the day", "Day-long trials",
    "Test sweet perfumes by recording sweetness balance and enjoyment at the opening and later. A vivid first impression does not establish how noticeable the scent will remain or whether you will enjoy its later warmth.", [
      ["Specify the sweet reference", "Vanilla-like warmth and sugary fruit can feel different. Name the quality you enjoy or want less of instead of giving every sweet scent the same brief."],
      ["Observe comfort in context", "Choose a normal appropriate setting and note whether the later sweetness feels comfortable. Do not layer unfamiliar scents while trying to judge one composition."],
      ["Compare willingness to repeat", "Ask whether you want to choose it again for the same occasion. That preference is separate from detecting a faint remaining trace."],
    ], "Record sweetness, contextual presence and wish to wear again as separate observations.", "Compare HUME's vanilla-containing compositions through separate samples instead of treating sweetness as a guaranteed performance class.", "samples", ["myself", "eros-flame"]),
  g("How to test floral perfumes through the day", "Day-long trials",
    "A day-long floral test should follow the flower-like impression and the complete supporting structure. A rose or jasmine listing does not mean that one flower must remain isolated and obvious for the entire wear.", [
      ["Describe the floral style", "Write fresh petals, richer floral character or a softer texture if those fit your impression. Your own words are more useful than forcing every listed flower into the record."],
      ["Notice what develops", "Woods, musks or warmth may become more noticeable later. Record the full scent instead of declaring it gone when the opening floral balance changes."],
      ["Compare enjoyment and use", "Choose an appropriate normal occasion and check whether you enjoy the later character there. A repeated favorite matters more than identifying every note correctly."],
    ], "Record the floral character and the later overall impression in separate parts of the same wear log.", "Use HUME's current floral-containing candidates below for contrast, then revisit your favorite on another day.", "samples", ["myself", "homme-intense"]),
  g("How to test oud perfumes through the day", "Day-long trials",
    "Test oud-listed perfumes as complete compositions rather than assuming the note guarantees all-day power. Record wood texture, supporting impressions and appropriate presence through your actual routine.", [
      ["Identify the oud context", "A wood-and-spice structure differs from rose and incense. Save the exact product and read its full notes instead of using oud as a universal formula description."],
      ["Separate projection and trace", "A quieter later woody impression may remain perceptible up close. Record that independently from noticeability around you."],
      ["Keep claims proportionate", "A personal wear test cannot establish natural agarwood quantity or a universal hour result. Use it to decide enjoyment and suitability for your own occasion."],
    ], "Track wood character, surrounding presence and later enjoyment without combining them into one power score.", "Compare HUME's available oud-listed structures below through separate trials rather than a natural-content or fixed-duration assumption.", "samples", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("How to test budget perfumes through the day", "Day-long trials",
    "Test budget perfumes using the same clear wear record you would use for any candidate. Price is not a formula category, so assess the exact product before deciding whether its experience offers value to you.", [
      ["Record identity before price", "Write maker, version, format and applicator. A sample and a full bottle are different offers, and familiar inspiration names do not make products identical."],
      ["Use normal observation points", "Choose moments relevant to your day and record later character and presence separately. Do not give a cheaper product a different performance definition."],
      ["Assess value afterward", "Include total delivered cost and how often you want to wear it. A longer detectable trace does not automatically make a more useful purchase."],
    ], "Complete scent and comfort notes before bringing price back into the final comparison.", "Use HUME's live prices and discovery options to compare personal value after a consistent wearing trial.", "samples"),
  g("How to test perfume samples through the day", "Day-long trials",
    "Test samples one at a time, keeping exact names and application details with your observations. A small tester can teach you about the fragrance, but its atomizer should not be assumed to deliver the same amount as every full bottle.", [
      ["Save the selection list", "Match maker and version to each tester before beginning. Similar-looking vials can otherwise leave you unsure which fragrance you enjoyed."],
      ["Use an uncomplicated trial", "Follow directions and avoid another unfamiliar fragrance. Record the opening, later character and presence at observation points chosen for your routine."],
      ["Return to favorites", "Retest the strongest candidates before choosing a bottle. Keep the product link with the notes so the later purchase matches the actual sample."],
    ], "Create one wear-log entry per sample with its exact name and a link to the matching product.", "Retain HUME's discovery selection details and use its current product pages when a sample becomes a full-bottle candidate.", "samples"),
  g("How to test oil perfumes through the day", "Day-long trials",
    "Test a finished perfume oil by recording its own directions, applicator and later scent. An oil carrier does not guarantee duration, and a contact application is not automatically equivalent to a spray dose.", [
      ["Check intended personal use", "A raw fragrance material or home-scent oil is different from a cosmetic perfume oil. Use only the intended finished product according to its label."],
      ["Separate mechanism and smell", "Record roller, dabber or another presentation, then describe the actual scent. Applicator convenience and fragrance preference are different observations."],
      ["Follow the later experience", "Record close-range scent, contextual presence and enjoyment without assuming that quietness means complete absence. Keep another format comparison separate."],
    ], "Save carrier information and the actual application method beside each later-wear observation.", "If comparing with HUME spray samples, evaluate each as its own product rather than an equal-drop-to-spray experiment.", "shop"),
  g("How to test light perfumes through the day", "Day-long trials",
    "For a light perfume, define whether light means airy scent, quiet presence or a lighter-positioned format. A useful day-long trial follows those separate qualities rather than assuming they all disappear at the same time.", [
      ["Set a precise brief", "Write the scent texture and noticeability you want. A delicate impression can still be perceptible around you, and a warm scent can be worn quietly."],
      ["Observe an appropriate routine", "Use label-directed application where fragrance is welcome and record the exact product. Avoid repeated top-ups while trying to understand the first application."],
      ["Judge the later comfort", "A quieter phase may meet your goal. Record whether you still enjoy it and want to choose it again instead of rating only maximum noticeability."],
    ], "Use separate columns for airy character, surrounding presence and later enjoyment.", "Start with HUME's soft sillage quiz preference if useful, then sample candidates to test your own definition of light.", "quiz"),
  g("Do fresh perfumes last longer on clothes", "Fabric comparisons",
    "There is no blanket rule that fresh perfume lasts longer on clothes. A retained garment trace and freshness around the wearer are different outcomes, and any comparison must respect both fragrance directions and garment-care instructions.", [
      ["Check permitted use first", "A personal fragrance is not automatically compatible with every fabric or accessory. Do not apply it to clothing when either product or garment guidance rules that out."],
      ["Define the fresh outcome", "Citrus brightness, marine character and overall remaining scent are separate observations. A later trace does not necessarily preserve the opening you liked."],
      ["Choose appropriate use", "Longevity is not a reason to ignore material care. Evaluate the fragrance through permitted application rather than using clothing as a universal performance fix."],
    ], "Read the fragrance and garment guidance before deciding whether a material comparison is appropriate at all.", "Follow HUME's exact product directions; the discovery set does not establish fabric compatibility for its fresh-note fragrances.", "shop"),
  g("Do citrus perfumes last longer on clothes", "Fabric comparisons",
    "A citrus perfume's opening and its full scent can develop differently on different permitted application surfaces. No universal clothes-versus-skin claim follows from the citrus label, and a garment trace is not proof of lasting citrus brightness.", [
      ["Review material care", "Read both the perfume's intended use and the garment instructions. A small tester or clear-looking liquid does not establish that direct fabric application is appropriate."],
      ["Track the right quality", "Decide whether you mean citrus opening, later supporting scent or surrounding presence. Those endpoints can lead to different impressions of lasting."],
      ["Avoid a shortcut", "If you mainly enjoy the opening, another composition may fit better. Do not treat clothing application as a guaranteed way to preserve one bright note indefinitely."],
    ], "Define citrus brightness separately from a general remaining trace before considering a permitted comparison.", "Use HUME's citrus-containing samples to compare complete developments through their intended application methods.", "samples"),
  g("Do woody perfumes last longer on clothes", "Fabric comparisons",
    "A woody note does not establish that clothing will provide longer or better wear. A persistent wood-like trace on a permitted material is a different experience from the fragrance you perceive during normal personal use.", [
      ["Check both sets of directions", "Fragrance and garment-care information should guide any application. A wood-led composition is not automatically suitable for delicate materials."],
      ["Distinguish texture from duration", "Smooth, dry or smoky impressions can change as the composition develops. Record what remains rather than assuming a woody base means every surface performs alike."],
      ["Choose enjoyment and care", "The longest retained trace may not be the scent balance you prefer. Respect material restrictions before thinking about any performance advantage."],
    ], "Identify the woody quality you want to compare and confirm that both products permit the proposed use.", "HUME's woody examples should be used according to their actual product directions rather than a blanket clothing recommendation.", "shop"),
  g("Do sweet perfumes last longer on clothes", "Fabric comparisons",
    "Sweetness does not predict a universal clothing-wear advantage. A lingering sweet trace, the opening impression and noticeability around the wearer are different observations, and garment compatibility must be checked separately.", [
      ["Read intended use", "A perfume designed for personal fragrance is not automatically suitable for every fabric. Follow the garment guidance as well as the maker's directions."],
      ["Describe the sweetness", "Vanilla-like warmth and sugary fruit can leave different impressions within their compositions. The family label does not reveal formula quantities or material compatibility."],
      ["Keep preference central", "A longer sweet trace is not necessarily desirable if you dislike its later balance. Choose a scent you enjoy in appropriate use instead of chasing persistence alone."],
    ], "Write which sweet impression you want to observe and check permitted application before comparing surfaces.", "Explore HUME's sweet or vanilla-containing note structures through intended use without assuming fabric suitability.", "samples"),
  g("Do floral perfumes last longer on clothes", "Fabric comparisons",
    "A floral perfume does not have a guaranteed longer duration on clothes. Flower-like character and later retained scent may differ, and compatibility depends on the actual fragrance and garment rather than the floral label.", [
      ["Avoid a delicate-scent assumption", "A soft floral description does not establish that a liquid can be applied to delicate clothing. Read both product and material-care guidance."],
      ["Compare the full character", "Supporting woods or musks may be part of what remains later. The continued presence of a trace does not mean the original floral balance is unchanged."],
      ["Respect the intended application", "If the proposed surface is not permitted, use the fragrance normally rather than conducting an improvised fabric trial. Performance goals do not override care instructions."],
    ], "Separate the flower-like impression you want from a general later trace before assessing any permitted fabric use.", "Use HUME's current floral-containing fragrances according to their own directions, not as a general garment-fragrancing range.", "shop"),
  g("Do oud perfumes last longer on clothes", "Fabric comparisons",
    "An oud listing does not guarantee superior clothing longevity or fabric compatibility. A retained woody or warm trace is not a measure of natural oud content and may differ from the scent experience you want during wear.", [
      ["Check the actual product", "Oud can describe different compositions and intended effects. A note name does not disclose the material quantity, source or permitted application surfaces."],
      ["Protect material care", "Read garment guidance and the perfume directions before considering direct application. A dark or powerful scent reputation is not an exception to those instructions."],
      ["Choose the relevant outcome", "Close material traces, surrounding presence and a moving trail are different observations. Do not combine them into an unsupported oud-performance score."],
    ], "Record exact product identity and permitted use before interpreting a retained woody trace as an advantage.", "HUME's oud-listed samples are fragrance exploration options, not certified garment perfumes or natural-content tests.", "samples"),
  g("Do budget perfumes last longer on clothes", "Fabric comparisons",
    "Price does not establish whether a perfume lasts longer on clothes or is appropriate for a garment. Check the exact product and material directions before using fabric application as a way to improve a lower-cost fragrance.", [
      ["Keep care independent of cost", "A cheap perfume and an expensive one both need to be used as directed. Neither price nor a clear liquid establishes compatibility with a fabric."],
      ["Compare meaningful observations", "A faint retained trace and useful presence during an occasion are different results. Choose the outcome you actually want rather than a vague longer-is-better score."],
      ["Consider personal value", "Include enjoyment, permitted use and final purchase cost. Risking a garment to chase an assumed performance fix does not improve the value of the purchase."],
    ], "Review the product and garment requirements before bringing the perfume's price into the comparison.", "Use HUME's samples and live prices to assess scent value through intended application rather than assuming a fabric workaround.", "samples"),
  g("Do perfume samples last longer on clothes", "Fabric comparisons",
    "A sample container does not create a special clothing-longevity advantage. The exact fragrance, dispenser and permitted use matter, and a tester should not be treated as a fabric-safe product just because it contains a small amount.", [
      ["Match the identity", "Save maker, fragrance and version. A third-party decant, official sample and inspired interpretation are different offers and should not be assumed interchangeable."],
      ["Read application restrictions", "Check the perfume directions and the garment's care guidance. A small spray mechanism does not establish compatibility with clothing or accessories."],
      ["Keep the comparison honest", "Atomizers can apply different amounts, and a retained trace is not the same as projection. Use the sample mainly to learn whether you enjoy the actual fragrance."],
    ], "Keep the exact tester name and intended-use guidance with the sample before any application comparison.", "HUME's discovery testers are small personal-fragrance samples; their format does not certify use on every material.", "shop"),
  g("Do oil perfumes last longer on clothes", "Fabric comparisons",
    "An oil carrier does not establish clothing compatibility or a universal longevity benefit. Only consider a material use when both the finished product's directions and the garment guidance permit it; personal perfume oil is not automatically a fabric product.", [
      ["Identify the intended cosmetic", "A finished skin perfume, raw fragrance oil and home-scent product are different. Do not substitute between them to create an improvised clothing fragrance."],
      ["Separate residue and scent", "The presence of product on material is not itself a measure of enjoyable fragrance performance. Follow care instructions instead of treating persistence as the only objective."],
      ["Choose the appropriate format", "If the use you want is not permitted, select a product designed for that purpose rather than transferring an oil routine to a garment."],
    ], "Check the oil's actual intended use and garment guidance before considering any direct material application.", "HUME's spray catalogue does not establish an oil format or certify a clothing application for an unlisted oil product.", "shop"),
  g("Do light perfumes last longer on clothes", "Fabric comparisons",
    "Light is a scent or marketing description, not a fabric-suitability or duration rating. A quieter perfume may leave a different later trace in permitted material use, but no universal clothing advantage follows from the adjective.", [
      ["Define light first", "An airy character, low projection and a lighter-positioned version are different ideas. Know which one you are comparing before interpreting a later trace."],
      ["Check application and care", "Read both the perfume directions and garment guidance. A delicate-smelling product is not automatically appropriate for delicate fabrics."],
      ["Choose suitable presence", "A close-range fragrance may already meet your intended need. Fabric application is not a required step to turn every quiet perfume into a stronger one."],
    ], "Write what light means on the actual listing and confirm permitted use before comparing any surfaces.", "Use HUME's soft-presence shortlist for scent exploration, without treating light descriptions as a garment-care guarantee.", "quiz"),
  g("How to make fresh perfumes last longer", "Wear routines",
    "For a fresh perfume, first distinguish lasting brightness from lasting overall scent. Use appropriate storage and the exact application directions, then compare compositions whose later character you enjoy rather than trying to preserve the opening through unlimited top-ups.", [
      ["Choose the kind of freshness", "Marine, citrus and green directions can have different supporting structures. The fresh label does not state a fixed duration or tell you what remains later."],
      ["Check the routine", "Keep the bottle closed and appropriately stored and record a label-directed wear. Do not change several application habits at once while trying to understand the result."],
      ["Select for later enjoyment", "If you mainly enjoy a brief opening, another candidate may fit better. A different supporting structure can be worth comparing without promising that every fresh perfume will behave alike."],
    ], "Write the fresh quality you want to retain and the later character you would still enjoy wearing.", "Compare HUME's current fresh-note structures below to find a development you like rather than a universal freshness-extension trick.", "samples", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("How to make citrus perfumes last longer", "Wear routines",
    "A citrus opening and a perfume's complete wear are different targets. Follow the product's application and storage directions, then compare its later structure instead of assuming more application can preserve one bright top impression indefinitely.", [
      ["Track the citrus separately", "Record the peel-like or bright quality you enjoy and what replaces it. This shows whether you need another composition or simply a clearer expectation of development."],
      ["Keep handling appropriate", "Avoid improvised heating, dilution or airing to alter the fragrance. Store the bottle as directed and use only permitted application areas."],
      ["Compare the later balance", "A citrus-containing perfume with different supporting notes may suit your routine better. Judge the whole experience instead of only the initial brightness."],
    ], "Record citrus brightness and later enjoyment during a repeat trial before changing your application habit.", "Use HUME's citrus-containing samples to compare supporting structures, without assuming a guaranteed way to extend every opening.", "samples", ["sauvage-noir", "lv-imagination"]),
  g("How to make woody perfumes last longer", "Wear routines",
    "For woody perfumes, start with correct handling and a clear wear record rather than assuming extra wood notes or home aging will increase duration. Distinguish a quieter later trace from loss of the entire scent.", [
      ["Check the actual product", "Read the exact version and directions. A woody family label does not disclose concentration or material quantities, and similar names can refer to different compositions."],
      ["Protect the normal routine", "Keep the bottle closed and stored away from unsuitable heat and light. Avoid deliberately opening or heating it in pursuit of a stronger result."],
      ["Compare the right outcome", "Track wood texture, close-range presence and enjoyment separately. If the later phase does not meet your preference, another candidate may be more useful than more of the same."],
    ], "Use a repeat wear log before deciding that the woody fragrance needs an application change or replacement.", "Compare HUME's current woody candidates through samples rather than treating a wood listing as a duration guarantee.", "samples", ["tom-ford-oud-wood", "bleu-de-chanel"]),
  g("How to make sweet perfumes last longer", "Wear routines",
    "A sweet perfume should be evaluated for comfortable later wear, not just maximum persistence. Follow its directions and distinguish an enjoyable remaining sweetness from a strong opening that encourages unnecessary extra application.", [
      ["Define the sweet experience", "Vanilla-like warmth and sugary fruit can develop differently. Record which quality you want and whether you enjoy the later balance."],
      ["Use restrained appropriate application", "Keep the product within its intended use and consider shared-space rules. A vivid initial impression does not require repeated refreshing to remain a successful wear."],
      ["Choose preference over trace", "A longer sweet trace is not automatically better. Compare another structure if you want a different balance rather than altering the formula or layering unfamiliar products at once."],
    ], "Record whether later sweetness remains enjoyable before making duration your main purchase criterion.", "Use HUME's vanilla-containing comparisons below to select a balance you like, not an unsupported sweetness-performance ranking.", "samples", ["myself", "eros-flame"]),
  g("How to make floral perfumes last longer", "Wear routines",
    "For floral perfumes, judge the complete later character and follow product-specific application and storage. The flower-like opening may change while other notes remain, so first decide which part of the experience you want to extend.", [
      ["Read the supporting structure", "Woods, musks or warmer notes can shape what remains later. A rose or jasmine listing does not mean an isolated flower impression will stay unchanged."],
      ["Keep a clear baseline", "Try the fragrance on its own in an appropriate setting before experimenting with other scented products. Layering changes what you are comparing and does not guarantee improvement."],
      ["Choose a better fit if needed", "If the later character does not appeal, compare a different composition. Correct care supports intended use but cannot promise that every floral scent will meet the same duration target."],
    ], "Write whether the opening flower or the full later composition is the experience you actually want to keep.", "Compare HUME's floral-containing structures below through separate discovery trials before choosing a bottle.", "samples", ["myself", "homme-intense"]),
  g("How to make oud perfumes last longer", "Wear routines",
    "An oud perfume does not need an invented home-aging or airing ritual to be evaluated properly. Use the exact directions, store it appropriately and assess later enjoyment separately from expectations based on the oud name.", [
      ["Keep sourcing claims separate", "A note listing and a duration observation cannot establish natural agarwood content. Read verified product information for material questions rather than guessing from strength."],
      ["Avoid changing the finished formula", "Do not heat, dilute or deliberately expose the product to air to chase performance. If there is a product-condition issue, use the maker's support information."],
      ["Compare actual structures", "Wood-and-spice and rose-and-incense directions can offer different later experiences. Choose the one you enjoy rather than requiring the largest trace or trail."],
    ], "Record the exact oud-listed composition and later presence before considering any application adjustment.", "Use HUME's available oud-listed candidates below for a direct preference comparison without a fixed-hour promise.", "samples", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("How to make budget perfumes last longer", "Wear routines",
    "A budget perfume should first be used and stored correctly, just like any other fragrance. Its price does not establish a need for boosters, improvised mixing or more application, and those steps do not provide a universal performance fix.", [
      ["Check the purchase identity", "Verify maker, version and format before comparing reviews. A related inspiration name does not establish the same composition as another product."],
      ["Use a repeat baseline", "Record the exact application and appropriate setting on more than one wear. Separate opening changes from later presence before blaming the price point."],
      ["Spend on a useful next step", "If the experience remains unsuitable, compare a sample of another candidate rather than automatically buying accessories or a larger bottle to solve the issue."],
    ], "Complete a repeat wear record before spending extra money on an assumed performance solution.", "Use HUME's discovery choices and live prices to compare value through actual enjoyment rather than an unsupported low-price durability claim.", "samples"),
  g("How to make perfume samples last longer", "Wear routines",
    "For samples, separate how long the liquid supply lasts from how long one application stays perceptible. Keep the tester secure and identifiable and use its directions; a small container does not create its own weak or strong fragrance class.", [
      ["Protect the remaining product", "Keep the closure secure and store the sample appropriately. Retain its exact name rather than transferring it into an unlabelled container."],
      ["Make each trial informative", "Use one candidate at a time and record the application and later experience. Testing several unfamiliar samples together can consume product without clarifying a favorite."],
      ["Avoid dose assumptions", "A sample atomizer and full bottle can deliver different amounts. Do not infer a guaranteed number of wears from volume or mechanically transfer a spray routine between them."],
    ], "Keep separate notes for the tester's remaining supply and the experience from each planned wearing trial.", "Retain HUME's sample selection list and use focused repeat trials to identify favorites before selecting full size.", "samples"),
  g("How to make oil perfumes last longer", "Wear routines",
    "Use a finished perfume oil according to its own directions and judge the actual later experience. An oil carrier is not a guaranteed longevity advantage, and altering it with solvents or other materials is not a reliable way to improve the product.", [
      ["Verify intended personal use", "A raw fragrance oil, essential oil and home-scent product are not interchangeable with a cosmetic perfume oil. Start with the correct product and label."],
      ["Record the applicator", "A dabber or roller applies differently from a spray. Describe what you used rather than inventing an equal-dose conversion."],
      ["Choose the desired outcome", "A close-range trace may differ from surrounding projection. If the balance does not suit your routine, compare another product rather than assuming more oil solves every preference."],
    ], "Write whether your concern is later enjoyment, close-range persistence or surrounding presence before changing the routine.", "Compare HUME's spray candidates as separate options when useful, without assuming oil versions or a carrier-based duration ranking.", "shop"),
  g("How to make light perfumes last longer", "Wear routines",
    "Start by defining what light means: airy character, quiet presence or a lighter-positioned format. You may want a longer enjoyable trace without wanting stronger projection, and those goals should be evaluated separately.", [
      ["Use the intended application", "Follow directions and shared-space rules rather than automatically increasing the amount. A delicate scent impression does not establish a universal dosage."],
      ["Observe the later phase", "A quieter but pleasant close-range experience may already meet your brief. Record it separately from an opening that feels less bright."],
      ["Compare a different structure", "If the later scent does not fit your preference, explore another candidate with the character you enjoy. Do not assume a higher concentration label alone provides the answer."],
    ], "Write the airy character you want and the later presence you need as two separate comparison goals.", "Use HUME's soft-presence quiz preference to shortlist ideas and discovery samples to evaluate your own wear brief.", "quiz"),
  g("Are fresh perfumes noticeable to other people", "Noticeability",
    "Fresh perfumes can be noticeable to others, but the label does not establish a fixed presence. Marine, citrus and green structures differ, and your own awareness of a bright opening is not the same as another person's observation.", [
      ["Identify the actual fragrance", "Read the complete notes and exact version. Fresh does not mean weak, quietly worn or automatically appropriate in every shared room."],
      ["Ask useful feedback where welcome", "A willing observer can describe whether the scent is noticeable during a normal interaction. Ask about presence rather than seeking a compliment."],
      ["Keep context visible", "Record the setting and stage of wear. A single observation does not establish a guaranteed radius or that everyone will perceive the fragrance identically."],
    ], "Record your own impression and a willing observer's contextual feedback separately.", "Compare HUME's current fresh-note candidates below without assuming the fresh label predicts how far they will be noticed.", "samples", ["acqua-di-gio-profondo", "lv-imagination"]),
  g("Are citrus perfumes noticeable to other people", "Noticeability",
    "A citrus perfume can be noticeable even when its opening feels light or bright. How others perceive it depends on the complete product, application and setting rather than the citrus note alone.", [
      ["Separate brightness from projection", "An opening you find vivid is a scent impression, not a measured radius. Supporting notes may contribute to noticeability after that opening changes."],
      ["Use normal appropriate feedback", "If useful, ask a willing person whether the fragrance is noticeable in a permitted setting. Do not increase application simply to force a response."],
      ["Compare later observations", "Check whether surrounding presence changes separately from citrus brightness. The full fragrance becoming quieter is not identical to one note fading."],
    ], "Ask about overall noticeability and record citrus character separately at the same stage of a trial.", "Use HUME's citrus-containing structures below for contrast rather than assuming every bright opening has the same projection.", "samples", ["sauvage-noir", "lv-imagination"]),
  g("Are woody perfumes noticeable to other people", "Noticeability",
    "Woody perfumes can be noticeable around the wearer, but dry or smooth wood descriptions do not establish their strength. Evaluate the exact composition and application instead of treating woods as automatically quiet or powerful.", [
      ["Describe texture independently", "Smooth, smoky and dry are character references. They help explain what you enjoy but are not substitutes for an observation of surrounding presence."],
      ["Consider the setting", "Follow fragrance rules and account for the shared environment. A prominent scent is not automatically preferable to a quieter one."],
      ["Use contextual observations", "A willing observer can describe noticeability in that moment. Keep that feedback separate from the later woody trace you notice up close."],
    ], "Record wood texture and contextual noticeability in different parts of your comparison.", "Compare HUME's available woody structures below as candidates rather than a ranked test of who will notice them.", "samples", ["tom-ford-oud-wood", "bleu-de-chanel"]),
  g("Are sweet perfumes noticeable to other people", "Noticeability",
    "Sweet perfumes can be noticeable, but sweetness is not a projection measurement. A dessert-like or warm impression may feel strong to you without showing exactly how others perceive it during the same wear.", [
      ["Name the sweetness", "Vanilla-like warmth and sugary fruit are different references. A shared sweet label does not mean two products have identical compositions or presence."],
      ["Use considerate application", "Follow directions and room rules instead of increasing the amount to seek attention. A compliment is not a dependable performance outcome."],
      ["Separate feedback from preference", "Ask a willing observer about noticeability if useful, then decide whether you personally enjoy the later balance. Those are independent judgments."],
    ], "Record perceived sweetness, outside noticeability and your own later enjoyment separately.", "Use HUME's vanilla-containing examples below for a balanced comparison without treating sweetness as guaranteed power.", "samples", ["myself", "eros-flame"]),
  g("Are floral perfumes noticeable to other people", "Noticeability",
    "Floral perfumes can have a noticeable presence; flowers do not automatically mean delicate projection. The complete structure, application and context matter more than a rose or jasmine listing alone.", [
      ["Read the supporting notes", "Woods, musks and warmer impressions can change the overall experience. A flower name is a scent clue rather than a strength rating."],
      ["Choose an appropriate setting", "Follow shared-space fragrance rules and evaluate a restrained label-directed trial. More noticeability is not always the useful outcome."],
      ["Ask for descriptive feedback", "A willing observer's report can help distinguish your own awareness from surrounding presence. Record when and where they noticed it instead of generalizing to everyone."],
    ], "Describe the floral character you enjoy and the level of presence appropriate to your actual setting.", "Explore HUME's current floral-containing candidates below without assuming all floral perfumes project alike.", "samples", ["myself", "homme-intense"]),
  g("Are oud perfumes noticeable to other people", "Noticeability",
    "An oud-listed perfume can be noticeable, but the note does not guarantee exceptional projection or a fixed trail. Choose from the complete composition and your setting rather than relying on oud's reputation for power.", [
      ["Check the interpretation", "Wood-and-spice and rose-and-incense structures can emphasize different qualities. The oud name does not disclose natural material quantity or surrounding presence."],
      ["Use a clear suitable trial", "Follow directions and fragrance rules. Ask a willing observer about actual noticeability rather than trying to prove maximum distance."],
      ["Keep trace and trail separate", "A lasting close-range wood impression differs from projection and the scent left through movement. Record those outcomes independently."],
    ], "Write the exact oud-style candidate and contextual presence you want before assessing feedback.", "Compare HUME's available oud-listed structures below without natural-content or guaranteed-noticeability claims.", "samples", ["tom-ford-oud-wood", "ombre-nomade"]),
  g("Are budget perfumes noticeable to other people", "Noticeability",
    "Budget perfumes can be noticeable to other people; price alone does not determine projection. Compare the exact fragrance and application under relevant conditions rather than assuming lower cost means either weak or overwhelming scent.", [
      ["Keep the identity clear", "Record maker, version and format. Familiar inspiration references do not establish that different products share the same formula or performance."],
      ["Observe before judging price", "Use the same contextual method for every candidate and ask a willing observer if useful. Do not change the definition of noticeable because the price changes."],
      ["Choose useful value", "Include enjoyment and appropriate presence alongside delivered cost. Being noticed is not automatically the goal in every setting."],
    ], "Complete presence and comfort notes before comparing the prices of shortlisted products.", "Use HUME's live catalogue prices and sample experiences to judge value without a price-based projection guarantee.", "samples"),
  g("Are perfume samples noticeable to other people", "Noticeability",
    "A perfume sample can be noticeable just like another application of its actual fragrance. A smaller container is not a weaker-formula category, but its dispenser may deliver a different amount from a full bottle.", [
      ["Identify the exact sample", "Check maker and version and distinguish an official sample, third-party decant and inspired interpretation. Container size alone cannot establish identity."],
      ["Keep application honest", "Follow directions and record the applicator. Equal spray counts from different containers do not establish equal amounts."],
      ["Use feedback for a shortlist", "A willing observer can describe presence in an appropriate setting. That observation helps your decision without creating a guaranteed full-bottle projection number."],
    ], "Keep sample name and application details beside any feedback from another person.", "Retain HUME's discovery selection list so noticeability observations stay linked to the correct candidate.", "samples"),
  g("Are oil perfumes noticeable to other people", "Noticeability",
    "Oil perfumes can be noticeable to others, and an oil carrier does not automatically mean close-only wear. Compare the finished cosmetic, actual application and appropriate setting rather than assuming a universal carrier-based projection rule.", [
      ["Check the intended product", "A personal perfume oil is different from a raw fragrance or home-scent oil. Use the correct finished cosmetic and its supplied directions."],
      ["Separate mechanism and formula", "A roller or dabber does not reveal concentration, and a spray cannot be equated using an invented drop conversion. Record how each product was actually applied."],
      ["Use contextual feedback", "Ask a willing observer if useful and keep their noticeability report separate from your own close-range perception. A quiet result is not automatically a defective one."],
    ], "Record exact formulation information, applicator and contextual noticeability before comparing carriers.", "Use HUME spray candidates as separate options where useful without implying matching oil versions or universal projection differences.", "shop"),
  g("Are light perfumes noticeable to other people", "Noticeability",
    "A light-smelling perfume can still be noticeable to others. Airy character, lower projection and a lighter-positioned version are different descriptions, so identify which meaning matters before interpreting feedback.", [
      ["Read the actual description", "Light does not specify a uniform formula or radius. Check the exact fragrance and format rather than assuming a delicate character means nobody will notice it."],
      ["Choose appropriate presence", "Follow the rules of shared spaces and describe the level of noticeability you want. Being quietly present can be a useful result rather than a failure."],
      ["Compare perspectives", "Your awareness can differ from a willing observer's report. Record both with setting and stage of wear, without treating one experience as universal."],
    ], "Write whether you want light texture, quiet presence or both before asking for feedback on a candidate.", "Use HUME's soft sillage preference to narrow possibilities, then check actual wear rather than assuming a light-label guarantee.", "quiz"),
  g("How to tell if fresh perfumes suit my skin", "Scent fit",
    "Separate two questions: whether you enjoy a fresh perfume as it develops, and whether the finished product meets your ingredient or skin-compatibility needs. A fresh scent label answers neither automatically, and a preference trial is not an allergy assessment.", [
      ["Define scent fit", "For preference, describe the freshness you like and judge the later character during label-directed appropriate use. Marine, citrus and green directions can feel different."],
      ["Check product information", "Use the actual ingredient and use information for requirements. A note list is a scent description rather than a full formula or evidence of suitability for a skin type."],
      ["Keep reactions outside the ranking", "Do not keep applying a product to prove a match if it causes irritation. Seek appropriate professional advice about reactions rather than treating a quiz or a sample as a diagnostic test."],
    ], "Make separate lists for scent preferences and confirmed ingredient or use requirements before comparing products.", "Use HUME's quiz and notes for preference discovery, and ask for specific product information when compatibility questions matter.", "quiz"),
  g("How to tell if citrus perfumes suit my skin", "Scent fit",
    "A citrus note can help choose a smell you enjoy, but it does not establish the skin compatibility of a finished perfume. Evaluate preference and ingredient requirements separately rather than assuming all citrus products suit or do not suit a particular skin type.", [
      ["Judge the complete scent", "A bright opening can develop into floral, woody or warm impressions. Decide whether you enjoy the whole wear rather than only a citrus reference."],
      ["Read the finished-product information", "A bergamot or lemon note does not reveal raw-material concentration, sourcing or every ingredient. Follow actual directions and seek product-specific information for requirements."],
      ["Avoid a home diagnosis", "A fragrance preference test cannot certify absence of allergy or irritation. If a reaction occurs, stop using that product and seek appropriate professional guidance instead of repeatedly retesting it for scent performance."],
    ], "Write the citrus character you enjoy separately from any ingredient questions that need verified product information.", "Compare HUME's citrus-containing options for scent preference while using labels and product-specific information for compatibility decisions.", "samples"),
];

const byTitle = (title: string) => BEGINNER_GUIDES_BATCH_SEVEN.find(guide => guide.title === title)!;
byTitle("How to test fresh perfumes through the day").chart = {
  headers: ["Observation", "Your record"],
  rows: [["Starting conditions", "Exact product, applicator and appropriate use"], ["Opening", "Type of freshness you perceive"], ["Later point you choose", "Changed character and contextual presence"], ["Preference", "Comfort and whether you want to wear it again"]],
};
byTitle("Do fresh perfumes last longer on clothes").chart = {
  headers: ["Check", "Decision it informs"],
  rows: [["Perfume directions", "Whether the material use is intended"], ["Garment-care guidance", "Whether direct application is compatible"], ["Defined observation", "Freshness, remaining trace or surrounding presence"], ["Personal preference", "Whether the later scent is actually enjoyable"]],
};
byTitle("Do fresh perfumes last longer on clothes").sources = [{ title: "CHANEL: garment-care instructions", url: "https://www.chanel.com/gb/fashion/care-instructions/ready-to-wear/" }];
for (const title of ["How to tell if fresh perfumes suit my skin", "How to tell if citrus perfumes suit my skin"]) {
  byTitle(title).sources = [{ title: "NHS: contact dermatitis and cosmetic triggers", url: "https://www.nhs.uk/conditions/contact-dermatitis/causes/" }, { title: "IFRA: fragrance ingredient questions", url: "https://ifrafragrance.org/about-fragrance/this-is-a-fragrance-2" }];
}
for (const guide of BEGINNER_GUIDES_BATCH_SEVEN) {
  if (guide.title.includes("oud perfumes")) guide.requiredNote = "oud";
  if (guide.title.includes("sweet perfumes")) guide.requiredNote = "vanilla";
}
