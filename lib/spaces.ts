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

export type SpacesProductCategory = "reed-diffuser" | "room-freshener" | "scent-machine" | "fragrance-oil";

export type SpacesProduct = {
  id: string;
  name: string;
  category: SpacesProductCategory;
  categoryLabel: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  size: string;
  coverage: string;
  image: string;
  notes: string;
  mood: string;
  badges?: {
    bestSeller?: boolean;
    newLaunch?: boolean;
    featured?: boolean;
  };
  roomSuitability: string[];
};

export const SPACE_SCENTS = [
  { name: "Ivory Lobby", family: "Citrus · tea · woods", notes: "Bergamot, white tea, cedar", mood: "Polished and welcoming" },
  { name: "Santal Residence", family: "Soft woods · amber", notes: "Sandalwood, iris, amber", mood: "Quiet, residential luxury" },
  { name: "Verdant Courtyard", family: "Green · aromatic", notes: "Neroli, fig leaf, vetiver", mood: "Airy and architectural" },
  { name: "Midnight Suite", family: "Floral · woody", notes: "Saffron, rosewood, soft oud", mood: "Intimate and distinctive" },
  { name: "Coastal Gallery", family: "Mineral · fresh woods", notes: "Mineral air, sage, pale woods", mood: "Clean, modern clarity" },
  { name: "Quiet Library", family: "Tea · leather · woods", notes: "Black tea, suede, cedar", mood: "Cultivated and composed" },
] as const;

export const SPACES_PRODUCTS: SpacesProduct[] = [
  {
    id: "hume-mini-reed-diffuser-50ml",
    name: "HUME Mini Reed Diffuser",
    category: "reed-diffuser",
    categoryLabel: "Reed Diffuser",
    subtitle: "A compact glass vessel for intimate rituals",
    description: "Flameless, low-profile fragrance for bedside tables, powder rooms, wardrobes and desks.",
    price: 799,
    originalPrice: 999,
    size: "50ml",
    coverage: "Up to 120 sq ft",
    image: "/images/spaces/decorative-diffuser.png",
    notes: "Australian Sandalwood · Tuscan Iris · Amber & Cedar",
    mood: "A quiet finishing touch",
    badges: { newLaunch: true, featured: true },
    roomSuitability: ["Bedside Tables", "Powder Rooms", "Wardrobes", "Desks"],
  },
  {
    id: "hume-signature-reed-diffuser-100ml",
    name: "HUME Signature Reed Diffuser",
    category: "reed-diffuser",
    categoryLabel: "Reed Diffuser",
    subtitle: "A considered vessel for daily living spaces",
    description: "A longer-lasting reed diffuser that lends a measured signature to bedrooms, foyers and compact lounges.",
    price: 1299,
    originalPrice: 1599,
    size: "100ml",
    coverage: "Up to 250 sq ft",
    image: "/images/spaces/decorative-diffuser.png",
    notes: "Australian Sandalwood · Tuscan Iris · Amber & Cedar",
    mood: "Composed, continuous atmosphere",
    badges: { bestSeller: true, featured: true },
    roomSuitability: ["Bedrooms", "Foyers", "Living Rooms", "Guest Suites"],
  },
  {
    id: "hume-smart-aroma-diffuser",
    name: "HUME Ambient Aroma Diffuser",
    category: "scent-machine",
    categoryLabel: "Aroma Diffuser",
    subtitle: "Warm glowing ceramic & teakwood mist diffuser",
    description: "Silent ambient scent diffuser with soft LED mood illumination and continuous mist diffusion.",
    price: 2499,
    originalPrice: 3299,
    size: "300ml",
    coverage: "Up to 600 sq ft",
    image: "/images/spaces/aroma-diffuser.png",
    notes: "Top: Italian Bergamot · Heart: White Tea & Neroli · Base: Pale Cedar",
    mood: "Warm & relaxing ambiance",
    badges: { newLaunch: true, featured: true },
    roomSuitability: ["Bedrooms", "Spa Rooms", "Lounges", "Home Offices"],
  },
  {
    id: "hume-commercial-scent-machine-pro",
    name: "HUME Commercial Cold-Air Scent Machine",
    category: "scent-machine",
    categoryLabel: "Scent Machine",
    subtitle: "High-performance waterless diffuser for concentrated spatial oils",
    description: "Architectural cold-air micro-nebulizer designed for concentrated spatial oils, offering powerful 1,000 - 2,000 sq ft coverage for gyms, lobbies & commercial spaces.",
    price: 4000,
    originalPrice: 5999,
    size: "500ml Capacity",
    coverage: "1,000 - 2,000 sq ft",
    image: "/images/spaces/commercial-scent-machine-pro.jpg",
    notes: "Technology: Cold-Air Nebulization · Concentrated Oil Compatible · App Control",
    mood: "High-capacity commercial scenting",
    badges: { bestSeller: true, featured: true },
    roomSuitability: ["Gyms & Fitness Centers", "Hotel Lobbies", "Showrooms", "Spas & Wellness"],
  },
  {
    id: "hume-pro-commercial-tower",
    name: "HUME Pro Commercial Tower Scent Machine",
    category: "scent-machine",
    categoryLabel: "Scent Machine",
    subtitle: "App-controlled cold-air micro-nebulizer",
    description: "Commercial-grade waterless nebulizing diffuser for hotel lobbies, showrooms & luxury boutiques.",
    price: 4999,
    originalPrice: 6999,
    size: "500ml Capacity",
    coverage: "Up to 1,500 sq ft",
    image: "/images/spaces/commercial-diffuser.png",
    notes: "Technology: Cold-Air Nebulization · Bluetooth App · Multi-Schedule",
    mood: "Controlled professional coverage",
    badges: { bestSeller: true, featured: true },
    roomSuitability: ["Hotel Lobbies", "Showrooms", "Boutiques", "Spas"],
  },
  {
    id: "hume-hvac-scenting-system",
    name: "HUME HVAC Scenting Integration System",
    category: "scent-machine",
    categoryLabel: "HVAC System",
    subtitle: "Discreet whole-building fragrance distribution",
    description: "Connects directly into central air ducting for uniform, measurable spatial scenting across floors.",
    price: 12999,
    originalPrice: 15999,
    size: "1000ml Capacity",
    coverage: "Up to 5,000 sq ft",
    image: "/images/spaces/hvac-diffuser-v2.png",
    notes: "Technology: Duct Air Nebulization · Multi-Zone Support · HVAC Direct",
    mood: "Whole-building signature fragrance",
    badges: { featured: true },
    roomSuitability: ["Commercial Towers", "Multi-Floor Offices", "Resorts"],
  },
];

