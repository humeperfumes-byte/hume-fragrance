export type SpacePage = {
  slug: string;
  kind: "collection" | "industry" | "service";
  eyebrow: string;
  title: string;
  summary: string;
  answer: string;
  recommendations: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
};

export const SPACE_SCENTS = [
  { name: "Ivory Lobby", family: "Citrus · tea · woods", notes: "Bergamot, white tea, cedar", mood: "Polished and welcoming" },
  { name: "Santal Residence", family: "Soft woods · amber", notes: "Sandalwood, iris, amber", mood: "Quiet, residential luxury" },
  { name: "Verdant Courtyard", family: "Green · aromatic", notes: "Neroli, fig leaf, vetiver", mood: "Airy and architectural" },
  { name: "Midnight Suite", family: "Floral · woody", notes: "Saffron, rosewood, soft oud", mood: "Intimate and distinctive" },
  { name: "Coastal Gallery", family: "Mineral · fresh woods", notes: "Mineral air, sage, pale woods", mood: "Clean, modern clarity" },
  { name: "Quiet Library", family: "Tea · leather · woods", notes: "Black tea, suede, cedar", mood: "Cultivated and composed" },
] as const;

const commonFaqs = [
  { question: "How is the correct diffuser selected?", answer: "HUME Spaces considers room volume, ceiling height, airflow, HVAC, operating hours and the number of scent zones. Square footage is only the starting point." },
  { question: "Can we test the fragrance first?", answer: "Yes. Professional projects begin with scent sampling and can include an on-site trial before a longer service plan is confirmed." },
  { question: "Do you provide refills and maintenance?", answer: "Yes. Purchase, refill and managed-service options are available. Final availability and service frequency depend on the project location." },
];

export const SPACE_PAGES: SpacePage[] = [
  {
    slug: "home", kind: "collection", eyebrow: "For the residence", title: "A signature atmosphere for every room",
    summary: "Decorative reed diffusers and programmable waterless systems for apartments, villas and private residences.",
    answer: "Use reeds in smaller, enclosed rooms and a programmable waterless diffuser in open-plan living areas, double-height entrances and larger residences.",
    recommendations: [
      { title: "Reed 100–150 ml", text: "Powder rooms, wardrobes, bedrooms and compact home offices." },
      { title: "Statement Reed 250–500 ml", text: "Entrances, suites and modest living rooms where the vessel is part of the interior." },
      { title: "Compact Waterless System", text: "Open-plan homes and spaces where intensity and operating hours need control." },
    ], faqs: commonFaqs,
  },
  {
    slug: "reed-diffusers", kind: "collection", eyebrow: "Passive scenting", title: "Reed diffusers, composed as objects",
    summary: "Flameless, silent and decorative scenting for intimate spaces.",
    answer: "Reed diffusers work beyond bathrooms: use them in bedrooms, entrances, wardrobes, cabins, treatment rooms and compact lounges where airflow is gentle.",
    recommendations: [
      { title: "Intimate spaces", text: "Begin with fewer reeds and add more only if needed." },
      { title: "Placement", text: "Place on a stable surface with gentle air movement, away from direct sun, AC blasts and children or pets." },
      { title: "Larger rooms", text: "Use multiple vessels for decorative zoning or select a programmable machine for consistent coverage." },
    ], faqs: commonFaqs,
  },
  {
    slug: "scent-machines", kind: "collection", eyebrow: "Controlled diffusion", title: "Waterless scent systems for designed coverage",
    summary: "Compact, commercial and HVAC-compatible formats selected for the volume and airflow of the property.",
    answer: "A scent machine is appropriate when a space is large, open, busy or requires scheduled, measurable fragrance output.",
    recommendations: [
      { title: "Compact", text: "Cabins, boutiques, salons, clinics and residential living areas." },
      { title: "Commercial", text: "Receptions, showrooms, restaurants, clubs and hotel public areas." },
      { title: "HVAC or multi-zone", text: "Large offices, hotels and properties requiring discreet distribution across connected areas." },
    ], faqs: commonFaqs,
  },
  {
    slug: "fragrance-oils", kind: "collection", eyebrow: "Spatial fragrance library", title: "Fragrances designed for the air",
    summary: "A restrained collection of spatial compositions for homes and professional environments.",
    answer: "Spatial fragrances must remain balanced during continuous diffusion. HUME Spaces recommends the formula and intensity for the environment rather than treating oil as a universal refill.",
    recommendations: SPACE_SCENTS.slice(0, 3).map((s) => ({ title: s.name, text: `${s.notes}. ${s.mood}.` })), faqs: commonFaqs,
  },
  {
    slug: "for-business", kind: "service", eyebrow: "Professional scenting", title: "One scent system. Every guest touchpoint.",
    summary: "Site assessment, equipment, scent selection, programming, replenishment and maintenance for commercial properties.",
    answer: "HUME Spaces offers equipment purchase as well as managed scenting. Managed plans can combine the diffuser, oil, programming and scheduled care into one service.",
    recommendations: [
      { title: "Purchase", text: "Own the equipment and reorder approved fragrance oils as required." },
      { title: "Managed scenting", text: "Equipment, replenishment, programming and scheduled care in one plan." },
      { title: "Signature programme", text: "Bespoke scent direction, trials, installation and optional branded retail products." },
    ], faqs: commonFaqs,
  },
  {
    slug: "signature-scent-studio", kind: "service", eyebrow: "Bespoke olfactive identity", title: "Make the space recognisable with your eyes closed",
    summary: "A guided scent-development programme for hotels, residences, offices, retailers and design-led brands.",
    answer: "The Signature Scent Studio translates a property’s architecture, materials, audience and desired emotion into scent concepts, trials and a practical diffusion plan.",
    recommendations: [
      { title: "01 · Discover", text: "Brand, property, audience and operational consultation." },
      { title: "02 · Compose", text: "Scent directions, samples and structured feedback." },
      { title: "03 · Trial", text: "Equipment selection, zoning and on-site calibration." },
      { title: "04 · Sustain", text: "Installation, replenishment and optional take-home formats." },
    ], faqs: commonFaqs,
  },
];

