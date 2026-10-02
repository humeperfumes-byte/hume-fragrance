import { getProductSeoSlug } from "./product-route";

// Preserve historical links without reviving unconfirmed stock or product claims.
export const UNAVAILABLE_PRODUCTS = [
  { id: "night-out", name: "Night Out", inspiration: "9 PM Night Out", inspirationBrand: "Afnan" },
  { id: "pacific-chill", name: "Pacific Chill", inspiration: "Pacific Chill", inspirationBrand: "Louis Vuitton" },
  { id: "most-wanted", name: "Most Wanted", inspiration: "The Most Wanted Parfum", inspirationBrand: "Azzaro" },
  { id: "althair", name: "Althair", inspiration: "Althaïr", inspirationBrand: "Parfums de Marly" },
  { id: "hugo-boss", name: "Hugo Boss", inspiration: "Hugo Man", inspirationBrand: "Hugo Boss" },
  { id: "her", name: "Her", inspiration: "Burberry Her", inspirationBrand: "Burberry" },
  { id: "angels-share", name: "Angels Share", inspiration: "Angels' Share", inspirationBrand: "Kilian" },
  { id: "purple-oud", name: "Purple Oud", inspiration: "Purple Oud", inspirationBrand: "Dior" },
];

export function getUnavailableProduct(segment: string) {
  return UNAVAILABLE_PRODUCTS.find((product) => product.id === segment
    || getProductSeoSlug(product) === segment
    || getProductSeoSlug({ ...product, inspiration: product.inspiration.normalize("NFD").replace(/[\u0300-\u036f]/g, "") }) === segment);
}
