import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BEGINNER_PERFUME_GUIDES, beginnerGuidePath, getBeginnerGuide } from "../lib/beginner-perfume-guides";
import { getBeginnerGuideProducts } from "../lib/beginner-guide-products";
import { perfumes } from "../data/perfumes";
import { BEGINNER_GUIDES_BATCH_TWO } from "../lib/beginner-perfume-guides-batch-two";
import { BEGINNER_GUIDES_BATCH_THREE } from "../lib/beginner-perfume-guides-batch-three";
import { BEGINNER_GUIDES_BATCH_FOUR } from "../lib/beginner-perfume-guides-batch-four";
import { BEGINNER_GUIDES_BATCH_FIVE } from "../lib/beginner-perfume-guides-batch-five";
import { BEGINNER_GUIDES_BATCH_SIX } from "../lib/beginner-perfume-guides-batch-six";
import { BEGINNER_GUIDES_BATCH_SEVEN } from "../lib/beginner-perfume-guides-batch-seven";
import { BEGINNER_GUIDES_BATCH_EIGHT } from "../lib/beginner-perfume-guides-batch-eight";
import { BEGINNER_GUIDES_BATCH_NINE } from "../lib/beginner-perfume-guides-batch-nine";
import { BEGINNER_GUIDES_BATCH_TEN } from "../lib/beginner-perfume-guides-batch-ten";
import { BEGINNER_GUIDES_BATCH_ELEVEN } from "../lib/beginner-perfume-guides-batch-eleven";
import { BEGINNER_GUIDES_BATCH_TWELVE } from "../lib/beginner-perfume-guides-batch-twelve";
import { BEGINNER_GUIDES_BATCH_THIRTEEN } from "../lib/beginner-perfume-guides-batch-thirteen";
import { BEGINNER_GUIDES_BATCH_FOURTEEN } from "../lib/beginner-perfume-guides-batch-fourteen";
import { BEGINNER_GUIDES_BATCH_FIFTEEN } from "../lib/beginner-perfume-guides-batch-fifteen";
import { BEGINNER_GUIDES_BATCH_SIXTEEN } from "../lib/beginner-perfume-guides-batch-sixteen";
import { BEGINNER_GUIDES_BATCH_SEVENTEEN } from "../lib/beginner-perfume-guides-batch-seventeen";
import { BEGINNER_GUIDES_BATCH_EIGHTEEN } from "../lib/beginner-perfume-guides-batch-eighteen";
import { BEGINNER_GUIDES_BATCH_NINETEEN } from "../lib/beginner-perfume-guides-batch-nineteen";
import { DISCOVERY_SET_PRICE, DISCOVERY_SET_SAMPLE_COUNT, DISCOVERY_SET_SAMPLE_SIZE_ML } from "../lib/discovery-set";

