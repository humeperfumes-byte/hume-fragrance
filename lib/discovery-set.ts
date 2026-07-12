export const DISCOVERY_SET_PRODUCT_ID = "hume-discovery-set";
export const DISCOVERY_SET_CART_ITEM_PREFIX = "discovery-set-";
export const DISCOVERY_SET_LEGACY_PATH = "/discovery-set";
export const DISCOVERY_SET_PATH =
  "/discovery-set/build-your-own-perfume-trial-kit-choose-15-3ml-samples";
export const DISCOVERY_SET_PRICE = 799;
export const DISCOVERY_SET_SIZE = "15 x 3ml";
export const DISCOVERY_SET_SAMPLE_COUNT = 15;

export const DISCOVERY_SET_IMAGES = [
  "/images/bg/tester_box1.png",
  "/images/bg/tester_box.png",
  "/images/bg/tester1.png",
  "/images/bg/tester2.png",
  "/images/bg/tester3.png",
  "/images/bg/tester4.png",
];

export type FragranceSelection = {
  id: string;
  name: string;
  inspiration?: string;
};

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