export function getSpacesProduct(id: string) {
  return SPACES_PRODUCTS.find((product) => product.id === id);
}

const commonFaqs = [
  { question: "How is the correct diffuser selected?", answer: "HUME Spaces considers room volume, ceiling height, airflow, HVAC, operating hours and the number of scent zones. Square footage is only the starting point." },
  { question: "Can we test the fragrance first?", answer: "Yes. Professional projects begin with scent sampling and can include an on-site trial before a longer service plan is confirmed." },
  { question: "Do you provide refills and maintenance?", answer: "Yes. Purchase, refill and managed-service options are available. Final availability and service frequency depend on the project location." },
];

export const SPACE_PAGES: SpacePage[] = [
  {
    slug: "home", kind: "collection", eyebrow: "For the residence", title: "A signature atmosphere for every room",
    summary: "Decorative reed diffusers, ambient room sprays, and programmable waterless systems for apartments, villas and private residences.",
    answer: "Use reed diffusers and room mists in smaller, enclosed rooms, and a programmable waterless diffuser in open-plan living areas and double-height foyers.",
    recommendations: [
      { title: "Reed Diffusers 150ml", text: "Powder rooms, wardrobes, bedrooms and compact home offices." },
      { title: "Ambient Room Sprays 100ml", text: "Instant room & fabric refresh before guests arrive or after morning rituals." },
      { title: "Statement Reeds & Waterless Systems", text: "Open-plan living areas, foyers and large master suites needing continuous diffusion." },
    ], faqs: commonFaqs,
  },
  {
    slug: "reed-diffusers", kind: "collection", eyebrow: "Passive scenting", title: "Reed diffusers, composed as objects",
    summary: "Two considered formats for a quiet, continuous signature in the rooms you inhabit most.",
    answer: "Choose 50ml for a smaller, personal corner and 100ml when you want fragrance to hold a bedroom, entry or compact living space.",
    recommendations: [
      { title: "Start lightly", text: "Begin with four reeds. Add more only once the fragrance has settled into the room." },
      { title: "Place with intention", text: "Choose a stable surface with gentle air movement, away from direct sun and AC vents." },
      { title: "Refresh the ritual", text: "Turn the reeds every one to two weeks for a renewed, even diffusion." },
    ], faqs: commonFaqs,
  },
  {
    slug: "room-fresheners", kind: "collection", eyebrow: "Instant ambient mist", title: "Ambient room sprays for instant atmosphere",
    summary: "Fine-mist room and fabric sprays crafted for fast, elegant scenting of living areas, linens, and curtains.",
    answer: "Room fresheners provide instant olfactive transformation. Mist into the center of the room or gently onto fabrics from 30cm away.",
    recommendations: [
      { title: "Guest arrival", text: "Mist entrances and seating areas 5 minutes before entertaining." },
      { title: "Linen refresh", text: "Lightly spray drapes, sofa cushions, and bed linen for lingering warmth." },
      { title: "Travel & car", text: "Keep a 100ml bottle in cars or travel suites for clean, familiar ambiance." },
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
  ["resorts", "Resorts & retreats", "Immersive, open-air and landscape scenting for luxury resorts.", "Use weather-resistant cold-air machines and decorative reed vessels for outdoor-to-indoor transitions.", ["Arrival Pavilion", "Private Villas", "Wellness Spas"]],
  ["gyms", "Gyms & fitness studios", "Odor-neutralising, energising spatial scenting for fitness environments.", "Use active dry-mist cold air diffusers combined with crisp eucalyptus and citrus oil formulas.", ["Workout Floors", "Locker Rooms", "Mindfulness Studios"]],
  ["rooms", "Bedrooms & living suites", "Restful and restorative ambient scenting for residential rooms.", "Use passive rattan reed diffusers or quiet compact waterless machines.", ["Master Bedrooms", "Guest Suites", "Living Rooms"]],
  ["bathrooms", "Bathrooms & powder rooms", "Continuous, flameless passive scenting for intimate spaces.", "Use 150ml - 300ml weighted glass reed diffusers for gentle, continuous freshness.", ["Powder Rooms", "En-suite Bathrooms", "Washroom Lounges"]],
  ["receptions", "Receptions & lobby lounges", "The signature arrival touchpoint for corporate and hospitality properties.", "Program cold-air nebulizers calibrated to peak guest arrival hours.", ["Reception Desks", "Waiting Lounges", "Elevator Lobbies"]],
  ["hvac-integration", "HVAC system integration", "Discreet whole-building spatial fragrance distribution through central ducting.", "Connect HVAC scent nebulizers directly to supply ducts for uniform distribution without visible hardware.", ["Central AHUs", "Multi-floor Offices", "Hotel Towers"]],
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
