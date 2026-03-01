export interface FestivalSeoFaq {
  question: string;
  answer: string;
}

export interface FestivalSeoEntry {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  festivalName: string;
  intro: string;
  focusKeywords: string[];
  styleKeywords: string[];
  faq: FestivalSeoFaq[];
}

const baseFaq = (festivalName: string): FestivalSeoFaq[] => [
  {
    question: `Which perfume family works best for ${festivalName}?`,
    answer:
      `For ${festivalName}, balance is key: fresh and airy during daytime rituals, richer woods/amber for evening gatherings. Choose based on event timing and climate.`,
  },
  {
    question: "How many sprays should I apply for festive occasions?",
    answer:
      "For close-family settings use 3–4 sprays. For open-air events and longer celebrations, 5–6 sprays works better. Apply on pulse points and fabric-safe areas.",
  },
  {
    question: "Can I wear the same fragrance from morning to night?",
    answer:
      "Yes, if you choose an EDP with a stable base. You can refresh with 1–2 extra sprays before evening plans to restore projection without overdoing it.",
  },
  {
    question: "How do I make perfume last longer in Indian weather?",
    answer:
      "Moisturize skin before spraying, apply on neck/wrists/chest, and include one light fabric spray. Avoid rubbing after application so the notes develop properly.",
  },
  {
    question: "Should I pick one signature scent or rotate fragrances?",
    answer:
      "For festive weeks, keep one signature for consistency and one alternate profile for contrast. This gives you flexibility across pooja, family visits, and outings.",
  },
];

export const FESTIVAL_SEO_PAGES: FestivalSeoEntry[] = [
  {
    slug: "perfume-for-diwali",
    title: "Best Perfume for Diwali in India (2026): Festive, Long-Lasting Fragrance Guide",
    metaTitle: "Perfume For Diwali | Best Festive Fragrances in India",
    metaDescription:
      "Find the best perfume for Diwali celebrations in India. Long-lasting festive fragrance picks with warm, elegant, and crowd-pleasing profiles.",
    festivalName: "Diwali",
    intro:
      "Diwali is a celebration of warmth, light, and togetherness, so your fragrance should feel festive yet refined. This guide covers how to pick a Diwali-ready scent that performs through pooja, family visits, festive dinners, and late-night gatherings without turning heavy or overpowering.",
    focusKeywords: ["amber", "sandalwood", "vanilla", "saffron", "oud", "spices"],
    styleKeywords: ["festive", "elegant", "warm", "luxury", "long-lasting"],
    faq: baseFaq("Diwali"),
  },
  {
    slug: "perfume-for-holi",
    title: "Best Perfume for Holi in India: Fresh and Clean Fragrances for Day Events",
    metaTitle: "Perfume For Holi | Fresh Fragrance Picks for Indian Summer",
    metaDescription:
      "Discover the best perfume for Holi parties and day events. Fresh, vibrant, long-lasting perfumes suitable for Indian heat and outdoor celebrations.",
    festivalName: "Holi",
    intro:
      "Holi celebrations are energetic, colorful, and mostly outdoors, so you need a clean, vibrant fragrance that stays pleasant in heat. The right Holi perfume should feel fresh, uplifting, and easy to wear while remaining noticeable throughout long daytime events.",
    focusKeywords: ["citrus", "marine", "bergamot", "mint", "lavender", "musk"],
    styleKeywords: ["fresh", "daytime", "clean", "playful", "outdoor"],
    faq: baseFaq("Holi"),
  },
  {
    slug: "perfume-for-eid",
    title: "Best Perfume for Eid in India: Elegant, Refined Fragrance Recommendations",
    metaTitle: "Perfume For Eid | Elegant and Sophisticated Picks",
    metaDescription:
      "Choose the best perfume for Eid with elegant, refined, and long-lasting scent profiles. Ideal for prayer, family gatherings, and festive evenings.",
    festivalName: "Eid",
    intro:
      "Eid calls for graceful and polished fragrances that feel respectful during daytime prayers and celebratory in evening gatherings. This page helps you choose balanced perfumes that feel sophisticated, memorable, and comfortable for long festive schedules.",
    focusKeywords: ["rose", "oud", "musk", "amber", "frankincense", "cardamom"],
    styleKeywords: ["elegant", "refined", "graceful", "classic", "premium"],
    faq: baseFaq("Eid"),
  },
  {
    slug: "perfume-for-rakhi",
    title: "Best Perfume for Rakhi: Family-Friendly Fragrances for Day to Evening",
    metaTitle: "Perfume For Rakhi | Family-Friendly Long Lasting Scents",
    metaDescription:
      "Find the best perfume for Rakhi celebrations with family-friendly, versatile scent profiles that stay fresh from morning rituals to evening outings.",
    festivalName: "Rakhi",
    intro:
      "Rakhi is personal and family-centric, so the ideal scent should be warm, approachable, and versatile. You need a fragrance that stays balanced through rituals, meals, photos, and evening visits without feeling too loud in close indoor settings.",
    focusKeywords: ["floral", "musk", "citrus", "woods", "amber", "lavender"],
    styleKeywords: ["family-friendly", "versatile", "soft-projection", "clean", "warm"],
    faq: baseFaq("Rakhi"),
  },
  {
    slug: "perfume-for-karwa-chauth",
    title: "Best Perfume for Karwa Chauth: Romantic Evening Fragrance Guide",
    metaTitle: "Perfume For Karwa Chauth | Romantic and Elegant Perfumes",
    metaDescription:
      "Explore romantic and elegant perfumes for Karwa Chauth celebrations. Long-lasting profiles for evening events, dinners, and intimate settings.",
    festivalName: "Karwa Chauth",
    intro:
      "Karwa Chauth celebrations often transition into romantic evening moments, so fragrance selection should combine elegance with intimacy. This guide focuses on scents that feel polished in traditional attire and attractive in close conversation settings.",
    focusKeywords: ["rose", "vanilla", "amber", "musk", "saffron", "sandalwood"],
    styleKeywords: ["romantic", "evening", "intimate", "elegant", "feminine"],
    faq: baseFaq("Karwa Chauth"),
  },
  {
    slug: "perfume-for-navratri",
    title: "Best Perfume for Navratri: Energetic, Lasting Fragrances for Long Nights",
    metaTitle: "Perfume For Navratri | Fragrances for Garba and Dandiya Nights",
    metaDescription:
      "Choose the best perfume for Navratri nights. Energetic and long-lasting fragrances for Garba, Dandiya, and festive social events.",
    festivalName: "Navratri",
    intro:
      "Navratri events are high-energy and movement-heavy, especially during Garba and Dandiya nights. You need fragrances that open fresh but hold structure in the base so they remain noticeable through long hours of activity and social interaction.",
    focusKeywords: ["citrus", "spices", "amberwood", "musk", "patchouli", "lavender"],
    styleKeywords: ["energetic", "long-nights", "vibrant", "crowd-safe", "lasting"],
    faq: baseFaq("Navratri"),
  },
  {
    slug: "perfume-for-durga-puja",
    title: "Best Perfume for Durga Puja: Day-to-Night Festive Scent Guide",
    metaTitle: "Perfume For Durga Puja | Elegant Day To Night Fragrances",
    metaDescription:
      "Find the best perfume for Durga Puja with day-to-night longevity. Balanced fragrances for pandal hopping, gatherings, and festive celebrations.",
    festivalName: "Durga Puja",
    intro:
      "Durga Puja celebrations span multiple hours and locations, from pandal visits to social dinners. Your fragrance should transition smoothly from daytime freshness to evening depth while staying comfortable in crowds and humid weather.",
    focusKeywords: ["jasmine", "rose", "cedar", "amber", "musk", "patchouli"],
    styleKeywords: ["day-to-night", "balanced", "festive", "social", "refined"],
    faq: baseFaq("Durga Puja"),
  },
  {
    slug: "perfume-for-christmas",
    title: "Best Perfume for Christmas in India: Cozy and Festive Scent Picks",
    metaTitle: "Perfume For Christmas | Cozy Festive Fragrance Guide",
    metaDescription:
      "Explore cozy, festive perfumes for Christmas parties and dinners. Long-lasting warm scent profiles ideal for holiday celebrations in India.",
    festivalName: "Christmas",
    intro:
      "Christmas fragrance style leans cozy, warm, and celebratory. In India, temperatures vary by city, so choose a scent that offers festive richness without becoming too dense indoors. This guide helps you pick profiles that feel modern, joyful, and memorable.",
    focusKeywords: ["cinnamon", "vanilla", "tobacco", "amber", "coffee", "woods"],
    styleKeywords: ["cozy", "holiday", "warm", "party-ready", "comforting"],
    faq: baseFaq("Christmas"),
  },
  {
    slug: "perfume-for-new-year",
    title: "Best Perfume for New Year Parties: Bold, Premium, Long-Lasting Scents",
    metaTitle: "Perfume For New Year | Party Fragrances for Men and Women",
    metaDescription:
      "Pick the best perfume for New Year celebrations. Bold, premium, long-lasting fragrances for parties, events, and late-night occasions.",
    festivalName: "New Year",
    intro:
      "New Year events are statement moments, so your fragrance should have confidence, projection, and longevity. Whether you attend a formal dinner or high-energy party, this guide helps you choose a profile that stands out while remaining polished.",
    focusKeywords: ["ambroxan", "woods", "leather", "oud", "spices", "musk"],
    styleKeywords: ["bold", "night-out", "premium", "statement", "party"],
    faq: baseFaq("New Year"),
  },
  {
    slug: "perfume-for-valentines-day",
    title: "Best Perfume for Valentine's Day: Romantic Fragrance Guide for Couples",
    metaTitle: "Perfume For Valentine's Day | Romantic Fragrance Picks",
    metaDescription:
      "Find romantic perfumes for Valentine's Day dates. Intimate, elegant, and long-lasting fragrance recommendations for memorable evenings.",
    festivalName: "Valentine's Day",
    intro:
      "Valentine's Day fragrances should be intimate and magnetic rather than overpowering. The right scent builds comfort and attraction over time, especially in close settings like dinners, drives, and evening walks.",
    focusKeywords: ["rose", "vanilla", "musk", "amber", "patchouli", "sandalwood"],
    styleKeywords: ["romantic", "date-night", "intimate", "smooth", "attractive"],
    faq: baseFaq("Valentine's Day"),
  },
  ...buildBudgetEntries(),
  ...buildOccasionEntries(),
  ...buildInspiredPerfumeEntries(),
];

