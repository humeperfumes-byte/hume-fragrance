import type { BeginnerGuide } from "@/lib/beginner-perfume-guides";
import { DISCOVERY_SET_PRICE, DISCOVERY_SET_SAMPLE_COUNT, DISCOVERY_SET_SAMPLE_SIZE_ML } from "@/lib/discovery-set";

function g(title: string, group: BeginnerGuide["group"], answer: string, sections: [string, string][], exercise: string, humeTip: string, nextStep: BeginnerGuide["nextStep"] = "shop"): BeginnerGuide {
  return { title, group, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), answer, sections: sections.map(([title, body]) => ({ title, body })), exercise, humeTip, nextStep, productIds: [] };
}

const price = `₹${DISCOVERY_SET_PRICE}`;
const kitWithin = (limit: number) => DISCOVERY_SET_PRICE < limit
  ? `The listed HUME discovery item price is ${price}, below ₹${limit.toLocaleString("en-IN")} before any additional charges; verify the complete order total.`
  : `The listed HUME discovery item price is ${price}, so it does not qualify below ₹${limit.toLocaleString("en-IN")}. Do not treat the kit shown alongside as a qualifying offer.`;

export const BEGINNER_GUIDES_BATCH_THIRTEEN: BeginnerGuide[] = [
  g("Long lasting perfume under 500 rupees", "Longevity budgets", "Under ₹500, verify an actual qualifying product and assess its later scent before believing a longevity promise. Low price, high concentration or a strong opening cannot establish fixed hours of wear.", [
    ["Keep the ceiling complete", "Include delivery and the selected size. A low-priced image may refer to a smaller item than you expect."],
    ["Define the lasting result", "A pleasant close-range trace and continuous surrounding projection are different goals. Decide which matters to you."],
    ["Allow an honest no-purchase result", "If the product identity or performance evidence is unclear, waiting is reasonable. Do not raise the limit just to follow an advertised upgrade."],
  ], "Write a strict ₹500 final-total limit and one later-wear outcome you want to evaluate.", `${kitWithin(500)} Review current bottle variants only when their final selected price fits your limit.`),
  g("Long lasting perfume under 1000 rupees", "Longevity budgets", "For lasting perfume under ₹1,000, compare a known favorite with a purposeful trial of an unfamiliar scent. A sample kit can help assess wear, but it is not a single full bottle or a guarantee of duration.", [
    ["Separate format and purpose", "A bottle provides one scent in quantity; discovery compares several. Choose according to what you already know."],
    ["Observe later enjoyment", "Record the exact product, application and remaining character during normal use. A strong first minute is not an all-day result."],
    ["Check the narrow margin", "A near-₹1,000 item leaves little room for additional charges. Confirm the actual checkout total."],
  ], "Compare later enjoyment and final cost separately before choosing a format below ₹1,000.", `${kitWithin(1000)} Choose discovery only if you need to compare HUME fragrances before buying more.`, "samples"),
  g("Long lasting perfume under 1500 rupees", "Longevity budgets", "Under ₹1,500, choose lasting fragrance from repeated personal wear rather than a price-based strength ranking. A later scent you dislike is not good value simply because it remains detectable.", [
    ["Track character and persistence", "Write what remains later and whether you still enjoy it. Do not reduce the trial to one hour count."],
    ["Keep comparison conditions readable", "Use the exact maker and version, and record the applicator. Equal spray counts do not prove equal quantities."],
    ["Buy useful volume", "Choose a size you expect to use after confirming the favorite. Lower cost per ml does not resolve uncertainty."],
  ], "Score later scent enjoyment before comparing the selected variants' delivered totals under ₹1,500.", "Use HUME discovery trials when the scent is unfamiliar, then review current bottle sizes without assuming a particular variant always fits."),
  g("Long lasting perfume under 2000 rupees", "Longevity budgets", "A ₹2,000 limit should support a fragrance that fits your routine, not a search for the loudest affordable opening. Persistence and surrounding presence are different qualities to assess.", [
    ["Describe the daily use", "Work, travel and evenings place different demands on scent presence. A quiet later trace may be enough."],
    ["Avoid automatic top-ups", "Your own fading awareness is not proof of disappearance. Extra application can obscure the original trial."],
    ["Compare full costs", "Include any sample exploration and delivery in your purchase plan rather than assuming they are free."],
  ], "Write the parts of your routine where you want a later scent and where less presence is preferable.", "Compare HUME sample wear notes before selecting a regular bottle; no fixed-hour performance is inferred from its price."),
  g("Long lasting perfume under 2500 rupees", "Longevity budgets", "For longevity under ₹2,500, compare exact products and their later development rather than assuming heavier notes last best. A wood, oud or vanilla listing does not provide a performance rating.", [
    ["Start with a liked direction", "Choose textures you want to live with. Persistent dislike is not an improvement over a shorter enjoyable experience."],
    ["Repeat a promising candidate", "One unusual day can be misleading. Note context during another suitable wear before choosing a bottle."],
    ["Respect the spending boundary", "A satisfying lower-cost candidate can complete the decision. You need not use the entire allowance."],
  ], "Retest the preferred later character before letting note reputation determine a purchase below ₹2,500.", "Use HUME's current scent descriptions for shortlisting and samples for your own wear evidence, keeping those roles separate."),
  g("Long lasting perfume under 3000 rupees", "Longevity budgets", "Under ₹3,000, assess longevity through a normal day and choose the remaining scent you enjoy. Price and concentration cannot establish one reliable number of hours for every wearer.", [
    ["Choose useful checkpoints", "Observe at arrival and a later natural break rather than repeatedly smelling the same spot."],
    ["Record the exact identity", "Maker, fragrance version and applicator matter. Inspired interpretations and designer originals are different products."],
    ["Match quantity to use", "A larger bottle of an unconfirmed scent is a larger commitment, not stronger evidence."],
  ], "Keep a two-checkpoint wear record before comparing larger bottle quantities within ₹3,000.", "Use HUME sample identities in the log and return to the exact corresponding listing if a favorite emerges."),
  g("Long lasting perfume under 4000 rupees", "Longevity budgets", "A lasting fragrance under ₹4,000 should be selected from credible product information and your own trials. Extreme-hours advertising does not become more reliable because a listing appears heavily discounted.", [
    ["Inspect the offer", "Confirm selected volume, version and product type. A sample and a full bottle can share similar images."],
    ["Assess the whole wear", "Record later texture and enjoyment apart from any surrounding scent trail."],
    ["Compare without discount pressure", "Judge the actual final price, not only a crossed-out reference number or urgency message."],
  ], "Evaluate a candidate's later scent before adding its advertised discount to your comparison.", "Review HUME's live prices and policies after sampling, without treating promotion size as a longevity signal."),
  g("Long lasting perfume under 5000 rupees", "Longevity budgets", "Under ₹5,000, the most useful lasting perfume is one whose later character serves your real wearing habits. Stronger projection and a more expensive bottle do not automatically create better value.", [
    ["Choose the desired persistence", "Personal later enjoyment and continuous attention from others are different aims. Use the first as a clear starting question."],
    ["Keep your settings relevant", "A long-lasting scent still needs considerate presence in offices and meals."],
    ["Preserve unused budget", "One confirmed lower-priced favorite may satisfy the brief. Extra bottles should add a distinct role."],
  ], "Name the practical benefit of longer wear in your routine before comparing prices below ₹5,000.", "HUME discovery can help establish whether its later scent interests you; it does not certify a universal performance tier."),
  g("Long lasting perfume under 7500 rupees", "Longevity budgets", "A ₹7,500 ceiling does not replace testing when longevity is important to you. Compare exact identities and a personally useful later result rather than equating prestige with persistence.", [
    ["Separate evidence from image", "Price and rare-sounding notes do not disclose formula quantities or establish how the product wears on you."],
    ["Use a repeat trial", "Save the name and version, note your normal routine and return to the favorite on another day."],
    ["Choose acceptable commitment", "A smaller confirmed purchase can be sensible even when a larger or more expensive option fits the budget."],
  ], "List the actual wear evidence for each candidate before deciding whether its price difference is worthwhile.", "Explore HUME as its own fragrance option, without inferring designer equivalence or fixed longevity from inspiration references."),
  g("Long lasting perfume under 10000 rupees", "Longevity budgets", "Under ₹10,000, choose longevity together with scent enjoyment, occasion fit and a verified purchase. A high ceiling does not guarantee a superior dry down, attraction or all-day projection.", [
    ["Set non-price requirements", "Define texture, dislikes and setting before comparing reputations. An expensive mismatch remains a mismatch."],
    ["Trial before committing", "Repeat the exact candidate and record later close-range scent separately from surrounding presence."],
    ["Review ownership value", "Choose a usable quantity and check complete cost and returns. You can stop below the maximum."],
  ], "Choose the candidate whose later wear meets your own brief before considering prestige or unused budget.", "Use HUME discovery only if its scent directions are relevant to your comparison, without treating a larger budget as a reason to buy more."),
  g("Everyday perfume under 500 rupees", "Daily-wear budgets", "For everyday perfume under ₹500, verify the final cost and choose a scent that suits frequent use. A low unit price is not useful if the exact product is unclear or you dislike wearing it.", [
    ["Define the routine", "Classes, work and transport call for different restraint. Follow any fragrance restrictions."],
    ["Check the selected quantity", "The displayed price may refer to a small format. Confirm actual millilitres and maker before paying."],
    ["Keep the limit honest", "Include delivery and avoid adding unwanted items to reach a promotional threshold."],
  ], "Write your everyday setting and a maximum ₹500 checkout total before comparing available offers.", `${kitWithin(500)} Browse only current selected variants that genuinely meet your everyday needs and limit.`),
  g("Everyday perfume under 1000 rupees", "Daily-wear budgets", "Under ₹1,000, an everyday fragrance should earn repeated use and fit the delivered total. Decide whether you already know the scent or need exploration before choosing a bottle or kit.", [
    ["Start with known preferences", "A confirmed favorite may make a direct bottle purchase useful. Unfamiliar tastes create a different need."],
    ["Consider daily proximity", "A fresh or gentle label does not establish restrained presence in classrooms or offices."],
    ["Check total cost", "A near-ceiling item may leave little room for delivery or other displayed charges."],
  ], "Compare the cost of a known favorite with the specific uncertainty a discovery purchase would resolve.", `${kitWithin(1000)} It is an exploration kit, not one everyday full bottle.`, "samples"),
  g("Everyday perfume under 1500 rupees", "Daily-wear budgets", "A daily perfume under ₹1,500 should match the settings you repeat most often. Choose for comfortable later enjoyment rather than the strongest first impression within the budget.", [
    ["Use a real week", "List your commute, work or classes and casual time. One versatile favorite may cover several roles."],
    ["Test the later scent", "Observe after arrival and later in the day. Decide whether the development remains something you want to wear."],
    ["Choose practical volume", "Available size and expected use matter alongside price per ml. Avoid buying extra quantity solely for a unit-price saving."],
  ], "Use your most repeated weekly setting as the main criterion before comparing daily variants below ₹1,500.", "Compare HUME's live bottle sizes after confirming a favorite, using discovery only when preference is still uncertain."),
  g("Everyday perfume under 2000 rupees", "Daily-wear budgets", "Under ₹2,000, a single enjoyable everyday fragrance can be better value than several untested bottles. Give the purchase a useful role rather than buying quantity because it fits the allowance.", [
    ["Choose overlapping usefulness", "Work and relaxed evenings may share a favorite. You do not need a separate bottle for every occasion name."],
    ["Check repeat preference", "Return to a promising scent on another suitable day before making it the regular choice."],
    ["Keep presence appropriate", "Frequent use does not justify strong application in shared rooms. Policy and others' comfort remain relevant."],
  ], "Compare one versatile favorite with any proposed multi-bottle order by actual weekly usefulness.", "Use HUME's current individual listings rather than assuming a dedicated everyday bundle exists under this ceiling."),
  g("Everyday perfume under 2500 rupees", "Daily-wear budgets", "For everyday wear under ₹2,500, choose a fragrance you want to return to without depending on novelty. A bottle's perceived status is a separate benefit from enjoying its scent every day.", [
    ["Name the regular appeal", "Describe the texture you like during ordinary tasks, not only while trying it for the first time."],
    ["Evaluate the full routine", "A travel opening and an indoor dry down can feel different. Consider both before choosing."],
    ["Preserve spending flexibility", "A lower-priced suitable choice can complete the task. Remaining budget does not require a second fragrance."],
  ], "Write why you would choose the candidate on an ordinary uneventful day before comparing its complete price.", "Use HUME samples to test repeat enjoyment, then select a live bottle variant around your actual daily use."),
  g("Everyday perfume under 3000 rupees", "Daily-wear budgets", "An everyday fragrance under ₹3,000 should balance your preferred character, considerate presence and useful quantity. Choose the size after confirming the scent rather than letting volume discounts decide first.", [
    ["Compare sizes fairly", "Check that variants refer to the same maker and version. Similar names do not establish an identical product."],
    ["Avoid false consumption precision", "Atomizers differ, so universal sprays-per-ml claims are a weak basis for exact cost-per-day estimates."],
    ["Assess your wearing habits", "Choose around real frequency and preference. Buying more of a scent you rarely select does not improve value."],
  ], "Decide the useful bottle quantity from your habits before calculating unit prices below ₹3,000.", "Review HUME's available variants directly; no fixed daily-use yield or complete size range is promised."),
  g("Everyday perfume under 4000 rupees", "Daily-wear budgets", "For daily use under ₹4,000, compare the candidate with what you already own before adding another bottle. A new purchase should improve a real part of the routine rather than duplicate an existing favorite.", [
    ["Identify the current gap", "Perhaps you want less sweetness or a different woody texture. Make the missing experience explicit."],
    ["Use a direct comparison", "Try the candidate on separate appropriate days and note the later difference you actually value."],
    ["Check complete ownership cost", "Include exploration and delivery when relevant. Do not assume a sample credit exists."],
  ], "Name one everyday benefit the new fragrance would add beyond your current favorite.", "Build HUME discovery choices around that benefit, then consider a bottle only when a repeat trial confirms it."),
  g("Everyday perfume under 5000 rupees", "Daily-wear budgets", "A ₹5,000 everyday budget should serve repeated enjoyment rather than a requirement to own a more expensive regular fragrance. Choose the benefits you personally value and verify the exact offer.", [
    ["Separate scent and presentation", "Packaging or brand identity may matter to you, but neither establishes better personal wear."],
    ["Choose for normal settings", "An assertive favorite for occasional events may not be your preferred daily companion."],
    ["Stop when the brief is met", "A lower-cost fragrance can be enough. More spending is not automatically an upgrade."],
  ], "Rank scent enjoyment, setting fit and presentation before comparing daily candidates below ₹5,000.", "Evaluate HUME as a clearly identified fragrance choice using its live details, without treating price differences as proof of equivalence."),
  g("Everyday perfume under 7500 rupees", "Daily-wear budgets", "Under ₹7,500, choose a daily perfume by the exact scent you enjoy through an ordinary week. Reputation is weaker evidence than knowing you want another wear of the later character.", [
    ["Test beyond a special outing", "A daily fragrance should be assessed during ordinary permitted routines, not only while dressed for an event."],
    ["Check the maker and version", "An original, decant and inspired interpretation remain different offers within the same spending limit."],
    ["Avoid prestige-led quantity", "A smaller known favorite may suit you better than the largest bottle available within the ceiling."],
  ], "Give the candidate two ordinary suitable wears before deciding its regular-use value justifies the commitment.", "Use HUME discovery trials when relevant, keeping exact sample identities in your notes for a later bottle decision."),
  g("Everyday perfume under 10000 rupees", "Daily-wear budgets", "A daily fragrance below ₹10,000 should satisfy your own routine without needing a universal best ranking. A large allowance does not remove the value of sampling or a clear spending boundary.", [
    ["Write the daily brief first", "Include setting, desired character, dislikes and acceptable presence before opening premium shortlists."],
    ["Choose a confirmed experience", "Observe later enjoyment and repeat the favorite. Price cannot guarantee compliments or personal fit."],
    ["Keep the final order deliberate", "Check seller, version, quantity and delivery. Leave unused budget unspent when the need is met."],
  ], "Choose the everyday candidate that meets the brief with the least unnecessary commitment.", "Explore HUME's own directions if they interest you, without turning the higher ceiling into an automatic multi-bottle purchase."),
  g("Unisex fragrance under 500 rupees", "Unisex budgets", "Under ₹500, choose unisex fragrance by the actual scent and verified complete cost. Unisex describes marketing without a single-gender restriction, not a specific smell or a quality tier.", [
    ["Read the scent structure", "Fresh, floral, woody and sweet directions can all appear under the label. Pick a texture you want to explore."],
    ["Check identity and quantity", "Confirm maker, selected volume and format before deciding a small-price listing qualifies."],
    ["Keep the total strict", "Include delivery. If no relevant verified offer fits, waiting is preferable to treating an above-budget kit as eligible."],
  ], "Replace the word unisex in your shortlist with actual scent descriptions and a maximum ₹500 final total.", `${kitWithin(500)} Check current bottle listings without assuming a qualifying unisex variant exists at every price.`),
  g("Unisex fragrance under 1000 rupees", "Unisex budgets", "For unisex fragrance under ₹1,000, explore by preferred notes rather than gender categories. Decide whether a bottle or a sample comparison serves your current knowledge and complete budget.", [
    ["Start with liked textures", "An airy wood or floral warmth can interest any wearer. The label alone does not predict the finished scent."],
    ["Check format honestly", "A multi-scent kit is not a single full bottle. Keep those purchase goals separate."],
    ["Verify final affordability", "A product price near the ceiling may exceed it after additional charges."],
  ], "Choose two scent directions without gender exclusions, then check the actual format and complete cost.", `${kitWithin(1000)} Use its choices to explore HUME fragrances rather than assuming every sample has one shared unisex smell.`, "samples"),
  g("Unisex fragrance under 1500 rupees", "Unisex budgets", "Under ₹1,500, unisex fragrance should be chosen for the exact texture you enjoy and the settings where you will wear it. Gender-neutral marketing cannot establish subtlety or versatility.", [
    ["Define your actual preference", "List two liked impressions and one dislike. This creates a clearer brief than unisex alone."],
    ["Trial appropriate presence", "A fragrance offered to everyone can still be assertive. Evaluate the candidate outside important shared occasions first."],
    ["Choose a useful amount", "A smaller confirmed favorite can be more sensible than extra volume of an uncertain scent."],
  ], "Write a scent-and-setting brief that would still make sense if the product had no gender wording.", "Use HUME's live notes and sample comparisons to form your own preference-led shortlist before buying."),
  g("Unisex fragrance under 2000 rupees", "Unisex budgets", "A unisex fragrance under ₹2,000 can be a personal choice or a shared one only when each intended wearer enjoys the exact scent. The label does not guarantee shared taste.", [
    ["Decide who will use it", "Do not assume two people want the same freshness, sweetness or presence simply because a bottle is marketed as unisex."],
    ["Compare independently", "Let each wearer assess the sample before discussing a shared purchase. Separate preferences are useful information."],
    ["Check quantity and total", "Sharing may change expected use, but the complete order still needs to fit the limit."],
  ], "If planning to share, ask each wearer for an independent later-scent verdict before choosing one bottle.", "HUME discovery samples can help determine whether a genuinely shared favorite exists without promising identical experiences."),
  g("Unisex fragrance under 2500 rupees", "Unisex budgets", "For unisex fragrance below ₹2,500, compare distinct structures rather than assuming gender-neutral means neutral-smelling. A floral-woody scent and dry citrus woods can produce very different experiences.", [
    ["Choose meaningful contrast", "Select candidates whose differences you can describe before trying them. Avoid several nearly identical descriptions."],
    ["Follow the complete wear", "A shared top note does not make two perfumes interchangeable. Record the supporting character later."],
    ["Keep spending preference-led", "Buy the candidate you want to repeat, not the one nearest the budget ceiling."],
  ], "Assign each candidate a different texture-based reason to try it before comparing prices under ₹2,500.", "Build HUME discovery selections around contrasting note structures, checking the actual product identities rather than labels alone."),
  g("Unisex fragrance under 3000 rupees", "Unisex budgets", "Under ₹3,000, a unisex choice should fit your intended occasion as well as your taste. The label does not certify a scent for work, dates or close indoor use.", [
    ["Use the setting boundary", "Workplace policy and nearby people's comfort apply regardless of marketing category."],
    ["Assess actual presence", "Try the exact candidate on an appropriate earlier day. Airy wording is not a measured projection rating."],
    ["Choose from later enjoyment", "Record whether the quieter stages remain appealing before committing to a bottle."],
  ], "Select a unisex candidate only after specifying the closest shared setting it needs to fit.", "Use HUME samples to evaluate your occasion preference, without inferring suitability from a universal-wear label."),
  g("Unisex fragrance under 4000 rupees", "Unisex budgets", "A ₹4,000 unisex shortlist should be based on verified product identity and your actual preference. Familiar inspiration references and broad marketing categories do not establish identical formulas.", [
    ["Read the maker first", "Separate original-brand products, third-party decants and inspired fragrances before comparing costs."],
    ["Judge the candidate itself", "A scent can interest you on its own merits without being an exact substitute for another maker's perfume."],
    ["Match the price basis", "Compare the selected size and complete total consistently. A reference image may show a different variant."],
  ], "Write maker, product type and selected millilitres beside every unisex candidate before comparing price.", "HUME samples are its own perfumes, including inspired interpretations; explore them as clearly identified products."),
  g("Unisex fragrance under 5000 rupees", "Unisex budgets", "For unisex fragrance under ₹5,000, choose according to personal value rather than assuming a higher price makes a scent more inclusive or versatile. The finished fragrance still needs a wear trial.", [
    ["Decide what you value", "Scent, packaging and brand identity can matter differently. Keep those benefits separate in your comparison."],
    ["Avoid demographic shortcuts", "Age or gender categories do not establish what an individual will enjoy. Actual likes and dislikes are more useful."],
    ["Keep the purchase proportionate", "A lower-priced favorite can satisfy the brief without spending the remainder on similar fragrances."],
  ], "Rank candidates by your own stated benefits before revealing which one costs closest to ₹5,000.", "Compare HUME's live details with your preferences, without using price or gender wording as a formula-quality score."),
  g("Unisex fragrance under 7500 rupees", "Unisex budgets", "Under ₹7,500, broaden your search beyond gendered shelves while keeping the exact scent and purchase terms clear. Unisex positioning does not prove rare ingredients, low projection or superior duration.", [
    ["Seek specific evidence", "Material sourcing and formula claims require maker information. A note name or retail price does not disclose composition."],
    ["Revisit the favorite", "A second suitable wear can confirm whether an initially surprising direction remains enjoyable."],
    ["Check the chosen quantity", "Buy around expected use rather than choosing the largest available size automatically."],
  ], "List one fragrance you previously overlooked because of marketing and evaluate its actual texture before buying.", "Use HUME discovery to explore unfamiliar directions on their own merits, without assigning premium claims from a spending ceiling."),
  g("Unisex fragrance under 10000 rupees", "Unisex budgets", "A unisex fragrance below ₹10,000 should serve an individual or genuinely shared preference, not an idea that one expensive scent suits everyone. Sample uncertainty before making a substantial commitment.", [
    ["Choose whose preference leads", "A personal purchase, shared bottle and gift require different evidence. Do not merge those needs under one label."],
    ["Confirm the exact scent", "Maker, version and format matter more than broad gender positioning. Compare later development."],
    ["Preserve choice and budget", "A smaller or lower-priced favorite can be enough. No universal fragrance justifies skipping the preference step."],
  ], "Define whether the purchase is personal, shared or a gift before selecting the next comparison step.", "HUME discovery can support preference exploration; it does not promise one sample or bottle will suit every intended wearer."),
  g("First perfume under 500 rupees", "First-purchase budgets", "For a first perfume under ₹500, start with a clear complete-cost limit and an identifiable product. There is no need to stretch the budget or buy an unclear bargain to begin enjoying fragrance.", [
    ["Choose a simple brief", "Name the setting and a smell you enjoy. You do not need to learn every fragrance family before making a sensible first choice."],
    ["Read the actual offer", "Confirm maker, format and millilitres. A familiar designer reference does not establish that brand as the maker."],
    ["Allow waiting", "If no verified suitable option fits the delivered limit, pausing is a valid first-purchase decision."],
  ], "Write where you will wear perfume and your strict ₹500 total before evaluating any listing.", `${kitWithin(500)} Check current individual listings only if the selected format and complete price qualify.`),
  g("First perfume under 1000 rupees", "First-purchase budgets", "Under ₹1,000, decide whether your first purchase should confirm one known scent or explore unfamiliar preferences. A sample kit can be the first step without being a single full-size bottle.", [
    ["Use your existing clues", "Liked fresh, floral, woody or sweet impressions help choose useful contrasts. Avoid filling a shortlist only with famous names."],
    ["Choose a manageable commitment", "Quantity should follow confidence. An untested large bottle is not automatically better than purposeful discovery."],
    ["Verify checkout", "Near-ceiling item prices require particular attention to additional charges and current availability."],
  ], "List one known like, one dislike and one preference question before choosing your first format.", `${kitWithin(1000)} Use discovery when those questions matter more than owning one bottle immediately.`, "samples"),
  g("First perfume under 1500 rupees", "First-purchase budgets", "For a first perfume below ₹1,500, choose around an ordinary day in your life. A scent you enjoy wearing is more useful than an impressive reputation you have not tested.", [
    ["Start with the real occasion", "A commute, class or office supplies a practical brief. Check any fragrance restrictions."],
    ["Compare two different directions", "A fresh candidate and a woodier or floral option can reveal preference more clearly than several near-duplicates."],
    ["Return to the favorite", "Observe the later scent on another suitable day before choosing quantity."],
  ], "Write your ordinary-day fragrance brief before comparing first-purchase options below ₹1,500.", "Use HUME's quiz to narrow directions and samples to decide which finished scent you actually enjoy."),
  g("First perfume under 2000 rupees", "First-purchase budgets", "A ₹2,000 first-perfume budget does not require a starter collection. One tested favorite can be enough while you learn what you enjoy and how often you wear fragrance.", [
    ["Keep the first goal small", "Choose a scent for the setting you repeat most, rather than buying separate bottles for every imagined occasion."],
    ["Understand the format", "Check whether the selected item is spray, oil, sample or bottle and follow its directions."],
    ["Keep expansion optional", "A later second purchase can be better informed by actual use of the first."],
  ], "Choose one main role for your first fragrance and defer additional roles until you have real wear experience.", "HUME discovery can help find an initial favorite; you do not need to convert every enjoyed sample into a bottle."),
  g("First perfume under 2500 rupees", "First-purchase budgets", "For a first perfume under ₹2,500, use simple smell descriptions before worrying about specialist terminology. Your own liked textures are useful evidence even when you cannot identify individual notes.", [
    ["Describe familiar references", "Citrus peel, flowers, dry wood or soft sweetness can begin the brief. A notes list helps shortlist rather than lets you smell the finished perfume."],
    ["Notice the development", "Write how the scent changes after the opening and which stage you prefer."],
    ["Choose a comfortable spend", "The maximum is a boundary, not the cost of entry. A lower-priced suitable fragrance can complete the decision."],
  ], "Describe your preferred scent in three everyday words before comparing products below ₹2,500.", "Use HUME's live note descriptions alongside samples to connect those words with actual wearing preferences."),
  g("First perfume under 3000 rupees", "First-purchase budgets", "Under ₹3,000, choose your first fragrance with a clear routine and a tested application rather than a copied spray rule. Bottle size and atomizer behavior are part of understanding the purchase.", [
    ["Read the product directions", "Application counts are not equal quantities across containers. Avoid assuming a sample count transfers exactly to a full bottle."],
    ["Test before important occasions", "An ordinary suitable day is easier for learning than a first interview, wedding or date."],
    ["Choose the right quantity", "A manageable size can be useful while wearing habits develop, even when a larger variant has a lower unit price."],
  ], "Plan the first appropriate trial day before deciding how much of the fragrance to buy.", "Explore HUME samples first when unfamiliar, then check the chosen bottle's current size, price and directions."),
  g("First perfume under 4000 rupees", "First-purchase budgets", "A first perfume below ₹4,000 should be purchased with clear product identity and seller terms. An attractive bottle or large advertised discount cannot replace knowing exactly what you are buying.", [
    ["Identify the maker", "Original designer perfume, inspired interpretation and decant are different product types. Read beyond familiar reference names."],
    ["Check the final variant", "Confirm volume, format and availability at the selected price. Images can show another size."],
    ["Read purchase conditions", "Review delivery and returns before paying. Do not assume disliking an opened fragrance qualifies for an exchange."],
  ], "Write maker, format, millilitres and complete total beside your first-purchase favorite before ordering.", "HUME discovery and bottle listings describe HUME perfumes; use the current product information and policy links for a clear purchase."),
  g("First perfume under 5000 rupees", "First-purchase budgets", "For a first perfume under ₹5,000, separate your scent preference from pressure to buy a prestigious first bottle. Sampling can be useful even when the budget allows a larger purchase.", [
    ["Choose personal criteria", "List what you want to smell and where you will wear it before reading rankings."],
    ["Avoid performance shortcuts", "Price and concentration do not guarantee hours, compliments or skin compatibility."],
    ["Commit after a repeat", "Choose from the full development on more than one suitable wear rather than the first exciting impression."],
  ], "Explain why you want to wear the exact fragrance without mentioning its price or prestige.", "Use HUME samples as one preference-learning option, without assuming affordable and designer products are identical."),
  g("First perfume under 7500 rupees", "First-purchase budgets", "A ₹7,500 first-purchase allowance gives you options, but it does not make an unfamiliar blind buy more certain. Choose a low-commitment way to resolve the scent question before buying quantity.", [
    ["Identify the remaining uncertainty", "You may know the preferred family but not the finished fragrance. Sample that specific uncertainty rather than every popular option."],
    ["Check later enjoyment", "A subtle dry down may matter more in regular use than a dramatic opening."],
    ["Preserve unused budget", "You can stop with a smaller confirmed favorite. There is no required premium first-perfume tier."],
  ], "Name the single uncertainty preventing a confident choice and choose the smallest useful next step to resolve it.", "HUME discovery can help compare its own directions when those are relevant to your first-fragrance brief."),
  g("First perfume under 10000 rupees", "First-purchase budgets", "Under ₹10,000, your first perfume should still start with a simple personal brief and actual scent experience. A high budget is not a reason to buy a collection before understanding your preferences.", [
    ["Choose for a real week", "Describe repeated settings, desired presence and dislikes. Avoid purchasing for an imagined lifestyle alone."],
    ["Confirm the candidate", "Save exact identity, observe later development and return to a favorite on another suitable day."],
    ["Buy deliberately", "Select useful quantity and review the complete order. Expansion can wait until wearing habits become clearer."],
  ], "Choose one first-fragrance role and a verified favorite before considering any additional purchases.", "Use HUME exploration if its scents fit your interests; the higher ceiling does not require a premium kit or multiple bottles."),
  g("Perfume discovery kit under 500 rupees", "Discovery-kit budgets", "A discovery kit under ₹500 needs a verified qualifying offer, not a price upgrade disguised as a match. Read count, sample size, maker and complete delivered total before deciding.", [
    ["Confirm it is a kit", "A low displayed amount may buy one vial rather than the photographed assortment. Read the selected option."],
    ["Keep useful variety", "A few relevant choices can be enough if an actual offer exists. Unwanted samples are not extra value."],
    ["Respect the spending limit", "If nothing suitable qualifies, wait or choose another plan. Do not count above-budget discovery as under ₹500."],
  ], "Confirm the exact contents and final total before marking any offer as a qualifying under-₹500 kit.", kitWithin(500)),
  g("Perfume discovery kit under 1000 rupees", "Discovery-kit budgets", `${kitWithin(1000)} A qualifying item price is only one check: the available scents and trial format must also match your discovery goal.`, [
    ["Verify checkout affordability", "A near-ceiling item leaves little room for additional charges. Confirm the total before selecting optional extras."],
    ["Choose meaningful contrasts", "Fresh, woody or sweeter directions can answer different questions. Avoid filling choices only from popular names."],
    ["Check availability and timing", "A preorder kit needs planning if the comparison is for a fixed date. Read the current offer."],
  ], "Confirm a complete total below ₹1,000 before assigning each discovery choice a specific trial purpose.", "Review HUME's current builder choices and preorder details; the shared specification below describes the existing kit.", "samples"),
  g("Perfume discovery kit under 1500 rupees", "Discovery-kit budgets", "For discovery below ₹1,500, choose a kit that helps answer clear preference questions. A lower-priced relevant selection can be more useful than spending to the limit on scents you do not want.", [
    ["Define the learning goal", "Comparing bright freshness with softer woods is a clearer purpose than collecting a long list of names."],
    ["Inspect quantities", "Read sample count and ml per sample. Presentation does not increase perfume volume."],
    ["Keep the outcome open", "Discovery can teach dislikes as well as favorites. It need not lead to a full-bottle purchase."],
  ], "List three questions the discovery selection would answer before comparing offers under ₹1,500.", `${kitWithin(1500)} Choose HUME samples around those questions rather than adding items to exhaust the allowance.`, "samples"),
  g("Perfume discovery kit under 2000 rupees", "Discovery-kit budgets", "Under ₹2,000, discovery value depends on a manageable trial plan rather than the highest vial count. Choose a set you can explore individually and revisit without rushing.", [
    ["Plan the trial calendar", "Unfamiliar scents are easier to assess on separate suitable days. Leave time to repeat the promising ones."],
    ["Avoid redundant choices", "Several almost identical directions may answer the same question. Build purposeful contrast."],
    ["Include the complete cost", "Delivery and any later optional bottle purchase should remain visible rather than assumed free."],
  ], "Schedule the first few separate discovery wears before deciding how much new variety is practical.", `${kitWithin(2000)} It is the existing HUME kit, not a separate ₹2,000 package.`, "samples"),
  g("Perfume discovery kit under 2500 rupees", "Discovery-kit budgets", "A discovery-kit ceiling of ₹2,500 should let you choose the selection method you prefer. A fixed assortment and a selectable kit offer different levels of control, not automatically different quality.", [
    ["Choose control or surprise", "Decide whether known dislikes make selection important or whether exploring a maker's assortment is the goal."],
    ["Count relevant samples", "A larger kit can be less useful if many included directions are ones you already avoid."],
    ["Keep identity transparent", "Official samples, third-party decants and inspired perfumes are different categories. Compare them accurately."],
  ], "Compare how many relevant choices a fixed and selectable kit provide before choosing under ₹2,500.", `${kitWithin(2500)} HUME's builder lets you choose from its listed available fragrances.`, "samples"),
  g("Perfume discovery kit under 3000 rupees", "Discovery-kit budgets", "For discovery under ₹3,000, separate the exploration purchase from any later bottle plan. A kit helps you choose; it does not automatically include credit toward another order.", [
    ["Budget the stages separately", "Write the kit cost and optional later bottle cost as distinct decisions."],
    ["Check published benefits", "Use only credits, promotions or services explicitly included in the current offer. Do not infer them from another brand's program."],
    ["Choose after a repeat", "A full bottle should follow enjoyment of the later character, not an obligation to finish the discovery process."],
  ], "Create separate exploration and optional bottle budgets before comparing discovery offers below ₹3,000.", `${kitWithin(3000)} Treat any future HUME bottle as a separate purchase unless current published terms state otherwise.`, "samples"),
  g("Perfume discovery kit under 4000 rupees", "Discovery-kit budgets", "Under ₹4,000, compare discovery quantity and useful variety as separate forms of value. Price per ml helps with arithmetic but cannot measure how much the selection teaches you.", [
    ["Calculate consistently", "Use stated perfume volume and the same price basis for each offer. Accessories are not fragrance millilitres."],
    ["Assess distinct experiences", "A sample that adds a new texture may be more useful than extra volume of a near-duplicate."],
    ["Avoid quality from price", "Higher cost does not establish natural ingredients, compatibility or longer wear. Read actual disclosures."],
  ], "Compare unit price alongside the number of distinct preference questions each kit can answer.", `${kitWithin(4000)} The HUME calculation table uses shared kit constants rather than an invented higher-budget assortment.`, "samples"),
  g("Perfume discovery kit under 5000 rupees", "Discovery-kit budgets", "A ₹5,000 discovery allowance can support broad exploration, but starting with one focused set may make the next choice better informed. More simultaneous kits are not automatically more useful.", [
    ["Choose the first learning task", "Decide whether you are exploring families, later textures or occasion fit. One comparison can inform several decisions."],
    ["Stage the variety", "Review the first trials before ordering overlapping samples. Your actual preferences may change the next shortlist."],
    ["Keep unspent budget", "Discovery is successful when it answers the question, even if the purchase costs less than planned."],
  ], "Write what a second kit would teach beyond the first before ordering several sets at once.", `${kitWithin(5000)} Start with it only when the available HUME directions match the first questions you want answered.`, "samples"),
  g("Perfume discovery kit under 7500 rupees", "Discovery-kit budgets", "For discovery below ₹7,500, verify what each sample actually contains and build an exploration plan around that identity. Expensive reference names are not evidence that a kit contains original designer fragrances.", [
    ["Read the maker and format", "Separate official samples, decants and the seller's own interpretations before comparing costs."],
    ["Avoid reputation-only choices", "Choose directions that interest you rather than assuming a famous inspiration guarantees preference."],
    ["Keep exact trial notes", "Save names and versions so a favorite can be matched to the correct later listing."],
  ], "Write an accurate product-type description for every discovery offer before comparing its complete price.", `${kitWithin(7500)} HUME discovery explores its own perfumes, including inspired interpretations, not a designer-decant collection.`, "samples"),
  g("Perfume discovery kit under 10000 rupees", "Discovery-kit budgets", "Under ₹10,000, a discovery purchase should remain proportionate to your curiosity and available trial time. A smaller relevant set can be a complete experience without another purchase afterward.", [
    ["Choose an endpoint", "Finding one regular favorite and enjoying occasional variety are different goals. Decide what successful discovery means to you."],
    ["Keep trials manageable", "Use one unfamiliar scent at a time and repeat favorites. Opening many samples in one sitting can make impressions harder to compare."],
    ["Stop when the goal is met", "A high spending ceiling does not require a premium kit tier or a full-bottle collection."],
  ], "Define the discovery endpoint and choose the smallest relevant selection that can reasonably answer it.", `${kitWithin(10000)} The same existing HUME offer is relevant only if its available scents serve your goal.`, "samples"),
];

BEGINNER_GUIDES_BATCH_THIRTEEN.find(guide => guide.title === "Perfume discovery kit under 4000 rupees")!.chart = {
  headers: ["Existing HUME kit", "Listed specification"],
  rows: [
    ["Item price before additional charges", price],
    ["Sample count and individual size", `${DISCOVERY_SET_SAMPLE_COUNT} × ${DISCOVERY_SET_SAMPLE_SIZE_ML}ml`],
    ["Total perfume volume", `${DISCOVERY_SET_SAMPLE_COUNT * DISCOVERY_SET_SAMPLE_SIZE_ML}ml`],
    ["Item price per ml, rounded", `₹${(DISCOVERY_SET_PRICE / (DISCOVERY_SET_SAMPLE_COUNT * DISCOVERY_SET_SAMPLE_SIZE_ML)).toFixed(2)}`],
  ],
};
