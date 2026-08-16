export const DISCOVERY_SET_PRODUCT_ID = "hume-discovery-set";
export const DISCOVERY_SET_CART_ITEM_PREFIX = "discovery-set-";
export const DISCOVERY_SET_LEGACY_PATH = "/discovery-set";
export const DISCOVERY_SET_LEGACY_TEN_PATH =
  "/discovery-set/build-your-own-perfume-trial-kit-choose-10-3ml-samples";
export const DISCOVERY_SET_PATH =
  "/discovery-set/build-your-own-perfume-trial-kit-choose-15-3ml-samples";
export const DISCOVERY_SET_SAMPLE_COUNT = 15;
export const DISCOVERY_SET_SAMPLE_SIZE_ML = 3;
export const DISCOVERY_SET_PRICE = 999;
export const DISCOVERY_SET_ORIGINAL_PRICE = 1500;
export const DISCOVERY_SET_STATUS = "Pre-Order";
export const DISCOVERY_SET_SCHEMA_AVAILABILITY = "https://schema.org/PreOrder";
export const DISCOVERY_SET_SIZE =
  `${DISCOVERY_SET_SAMPLE_COUNT} x ${DISCOVERY_SET_SAMPLE_SIZE_ML}ml`;
export const DISCOVERY_SET_SHORT_DESCRIPTION =
  `Choose any ${DISCOVERY_SET_SAMPLE_COUNT} HUME perfume testers of ${DISCOVERY_SET_SAMPLE_SIZE_ML}ml each and compare them before buying a full bottle.`;
export const DISCOVERY_SET_DESCRIPTION =
  `Pre-order the HUME Discovery Set with ${DISCOVERY_SET_SIZE} testers for INR ${DISCOVERY_SET_PRICE} (original price INR ${DISCOVERY_SET_ORIGINAL_PRICE}). Choose your fragrances and test them on skin before buying a full bottle.`;

export const DISCOVERY_SET_IMAGES = [
  "/images/bg/discovery-set-15x3ml.png",
];

export type FragranceSelection = {
  id: string;
  name: string;
  inspiration?: string;
};

export function getDiscoverySetReviewAggregate(
  reviews: Array<{ rating: number; reviewerLanguage?: string; title?: string }>,
) {
  const ratingReviews = reviews.filter((review) => {
    const kind = review.reviewerLanguage?.toLowerCase();
    const title = review.title?.toLowerCase();
    return kind !== "question" && kind !== "response" && title !== "question" && !title?.startsWith("response:");
  });

  if (ratingReviews.length === 0) return null;

  const ratingValue =
    ratingReviews.reduce((sum, review) => sum + review.rating, 0) /
    ratingReviews.length;

  return {
    "@type": "AggregateRating",
    ratingValue: Number(ratingValue.toFixed(1)),
    reviewCount: ratingReviews.length,
    bestRating: 5,
    worstRating: 1,
  };
}

export function isDiscoverySetProductId(id: string) {
  return id === DISCOVERY_SET_PRODUCT_ID;
}

export function isDiscoverySetCartItemId(id: string) {
  return id === DISCOVERY_SET_PRODUCT_ID || id.startsWith(DISCOVERY_SET_CART_ITEM_PREFIX);
}

export function isDiscoverySetCartItem(item: {
  id?: string;
  name?: string;
  category?: string;
  sampleSelections?: unknown[];
}) {
  const normalizedName = item.name?.trim().toLowerCase();
  const normalizedCategory = item.category?.trim().toLowerCase();

  return Boolean(
    (item.id && isDiscoverySetCartItemId(item.id)) ||
      normalizedName === "hume discovery set" ||
      normalizedCategory === "discovery set" ||
      (item.id?.startsWith(DISCOVERY_SET_CART_ITEM_PREFIX) &&
        Array.isArray(item.sampleSelections) &&
        item.sampleSelections.length > 0),
  );
}