test("final CSV topics 951 through 1000 have complete quantity and container-care coverage", () => {
  const lines = readFileSync(new URL("../outputs/perfume-search-research/perfume-search-ideas.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
  const requested = lines.slice(951, 1001).map(line => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replace(/""/g, '"'))[2]);
  assert.equal(requested.length, 50);
  assert.equal(requested[0], "how long will a 3ml perfume sample last");
  assert.equal(requested.at(-1), "how to pack a mini perfume gift set safely");
  assert.equal(BEGINNER_GUIDES_BATCH_NINETEEN.length, 50);
  for (const title of requested) {
    assert.equal(BEGINNER_GUIDES_BATCH_NINETEEN.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
    assert.equal(BEGINNER_PERFUME_GUIDES.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
  }
  for (const guide of BEGINNER_GUIDES_BATCH_NINETEEN) {
    if (guide.chart) assert.ok(guide.chart.rows.every(row => row.length === guide.chart!.headers.length));
    if (guide.group === "Packing fragrance formats") assert.ok(guide.sources?.some(source => source.url.startsWith("https://www.airindia.com/")));
  }
});

test("CSV topics 901 through 950 have complete care, travel and application coverage", () => {
  const lines = readFileSync(new URL("../outputs/perfume-search-research/perfume-search-ideas.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
  const requested = lines.slice(901, 951).map(line => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replace(/""/g, '"'))[2]);
  assert.equal(requested.length, 50);
  assert.equal(requested[0], "where to spray perfume");
  assert.equal(requested.at(-1), "how to use a mini perfume gift set");
  assert.equal(BEGINNER_GUIDES_BATCH_EIGHTEEN.length, 50);
  for (const title of requested) {
    assert.equal(BEGINNER_GUIDES_BATCH_EIGHTEEN.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
    assert.equal(BEGINNER_PERFUME_GUIDES.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
  }
  for (const guide of BEGINNER_GUIDES_BATCH_EIGHTEEN.filter(guide => guide.group === "Travelling with fragrance" || guide.title === "Can I take perfume samples on a plane")) {
    assert.ok(guide.sources?.some(source => source.url.startsWith("https://www.airindia.com/")));
  }
  const chart = BEGINNER_GUIDES_BATCH_EIGHTEEN.find(guide => guide.chart)!.chart!;
  assert.ok(chart.rows.every(row => row.length === chart.headers.length));
});

test("CSV topics 851 through 900 have complete seller-comparison coverage", () => {
  const lines = readFileSync(new URL("../outputs/perfume-search-research/perfume-search-ideas.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
  const requested = lines.slice(851, 901).map(line => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replace(/""/g, '"'))[2]);
  assert.equal(requested.length, 50);
  assert.equal(requested[0], "how to compare reviews of perfume websites");
  assert.equal(requested.at(-1), "how to compare prices across niche perfume retailers");
  assert.equal(BEGINNER_GUIDES_BATCH_SEVENTEEN.length, 50);
  for (const title of requested) {
    assert.equal(BEGINNER_GUIDES_BATCH_SEVENTEEN.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
    assert.equal(BEGINNER_PERFUME_GUIDES.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
  }
  const chart = BEGINNER_GUIDES_BATCH_SEVENTEEN.find(guide => guide.chart)!.chart!;
  assert.ok(chart.rows.every(row => row.length === chart.headers.length));
  for (const guide of BEGINNER_GUIDES_BATCH_SEVENTEEN.filter(guide => guide.group === "Reading return terms")) {
    assert.ok(guide.sources?.some(source => source.url === "/return-refund-policy"));
  }
});

test("CSV topics 801 through 850 have complete identity-and-seller coverage", () => {
  const lines = readFileSync(new URL("../outputs/perfume-search-research/perfume-search-ideas.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
  const requested = lines.slice(801, 851).map(line => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replace(/""/g, '"'))[2]);
  assert.equal(requested.length, 50);
  assert.equal(requested[0], "how to check if perfume is original");
  assert.equal(requested.at(-1), "what to ask niche perfume retailers before buying");
  assert.equal(BEGINNER_GUIDES_BATCH_SIXTEEN.length, 50);
  for (const title of requested) {
    assert.equal(BEGINNER_GUIDES_BATCH_SIXTEEN.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
    assert.equal(BEGINNER_PERFUME_GUIDES.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
  }
  const chart = BEGINNER_GUIDES_BATCH_SIXTEEN.find(guide => guide.chart)!.chart!;
  assert.ok(chart.rows.every(row => row.length === chart.headers.length));
  for (const title of ["How to check if perfume is original", "How to check perfume seller reviews", "How to spot fake perfume reviews", "What to check on a perfume ingredient label", "Can I return perfume if I dislike the smell"]) {
    assert.ok(BEGINNER_GUIDES_BATCH_SIXTEEN.find(guide => guide.title === title)!.sources?.length);
  }
});

test("CSV topics 751 through 800 have complete sample-purchase coverage", () => {
  const lines = readFileSync(new URL("../outputs/perfume-search-research/perfume-search-ideas.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
  const requested = lines.slice(751, 801).map(line => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replace(/""/g, '"'))[2]);
  assert.equal(requested.length, 50);
  assert.equal(requested[0], "perfume samples for first time buyers");
  assert.equal(requested.at(-1), "perfume sampler gifts before buying a full bottle");
  assert.equal(BEGINNER_GUIDES_BATCH_FIFTEEN.length, 50);
  for (const title of requested) {
    assert.equal(BEGINNER_GUIDES_BATCH_FIFTEEN.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
    assert.equal(BEGINNER_PERFUME_GUIDES.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
  }
  const chart = BEGINNER_GUIDES_BATCH_FIFTEEN.find(guide => guide.chart)!.chart!;
  assert.ok(chart.rows.every(row => row.length === chart.headers.length));
  assert.equal(chart.rows[0][1], `₹${DISCOVERY_SET_PRICE}`);
  assert.equal(chart.rows[2][1], `${DISCOVERY_SET_SAMPLE_COUNT * DISCOVERY_SET_SAMPLE_SIZE_ML}ml`);
  assert.equal(chart.rows[3][1], `₹${(DISCOVERY_SET_PRICE / (DISCOVERY_SET_SAMPLE_COUNT * DISCOVERY_SET_SAMPLE_SIZE_ML)).toFixed(2)}`);
});

test("CSV topics 701 through 750 have one samples-and-testers guide each", () => {
  const lines = readFileSync(new URL("../outputs/perfume-search-research/perfume-search-ideas.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
  const requested = lines.slice(701, 751).map(line => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replace(/""/g, '"'))[2]);
  assert.equal(requested.length, 50);
  assert.equal(requested[0], "perfume samples India");
  assert.equal(requested.at(-1), "are perfume sampler gifts worth buying");
  assert.equal(BEGINNER_GUIDES_BATCH_FOURTEEN.length, 50);
  for (const title of requested) {
    assert.equal(BEGINNER_GUIDES_BATCH_FOURTEEN.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
    assert.equal(BEGINNER_PERFUME_GUIDES.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
  }
  const chart = BEGINNER_GUIDES_BATCH_FOURTEEN.find(guide => guide.chart)!.chart!;
  assert.ok(chart.rows.every(row => row.length === chart.headers.length));
  assert.equal(chart.rows[0][1], `₹${DISCOVERY_SET_PRICE}`);
  assert.equal(chart.rows[2][1], `${DISCOVERY_SET_SAMPLE_COUNT * DISCOVERY_SET_SAMPLE_SIZE_ML}ml`);
});

test("CSV topics 651 through 700 have complete coverage with truthful budget eligibility", () => {
  const lines = readFileSync(new URL("../outputs/perfume-search-research/perfume-search-ideas.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
  const requested = lines.slice(651, 701).map(line => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replace(/""/g, '"'))[2]);
  assert.equal(requested.length, 50);
  assert.equal(requested[0], "long lasting perfume under 500 rupees");
  assert.equal(requested.at(-1), "perfume discovery kit under 10000 rupees");
  assert.equal(BEGINNER_GUIDES_BATCH_THIRTEEN.length, 50);
  for (const title of requested) {
    assert.equal(BEGINNER_GUIDES_BATCH_THIRTEEN.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
    assert.equal(BEGINNER_PERFUME_GUIDES.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
  }
  for (const guide of BEGINNER_GUIDES_BATCH_THIRTEEN.filter(guide => guide.title.endsWith("under 500 rupees"))) {
    assert.equal(guide.nextStep, "shop");
    assert.ok(guide.humeTip.includes(`₹${DISCOVERY_SET_PRICE}`));
    if (DISCOVERY_SET_PRICE >= 500) assert.ok(guide.humeTip.includes("does not qualify"));
  }
  const chart = BEGINNER_GUIDES_BATCH_THIRTEEN.find(guide => guide.chart)!.chart!;
  assert.ok(chart.rows.every(row => row.length === chart.headers.length));
  assert.equal(chart.rows.at(-1)![1], `₹${(DISCOVERY_SET_PRICE / (DISCOVERY_SET_SAMPLE_COUNT * DISCOVERY_SET_SAMPLE_SIZE_ML)).toFixed(2)}`);
});

test("CSV topics 601 through 650 have complete budget coverage and accurate kit arithmetic", () => {
  const lines = readFileSync(new URL("../outputs/perfume-search-research/perfume-search-ideas.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
  const requested = lines.slice(601, 651).map(line => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replace(/""/g, '"'))[2]);
  assert.equal(requested.length, 50);
  assert.equal(requested[0], "are expensive perfumes worth it");
  assert.equal(requested.at(-1), "perfume gift set under 10000 rupees");
  assert.equal(BEGINNER_GUIDES_BATCH_TWELVE.length, 50);
  for (const title of requested) {
    assert.equal(BEGINNER_GUIDES_BATCH_TWELVE.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
    assert.equal(BEGINNER_PERFUME_GUIDES.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
  }
  const unitPrice = `₹${(DISCOVERY_SET_PRICE / (DISCOVERY_SET_SAMPLE_COUNT * DISCOVERY_SET_SAMPLE_SIZE_ML)).toFixed(2)}`;
  for (const title of ["Perfume cost per ml explained", "Perfume sample price per ml"]) {
    const chart = BEGINNER_GUIDES_BATCH_TWELVE.find(guide => guide.title === title)!.chart!;
    assert.ok(chart.rows.every(row => row.length === chart.headers.length));
    assert.equal(chart.rows.at(-1)![1], unitPrice);
  }
  for (const title of ["Perfume sample set under 500 rupees", "Perfume gift set under 500 rupees"]) {
    const guide = BEGINNER_GUIDES_BATCH_TWELVE.find(guide => guide.title === title)!;
    assert.ok(guide.humeTip.includes(`₹${DISCOVERY_SET_PRICE}`));
    assert.equal(guide.nextStep, "shop");
    assert.equal(guide.productIds.length, 0);
  }
});

test("CSV topics 551 through 600 have one guide each", () => {
  const lines = readFileSync(new URL("../outputs/perfume-search-research/perfume-search-ideas.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
  const requested = lines.slice(551, 601).map(line => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replace(/""/g, '"'))[2]);
  assert.equal(requested.length, 50);
  assert.equal(requested[0], "light perfumes for hot humid weather");
  assert.equal(requested.at(-1), "sweet fragrances for air conditioned environments");
  assert.equal(BEGINNER_GUIDES_BATCH_ELEVEN.length, 50);
  for (const title of requested) {
    assert.equal(BEGINNER_GUIDES_BATCH_ELEVEN.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
    assert.equal(BEGINNER_PERFUME_GUIDES.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
  }
  for (const guide of BEGINNER_GUIDES_BATCH_ELEVEN) {
    if (guide.chart) assert.ok(guide.chart.rows.every(row => row.length === guide.chart!.headers.length));
  }
});

test("CSV topics 501 through 550 have one weather guide each", () => {
  const lines = readFileSync(new URL("../outputs/perfume-search-research/perfume-search-ideas.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
  const requested = lines.slice(501, 551).map(line => [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replace(/""/g, '"'))[2]);
  assert.equal(requested.length, 50);
  assert.equal(requested[0], "best perfume for Indian weather");
  assert.equal(requested.at(-1), "woody scents for air conditioned environments");
  assert.equal(BEGINNER_GUIDES_BATCH_TEN.length, 50);
  for (const title of requested) {
    assert.equal(BEGINNER_GUIDES_BATCH_TEN.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
    assert.equal(BEGINNER_PERFUME_GUIDES.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
  }
  for (const guide of BEGINNER_GUIDES_BATCH_TEN) {
    if (guide.chart) assert.ok(guide.chart.rows.every(row => row.length === guide.chart!.headers.length));
  }
});

test("CSV topics 450 through 500 have exactly one guide each", () => {
  const lines = readFileSync(new URL("../outputs/perfume-search-research/perfume-search-ideas.csv", import.meta.url), "utf8").trim().split(/\r?\n/);
  const requested = lines.slice(450, 501).map(line => {
    const fields = [...line.matchAll(/"((?:[^"]|"")*)"/g)].map(match => match[1].replace(/""/g, '"'));
    return fields[2];
  });
  assert.equal(requested.length, 51);
  assert.equal(requested[0], "fresh perfume for gifting");
  assert.equal(requested.at(-1), "affordable perfume for gifting");
  assert.equal(BEGINNER_GUIDES_BATCH_NINE.length, 51);
  for (const title of requested) {
    assert.equal(BEGINNER_GUIDES_BATCH_NINE.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
    assert.equal(BEGINNER_PERFUME_GUIDES.filter(guide => guide.title.toLowerCase() === title.toLowerCase()).length, 1, title);
  }
});

test("eighth request covers all 57 skin-fit and occasion topics", () => {
  const occasions = ["office wear", "college", "date nights", "weddings", "daily commuting", "weekend outings", "formal dinners", "outdoor events", "holidays", "gifting"];
  const requested = [
    ...["woody perfumes", "sweet perfumes", "floral perfumes", "oud perfumes", "budget perfumes", "perfume samples", "oil perfumes", "light perfumes"].map(category => `how to tell if ${category} suit my skin`),
    "daytime vs evening perfume", "office perfume etiquette", "perfume for first job", "perfume for college beginners", "how to choose a wedding perfume", "perfume for a first date", "everyday perfume vs special occasion perfume", "one fragrance for work and evenings", "perfume for people who commute daily", "perfume for close indoor spaces", "how to choose a gym fragrance", "perfume for interviews", "perfume gift for someone new to fragrances", "how to choose a birthday perfume gift", "perfume for restaurant visits", "perfume for outdoor events", "how to avoid overpowering perfume at work", "perfume for a long working day", "how many sprays for an office", "how to choose perfume for a formal event",
    ...occasions.map(occasion => `best perfume for ${occasion}`),
    ...occasions.map(occasion => `subtle fragrance for ${occasion}`),
    ...occasions.slice(0, 9).map(occasion => `fresh perfume for ${occasion}`),
  ];
  assert.equal(requested.length, 57);
  assert.equal(BEGINNER_GUIDES_BATCH_EIGHT.length, 57);
  for (const title of requested) assert.equal(BEGINNER_GUIDES_BATCH_EIGHT.filter(guide => guide.title.toLowerCase() === title).length, 1, title);
  for (const guide of BEGINNER_GUIDES_BATCH_EIGHT) {
    if (guide.chart) assert.ok(guide.chart.rows.every(row => row.length === guide.chart!.headers.length));
    if (guide.group === "Scent fit") assert.ok(guide.sources?.some(source => source.url.startsWith("https://www.nhs.uk/")));
  }
});

test("seventh request adds all 50 fading, testing, fabric, routine, noticeability and fit topics", () => {
  const categories = ["fresh perfumes", "citrus perfumes", "woody perfumes", "sweet perfumes", "floral perfumes", "oud perfumes", "budget perfumes", "perfume samples", "oil perfumes", "light perfumes"];
  const requested = [
    ...categories.slice(2).map(category => `why do ${category} fade quickly`),
    ...categories.map(category => `how to test ${category} through the day`),
    ...categories.map(category => `do ${category} last longer on clothes`),
    ...categories.map(category => `how to make ${category} last longer`),
    ...categories.map(category => `are ${category} noticeable to other people`),
    ...categories.slice(0, 2).map(category => `how to tell if ${category} suit my skin`),
  ];
  assert.equal(requested.length, 50);
  assert.equal(BEGINNER_GUIDES_BATCH_SEVEN.length, 50);
  for (const title of requested) assert.equal(BEGINNER_GUIDES_BATCH_SEVEN.filter(guide => guide.title.toLowerCase() === title).length, 1, title);
  for (const guide of BEGINNER_GUIDES_BATCH_SEVEN) {
    if (guide.chart) assert.ok(guide.chart.rows.every(row => row.length === guide.chart!.headers.length));
  }
});

test("sixth request adds all 50 amount, performance, wear and projection topics", () => {
  const categories = ["fresh perfumes", "citrus perfumes", "woody perfumes", "sweet perfumes", "floral perfumes", "oud perfumes", "budget perfumes", "perfume samples", "oil perfumes", "light perfumes"];
  const requested = [
    ...["extrait de parfum", "perfume oil", "attar", "body mist", "solid perfume", "roll on perfume", "cologne", "alcohol free perfume"].map(format => `how much ${format} should i apply`),
    "long lasting perfume meaning", "projection vs longevity perfume", "sillage meaning in perfume", "why can i not smell my own perfume", "nose blindness vs weak perfume", "why does perfume fade quickly on me", "how to test perfume longevity", "how to test perfume projection", "does perfume last longer on clothes or skin", "does expensive perfume last longer", "how long should perfume last", "why does perfume last longer on my friend", "does perfume get stronger with age", "does perfume performance change after delivery", "how far should perfume project", "perfume that lasts all day", "how to make perfume last longer", "does rubbing wrists affect perfume", "how many hours should an edp last", "why is my perfume strong at first then gone",
    ...categories.map(category => `how long do ${category} last on skin`),
    ...categories.map(category => `how to compare the projection of ${category}`),
    "why do fresh perfumes fade quickly", "why do citrus perfumes fade quickly",
  ];
  assert.equal(requested.length, 50);
  assert.equal(BEGINNER_GUIDES_BATCH_SIX.length, 50);
  for (const title of requested) assert.equal(BEGINNER_GUIDES_BATCH_SIX.filter(guide => guide.title.toLowerCase() === title).length, 1, title);
  for (const guide of BEGINNER_GUIDES_BATCH_SIX) {
    if (guide.chart) assert.ok(guide.chart.rows.every(row => row.length === guide.chart!.headers.length));
  }
});

test("fifth request covers all 50 beginner, everyday, heat, size, storage and amount topics", () => {
  const formats = ["eau de parfum", "eau de toilette", "extrait de parfum", "perfume oil", "attar", "body mist", "solid perfume", "roll on perfume", "cologne", "alcohol free perfume"];
  const requested = [
    ...formats.slice(2).map(format => `is ${format} good for beginners`),
    ...["for everyday wear", "for hot weather", "sample size options"].flatMap(suffix => formats.map(format => `${format} ${suffix}`)),
    ...formats.map(format => `how to store ${format}`),
    ...formats.slice(0, 2).map(format => `how much ${format} should i apply`),
  ];
  assert.equal(requested.length, 50);
  assert.equal(BEGINNER_GUIDES_BATCH_FIVE.length, 50);
  for (const title of requested) assert.equal(BEGINNER_GUIDES_BATCH_FIVE.filter(guide => guide.title.toLowerCase() === title).length, 1, title);
  for (const guide of BEGINNER_GUIDES_BATCH_FIVE) {
    if (guide.chart) assert.ok(guide.chart.rows.every(row => row.length === guide.chart!.headers.length));
  }
});

test("fourth request adds all 50 note, format, application and wear-time topics", () => {
  const formats = ["eau de parfum", "eau de toilette", "extrait de parfum", "perfume oil", "attar", "body mist", "solid perfume", "roll on perfume", "cologne", "alcohol free perfume"];
  const requested = [
    ...["rose", "jasmine", "sandalwood", "musk", "bergamot", "vetiver", "patchouli", "leather"].map(note => `how to choose a ${note} fragrance`),
    "edp vs edt perfume difference", "parfum vs eau de parfum", "perfume vs body spray", "attar vs perfume spray", "perfume oil vs alcohol perfume", "body mist vs perfume", "what does cologne mean", "what is extrait de parfum", "does higher concentration mean better perfume", "which perfume concentration lasts longer", "what is solid perfume", "what is a perfume decant", "what is a perfume tester bottle", "perfume refill vs new bottle", "roll on perfume vs spray", "alcohol free perfume meaning", "natural vs synthetic perfume ingredients", "is eau de toilette only for men", "why do perfumes contain alcohol", "what is a perfume travel atomizer",
    ...formats.map(format => `how to use ${format}`),
    ...formats.map(format => `how long does ${format} last`),
    "is eau de parfum good for beginners", "is eau de toilette good for beginners",
  ];
  assert.equal(requested.length, 50);
  assert.equal(BEGINNER_GUIDES_BATCH_FOUR.length, 50);
  for (const title of requested) assert.equal(BEGINNER_GUIDES_BATCH_FOUR.filter(guide => guide.title.toLowerCase() === title).length, 1, title);
  for (const guide of BEGINNER_GUIDES_BATCH_FOUR) {
    if (guide.chart) assert.ok(guide.chart.rows.every(row => row.length === guide.chart!.headers.length));
  }
});

test("third request adds 51 topics and readable educational charts", () => {
  const notes = ["vanilla", "oud", "rose", "jasmine", "sandalwood", "musk", "bergamot", "vetiver", "patchouli", "leather"];
  const requested = [
    ...["college students", "office workers", "teenagers", "people who like mild scents", "people who dislike sweet scents", "people who like fresh scents", "people buying online", "people buying on a budget"].map(audience => `fragrance starter kits for ${audience}`),
    "perfume scent families explained", "top middle and base notes meaning", "what does perfume dry down mean", "how to read a perfume notes list", "fresh vs sweet perfume", "woody vs spicy perfume", "floral vs fruity perfume", "what does gourmand mean in perfume", "what does aquatic perfume smell like", "what does amber smell like in perfume", "what is a green fragrance", "what is a powdery perfume", "what is a skin scent", "what makes a perfume smell clean", "why does perfume smell different after an hour", "can perfume notes predict the smell", "what is a fragrance accord", "how to find perfumes with similar notes", "how to identify perfume notes", "perfume notes chart for beginners",
    ...notes.map(note => `what does ${note} smell like in perfume`),
    ...notes.map(note => `${note} perfume for beginners`),
    ...["vanilla", "oud", "rose"].map(note => `best ${note} perfume samples`),
  ];
  assert.equal(requested.length, 51);
  assert.equal(BEGINNER_GUIDES_BATCH_THREE.length, 51);
  for (const title of requested) assert.equal(BEGINNER_GUIDES_BATCH_THREE.filter(guide => guide.title.toLowerCase() === title).length, 1, title);
  for (const guide of BEGINNER_GUIDES_BATCH_THREE) {
    if (guide.chart) assert.ok(guide.chart.rows.every(row => row.length === guide.chart!.headers.length));
    if (guide.sources) assert.ok(guide.sources.every(source => source.url.startsWith("https://")));
  }
  assert.equal(getBeginnerGuide("perfume-notes-chart-for-beginners")?.chart?.rows.length, 10);
});

test("second request covers all 51 topics while reusing nine existing pages", () => {
  const audiences = ["men", "women", "college students", "office workers", "teenagers", "people who like mild scents", "people who dislike sweet scents", "people who like fresh scents", "people buying online", "people buying on a budget"];
  const requested = [
    ...audiences.slice(1).map(audience => `everyday fragrance recommendations for ${audience}`),
    ...["how to choose a signature scent for", "perfume discovery sets for", "small perfume bottles for", "perfume selection quiz for"].flatMap(prefix => audiences.map(audience => `${prefix} ${audience}`)),
    "fragrance starter kits for men", "fragrance starter kits for women",
  ];
  assert.equal(requested.length, 51);
  assert.equal(BEGINNER_GUIDES_BATCH_TWO.length, 42);
  for (const title of requested) {
    assert.equal(BEGINNER_PERFUME_GUIDES.filter(guide => guide.title.toLowerCase() === title).length, 1, title);
  }
});

test("all 951 batch topics have unique routes and independently written decisions", () => {
  const guides = BEGINNER_PERFUME_GUIDES;
  assert.equal(guides.length, 951);
  for (const field of ["slug", "title", "answer", "exercise", "humeTip"] as const) {
    assert.equal(new Set(guides.map(guide => guide[field])).size, guides.length, field);
  }
  for (const guide of guides) {
    assert.match(beginnerGuidePath(guide.slug), /^\/perfume-beginners\/[a-z0-9-]+$/);
    assert.equal(getBeginnerGuide(guide.slug), guide);
    assert.equal(guide.sections.length, 3, guide.slug);
    assert.ok(guide.sections.every(section => section.title && section.body), guide.slug);
    for (const id of guide.productIds) assert.ok(perfumes.some(product => product.id === id), `${guide.slug}: ${id}`);
  }
  assert.equal(getBeginnerGuide("not-a-real-guide"), undefined);
});

test("editorial examples never expose hidden, unavailable or unrelated products", () => {
  const guide = BEGINNER_PERFUME_GUIDES.find(guide => guide.productIds.length > 0)!;
  const candidate = perfumes.find(product => product.id === guide.productIds[0])!;
  assert.deepEqual(getBeginnerGuideProducts(guide, [candidate]).map(product => product.id), [candidate.id]);
  assert.deepEqual(getBeginnerGuideProducts(guide, [{ ...candidate, visibility: "seo_only" }]), []);
  assert.deepEqual(getBeginnerGuideProducts(guide, [{ ...candidate, badges: { soldOut: true } }]), []);
  assert.deepEqual(getBeginnerGuideProducts(guide, [{ ...candidate, badges: { comingSoon: true } }]), []);
  assert.deepEqual(getBeginnerGuideProducts(guide, []), []);
  assert.deepEqual(getBeginnerGuideProducts({ ...guide, productIds: [] }, [candidate]), []);
  const roseGuide = { ...guide, requiredNote: "rose" };
  assert.deepEqual(getBeginnerGuideProducts(roseGuide, [{ ...candidate, notes: { top: ["Rosewood"], heart: [], base: [] } }]), []);
  assert.equal(getBeginnerGuideProducts(roseGuide, [{ ...candidate, notes: { top: ["Bulgarian Rose"], heart: [], base: [] } }]).length, 1);
});