const industries: Array<[string, string, string, string, string[]]> = [
  ["luxury-homes", "Luxury residences", "A considered scent plan for entrances, living areas, suites and private retreats.", "Use a zoned combination: reeds for intimate rooms and programmable machines for open-plan or double-height areas.", ["Entrance and foyer", "Living and entertaining", "Private suites"]],
  ["hotels", "Hotels & hospitality", "A consistent arrival, stay and departure—expressed through scent.", "Prioritise the lobby and arrival sequence, then extend subtly to corridors, spas and selected guest areas without over-scenting.", ["Lobby and reception", "Guest corridors", "Spa and wellness"]],
  ["corporate-offices", "Corporate offices", "A composed welcome for clients and a considerate atmosphere for teams.", "Start with reception and client-facing zones. Keep work areas subtle and provide a fragrance-sensitive policy and unscented alternatives.", ["Reception", "Boardrooms", "Client lounges"]],
  ["retail-stores", "Retail & showrooms", "A sensory identity that supports materials, merchandise and brand memory.", "Position controlled diffusion near the customer journey and entrance, away from direct product contamination or enclosed staff areas.", ["Fashion and jewellery", "Furniture galleries", "Automotive showrooms"]],
  ["restaurants", "Restaurants & clubs", "A memorable arrival without competing with taste.", "Scent the threshold, reception or washroom—not dining tables or food preparation areas—and keep intensity restrained.", ["Entrance", "Host desk", "Member lounges"]],
  ["spas-and-salons", "Spas & salons", "A calm olfactive transition from street to treatment.", "Use controlled diffusion at reception and passive reeds in private rooms where appropriate, with distinct consideration for treatment protocols.", ["Reception", "Waiting areas", "Treatment suites"]],
  ["real-estate", "Real estate", "Give buyers an emotional memory of the property.", "Use portable programmable systems for sample apartments, sales galleries and handover experiences, calibrated to the property’s finishes.", ["Sales gallery", "Sample residence", "Handover gifting"]],
  ["events", "Events & celebrations", "Temporary scent environments, calibrated for the venue and guest flow.", "Portable systems can scent entrances, stages and lounges. Open-air venues require a site-specific feasibility check.", ["Arrival tunnel", "VIP lounge", "Wedding venue"]],
  ["interior-designers", "Architects & interior designers", "Specify scent as deliberately as light, texture and sound.", "The HUME Spaces Trade Programme supports selection, specification, samples and installation coordination for residential and commercial projects.", ["Sample library", "Project specification", "Installation support"]],
];

industries.forEach(([slug, title, summary, answer, zones]) => SPACE_PAGES.push({
  slug, kind: "industry", eyebrow: "HUME Spaces for", title, summary, answer,
  recommendations: zones.map((zone, index) => ({ title: `${String(index + 1).padStart(2, "0")} · ${zone}`, text: "System, fragrance and intensity selected after reviewing volume, airflow and the desired experience." })),
  faqs: commonFaqs,
}));

export const getSpacePage = (slug: string) => SPACE_PAGES.find((page) => page.slug === slug);
