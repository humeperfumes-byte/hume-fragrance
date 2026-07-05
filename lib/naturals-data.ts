export type NaturalCategory = "Floral" | "Woody" | "Earthy" | "Green" | "Resinous";

export interface NaturalSizeOption {
  ml: string;
  price: number;
  label?: string;
}

export interface AromaProfile {
  top: string;
  heart: string;
  base: string;
}

export interface IngredientDetail {
  name: string;
  value: string;
}

export interface SourcingStep {
  num: string;
  title: string;
  desc: string;
}

export interface NaturalProduct {
  id: string;
  number: string;
  name: string;
  scientificName: string;
  origin: string;
  category: NaturalCategory;
  price: number; // default base price for default size
  size: string;  // default size
  image: string;
  tags: string;
  tagline: string;
  quote: string;
  description: string;
  sensoryNotes: string;
  extractionMethod: string;
  sourcing: string;
  profile: string;
  aromaProfile: AromaProfile;
  ingredients: IngredientDetail[];
  sourcingTitle: string;
  sourcingSteps: SourcingStep[];
  sizes: NaturalSizeOption[];
  videoUrl?: string;
}

export const NATURALS_PRODUCTS: NaturalProduct[] = [
  {
    id: "rose-otto",
    number: "Nº 01",
    name: "Rose Otto",
    scientificName: "Rosa damascena",
    origin: "Kannauj, Uttar Pradesh",
    category: "Floral",
    price: 4800,
    size: "10ml",
    image: "/images/naturals/rose_otto.jpg",
    tags: "FLORAL / SWEET · STEAM DISTILLED",
    tagline: "“The dawn harvest, distilled unchanged.”",
    quote: "100% Rosa damascena flower oil. Nothing else.",
    description: "Petal-fresh, honeyed, deeply romantic. Distilled from freshly harvested Damask roses at dawn.",
    sensoryNotes: "Honeyed sweetness, fresh morning dew, warm wood, green leaf.",
    extractionMethod: "Steam Distilled",
    sourcing: "Sourced from multigenerational rose growers in Kannauj. Harvested before sunrise in March and April when the rosebuds are richest in essential oils.",
    profile: "Rosa damascena absolute contains citronellol, geraniol, and phenylethyl alcohol, delivering unmatched therapeutic and aromatic depth.",
    aromaProfile: {
      top: "Fresh dewy petal, faint citrus lift",
      heart: "Honeyed rose, warm nectar",
      base: "Waxy, slightly spiced, long-lasting",
    },
    ingredients: [
      { name: "No carrier oils", value: "Undiluted" },
      { name: "No synthetics or reconstitutions", value: "100% natural" },
      { name: "Vegan · Cruelty-free", value: "Verified" },
      { name: "GC/MS batch report", value: "On request" },
    ],
    sourcingTitle: "From Kannauj.",
    sourcingSteps: [
      { num: "01", title: "The Harvest", desc: "Hand-picked between 4 and 7 a.m. through April and May, when the oil yield in the petal is at its peak. Distilled the same morning." },
      { num: "02", title: "The Yield", desc: "Roughly 3,500 kg of fresh petals yield a single kilogram of Rose Otto." },
      { num: "03", title: "The Grower", desc: "From a family of fifth-generation distillers in Kannauj working with contracted rose farms across the Ganga plains. Fair wages verified per harvest cycle." },
    ],
    sizes: [
      { ml: "10ml", price: 4800 },
      { ml: "25ml", price: 11040 },
      { ml: "50ml", price: 20640 },
      { ml: "100ml", price: 38400 },
      { ml: "Custom", price: 0, label: "BESPOKE" },
    ],
  },
  {
    id: "vetiver",
    number: "Nº 02",
    name: "Vetiver",
    scientificName: "Chrysopogon zizanioides",
    origin: "Mysuru, Karnataka",
    category: "Earthy",
    price: 3300,
    size: "10ml",
    image: "/images/naturals/vetiver.jpg",
    tags: "EARTHY / WOODY · COLD DISTILLED",
    tagline: "“Liquid earth, grounding and timeless.”",
    quote: "100% Chrysopogon zizanioides root oil. Nothing else.",
    description: "Damp soil, smoked wood and monsoon roots. Grounding and long-wearing on the skin.",
    sensoryNotes: "Earthy, damp soil, rich balsam, smoked wood, green root.",
    extractionMethod: "Hydro-Distillation",
    sourcing: "Sourced from organic vetiver grass plantations in Southern India. The roots are harvested at 18 months, washed, dried, and distilled slowly to lock in the deep woody undertones.",
    profile: "Contains khusimol and vetivone. Acts as a natural fixative that deepens and extends other notes on the skin.",
    aromaProfile: {
      top: "Monsoon earth, damp topsoil, dry green grass",
      heart: "Smoked cedarwood, warm amber resin",
      base: "Sweet woody balsam, long-wearing root",
    },
    ingredients: [
      { name: "No carrier oils", value: "Undiluted" },
      { name: "No synthetics or reconstitutions", value: "100% natural" },
      { name: "Vegan · Cruelty-free", value: "Verified" },
      { name: "GC/MS batch report", value: "On request" },
    ],
    sourcingTitle: "From Mysuru.",
    sourcingSteps: [
      { num: "01", title: "The Harvest", desc: "Sun-dried roots are harvested at peak maturity after the monsoon season, when vetiverol concentration is optimal." },
      { num: "02", title: "The Distillation", desc: "A slow 36-hour steam distillation process extracting the dense oil from the fibrous root systems." },
      { num: "03", title: "The Farm", desc: "Cultivated in co-op farms in Karnataka, using traditional dry-farming methods that enhance the root aroma profile." },
    ],
    sizes: [
      { ml: "10ml", price: 3300 },
      { ml: "25ml", price: 7590 },
      { ml: "50ml", price: 14190 },
      { ml: "100ml", price: 26400 },
      { ml: "Custom", price: 0, label: "BESPOKE" },
    ],
  },
  {
    id: "chandan",
    number: "Nº 03",
    name: "Chandan (Sandalwood)",
    scientificName: "Santalum album",
    origin: "Marayoor, Kerala",
    category: "Woody",
    price: 6400,
    size: "10ml",
    image: "/images/naturals/chandan.jpg",
    tags: "WOODY / BALSAMIC · SLOW STREAM DISTILLED",
    tagline: "“Aged heartwood, milky and meditative.”",
    quote: "100% Santalum album wood oil. Nothing else.",
    description: "Warm, milky, meditative. From aged East Indian sandalwood heartwood.",
    sensoryNotes: "Milky cream, warm wood, balsamic, meditative sweetness.",
    extractionMethod: "Steam Distillation",
    sourcing: "Sourced from the state-protected sandalwood forests of Marayoor, Kerala. Only wood from mature trees over 30 years old is harvested to ensure maximum santalol content.",
    profile: "Rich in alpha and beta santalol, providing a buttery, calming, and exceptionally long-lasting base note.",
    aromaProfile: {
      top: "Soft sweet cream, light balsamic warmth",
      heart: "Smooth milky heartwood, clean cedar",
      base: "Deep buttery sandalwood, spiritual dry-down",
    },
    ingredients: [
      { name: "No carrier oils", value: "Undiluted" },
      { name: "No synthetics or reconstitutions", value: "100% natural" },
      { name: "Vegan · Cruelty-free", value: "Verified" },
      { name: "GC/MS batch report", value: "On request" },
    ],
    sourcingTitle: "From Marayoor.",
    sourcingSteps: [
      { num: "01", title: "The Sourcing", desc: "Ethically harvested under strict Kerala forest department supervision. Only mature heartwood is utilized." },
      { num: "02", title: "The Processing", desc: "Heartwood is ground into a fine powder and steam-distilled for 48 hours to extract the rich santalol oil." },
      { num: "03", title: "The Quality", desc: "GC/MS tested to guarantee over 90% santalol content, establishing absolute premium purity." },
    ],
    sizes: [
      { ml: "10ml", price: 6400 },
      { ml: "25ml", price: 14720 },
      { ml: "50ml", price: 27520 },
      { ml: "100ml", price: 51200 },
      { ml: "Custom", price: 0, label: "BESPOKE" },
    ],
  },
  {
    id: "bela",
    number: "Nº 04",
    name: "Bela (Champa)",
    scientificName: "Michelia champaca",
    origin: "Odisha",
    category: "Floral",
    price: 3700,
    size: "10ml",
    image: "/images/naturals/bela.jpg",
    tags: "FLORAL / HEADY · DEG DISTILLED",
    tagline: "“Golden blossoms, intoxicating and warm.”",
    quote: "100% Michelia champaca flower oil. Nothing else.",
    description: "Lush, sweet, and exotic champa blossoms hydro-distilled in traditional Kannauj degs.",
    sensoryNotes: "Sweet nectar, exotic tea, warm apricot, heady spice.",
    extractionMethod: "Hydro-distillation",
    sourcing: "Hand-picked golden champa flowers collected from the coastal regions of Odisha. Distilled within hours of harvesting to preserve the delicate top notes.",
    profile: "Features linalool and methyl anthranilate. Uplifting, rare, and prized in classical Indian perfumery.",
    aromaProfile: {
      top: "Exotic tea, citrus blossom, fresh apricot",
      heart: "Lush golden champa, warm jasmine spice",
      base: "Sweet indolic resin, rich floral musk",
    },
    ingredients: [
      { name: "No carrier oils", value: "Undiluted" },
      { name: "No synthetics or reconstitutions", value: "100% natural" },
      { name: "Vegan · Cruelty-free", value: "Verified" },
      { name: "GC/MS batch report", value: "On request" },
    ],
    sourcingTitle: "From Odisha.",
    sourcingSteps: [
      { num: "01", title: "The Gathering", desc: "Blossoms are gathered by hand at peak bloom from coastal groves when their exotic oil yield is highest." },
      { num: "02", title: "The Extraction", desc: "Hydro-distilled locally in copper degs to capture both the delicate top notes and warm balsamic resins." },
      { num: "03", title: "The Heritage", desc: "Distilled following ancient recipe guidelines to preserve the true cultural legacy of champa perfumery." },
    ],
    sizes: [
      { ml: "10ml", price: 3700 },
      { ml: "25ml", price: 8510 },
      { ml: "50ml", price: 15910 },
      { ml: "100ml", price: 29600 },
      { ml: "Custom", price: 0, label: "BESPOKE" },
    ],
  },
  {
    id: "mehndi",
    number: "Nº 05",
    name: "Mehndi (Henna)",
    scientificName: "Lawsonia inermis",
    origin: "Sojat, Rajasthan",
    category: "Green",
    price: 2800,
    size: "10ml",
    image: "/images/naturals/mehndi.jpg",
    tags: "GREEN / BALSAMIC · DEG DISTILLED",
    tagline: "“Cooling earth, dry hay and herbal smoke.”",
    quote: "100% Lawsonia inermis leaf oil. Nothing else.",
    description: "Dry hay, warm resin and crushed leaf. A rare, quietly cooling attar base.",
    sensoryNotes: "Dry hay, warm balsam, crushed green leaf, herbal smoke.",
    extractionMethod: "Hydro-distillation",
    sourcing: "Harvested from the arid farms of Sojat, Rajasthan, where the henna leaves develop a high concentration of aromatic lawsone molecule.",
    profile: "Deeply calming, grounding, and cooling. Functions as an excellent base for traditional Indian attars.",
    aromaProfile: {
      top: "Crushed green leaf, dry meadow grass",
      heart: "Warm herbal hay, light balsamic smoke",
      base: "Cool earth, resinous tea, long-wearing fixative",
    },
    ingredients: [
      { name: "No carrier oils", value: "Undiluted" },
      { name: "No synthetics or reconstitutions", value: "100% natural" },
      { name: "Vegan · Cruelty-free", value: "Verified" },
      { name: "GC/MS batch report", value: "On request" },
    ],
    sourcingTitle: "From Sojat.",
    sourcingSteps: [
      { num: "01", title: "The Harvest", desc: "Henna leaves are harvested in the dry winters of Sojat, Rajasthan, locking in high-potency aromatic lawsone." },
      { num: "02", title: "The Distillation", desc: "Hydro-distilled using a slow copper deg process with a traditional sandalwood base to capture cooling vapors." },
      { num: "03", title: "The Calming", desc: "Prized for its natural cooling and grounding aromatherapy properties across North India." },
    ],
    sizes: [
      { ml: "10ml", price: 2800 },
      { ml: "25ml", price: 6440 },
      { ml: "50ml", price: 12040 },
      { ml: "100ml", price: 22400 },
      { ml: "Custom", price: 0, label: "BESPOKE" },
    ],
  },
  {
    id: "mogra",
    number: "Nº 06",
    name: "Mogra",
    scientificName: "Jasminum sambac",
    origin: "Madurai, Tamil Nadu",
    category: "Floral",
    price: 4200,
    size: "10ml",
    image: "/images/naturals/mogra.jpg",
    tags: "FLORAL / WHITE · SOLVENT EXTRACTED",
    tagline: "“Midnight blossoms, lush and intoxicating.”",
    quote: "100% Jasminum sambac absolute. Nothing else.",
    description: "Night-blooming, indolic, lush. Harvested before sunrise for maximum aromatic yield.",
    sensoryNotes: "Lush white floral, clean jasmine, indolic warmth, honeyed nectar.",
    extractionMethod: "Absolute Extraction",
    sourcing: "Harvested from the jasmine fields of Madurai. The mogra buds are plucked at midnight when they open, releasing their peak volatile compounds.",
    profile: "Rich in benzyl acetate and linalool, providing a vibrant, intense, and intoxicating white floral signature.",
    aromaProfile: {
      top: "Vibrant sweet jasmine, clean fresh leaf",
      heart: "Lush white floral, honeyed mogra nectar",
      base: "Warm indolic musk, rich exotic dry-down",
    },
    ingredients: [
      { name: "No carrier oils", value: "Undiluted" },
      { name: "No synthetics or reconstitutions", value: "100% natural" },
      { name: "Vegan · Cruelty-free", value: "Verified" },
      { name: "GC/MS batch report", value: "On request" },
    ],
    sourcingTitle: "From Madurai.",
    sourcingSteps: [
      { num: "01", title: "Midnight Harvest", desc: "Fresh buds are plucked by hand at midnight by local farmers, catching the blossoms right as they open." },
      { num: "02", title: "Immediate Extraction", desc: "Processed immediately near the fields to ensure none of the delicate white floral top notes are lost." },
      { num: "03", title: "The Quality", desc: "Highly concentrated absolute format, capturing the complete multi-faceted scent of live jasmine." },
    ],
    sizes: [
      { ml: "10ml", price: 4200 },
      { ml: "25ml", price: 9660 },
      { ml: "50ml", price: 18060 },
      { ml: "100ml", price: 33600 },
      { ml: "Custom", price: 0, label: "BESPOKE" },
    ],
  },
  {
    id: "jasmine-grandiflorum",
    number: "Nº 07",
    name: "Jasmine Grandiflorum",
    scientificName: "Jasminum grandiflorum",
    origin: "Coimbatore, Tamil Nadu",
    category: "Floral",
    price: 4800,
    size: "10ml",
    image: "/images/naturals/jasmine_grandiflorum.jpg",
    tags: "FLORAL / FRUITY · SOLVENT EXTRACTED",
    tagline: "“Morning absolute, fruity and voluptuous.”",
    quote: "100% Jasminum grandiflorum absolute. Nothing else.",
    description: "Intensely floral, sweet, and rich absolute of night-blooming jasmine flowers.",
    sensoryNotes: "Sweet jasmin, exotic green tea, fruity undertone, indole.",
    extractionMethod: "Absolute Extraction",
    sourcing: "Harvested in Coimbatore, Tamil Nadu. Hand-gathered in the early morning hours and processed immediately to retain the delicate, fruity-floral molecules.",
    profile: "Contains benzyl benzoate and phytol. Highly complex, radiant, and voluptuous scent profile.",
    aromaProfile: {
      top: "Exotic green tea, fresh peach skin, fruity lift",
      heart: "Head-turning jasmine floral, honeyed nectar",
      base: "Warm waxy indole, long-lasting rich balsam",
    },
    ingredients: [
      { name: "No carrier oils", value: "Undiluted" },
      { name: "No synthetics or reconstitutions", value: "100% natural" },
      { name: "Vegan · Cruelty-free", value: "Verified" },
      { name: "GC/MS batch report", value: "On request" },
    ],
    sourcingTitle: "From Coimbatore.",
    sourcingSteps: [
      { num: "01", title: "Dawn Harvest", desc: "Collected in the early morning dew when the grandiflorum blossoms show their fruitiest, sweetest profile." },
      { num: "02", title: "Absolute Process", desc: "Extracted carefully in Coimbatore to yield a rich, dark-colored absolute that captures the complete floral body." },
      { num: "03", title: "Olfactory Depth", desc: "A staple in fine perfumery, delivering unmatched diffusion, radiation, and complex floral depth." },
    ],
    sizes: [
      { ml: "10ml", price: 4800 },
      { ml: "25ml", price: 11040 },
      { ml: "50ml", price: 20640 },
      { ml: "100ml", price: 38400 },
      { ml: "Custom", price: 0, label: "BESPOKE" },
    ],
  },
  {
    id: "kewra",
    number: "Nº 08",
    name: "Kewra",
    scientificName: "Pandanus odorifer",
    origin: "Ganjam, Odisha",
    category: "Green",
    price: 2400,
    size: "10ml",
    image: "/images/naturals/kewra.jpg",
    tags: "GREEN / SWEET · DEG DISTILLED",
    tagline: "“Pandanus blossoms, diffusive and honeyed.”",
    quote: "100% Pandanus odorifer flower oil. Nothing else.",
    description: "Rose-like with a resinous edge. A cherished note in North Indian perfumery.",
    sensoryNotes: "Sweet honey, rosewater, green grass, resinous background.",
    extractionMethod: "Hydro-distillation",
    sourcing: "Harvested in the Ganjam district of coastal Odisha, globally renowned for growing the finest Kewra flowers. Only the male blossoms are gathered.",
    profile: "Rich in phenylethyl methyl ether, giving it a sweet, honey-like, and highly diffusive character.",
    aromaProfile: {
      top: "Heady honeyed nectar, sweet rosewater, fresh dew",
      heart: "resinous green grass, light exotic melon",
      base: "Sweet diffusive musk, warm balsamic background",
    },
    ingredients: [
      { name: "No carrier oils", value: "Undiluted" },
      { name: "No synthetics or reconstitutions", value: "100% natural" },
      { name: "Vegan · Cruelty-free", value: "Verified" },
      { name: "GC/MS batch report", value: "On request" },
    ],
    sourcingTitle: "From Ganjam.",
    sourcingSteps: [
      { num: "01", title: "The Harvest", desc: "Male pandanus flowers are harvested during the monsoon season in Ganjam, Odisha, when the blossoms are highly aromatic." },
      { num: "02", title: "Traditional Degs", desc: "Distilled immediately in traditional copper degs to capture the highly volatile honeyed scent profile." },
      { num: "03", title: "Olfactory Power", desc: "Highly diffusive; a single drop of Ganjam Kewra oil spreads an intensely sweet, fresh floral aroma." },
    ],
    sizes: [
      { ml: "10ml", price: 2400 },
      { ml: "25ml", price: 5520 },
      { ml: "50ml", price: 10320 },
      { ml: "100ml", price: 19200 },
      { ml: "Custom", price: 0, label: "BESPOKE" },
    ],
  },
  {
    id: "khus",
    number: "Nº 09",
    name: "Khus",
    scientificName: "Vetiveria zizanioides",
    origin: "Bharatpur, Rajasthan",
    category: "Earthy",
    price: 3500,
    size: "10ml",
    image: "/images/naturals/khus.jpg",
    tags: "EARTHY / GREEN · DEG DISTILLED",
    tagline: "“Monsoon grass, cool earth and river stones.”",
    quote: "100% Vetiveria zizanioides root oil. Nothing else.",
    description: "A cooler, greener cousin of Vetiver. Wet grass, river stones, monsoon air.",
    sensoryNotes: "Cool wet grass, river stones, crisp monsoon air, dark earth.",
    extractionMethod: "Hydro-distillation",
    sourcing: "Wild-harvested roots of khus grass from the marshlands of Bharatpur, Rajasthan. Distilled locally in traditional copper degs.",
    profile: "Contains high amounts of vetivenol, rendering a cool, balsamic, and refreshing wet-earth aroma.",
    aromaProfile: {
      top: "Crisp monsoon air, wet river stones, cool grass",
      heart: "Green vetiver root, sweet rain water, light smoke",
      base: "Cool earthy balsam, soothing green fixative",
    },
    ingredients: [
      { name: "No carrier oils", value: "Undiluted" },
      { name: "No synthetics or reconstitutions", value: "100% natural" },
      { name: "Vegan · Cruelty-free", value: "Verified" },
      { name: "GC/MS batch report", value: "On request" },
    ],
    sourcingTitle: "From Bharatpur.",
    sourcingSteps: [
      { num: "01", title: "Wild Harvest", desc: "Roots are wild-harvested by hand from the wet marshlands of Bharatpur, Rajasthan, in dry winter seasons." },
      { num: "02", title: "Copper Degs", desc: "Distilled locally in ancient copper deg and bhapka setups using wood fire, which adds a distinct cool smoky depth." },
      { num: "03", title: "Aromatherapy", desc: "prized across India as a natural body-cooler, offering a refreshing and deeply therapeutic wet-grass aroma." },
    ],
    sizes: [
      { ml: "10ml", price: 3500 },
      { ml: "25ml", price: 8050 },
      { ml: "50ml", price: 15050 },
      { ml: "100ml", price: 28000 },
      { ml: "Custom", price: 0, label: "BESPOKE" },
    ],
  },
];
