"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PerfumeCard from "@/components/PerfumeCard";
import type { PerfumeData } from "@/data/perfumes";

type GenderPref = "Men" | "Women" | "Unisex" | "Any";
type VibePref = "Fresh" | "Woody" | "Sweet" | "Smoky" | "Floral";
type OccasionPref = "Daily" | "Date Night" | "Party" | "Summer" | "Winter";
type SillagePref = "Soft" | "Moderate" | "Strong";

type Answers = {
  gender: GenderPref | null;
  vibe: VibePref | null;
  occasion: OccasionPref | null;
  sillage: SillagePref | null;
};

const initialAnswers: Answers = {
  gender: null,
  vibe: null,
  occasion: null,
  sillage: null,
};

const vibeKeywords: Record<VibePref, string[]> = {
  Fresh: ["fresh", "bergamot", "lemon", "marine", "aquatic", "citrus", "mint"],
  Woody: ["woody", "cedar", "sandalwood", "vetiver", "oak", "birch"],
  Sweet: ["vanilla", "tonka", "amber", "sweet", "creamy"],
  Smoky: ["oud", "incense", "smoke", "leather", "tobacco"],
  Floral: ["rose", "jasmine", "floral", "lavender", "violet", "orange blossom"],
};

const occasionMatch: Record<OccasionPref, string[]> = {
  Daily: ["daily wear", "office", "casual"],
  "Date Night": ["date night", "evening"],
  Party: ["party", "night out"],
  Summer: ["summer", "spring"],
  Winter: ["winter", "autumn", "fall"],
};

function scorePerfume(perfume: PerfumeData, answers: Answers): number {
  let score = 0;

  if (answers.gender && answers.gender !== "Any") {
    if (perfume.gender === answers.gender || perfume.gender === "Unisex") score += 3;
    else score -= 1;
  }

  if (answers.vibe) {
    const blob = [
      perfume.category,
      perfume.description,
      ...perfume.notes.top,
      ...perfume.notes.heart,
      ...perfume.notes.base,
    ]
      .join(" ")
      .toLowerCase();
    for (const kw of vibeKeywords[answers.vibe]) {
      if (blob.includes(kw)) score += 1;
    }
  }

  if (answers.occasion) {
    const wishes = occasionMatch[answers.occasion];
    const hay = [...perfume.longevity.occasion, ...perfume.longevity.season]
      .join(" ")
      .toLowerCase();
    for (const wish of wishes) {
      if (hay.includes(wish)) score += 2;
    }
  }

  if (answers.sillage) {
    const text = perfume.longevity.sillage.toLowerCase();
    if (answers.sillage === "Soft" && text.includes("moderate")) score += 1;
    if (answers.sillage === "Moderate" && text.includes("moderate")) score += 2;
    if (answers.sillage === "Strong" && (text.includes("strong") || text.includes("powerful"))) score += 2;
  }

  return score;
}

const steps = [
  {
    key: "gender" as const,
    question: "Who are you shopping for?",
    options: ["Men", "Women", "Unisex", "Any"] as const,
  },
  {
    key: "vibe" as const,
    question: "Pick your scent vibe",
    options: ["Fresh", "Woody", "Sweet", "Smoky", "Floral"] as const,
  },
  {
    key: "occasion" as const,
    question: "Where will you wear it most?",
    options: ["Daily", "Date Night", "Party", "Summer", "Winter"] as const,
  },
  {
    key: "sillage" as const,
    question: "How loud should it project?",
    options: ["Soft", "Moderate", "Strong"] as const,
  },
];

export default function ScentQuiz({ perfumes }: { perfumes: PerfumeData[] }) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);

  const currentStep = steps[stepIndex];
  const progress = Math.round(((stepIndex + (done ? 1 : 0)) / steps.length) * 100);

  const recommendations = useMemo(() => {
    return [...perfumes]
      .map((p) => ({ perfume: p, score: scorePerfume(p, answers) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((x) => x.perfume);
  }, [perfumes, answers]);

  function selectOption(option: string) {
    setAnswers((prev) => ({ ...prev, [currentStep.key]: option } as Answers));
  }

  function next() {
    if (!answers[currentStep.key]) return;
    if (stepIndex === steps.length - 1) {
      setDone(true);
      return;
    }
    setStepIndex((s) => s + 1);
  }

  function back() {
    if (stepIndex > 0) setStepIndex((s) => s - 1);
  }

  function restart() {
    setAnswers(initialAnswers);
    setStepIndex(0);
    setDone(false);
  }

  return (
    <section className="pt-28 pb-20 md:pt-36 md:pb-24">
      <div className="container-luxury">
        <div className="text-center mb-10">
          <p className="text-caption text-muted-foreground mb-3">Find your fragrance in 60s</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">Scent Quiz</h1>
          <div className="w-full max-w-xl mx-auto h-1 bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-foreground"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {!done ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl mx-auto border border-border p-6 md:p-10"
            >
              <h2 className="font-serif text-2xl mb-6">{currentStep.question}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {currentStep.options.map((option) => {
                  const selected = answers[currentStep.key] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => selectOption(option)}
                      className={`px-4 py-3 border text-left transition-luxury ${
                        selected
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={back}
                  disabled={stepIndex === 0}
                  className="text-sm text-muted-foreground disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  onClick={next}
                  disabled={!answers[currentStep.key]}
                  className="px-5 py-2 border border-foreground text-sm disabled:opacity-40"
                >
                  {stepIndex === steps.length - 1 ? "See Results" : "Next"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Your Top Matches</h2>
              <button onClick={restart} className="text-sm text-muted-foreground hover:text-foreground">
                Retake quiz
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {recommendations.map((perfume, index) => (
                <PerfumeCard
                  key={perfume.id}
                  id={perfume.id}
                  name={perfume.name}
                  inspiration={perfume.inspiration}
                  inspirationBrand={perfume.inspirationBrand}
                  category={perfume.category}
                  categoryTags={perfume.categoryTags}
                  categoryIds={perfume.categoryIds}
                  image={perfume.images[0]}
                  price={perfume.price}
                  index={index}
                  bestSeller={perfume.badges?.bestSeller}
                  limitedStock={perfume.badges?.limitedStock}
                  hidePrice
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