export function getFestivalSeoEntry(slug: string): FestivalSeoEntry | null {
  return FESTIVAL_SEO_PAGES.find((entry) => entry.slug === slug) ?? null;
}

export function getFestivalSeoSlugs(): string[] {
  return FESTIVAL_SEO_PAGES.map((entry) => entry.slug);
}

export function buildFestivalLongContent(entry: FestivalSeoEntry): Array<{ heading: string; text: string }> {
  const keywordLine = entry.focusKeywords.join(", ");
  const styleLine = entry.styleKeywords.join(", ");

  return [
    {
      heading: `How To Choose The Right ${entry.festivalName} Perfume`,
      text: `Choosing fragrance for ${entry.festivalName} starts with context, not trend. You need to map your scent profile to timing, venue, and how long you expect to stay out. In India, festive plans often begin in the day and continue into evening, so top notes alone are never enough. Start with a profile that opens clean and inviting, then confirm the base has enough body to survive heat, humidity, food aromas, and crowd movement. For ${entry.festivalName}, focus on notes like ${keywordLine}. These notes create emotional familiarity while still feeling premium. Also prioritize wearability: your fragrance should be noticeable at social distance but never suffocating in close family conversations. A strong festive scent is one that feels intentional, lasts through transitions, and still smells elegant in the final hour of your celebration.`,
    },
    {
      heading: "Why Concentration Matters In Indian Weather",
      text: `A major reason people feel disappointed with festive perfumes is concentration mismatch. Many buyers unknowingly wear light EDT-style blends in demanding weather, then assume the fragrance is bad when performance drops in 2–3 hours. For festival days, an EDP profile is more practical because it holds structure under pressure. The objective is not to smell stronger at minute one; it is to smell consistent at hour six. If your calendar includes travel, outfit changes, crowded venues, and long ceremonies, you need a fragrance architecture that survives all of it. This means top-note sparkle supported by stable heart and base construction. During ${entry.festivalName}, look for compositions that begin clean, transition gracefully, and avoid harsh synthetic sharpness when skin heats up. That’s the difference between “good opening” and “all-day signature.”`,
    },
    {
      heading: "Daytime vs Evening Strategy",
      text: `Most festive fragrance mistakes happen because one scent is forced into every setting. A better strategy is to choose one profile that adapts naturally from day to evening. Daytime calls for clarity and polish; evening allows slightly deeper character. The easiest way to handle both is to pick a balanced scent family and modulate spray count. Use fewer sprays for rituals, family brunches, and close indoor moments. Add a controlled top-up before evening gatherings if needed. For ${entry.festivalName}, this approach helps you stay fresh without restarting the fragrance story completely. Think of your perfume as part of styling, just like fabric and accessories. It should support mood shifts throughout the day. In practical terms, that means avoiding extremely sharp freshies and extremely sweet bombs; choose the middle ground with structure, softness, and staying power.`,
    },
    {
      heading: "Fragrance Pairing With Traditional And Modern Outfits",
      text: `Your perfume should complement fabric texture, color palette, and event mood. Rich traditional attire with embroidery and warm tones generally pairs better with amber, woods, spice, and soft resin notes. Lighter modern outfits or daytime pastel looks usually benefit from citrus-aromatic openings and clean musk trails. During ${entry.festivalName}, people move across multiple dress codes in a single day, so flexibility matters. If you can only wear one fragrance, pick a profile with smooth transitions rather than abrupt changes. A scent that starts crisp but settles into warm woods is usually safer than one-dimensional profiles. Fragrance pairing is also social positioning: your scent should communicate grooming and taste before anyone asks what you are wearing. That subtle impression is often more valuable than brute projection.`,
    },
    {
      heading: "Projection, Compliments, And Social Comfort",
      text: `Compliment-worthy fragrance is rarely the loudest fragrance in the room. The best festive perfumes project just enough to be remembered but stay refined in close interactions. During ${entry.festivalName}, you’ll likely meet family, friends, elders, and new people across different settings, so social comfort should be a design rule. Avoid over-spraying sweet-heavy formulas that become dense indoors. Instead, target pulse points strategically and include one light fabric spray if your fragrance allows. This gives you a stable aura while reducing the risk of olfactory fatigue. Another practical tip: test your perfume in motion, not just in front of a mirror. Walk, sit, and re-enter the room after ten minutes. If it still feels elegant and controlled, you have the right performance profile for festive use.`,
    },
    {
      heading: "Budget Logic: Luxury Feel Without Luxury Markup",
      text: `Festive seasons involve gifting, travel, outfits, and hosting costs, so fragrance budget discipline matters. Paying only for a label rarely improves experience if the profile does not suit climate and wear style. The better approach is value engineering: prioritize scent architecture, concentration, and how naturally the fragrance develops on skin. For ${entry.festivalName}, this lets you achieve premium impression without overspending. You can redirect savings toward gifting, accessories, or second-scent rotation. Practical buyers compare longevity per rupee, not just brand prestige. If a fragrance gives polished opening, smooth heart, and reliable base performance across 8–10 hours, it has already met the core luxury criteria that most users actually feel in real life.`,
    },
    {
      heading: "Recommended Fragrance Styles For This Festival",
      text: `For ${entry.festivalName}, the strongest-performing styles are: ${styleLine}. These styles work because they handle crowd environments, mixed temperatures, and long wear windows without collapsing. You can choose fresh-aromatic blends when your schedule is daytime heavy, or shift toward woody-amber depth for evening-first plans. If your event includes photography, greeting lines, and indoor dining, balanced projection is essential. If your plans are mostly open-air and active, prioritize longer dry-down support. The recommendation products below are selected from HUME’s catalogue to match these festival-use conditions. They are meant to reduce guesswork: each option is practical for Indian wear, festive pacing, and real social settings where fragrance needs to perform beyond the first impression.`,
    },
    {
      heading: "How To Apply For 8–10 Hour Festive Performance",
      text: `Application technique can improve perceived performance as much as formula selection. Start with moisturized skin, then spray on neck sides, upper chest, and wrists. Do not rub, because friction disturbs top-note evaporation and can flatten evolution. If you wear layered outfits during ${entry.festivalName}, use one light spray on inner fabric (after patch test) to extend scent memory through movement. For evening extensions, add a single re-spray rather than restarting with multiple bursts. Store your bottle away from sunlight and heat to preserve quality across the season. These simple habits make a measurable difference in longevity, clarity, and projection consistency.`,
    },
    {
      heading: "Mistakes To Avoid During Festival Wear",
      text: `Common festive mistakes include choosing a fragrance only by top-note test strip, over-spraying before entering crowded spaces, and mixing heavily scented personal care products with perfume. Another issue is copying someone else’s “best perfume” without matching it to your body chemistry and event type. For ${entry.festivalName}, avoid extremes: very sharp citrus with no base support, or very sweet dense formulas for daytime family rituals. Also avoid testing and buying on the same day if possible; give fragrances at least one full dry-down cycle. Smart selection is about stability, comfort, and memorability over time. When those three align, your scent supports your presence instead of competing with it.`,
    },
    {
      heading: "Final Take: Build A Repeatable Festival Fragrance System",
      text: `The best way to win festive fragrance decisions is to treat them as a system: one versatile signature, one optional alternate profile, and a clear application method. This keeps choices simple while giving enough flexibility for changing plans. For ${entry.festivalName}, use the recommendation block below to shortlist products that fit real Indian conditions and social use-cases. From there, compare based on your preferred note direction, projected wear duration, and occasion mix. Done correctly, your perfume becomes a reliable style anchor across the entire festive calendar—not just a one-day purchase. That is how you turn fragrance from impulse buying into dependable personal branding.`,
    },
  ];
}

