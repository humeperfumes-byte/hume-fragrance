import { DISCOVERY_SET_PRICE, DISCOVERY_SET_SAMPLE_COUNT, DISCOVERY_SET_SAMPLE_SIZE_ML } from "@/lib/discovery-set";

const count = DISCOVERY_SET_SAMPLE_COUNT;
const size = DISCOVERY_SET_SAMPLE_SIZE_ML;
const price = DISCOVERY_SET_PRICE;

export const DISCOVERY_GUIDES = [
  {
    slug: "15-perfume-samples-under-1000",
    title: `${count} Perfume Samples for ₹${price}`,
    description: `Explore the HUME discovery set: choose ${count} fragrances in ${size}ml testers for ₹${price}. Understand the sample sizes, price and pre-order before buying.`,
    intro: `The HUME Discovery Set gives you ${count} different HUME perfume samples of ${size}ml each for ₹${price}. You choose the fragrances instead of receiving a fixed assortment.`,
    sections: [
      { title: "What does the sample pack include?", body: `Your set contains ${count} selected fragrances, each in a ${size}ml spray tester. That is ${count * size}ml in total, divided across different scents rather than one bottle. The kit price is ₹${price}; check checkout for any delivery charges and your final payable total.` },
      { title: "What does each trial cost?", body: `Dividing the kit price by ${count} gives approximately ₹${(price / count).toFixed(2)} per fragrance. This is a comparison of the complete set price, not an offer to purchase individual testers at that price. The value is in exploring several options before choosing a larger bottle.` },
      { title: "Samples versus a full bottle", body: "Choose a sample set when you are unsure which scent you enjoy wearing. Choose a full bottle when you already know your favorite and want more of one fragrance. Samples let you compare on skin; they are not a promise that every fragrance will suit you." },
      { title: "Check before you order", body: "The discovery set is offered on pre-order. Review the current product page for price and availability, choose the required number of available fragrances, and review the order summary before paying. The samples are HUME perfumes, not original designer-brand decants." },
    ],
    checklist: ["Compare the kit price and final checkout total", `Select ${count} distinct available fragrances`, "Review the pre-order status", "Keep a list of your favorites for a future full bottle"],
  },
  {
    slug: "build-your-own-perfume-sample-kit",
    title: "Build Your Own Perfume Discovery Kit",
    description: `Customize your HUME sample set by choosing ${count} available fragrances. Build a balanced perfume tester kit for your tastes and occasions.`,
    intro: `Customize your perfume discovery set by choosing ${count} available HUME fragrances. You control which scents go into the kit; each selected fragrance comes as a ${size}ml tester.`,
    sections: [
      { title: "Start with how you want to wear perfume", body: "Think about your normal week: office days, relaxed afternoons, special occasions and evenings. Read the individual fragrance descriptions and choose options for those situations rather than selecting only similar scent profiles." },
      { title: "An example of a balanced kit", body: `For a ${count}-sample selection, you could start with five fresh options, four woody options, three sweet options and three floral or evening options, depending on the available catalogue. These are selection ideas, not a fixed bundle or a guarantee that every category is currently available.` },
      { title: "How the builder works", body: `Open the discovery-set builder, review the available fragrance cards and select ${count} different options. Change your selection before adding the completed kit to your bag. Check the selected names in your bag before proceeding to checkout.` },
      { title: "What does customize perfume mean here?", body: "Here, customization means selecting the existing fragrances in your sample kit. It does not change their formulas, combine them into a new scent or create a bespoke perfume. Each tester remains a separate HUME fragrance to try on its own." },
    ],
    checklist: ["Choose for the occasions you actually wear perfume", "Include familiar notes and a few new directions", "Read each fragrance description", "Review all selected names before checkout"],
  },
  {
    slug: "try-perfume-before-buying",
    title: "Try Perfume Before Buying a Full Bottle",
    description: "Use HUME fragrance samples to compare the opening, dry-down and wear experience. A practical guide to choosing perfume through repeat wear tests.",
    intro: "A perfume trial lets you decide how a fragrance feels during your own day. The HUME discovery set gives you separate samples to compare before committing to a full-size bottle.",
    sections: [
      { title: "Give each fragrance its own trial", body: "Start with one sample on a day when you can pay attention to it. Avoid judging several fragrances layered together: you want to recognize the individual scent. Record the sample name and when you applied it." },
      { title: "Compare the opening and dry-down", body: "Write a quick first impression, then return to it later in the day. Note which parts you enjoy, how comfortable it feels in your normal surroundings and whether you still want to wear it after the initial impression changes." },
      { title: "Use the same simple scorecard", body: "For each sample, record: fragrance name, date, occasion, first impression, later impression and whether you would wear it again. Your personal preference matters more than choosing the most expensive tester or following someone else's ranking." },
      { title: "What makes the best perfume samples for you?", body: "Useful samples give you a chance to compare scents you might actually wear. HUME's kit lets you choose your own selection. It contains HUME fragrances, including inspired interpretations; luxury perfume testers from original designer brands are a different product, so compare brand identity as well as price." },
      { title: "Shortlist before buying full size", body: "Return to your favorites on another day. If a scent remains comfortable and enjoyable across your normal routine, find its full-size product in the HUME collection. A sample test helps you make a personal choice; fragrance performance and preferences vary." },
    ],
    checklist: ["Sample name and date", "Opening impression", "Later impression and occasion", "Would I wear this again?", "Retest before committing to full size"],
  },
  {
    slug: "travel-perfume-set-mini-testers",
    title: "A Travel Perfume Set with Mini Testers",
    description: `Explore ${size}ml HUME fragrance samples for everyday carry and travel. Choose a varied tester set and organize your mini perfumes by occasion.`,
    intro: `The HUME Discovery Set contains ${size}ml spray testers that can be carried individually. You can take a few selected fragrances for a trip while keeping the rest of your sample set at home.`,
    sections: [
      { title: "Choose a small rotation for your trip", body: "Pick from your tested favorites: an everyday fragrance, an evening option and one alternative can give you variety without carrying your entire sample box. Choose for your planned activities and your own preferences rather than an untested assumption about a scent." },
      { title: "Keep samples identifiable", body: "Keep the sample name visible and keep your selected-fragrance list with your order details. Carry the testers in a protective pouch, close them securely and avoid leaving them in direct sun or a hot parked vehicle." },
      { title: "Plan before flying", body: "Check the current liquid restrictions and packing requirements with your airline and departure airport. A small tester size does not automatically establish that your entire bag complies with the applicable rules." },
      { title: "Travel samples or one travel bottle?", body: "A sample kit offers variety in separate small testers. A larger travel bottle gives you more of one known favorite. Choose the discovery set if exploring and switching fragrances matters to you; choose a larger size if you need more of a single scent." },
    ],
    checklist: ["Test your choices before the trip", "Carry only the fragrances you need", "Keep names and closures secure", "Check your carrier's current packing rules"],
  },
];

export function getDiscoveryGuide(slug: string) {
  return DISCOVERY_GUIDES.find((guide) => guide.slug === slug);
}

export function discoveryGuidePath(slug: string) {
  return `/discovery-guides/${slug}`;
}