function buildBudgetEntries(): FestivalSeoEntry[] {
  const budgetSlugs = [
    "perfume-under-199",
    "perfume-under-299",
    "perfume-under-399",
    "perfume-under-499",
    "perfume-under-500",
    "perfume-under-599",
    "perfume-under-699",
    "perfume-under-799",
    "perfume-under-899",
    "perfume-under-999",
    "perfume-under-1000",
    "perfume-under-1200",
    "perfume-under-1500",
    "perfume-under-2000",
    "perfume-under-3000",
    "best-perfume-under-500-india",
    "best-perfume-under-1000-india",
    "best-perfume-under-1500-india",
    "best-perfume-under-2000-india",
    "best-budget-perfume-men-india",
  ];

  const parseBudget = (slug: string): number | null => {
    const match = slug.match(/under-(\d+)/);
    if (!match) return null;
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  };

  const titleForSlug = (slug: string, budget: number | null) => {
    if (slug === "best-budget-perfume-men-india") {
      return "Best Budget Perfume for Men in India (2026 Buying Guide)";
    }
    if (slug.startsWith("best-perfume-under")) {
      return `Best Perfume Under ₹${budget} in India (2026 Value Guide)`;
    }
    return `Best Perfume Under ₹${budget} in India (2026 Budget Fragrance Guide)`;
  };

  const descriptionForBudget = (budget: number | null) =>
    `Discover the best perfumes under ₹${budget} in India. Compare long-lasting budget fragrances with premium-inspired profiles and practical buying tips.`;

  return budgetSlugs.map((slug) => {
    const budget = parseBudget(slug);
    const budgetLabel = budget ? `₹${budget}` : "Budget";
    const isMenIntent = slug.includes("men");

    return {
      slug,
      title: titleForSlug(slug, budget),
      metaTitle: titleForSlug(slug, budget),
      metaDescription:
        slug === "best-budget-perfume-men-india"
          ? "Find the best budget perfumes for men in India with strong performance, modern scent profiles, and practical value under popular price points."
          : descriptionForBudget(budget),
      festivalName: `Budget ${budgetLabel}`,
      intro:
        slug === "best-budget-perfume-men-india"
          ? "Buying a strong men’s fragrance on a budget is about profile quality, projection control, and real longevity in Indian weather—not only brand tags. This guide helps you choose practical options that smell premium without overspending."
          : `If you are shopping for perfume under ${budgetLabel}, the goal is maximum scent quality per rupee. This guide breaks down how to choose long-lasting, premium-feel fragrances within your budget while avoiding weak formulations and short-lived blends.`,
      focusKeywords: isMenIntent
        ? ["ambroxan", "woods", "citrus", "musk", "spices", "leather"]
        : ["amber", "musk", "citrus", "lavender", "woods", "vanilla"],
      styleKeywords: ["budget", "value", "long-lasting", "daily-wear", "premium-inspired"],
      faq: [
        {
          question: `Can I get a good perfume under ${budgetLabel} in India?`,
          answer:
            `Yes. Focus on balanced scent construction and EDP-style performance. Even under ${budgetLabel}, you can find fragrances with strong character and practical longevity.`,
        },
        {
          question: "How do I compare perfumes in a budget range?",
          answer:
            "Compare by wear time, dry-down quality, and projection comfort. Price alone is not enough—judge how natural the fragrance smells after 2–3 hours.",
        },
        {
          question: "Which notes usually perform better in budget perfumes?",
          answer:
            "Amber, woods, musks, and selected spice accords generally hold longer than very top-heavy citrus formulas, especially in Indian heat.",
        },
        {
          question: "Is budget perfume suitable for office and daily wear?",
          answer:
            "Yes. Choose a fresh-woody or aromatic profile with moderate projection. These are safer in close environments and still leave a polished impression.",
        },
        {
          question: "How many sprays should I apply for best value?",
          answer:
            "Use 3–5 sprays depending on setting. Controlled application gives better perception and avoids overusing fragrance, improving bottle life and value.",
        },
      ],
    };
  });
}

function buildOccasionEntries(): FestivalSeoEntry[] {
  const occasionSlugs = [
    "perfume-for-office",
    "best-office-perfume-men",
    "perfume-for-date-night",
    "best-date-night-perfume-men",
    "perfume-for-college",
    "perfume-for-wedding",
    "perfume-for-party",
    "perfume-for-gym",
    "perfume-for-travel",
    "perfume-for-clubbing",
    "perfume-for-daily-use",
    "perfume-for-first-date",
    "perfume-for-interview",
    "perfume-for-meeting",
    "perfume-for-romantic-evening",
    "perfume-for-night-out",
    "perfume-for-festival",
    "perfume-for-teenage-boys",
    "perfume-for-young-men",
    "perfume-for-college-guys",
    "perfume-for-working-men",
    "perfume-for-men-25-30",
    "perfume-for-men-30-plus",
    "perfume-for-groom",
    "perfume-for-students",
    "perfume-for-businessmen",
    "perfume-for-daily-office-men",
    "summer-perfume-men-india",
    "winter-perfume-men-india",
    "rainy-season-perfume",
    "hot-weather-perfume",
    "humid-weather-perfume",
    "long-lasting-summer-perfume",
    "best-winter-perfume-men",
    "fresh-perfume-for-summer",
    "cooling-perfume-for-summer",
    "heat-resistant-perfume",
    "woody-perfume-men",
    "sweet-perfume-men",
    "fresh-perfume-men",
    "musky-perfume-men",
    "spicy-perfume-men",
    "citrus-perfume-men",
    "floral-perfume-men",
    "oud-perfume-men",
    "vanilla-perfume-men",
    "aquatic-perfume-men",
    "amber-perfume-men",
    "leather-perfume-men",
    "sandalwood-perfume-men",
    "long-lasting-perfume-men-india",
    "extreme-long-lasting-perfume",
    "12-hour-lasting-perfume",
    "24-hour-lasting-perfume",
    "strong-projection-perfume",
    "high-sillage-perfume",
    "beast-mode-perfume",
    "best-performance-perfume",
    "most-powerful-perfume-men",
    "perfume-that-lasts-all-day",
    "best-perfume-for-men-india",
    "top-10-perfumes-for-men-india",
    "best-budget-perfume-men",
    "top-perfumes-under-1000",
    "best-smelling-perfume-men",
    "most-complimented-perfume-men",
    "perfume-that-smells-expensive",
    "perfume-that-gets-compliments",
    "perfume-women-love-on-men",
    "signature-scent-for-men",
    "how-to-apply-perfume",
    "how-to-make-perfume-last-longer",
    "where-to-spray-perfume",
    "perfume-notes-explained",
    "perfume-layering-guide",
    "how-to-choose-perfume",
    "how-to-store-perfume",
  ];

  const titleMap: Record<string, string> = {
    "perfume-for-office": "Best Perfume for Office in India (Professional Daily Wear Guide)",
    "best-office-perfume-men": "Best Office Perfume for Men (2026 Professional Fragrance Guide)",
    "perfume-for-date-night": "Best Perfume for Date Night: Attractive and Long-Lasting Picks",
    "best-date-night-perfume-men": "Best Date Night Perfume for Men (Romantic Evening Guide)",
    "perfume-for-college": "Best Perfume for College Students in India (Fresh Daily Scents)",
    "perfume-for-wedding": "Best Perfume for Wedding Events: Elegant Day-to-Night Fragrances",
    "perfume-for-party": "Best Perfume for Party Nights: Strong and Noticeable Fragrance Picks",
    "perfume-for-gym": "Best Perfume for Gym and Post-Workout Freshness (India Guide)",
    "perfume-for-travel": "Best Perfume for Travel: Long-Lasting and Versatile Scent Guide",
    "perfume-for-clubbing": "Best Perfume for Clubbing: Bold Projection Fragrances for Men",
    "perfume-for-daily-use": "Best Perfume for Daily Use in India (All-Season Practical Guide)",
    "perfume-for-first-date": "Best Perfume for First Date: Clean, Attractive, Safe Choices",
    "perfume-for-interview": "Best Perfume for Interview: Professional and Non-Offensive Picks",
    "perfume-for-meeting": "Best Perfume for Meetings: Polished, Controlled Projection Fragrances",
    "perfume-for-romantic-evening": "Best Perfume for Romantic Evening: Smooth and Memorable Scents",
    "perfume-for-night-out": "Best Perfume for Night Out: Long-Lasting Statement Fragrances",
    "perfume-for-festival": "Best Perfume for Festivals in India (Complete Occasion Guide)",
    "perfume-for-teenage-boys": "Best Perfume for Teenage Boys (Fresh and Safe Daily Picks)",
    "perfume-for-young-men": "Best Perfume for Young Men in India (Modern Signature Guide)",
    "perfume-for-college-guys": "Best Perfume for College Guys (Affordable Long-Lasting Picks)",
    "perfume-for-working-men": "Best Perfume for Working Men (Professional Daily Wear Guide)",
    "perfume-for-men-25-30": "Best Perfume for Men 25-30 (Versatile Premium-Inspired Picks)",
    "perfume-for-men-30-plus": "Best Perfume for Men 30 Plus (Mature and Refined Fragrance Guide)",
    "perfume-for-groom": "Best Perfume for Groom (Wedding Day Signature Scent Guide)",
    "perfume-for-students": "Best Perfume for Students in India (Budget Daily Fragrance Guide)",
    "perfume-for-businessmen": "Best Perfume for Businessmen (Executive and Boardroom-Ready Picks)",
    "perfume-for-daily-office-men": "Best Perfume for Daily Office Men (Clean Professional Fragrances)",
    "summer-perfume-men-india": "Best Summer Perfume for Men in India (2026 Heat-Ready Guide)",
    "winter-perfume-men-india": "Best Winter Perfume for Men in India (Warm Long-Lasting Picks)",
    "rainy-season-perfume": "Best Perfume for Rainy Season (Monsoon Fragrance Guide)",
    "hot-weather-perfume": "Best Perfume for Hot Weather in India (Fresh and Stable Scents)",
    "humid-weather-perfume": "Best Perfume for Humid Weather (Long-Lasting India Guide)",
    "long-lasting-summer-perfume": "Long Lasting Summer Perfume (India Performance Guide)",
    "best-winter-perfume-men": "Best Winter Perfume for Men (Evening and Daily Wear Guide)",
    "fresh-perfume-for-summer": "Best Fresh Perfume for Summer (Clean Cooling Fragrance Picks)",
    "cooling-perfume-for-summer": "Best Cooling Perfume for Summer in India (Heat Comfort Guide)",
    "heat-resistant-perfume": "Best Heat Resistant Perfume (Indian Summer Longevity Guide)",
    "woody-perfume-men": "Best Woody Perfume for Men in India (Refined Daily and Evening Guide)",
    "sweet-perfume-men": "Best Sweet Perfume for Men (Balanced and Wearable Picks)",
    "fresh-perfume-men": "Best Fresh Perfume for Men in India (Clean Signature Guide)",
    "musky-perfume-men": "Best Musky Perfume for Men (Clean Skin-Scent Style Guide)",
    "spicy-perfume-men": "Best Spicy Perfume for Men (Warm Bold Fragrance Guide)",
    "citrus-perfume-men": "Best Citrus Perfume for Men in India (Fresh Heat-Friendly Picks)",
    "floral-perfume-men": "Best Floral Perfume for Men (Modern Masculine Floral Guide)",
    "oud-perfume-men": "Best Oud Perfume for Men in India (Bold and Premium Guide)",
    "vanilla-perfume-men": "Best Vanilla Perfume for Men (Warm Attractive Scent Guide)",
    "aquatic-perfume-men": "Best Aquatic Perfume for Men (Fresh Marine Fragrance Guide)",
    "amber-perfume-men": "Best Amber Perfume for Men (Rich Evening Wear Guide)",
    "leather-perfume-men": "Best Leather Perfume for Men (Bold Signature Fragrance Guide)",
    "sandalwood-perfume-men": "Best Sandalwood Perfume for Men in India (Smooth Woody Guide)",
    "long-lasting-perfume-men-india": "Best Long Lasting Perfume for Men in India (8-12 Hour Guide)",
    "extreme-long-lasting-perfume": "Best Extreme Long Lasting Perfume (Performance-First Guide)",
    "12-hour-lasting-perfume": "Best 12 Hour Lasting Perfume (Reliable All-Day Performance)",
    "24-hour-lasting-perfume": "Best 24 Hour Lasting Perfume (High-Endurance Fragrance Guide)",
    "strong-projection-perfume": "Best Strong Projection Perfume (Noticeable Yet Refined Picks)",
    "high-sillage-perfume": "Best High Sillage Perfume (Trail-Focused Fragrance Guide)",
    "beast-mode-perfume": "Best Beast Mode Perfume (Maximum Performance Guide)",
    "best-performance-perfume": "Best Performance Perfume (Longevity + Projection Buying Guide)",
    "most-powerful-perfume-men": "Most Powerful Perfume for Men (Bold Performance Picks)",
    "perfume-that-lasts-all-day": "Best Perfume That Lasts All Day (Indian Weather Guide)",
    "best-perfume-for-men-india": "Best Perfume for Men in India (Complete 2026 Buying Guide)",
    "top-10-perfumes-for-men-india": "Top 10 Perfumes for Men in India (Expert Picks 2026)",
    "best-budget-perfume-men": "Best Budget Perfume for Men (Value + Performance Guide)",
    "top-perfumes-under-1000": "Top Perfumes Under ₹1000 in India (Best Value Picks)",
    "best-smelling-perfume-men": "Best Smelling Perfume for Men (Mass-Appeal Fragrance Guide)",
    "most-complimented-perfume-men": "Most Complimented Perfume for Men (Attraction-Focused Picks)",
    "perfume-that-smells-expensive": "Perfume That Smells Expensive (Luxury Impression Guide)",
    "perfume-that-gets-compliments": "Perfume That Gets Compliments (Top Crowd-Pleasing Scents)",
    "perfume-women-love-on-men": "Perfume Women Love on Men (Most Attractive Profiles)",
    "signature-scent-for-men": "How to Choose a Signature Scent for Men (Practical Guide)",
    "how-to-apply-perfume": "How to Apply Perfume Correctly (Step-by-Step Guide)",
    "how-to-make-perfume-last-longer": "How to Make Perfume Last Longer (Indian Climate Guide)",
    "where-to-spray-perfume": "Where to Spray Perfume for Best Longevity and Projection",
    "perfume-notes-explained": "Perfume Notes Explained: Top, Heart, and Base Notes",
    "perfume-layering-guide": "Perfume Layering Guide (How to Layer Fragrances Properly)",
    "how-to-choose-perfume": "How to Choose Perfume (Beginner to Advanced Buying Guide)",
    "how-to-store-perfume": "How to Store Perfume Correctly (Preserve Quality Longer)",
  };

  const introMap: Record<string, string> = {
    "perfume-for-office":
      "Office fragrance should project confidence without overwhelming close spaces. This guide helps you pick clean, professional profiles that stay present through long workdays.",
    "best-office-perfume-men":
      "Men’s office perfumes should be polished, modern, and meeting-safe. You need balanced projection, smooth dry-down, and real performance in Indian climate.",
    "perfume-for-date-night":
      "Date-night fragrance should feel magnetic and intimate. This guide covers scent profiles that create warmth and attraction without turning loud.",
    "best-date-night-perfume-men":
      "The best date fragrances for men combine clean opening with sensual depth. Here’s how to choose one that performs from dinner to late evening.",
    "perfume-for-college":
      "College perfumes should be fresh, affordable, and versatile for classes, outings, and casual plans. This page focuses on wearable profiles with good longevity.",
    "perfume-for-wedding":
      "Wedding events need fragrance that transitions from ceremony to reception. This guide helps you choose elegant profiles for traditional and modern outfits.",
    "perfume-for-party":
      "Party scents need stronger projection and memorable character. Here are profiles that stand out in social spaces while remaining smooth on skin.",
    "perfume-for-gym":
      "Gym use requires very clean and controlled scents. This page focuses on fresh profiles suitable for post-workout, commute, and casual daytime wear.",
    "perfume-for-travel":
      "Travel fragrances should be versatile across airports, hotels, meetings, and dinners. Choose adaptable profiles that stay pleasant in changing weather.",
    "perfume-for-clubbing":
      "Clubbing perfumes should cut through noise, heat, and movement. This guide covers bold night profiles with better staying power and attention value.",
    "perfume-for-daily-use":
      "Daily-use fragrance should be easy, consistent, and season-proof. You need a profile that works for office, errands, and evening plans without switching bottles.",
    "perfume-for-first-date":
      "First-date scent should be safe, clean, and attractive at close range. This guide helps avoid overprojection while keeping a memorable signature.",
    "perfume-for-interview":
      "Interview fragrance should communicate professionalism and grooming. Pick subtle but refined scents that never distract in formal settings.",
    "perfume-for-meeting":
      "Meeting-friendly fragrances require controlled projection and polished tone. This page helps you choose profiles that support executive presence.",
    "perfume-for-romantic-evening":
      "Romantic evening perfumes should feel warm, smooth, and intimate. You need a dry-down that stays appealing over time, not just a sharp opening.",
    "perfume-for-night-out":
      "Night-out fragrances should feel confident and noticeable. This guide covers statement profiles with strong performance for late social settings.",
    "perfume-for-festival":
      "Festival occasions need fragrance versatility from day rituals to evening gatherings. This guide helps you choose festive profiles with practical longevity.",
    "perfume-for-teenage-boys":
      "Teenage fragrance should be clean, easy, and age-appropriate. This guide covers safe daily profiles that feel fresh without being too heavy or sharp.",
    "perfume-for-young-men":
      "Young men need fragrances that feel modern, energetic, and versatile across college, work, and social time. This guide focuses on practical signature options.",
    "perfume-for-college-guys":
      "College guys need affordable fragrances with decent performance and strong wearability. This page helps pick profiles that stay fresh through classes and outings.",
    "perfume-for-working-men":
      "Working men need polished fragrances that survive office hours and commute. This guide focuses on clean projection and reliable day-long performance.",
    "perfume-for-men-25-30":
      "Men aged 25-30 often need one fragrance that works for work, social plans, and dates. This guide helps you choose balanced profiles with mature character.",
    "perfume-for-men-30-plus":
      "Men 30+ usually prefer refined profiles with depth and control. This guide focuses on sophisticated fragrances that feel confident and premium.",
    "perfume-for-groom":
      "A groom’s fragrance should be memorable, elegant, and camera-day ready. This guide helps choose long-lasting scents for ceremony to reception transitions.",
    "perfume-for-students":
      "Students need value-first fragrances that are fresh, crowd-safe, and easy to wear daily. This page helps shortlist budget-friendly long-lasting options.",
    "perfume-for-businessmen":
      "Businessmen need executive fragrances with controlled projection and strong identity. This guide covers boardroom-appropriate profiles with premium tone.",
    "perfume-for-daily-office-men":
      "Daily office fragrances for men should be clean, dependable, and non-offensive. This guide helps choose practical scent profiles for regular professional wear.",
    "summer-perfume-men-india":
      "Summer fragrance for Indian men should be fresh but not weak. This guide focuses on profiles that remain clean and noticeable in high temperatures.",
    "winter-perfume-men-india":
      "Winter allows richer fragrance depth. This guide helps men choose warm profiles that project smoothly in cooler weather and evening settings.",
    "rainy-season-perfume":
      "Monsoon weather can mute or distort weak scents. This guide covers balanced fragrances that stay pleasant in damp and shifting conditions.",
    "hot-weather-perfume":
      "In hot weather, heavy sweet notes can become cloying. This page helps you choose breathable compositions with better comfort and longevity.",
    "humid-weather-perfume":
      "Humidity challenges fragrance stability. This guide focuses on scent structures that hold shape in coastal and monsoon-heavy Indian conditions.",
    "long-lasting-summer-perfume":
      "Summer longevity needs smart base support, not just citrus top notes. This guide shows how to pick scents that survive heat and movement.",
    "best-winter-perfume-men":
      "Winter men’s fragrances should feel warm, confident, and refined. This page covers profiles ideal for office evenings, dinners, and social events.",
    "fresh-perfume-for-summer":
      "Fresh summer perfumes should feel cooling and professional while retaining enough base depth to avoid quick fade-out.",
    "cooling-perfume-for-summer":
      "Cooling summer scents combine citrus, minty freshness, and clean musks. This guide helps you choose options that remain wearable all day.",
    "heat-resistant-perfume":
      "Heat-resistant perfumes are designed around stronger dry-down performance. This guide helps identify profiles that stay stable in Indian summers.",
    "woody-perfume-men":
      "Woody perfumes offer sophistication and versatility. This guide helps men choose cedar, sandalwood, and dry-wood profiles that feel refined across occasions.",
    "sweet-perfume-men":
      "Sweet men’s fragrances should feel smooth, not sugary. This guide helps pick wearable sweet profiles with balanced projection and modern appeal.",
    "fresh-perfume-men":
      "Fresh men’s perfumes are ideal for daily wear when they include a stable base. This guide covers clean profiles that stay noticeable without being loud.",
    "musky-perfume-men":
      "Musky fragrances create a clean skin-like signature. This page focuses on smooth musky profiles that feel intimate and professional.",
    "spicy-perfume-men":
      "Spicy perfumes bring warmth and character. This guide helps choose modern spice-forward profiles suitable for evenings and cooler settings.",
    "citrus-perfume-men":
      "Citrus perfumes should remain sharp and uplifting without fading too fast. This guide covers citrus-led profiles that perform in Indian climate.",
    "floral-perfume-men":
      "Modern floral perfumes for men are fresh, elegant, and highly wearable. This guide shows how to choose masculine floral blends confidently.",
    "oud-perfume-men":
      "Oud perfumes for men should be bold but wearable. This guide helps identify rich oud profiles with strong longevity and social comfort.",
    "vanilla-perfume-men":
      "Vanilla in men’s perfumery adds warmth and attraction when balanced correctly. This guide covers modern vanilla profiles for day-to-night use.",
    "aquatic-perfume-men":
      "Aquatic perfumes deliver marine freshness and clean character. This guide helps you pick aquatic profiles with better long-lasting performance.",
    "amber-perfume-men":
      "Amber fragrances provide depth, warmth, and premium feel. This guide focuses on rich amber profiles suitable for evenings and occasions.",
    "leather-perfume-men":
      "Leather perfumes project confidence and edge. This guide helps men choose wearable leather blends that stay refined, not harsh.",
    "sandalwood-perfume-men":
      "Sandalwood perfumes offer creamy woody elegance and calm projection. This guide helps pick smooth sandalwood-led profiles for Indian wear.",
    "long-lasting-perfume-men-india":
      "Long-lasting perfumes for Indian men need stronger base structure and balanced projection. This guide helps choose fragrances that stay present through full workdays.",
    "extreme-long-lasting-perfume":
      "Extreme longevity perfumes are built for endurance and consistency. This page helps identify profiles that hold shape for many hours.",
    "12-hour-lasting-perfume":
      "If your target is 12-hour wear, you need stable dry-down and controlled reapplication strategy. This guide covers practical high-longevity picks.",
    "24-hour-lasting-perfume":
      "24-hour performance claims depend on skin, fabric, and climate. This guide focuses on realistic methods and high-endurance fragrance profiles.",
    "strong-projection-perfume":
      "Strong projection perfumes should be noticeable without becoming harsh. This guide helps pick high-impact fragrances with social balance.",
    "high-sillage-perfume":
      "High sillage means a memorable scent trail. This page helps choose fragrances that leave presence while keeping composition smooth.",
    "beast-mode-perfume":
      "Beast mode perfumes prioritize power and endurance. This guide helps identify bold profiles suited for nightlife and cooler conditions.",
    "best-performance-perfume":
      "Performance perfumes combine longevity, projection, and dry-down quality. This guide helps compare options beyond marketing claims.",
    "most-powerful-perfume-men":
      "Powerful men’s perfumes create strong first impression and lasting trail. This guide covers high-impact profiles for confident wear.",
    "perfume-that-lasts-all-day":
      "All-day fragrance depends on formula and application method. This guide explains how to choose and apply perfumes for consistent full-day presence.",
    "best-perfume-for-men-india":
      "Finding the best perfume for men in India requires matching profile, concentration, and weather conditions. This guide helps you choose practical winners across occasions.",
    "top-10-perfumes-for-men-india":
      "This top-10 style guide focuses on men’s perfumes that balance scent quality, versatility, and performance in Indian climate.",
    "best-budget-perfume-men":
      "Budget perfumes for men can still smell premium when selected correctly. This page helps you maximize value without sacrificing performance.",
    "top-perfumes-under-1000":
      "Perfumes under ₹1000 need strict value filtering. This guide helps you choose options that remain wearable, pleasant, and practical.",
    "best-smelling-perfume-men":
      "Best-smelling men’s perfumes are usually the most balanced, not the loudest. This guide helps pick universally pleasant scent profiles.",
    "most-complimented-perfume-men":
      "Compliment-focused fragrances combine clean opening with attractive dry-down. This guide helps identify profiles that get noticed positively.",
    "perfume-that-smells-expensive":
      "An expensive-smelling perfume is about blend quality and smoothness, not just brand price. This guide helps you build luxury impression smartly.",
    "perfume-that-gets-compliments":
      "Fragrances that get compliments are generally crowd-safe, clean, and memorable. This guide helps pick profiles with high social acceptance.",
    "perfume-women-love-on-men":
      "This guide covers fragrance styles women generally find attractive on men, focusing on smooth projection and close-range appeal.",
    "signature-scent-for-men":
      "A signature scent should match your routine, style, and climate. This guide helps men choose one versatile fragrance for consistent identity.",
    "how-to-apply-perfume":
      "Correct perfume application improves both longevity and projection. This guide explains simple methods that work in Indian weather.",
    "how-to-make-perfume-last-longer":
      "If your perfume fades early, application strategy and skin prep are usually the issue. This guide gives practical fixes for longer wear.",
    "where-to-spray-perfume":
      "Spray placement changes how your fragrance evolves and projects. This guide explains pulse points, fabric use, and spray count.",
    "perfume-notes-explained":
      "Understanding perfume notes helps you buy better. This guide explains top, heart, and base notes with practical examples.",
    "perfume-layering-guide":
      "Layering perfume can improve uniqueness and longevity when done correctly. This guide covers safe, wearable layering combinations.",
    "how-to-choose-perfume":
      "Choosing perfume becomes easy when you evaluate note profile, occasion fit, and performance. This guide provides a clear decision framework.",
    "how-to-store-perfume":
      "Proper storage preserves fragrance quality over time. This guide explains how light, heat, and humidity impact perfume stability.",
  };

  const faqForOccasion = (occasionName: string): FestivalSeoFaq[] => [
    {
      question: `What fragrance style is best for ${occasionName}?`,
      answer:
        `For ${occasionName}, choose a profile that matches setting density and duration. Fresh-woody blends are safest for mixed environments, while deeper notes suit evenings.`,
    },
    {
      question: "How strong should projection be for this occasion?",
      answer:
        "Aim for moderate projection in professional settings and stronger projection only for nightlife scenarios. The best choice is noticeable but socially comfortable.",
    },
    {
      question: "Can one perfume handle both day and evening plans?",
      answer:
        "Yes, if it has a clean opening and a stable woody/musky base. You can adjust with spray count rather than switching fragrances.",
    },
    {
      question: "How can I improve fragrance longevity in India?",
      answer:
        "Use moisturized skin, spray pulse points, and add a light fabric spray when suitable. This improves consistency in heat and humidity.",
    },
    {
      question: "How many sprays are ideal?",
      answer:
        "Use 3–4 sprays for office/interview environments and 5–6 sprays for open-air or evening social events depending on fragrance strength.",
    },
  ];

  return occasionSlugs.map((slug) => {
    const menIntent = slug.includes("men") || slug.includes("office");
    const weatherIntent =
      slug.includes("summer") ||
      slug.includes("winter") ||
      slug.includes("rainy") ||
      slug.includes("humid") ||
      slug.includes("hot") ||
      slug.includes("heat");
    const noteIntent =
      slug.includes("woody") ||
      slug.includes("sweet") ||
      slug.includes("fresh") ||
      slug.includes("musky") ||
      slug.includes("spicy") ||
      slug.includes("citrus") ||
      slug.includes("floral") ||
      slug.includes("oud") ||
      slug.includes("vanilla") ||
      slug.includes("aquatic") ||
      slug.includes("amber") ||
      slug.includes("leather") ||
      slug.includes("sandalwood");
    const performanceIntent =
      slug.includes("long-lasting") ||
      slug.includes("lasting") ||
      slug.includes("projection") ||
      slug.includes("sillage") ||
      slug.includes("beast-mode") ||
      slug.includes("performance") ||
      slug.includes("powerful") ||
      slug.includes("all-day");
    const educationalIntent =
      slug.startsWith("how-to-") ||
      slug.startsWith("where-to-") ||
      slug.includes("explained") ||
      slug.includes("guide");
    const nightIntent =
      slug.includes("date") ||
      slug.includes("night") ||
      slug.includes("party") ||
      slug.includes("clubbing") ||
      slug.includes("romantic");
    const occasionName = slug
      .replace(/^best-/, "")
      .replace(/^perfume-for-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    const resolvedTitle =
      titleMap[slug] ??
      `Best ${occasionName} Perfume in India (2026 Guide)`;

    return {
      slug,
      title: resolvedTitle,
      metaTitle: resolvedTitle,
      metaDescription:
        `${resolvedTitle}. Discover long-lasting, premium-inspired fragrances with practical recommendations for Indian weather and real occasions.`,
      festivalName: occasionName,
      intro:
        introMap[slug] ??
        "Find practical fragrance recommendations for Indian weather with clear guidance on longevity, projection, and daily wearability.",
      focusKeywords: nightIntent
        ? ["amber", "vanilla", "woods", "musk", "spices", "leather"]
        : weatherIntent
          ? ["citrus", "marine", "mint", "lavender", "musk", "amberwood"]
          : educationalIntent
            ? ["perfume tips", "how to apply perfume", "longevity", "projection", "notes", "guide"]
          : performanceIntent
            ? ["long lasting", "projection", "sillage", "performance", "ambroxan", "woods"]
          : noteIntent
            ? ["woody", "fresh", "musk", "spice", "amber", "long-lasting"]
        : menIntent
          ? ["citrus", "lavender", "ambroxan", "cedar", "musk", "vetiver"]
          : ["citrus", "floral", "woods", "musk", "amber", "patchouli"],
      styleKeywords: nightIntent
        ? ["bold", "attractive", "evening", "long-lasting", "statement"]
        : weatherIntent
          ? ["seasonal", "fresh", "climate-ready", "long-lasting", "balanced"]
          : educationalIntent
            ? ["educational", "practical", "step-by-step", "beginner-friendly", "actionable"]
          : performanceIntent
            ? ["high-performance", "long-lasting", "projecting", "endurance", "power"]
          : noteIntent
            ? ["note-focused", "masculine", "wearable", "versatile", "premium-inspired"]
        : ["clean", "versatile", "professional", "daily-wear", "balanced"],
      faq: faqForOccasion(occasionName),
    };
  });
}

function buildInspiredPerfumeEntries(): FestivalSeoEntry[] {
  const inspiredSlugs = [
    "dior-sauvage-inspired-perfume",
    "creed-aventus-inspired-perfume",
    "creed-viking-inspired-perfume",
    "tom-ford-oud-wood-inspired-perfume",
    "tom-ford-ombre-leather-inspired-perfume",
    "bleu-de-chanel-inspired-perfume",
    "ysl-y-inspired-perfume",
    "versace-eros-inspired-perfume",
    "paco-rabanne-1-million-inspired-perfume",
    "armani-code-inspired-perfume",
    "creed-absolu-aventus-inspired-perfume",
    "hugo-boss-bottled-absolu-inspired-perfume",
    "french-avenue-liquid-brun-inspired-perfume",
    "dior-homme-parfum-inspired-perfume",
    "ysl-myslf-le-parfum-inspired-perfume",
    "amouage-outlands-inspired-perfume",
    "kilian-angels-share-paradis-inspired-perfume",
    "hermes-terre-d-hermes-intense-inspired-perfume",
    "jpg-le-male-elixir-absolu-inspired-perfume",
    "jpg-ultra-male-inspired-perfume",
    "jpg-le-beau-paradise-garden-inspired-perfume",
    "armani-acqua-di-gio-profondo-inspired-perfume",
    "byredo-bal-d-afrique-absolu-inspired-perfume",
    "creed-virgin-island-water-inspired-perfume",
    "viktor-rolf-spicebomb-extreme-inspired-perfume",
    "azzaro-most-wanted-parfum-inspired-perfume",
    "armaf-club-de-nuit-intense-man-inspired-perfume",
    "paco-rabanne-invictus-parfum-inspired-perfume",
    "rasasi-hawas-inspired-perfume",
    "rasasi-hawas-ice-inspired-perfume",
    "maison-crivelli-oud-marakuja-inspired-perfume",
    "parfums-de-marly-althair-inspired-perfume",
    "replica-jazz-club-inspired-perfume",
    "lv-imagination-inspired-perfume",
    "lv-ombre-nomade-inspired-perfume",
    "lv-afternoon-swim-inspired-perfume",
    "lv-city-of-stars-inspired-perfume",
    "valentino-born-in-roma-intense-inspired-perfume",
    "afnan-9pm-inspired-perfume",
    "afnan-9pm-night-out-inspired-perfume",
    "baccarat-rouge-540-inspired-perfume",
    "ysl-black-opium-inspired-perfume",
    "carolina-herrera-good-girl-inspired-perfume",
    "prada-paradoxe-inspired-perfume",
    "tom-ford-lost-cherry-inspired-perfume",
    "guerlain-shalimar-inspired-perfume",
  ];

  const inspiredFaq = (label: string): FestivalSeoFaq[] => [
    {
      question: `What is the best ${label} inspired perfume in India?`,
      answer:
        "The best pick depends on your preferred notes, projection style, and daily use case. This page lists practical HUME alternatives optimized for Indian weather.",
    },
    {
      question: "Will inspired perfumes last in Indian heat and humidity?",
      answer:
        "Yes, when the concentration and base-note structure are designed for local conditions. Focus on stable dry-down and balanced projection.",
    },
    {
      question: "Are these alternatives suitable for daily wear?",
      answer:
        "Yes. The recommendations prioritize versatility, social comfort, and reliable all-day wear across office, casual, and evening settings.",
    },
    {
      question: "Can I get similar scent DNA at a lower price?",
      answer:
        "That is the goal of inspired perfumery: preserve the recognizable scent direction while improving value and practicality for daily use.",
    },
    {
      question: "How many recommendations are shown on each page?",
      answer:
        "Each page shows up to 4 relevant HUME products. If an exact one is unavailable, close-profile alternatives are shown automatically.",
    },
  ];

  return inspiredSlugs.map((slug) => {
    const label = slug
      .replace(/-inspired-perfume$/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return {
      slug,
      title: `Best ${label} Inspired Perfume in India (2026 Guide)`,
      metaTitle: `${label} Inspired Perfume | Best Alternatives in India`,
      metaDescription:
        `Looking for ${label} inspired perfume in India? Explore top HUME alternatives with long-lasting performance, balanced projection, and premium scent profile.`,
      festivalName: label,
      intro:
        `${label} remains a popular scent profile, and many buyers in India want that same olfactory direction with better value. This page helps you compare HUME alternatives by smell style, wearability, and real-world performance in Indian weather.`,
      focusKeywords: ["inspired perfume", "alternative", "long lasting", "india", "edp", "luxury profile"],
      styleKeywords: ["premium-inspired", "versatile", "balanced", "long-lasting", "value"],
      faq: inspiredFaq(label),
    } satisfies FestivalSeoEntry;
  });
}
